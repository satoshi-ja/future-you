# 🍎 Future You System

**未来の自分からのビデオメッセージ生成システム**

> Apple風の洗練されたデザインで、3年後の理想の自分からメッセージを受け取りましょう

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

**ネットワーク制限がある場合:**
- プロキシ設定: `npm config set proxy http://your-proxy:port`
- レジストリアクセスを許可: `https://registry.npmjs.org/`

### 2. MongoDBのインストールと起動

```bash
# Homebrewを使用してMongoDBをインストール
brew tap mongodb/brew
brew install mongodb-community

# MongoDBサービスを起動
brew services start mongodb-community

# 起動確認
mongosh --eval "db.version()"
```

**Dockerを使用する場合:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを開き、設定を行う:

```env
# OpenAI API Key (必須)
OPENAI_API_KEY=your_openai_api_key_here

# Server Port (デフォルト: 5173)
PORT=5173

# OpenAI Models (オプション)
GPT_MODEL=gpt-5-pro
SORA_MODEL=sora-2

# MongoDB Connection (デフォルト: mongodb://localhost:27017/future-you)
MONGODB_URI=mongodb://localhost:27017/future-you

# Mock Mode (テスト用、API呼び出しなし)
USE_MOCK=false
```

### 4. サーバーの起動

```bash
npm start
```

または開発モード（自動再起動）:

```bash
npm run dev
```

### 5. 動作確認

#### ヘルスチェック

```bash
curl http://localhost:5173/api/health
```

#### ブラウザでの確認

ブラウザで `http://localhost:5173` を開き、以下を確認:

1. フォームに情報を入力
2. 「生成」ボタンをクリック
3. 動画/HTML生成の完了を待つ
4. 結果が表示されることを確認

#### APIテストの実行

別ターミナルでサーバーを起動した状態で:

```bash
npm test
```

このテストスクリプトは:
- API エンドポイント `/api/generate` の動作確認
- レスポンス形式の検証
- エラーハンドリングの確認
を行います。

## 🎨 デザインシステム

このプロジェクトは **Apple風のデザイン言語** を採用しています：

### デザイン哲学
1. **ミニマリズムの極致** - 「Less is More」の徹底
2. **タイポグラフィ・ファースト** - 大胆なサイズコントラストと明確な階層
3. **マイクロインタラクション** - 滑らかで予測可能なアニメーション

### 主要な特徴
- 🎨 **Apple Gray Scale カラーパレット**
- ✨ **48-96px の大胆な見出し**
- 💫 **60fps の滑らかなアニメーション**
- 📱 **完全レスポンシブ対応**
- ♿ **WCAG 2.1 AA準拠のアクセシビリティ**

詳細は [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) を参照してください。

## 💻 技術スタック

- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **AI**: OpenAI GPT-5 + Sora2
- **Frontend**: Pure HTML/CSS/JavaScript (Apple Design System)
- **Font**: SF Pro Display/Text風システムフォント

## 📡 API仕様

### POST /api/generate
未来メッセージの生成

**リクエスト:**
```json
{
  "q1": "名前",
  "q2": "年齢",
  "q3": "職業",
  "q4": "夢や目標",
  "q5": "人生のビジョン",
  "q6": "大切にしている関係性",
  "q7": "価値観",
  "q8": "ニックネーム"
}
```

**レスポンス:**
```json
{
  "success": true,
  "dbId": "MongoDB Document ID",
  "videoId": "Sora2 Video ID",
  "videoUrl": "動画URL",
  "pageUrl": "/output/filename.html",
  "message": "完成メッセージ"
}
```

### GET /api/history?limit=10&status=completed
生成履歴の取得

### GET /api/record/:id
個別レコードの取得

### GET /api/search/:nickname
ニックネームで検索

### GET /api/health
ヘルスチェック（DB接続状態を含む）

## ライセンス

MIT

---

## 🔧 環境変数

| 変数名 | 説明 | 必須 | デフォルト値 |
| ------ | ---- | ---- | ------------ |
| OPENAI_API_KEY | OpenAI APIキー | ✅ | - |
| PORT | サーバーポート | ❌ | 5173 |
| GPT_MODEL | 使用するGPTモデル | ❌ | gpt-5-pro |
| SORA_MODEL | 使用するSoraモデル | ❌ | sora-2 |
| MONGODB_URI | MongoDB接続URI | ❌ | mongodb://localhost:27017/future-you |
| USE_MOCK | モックモード（テスト用） | ❌ | false |

## 📁 プロジェクト構成

```
future-you/
├── public/
│   └── index.html              # フォーム入力ページ (Apple風デザイン)
├── src/
│   ├── db/
│   │   ├── schema.js           # MongoDBスキーマ定義
│   │   └── connection.js       # DB接続管理
│   ├── generators/             # コンテンツ生成ロジック
│   │   ├── persona-generator.js
│   │   ├── scenario-generator.js
│   │   ├── article-generator.js
│   │   ├── prompt-generator.js
│   │   └── video-generator.js  # Sora2 REST API実装
│   ├── html-generator.js       # 結果ページ生成 (Apple風デザイン)
│   └── main-pipeline.js        # メインパイプライン (DB統合)
├── docs/
│   ├── DESIGN_SYSTEM.md        # デザインシステムドキュメント
│   └── DESIGN_DOC.md           # 設計ドキュメント
├── output/                     # 生成されたHTMLファイル
├── server.js                   # Expressサーバー (API実装)
└── package.json
```

## 📝 注意事項

- GPTモデルとSoraモデルは、APIキーのアクセス権限に応じて利用可能なモデルを環境変数で指定してください
- APIキーに利用可能なモデルを確認するには: `node check-models.js`
- **利用可能なGPTモデル**: `gpt-5`, `gpt-5-pro`, `gpt-5-pro-2025-10-06`, `gpt-4o-mini-tts`
- **推奨モデル**: `gpt-5-pro` (最新・最高性能)
- Soraモデル例: `sora-2`, `sora-2-pro`

## 🎯 パフォーマンス目標

- **LCP** (Largest Contentful Paint): < 2.5秒
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Animation FPS**: 60fps

## 🌐 ブラウザ対応

- ✅ Chrome/Edge (最新版)
- ✅ Safari (最新版)
- ✅ Firefox (最新版)
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+
