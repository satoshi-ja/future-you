# Sora Video API Implementation Guide

OpenAI Sora2 API を使った動画生成機能の実装方法をまとめたドキュメントです。他のプロジェクトでも再利用できるように設計されています。

## 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [必要な設定](#必要な設定)
4. [コンポーネント別実装](#コンポーネント別実装)
5. [API エンドポイント](#api-エンドポイント)
6. [ワーカー実装](#ワーカー実装)
7. [参照画像アップロード機能](#参照画像アップロード機能)
8. [エラーハンドリング](#エラーハンドリング)
9. [導入手順](#導入手順)

---

## 概要

このプロジェクトでは、OpenAI の Sora2 API を使用して以下の機能を実装しています：

- **動画生成リクエストの送信**: プロンプトから動画を生成
- **ステータスポーリング**: 非同期での生成状況の監視
- **参照画像のサポート**: 画像から動画を生成する機能
- **画像リサイズ**: Sora2 API が要求するサイズへの自動調整
- **ダウンロードリトライ**: 生成完了直後の 404 エラーに対応
- **非同期ワーカー処理**: Celery を使った長時間タスクの実行

---

## アーキテクチャ

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│  Frontend   │─────▶│   Backend   │─────▶│    Redis     │
│  (Next.js)  │      │  (FastAPI)  │      │   (Queue)    │
└─────────────┘      └─────────────┘      └──────────────┘
                            │                      │
                            │                      ▼
                            │              ┌──────────────┐
                            │              │    Worker    │
                            │              │   (Celery)   │
                            │              └──────────────┘
                            │                      │
                            ▼                      ▼
                     ┌─────────────────────────────────┐
                     │      OpenAI Sora2 API           │
                     │  (videos.generate / retrieve)   │
                     └─────────────────────────────────┘
```

### データフロー

1. **Frontend** → Backend: 動画生成リクエスト (`/api/renders`)
2. **Backend** → Redis: ジョブをキューに追加
3. **Worker** ← Redis: ジョブを取得
4. **Worker** → Sora2 API: 動画生成リクエスト送信
5. **Worker** → Sora2 API: ポーリングでステータス確認
6. **Worker** → Sora2 API: 動画ダウンロード
7. **Worker** → Storage: 動画をストレージにアップロード
8. **Worker** → Backend: ステータス更新 (`/api/renders/{job_id}/status`)
9. **Frontend** ← Backend: ステータスを取得して表示

---

## 必要な設定

### 環境変数

```bash
# OpenAI API 設定
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_org_id  # 省略可能
SORA_MODEL=sora-2.0  # デフォルト: sora-2.0

# Sora Provider 設定
SORA_PROVIDER=openai  # openai, sora, sora2 のいずれか (stub でスタブモードに)
SORA_POLL_INTERVAL=5  # ポーリング間隔（秒）
SORA_POLL_TIMEOUT=600  # タイムアウト（秒）

# Redis (キュー)
REDIS_URL=redis://localhost:6379/0

# ストレージ設定
STORAGE_LOCAL_ROOT=/tmp/sorapitch
STORAGE_PUBLIC_BASE_URL=https://your-cdn.example.com
```

### 依存パッケージ

**Backend (FastAPI)**:
```bash
pip install fastapi openai pydantic pydantic-settings httpx
```

**Worker (Celery)**:
```bash
pip install celery redis openai tenacity pillow
```

---

## コンポーネント別実装

### 1. Sora クライアント (Backend)

**ファイル**: `backend/app/services/sora.py`

```python
from openai import OpenAI
from app.core.config import settings

class SoraClient:
    """Thin wrapper around OpenAI video generation endpoint."""

    def __init__(self) -> None:
        self._client = OpenAI(
            api_key=settings.openai_api_key,
            organization=settings.openai_org_id
        )
        self._model = settings.sora_model

    def submit_job(
        self,
        prompt: str,
        duration_seconds: int = 8,
        aspect_ratio: str = "16:9"
    ) -> dict:
        """動画生成ジョブを送信"""
        response = self._client.videos.generate(
            model=self._model,
            prompt=prompt,
            duration_seconds=duration_seconds,
            size=aspect_ratio,
            format="mp4",
        )
        return response.to_dict()

    def get_status(self, job_id: str) -> dict:
        """ジョブのステータスを取得"""
        response = self._client.videos.retrieve(job_id=job_id)
        return response.to_dict()

sora_client = SoraClient()
```

**使用例**:
```python
# ジョブ送信
result = sora_client.submit_job(
    prompt="A cat playing with a ball",
    duration_seconds=8,
    aspect_ratio="16:9"
)
job_id = result["id"]

# ステータス確認
status = sora_client.get_status(job_id)
print(status["status"])  # "queued", "in_progress", "completed", "failed"
```

---

### 2. Sora Provider (Worker)

**ファイル**: `worker/providers/sora.py`

```python
import os
import time
from pathlib import Path
from openai import OpenAI

class OpenAISoraProvider:
    def __init__(self) -> None:
        self._client = OpenAI()
        self._model = os.getenv("SORA_MODEL", "sora-2")
        self._poll_interval = float(os.getenv("SORA_POLL_INTERVAL", "5"))
        self._poll_timeout = float(os.getenv("SORA_POLL_TIMEOUT", "600"))

    def generate_scene(
        self,
        *,
        prompt: str,
        duration: int,
        aspect_ratio: str,
        output_path: Path,
        reference_image_url: str | None = None
    ) -> Path:
        """シーン動画を生成してローカルファイルとして保存"""

        # アスペクト比を size パラメータに変換
        size_map = {
            "16:9": "1280x720",
            "9:16": "720x1280",
            "1:1": "720x720",
        }
        size = size_map.get(aspect_ratio, "1280x720")

        # duration を 4, 8, 12 のいずれかに丸める
        allowed_durations = [4, 8, 12]
        seconds = str(min(allowed_durations, key=lambda x: abs(x - duration)))

        # API パラメータ準備
        video_params = {
            "model": self._model,
            "prompt": prompt,
            "size": size,
            "seconds": seconds,
        }

        # 参照画像がある場合
        if reference_image_url:
            # 画像をダウンロードしてリサイズ（後述）
            video_params["input_reference"] = open(resized_path, "rb")

        # 動画生成リクエスト
        video = self._client.videos.create(**video_params)

        # ポーリングで完了を待つ
        start_time = time.time()
        while time.time() - start_time < self._poll_timeout:
            video = self._client.videos.retrieve(video.id)

            if video.status == "completed":
                # ダウンロード（リトライあり）
                for retry in range(10):
                    try:
                        content = self._client.videos.download_content(video.id)
                        content.write_to_file(output_path.as_posix())
                        return output_path
                    except Exception as e:
                        if retry < 9:
                            time.sleep(5)
                        else:
                            raise

            if video.status == "failed":
                raise RuntimeError("Video generation failed")

            time.sleep(self._poll_interval)

        raise TimeoutError(f"Timed out waiting for video {video.id}")
```

**ポイント**:
- `duration` は 4, 8, 12 秒のいずれかに丸める必要がある
- `size` は `"1280x720"` 形式（アスペクト比から変換）
- `status` が `"completed"` になってもすぐにダウンロードできない場合があるのでリトライする

---

### 3. 参照画像のリサイズ

Sora2 API は参照画像のサイズが動画サイズと一致している必要があります。以下のコードで自動リサイズできます：

```python
from PIL import Image
import tempfile

# 動画サイズを取得
target_width, target_height = map(int, size.split('x'))  # "1280x720" → 1280, 720

# 画像を開く
with Image.open(image_file_path) as img:
    # アスペクト比を計算
    img_aspect = img.width / img.height
    target_aspect = target_width / target_height

    if img_aspect > target_aspect:
        # 画像が横長すぎる場合: 高さを基準にリサイズして左右をクロップ
        new_height = target_height
        new_width = int(new_height * img_aspect)
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        left = (new_width - target_width) // 2
        img_final = img_resized.crop((left, 0, left + target_width, target_height))
    else:
        # 画像が縦長すぎる場合: 幅を基準にリサイズして上下をクロップ
        new_width = target_width
        new_height = int(new_width / img_aspect)
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        top = (new_height - target_height) // 2
        img_final = img_resized.crop((0, top, target_width, top + target_height))

    # RGBA → RGB 変換
    if img_final.mode == 'RGBA':
        img_final = img_final.convert('RGB')

    # 一時ファイルに保存
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f:
        resized_path = f.name
        img_final.save(resized_path, format='JPEG', quality=95)
```

---

## API エンドポイント

### 1. 動画生成リクエスト

**エンドポイント**: `POST /api/renders`

**リクエスト**:
```json
{
  "project_id": "project-123",
  "variant_id": "variant-456",
  "force_refresh": false
}
```

**レスポンス**:
```json
{
  "job_id": "job-789",
  "status": "queued",
  "progress": 0.0,
  "message": null,
  "video_url": null,
  "created_at": "2025-10-12T10:00:00Z",
  "updated_at": "2025-10-12T10:00:00Z"
}
```

**実装** (`backend/app/api/v1/renders.py`):
```python
@router.post("/", response_model=RenderStatus, status_code=status.HTTP_202_ACCEPTED)
async def enqueue_render(payload: RenderRequest) -> RenderStatus:
    project = project_repository.get(payload.project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    render_status = render_repository.enqueue(payload)
    queue.enqueue({
        "job_id": render_status.job_id,
        "project_id": payload.project_id,
        "variant_id": payload.variant_id,
    })
    return render_status
```

---

### 2. ステータス取得

**エンドポイント**: `GET /api/renders/{job_id}`

**レスポンス**:
```json
{
  "job_id": "job-789",
  "status": "rendering",
  "progress": 0.5,
  "message": "Generating scene 2/5",
  "video_url": null,
  "created_at": "2025-10-12T10:00:00Z",
  "updated_at": "2025-10-12T10:05:00Z"
}
```

---

### 3. 参照画像アップロード

**エンドポイント**: `POST /api/projects/{project_id}/scenes/{scene_id}/upload-image`

**リクエスト**: `multipart/form-data`
```
file: <image file>
```

**レスポンス**:
```json
{
  "success": true,
  "image_url": "https://cdn.example.com/reference_images/project-123/scene-456_abc123.jpg",
  "scene_id": "scene-456"
}
```

**実装** (`backend/app/api/v1/projects.py:42-111`):
- ファイルタイプを検証（`image/*` のみ許可）
- ユニークなファイル名を生成
- ローカルストレージに保存
- データベースの `scene.reference_image_url` を更新

---

## ワーカー実装

### Celery タスク

**ファイル**: `worker/tasks/render.py`

```python
from celery import shared_task
from tenacity import retry, stop_after_attempt, wait_exponential

@shared_task(name="worker.tasks.render.execute_render")
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=1, max=10))
def execute_render(job_payload: dict) -> None:
    """動画生成のオーケストレーション"""
    job_id = job_payload["job_id"]
    project_id = job_payload["project_id"]

    # ステータス更新: 処理開始
    update_status(job_id, "rendering", 0.1, "Job accepted by worker")

    # プロジェクト情報を取得
    project = fetch_project(project_id)
    update_status(job_id, "rendering", 0.35, "Blueprint downloaded")

    # パイプライン実行
    try:
        public_url = run_pipeline(
            RenderContext(
                job_id=job_id,
                project=project,
                workspace=workdir,
                sora=sora_provider,
                tts=tts_provider,
                storage=storage_provider,
            )
        )
    except Exception as exc:
        update_status(job_id, "failed", 1.0, f"Render pipeline failed: {exc}")
        raise

    # ステータス更新: 完了
    update_status(job_id, "ready", 1.0, "Render complete", video_url=public_url)
```

**ポイント**:
- `@retry`: 一時的なネットワークエラーに対してリトライ
- ステータス更新を細かく行い、フロントエンドでプログレスバーを表示
- 例外が発生した場合はフォールバック動画を返すこともできる

---

## エラーハンドリング

### 1. ダウンロード直後の 404 エラー

Sora2 API は `status="completed"` になった直後でも動画ファイルがまだ準備できていないことがあります。

**対策**: リトライロジック
```python
max_retries = 10
retry_interval = 5

for retry in range(max_retries):
    try:
        content = self._client.videos.download_content(video.id)
        content.write_to_file(output_path.as_posix())
        return output_path
    except Exception as e:
        if retry < max_retries - 1:
            logger.warning(f"Download failed, retrying in {retry_interval}s...")
            time.sleep(retry_interval)
        else:
            raise
```

---

### 2. タイムアウト

デフォルトで 10 分のタイムアウトを設定しています。

```python
start_time = time.time()
while time.time() - start_time < self._poll_timeout:
    # ポーリング処理
    ...
    time.sleep(self._poll_interval)

raise TimeoutError(f"Timed out waiting for video {video.id}")
```

---

### 3. 生成失敗

```python
if video.status == "failed":
    error_msg = getattr(getattr(video, "error", None), "message", "Video generation failed")
    raise RuntimeError(f"Sora video generation failed: {error_msg}")
```

---

## 導入手順

### 1. 環境構築

```bash
# 環境変数を設定
export OPENAI_API_KEY=your_key
export SORA_MODEL=sora-2.0
export REDIS_URL=redis://localhost:6379/0

# 依存パッケージをインストール
pip install openai celery redis pillow tenacity
```

---

### 2. Backend の起動

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 3. Worker の起動

```bash
cd worker
celery -A app worker --loglevel=info --concurrency=2
```

---

### 4. テスト

```bash
# 動画生成リクエスト
curl -X POST http://localhost:8000/api/renders \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "test-project",
    "variant_id": null,
    "force_refresh": false
  }'

# ステータス確認
curl http://localhost:8000/api/renders/{job_id}
```

---

## まとめ

このドキュメントで紹介した実装パターンを使えば、以下の機能を持つ Sora2 API 統合を実現できます：

- ✅ 非同期動画生成
- ✅ ステータスポーリング
- ✅ 参照画像サポート（リサイズあり）
- ✅ ダウンロードリトライ
- ✅ エラーハンドリング
- ✅ Celery による分散処理

各コンポーネントは独立しているため、他のプロジェクトでも簡単に再利用できます。

---

## 参考リンク

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Celery Documentation](https://docs.celeryproject.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
