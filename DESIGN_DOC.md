# 🎬 Future You System - Claude Code 開発用設計書

---

## 📋 プロジェクト概要

### プロジェクト名
Future You - 未来の自分からのビデオメッセージ生成システム

### 目的
ユーザーの理想の未来を入力すると、AIが3年後の成功した自分からの励ましのビデオメッセージ（Sora2）とブログ記事（GPT-4）を自動生成するWebアプリケーション

### 主要機能
1. Webフォームで未来の理想を入力
2. GPT-4で未来のペルソナ・シナリオ・記事を生成
3. Sora2で15秒のビデオメッセージを生成
4. 動画埋め込み済みのHTML記事ページを自動生成
5. 完成ページを自動で開く

---

## 🛠️ 技術スタック

### フロントエンド
- HTML5 + CSS3 + Vanilla JavaScript
- レスポンシブデザイン

### バックエンド
- Node.js (v18+)
- Express.js

### AI/API
- OpenAI GPT-4 (テキスト生成)
- OpenAI Sora2 (動画生成)

### 依存パッケージ
```json
{
  "openai": "^4.77.0",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7"
}

📁 プロジェクト構成
future-you-system/
├── README.md                      # プロジェクト説明
├── package.json                   # 依存関係定義
├── .env                          # 環境変数（非コミット）
├── .env.example                  # 環境変数テンプレート
├── .gitignore                    # Git除外設定
├── server.js                     # Expressサーバー
├── src/
│   ├── generators/
│   │   ├── persona-generator.js     # ペルソナ生成
│   │   ├── scenario-generator.js    # シナリオ生成
│   │   ├── article-generator.js     # 記事生成
│   │   ├── prompt-generator.js      # Sora2プロンプト生成
│   │   └── video-generator.js       # Sora2動画生成
│   ├── html-generator.js           # HTMLページ生成
│   └── main-pipeline.js            # メインパイプライン
├── public/
│   └── index.html                  # フォームページ
└── output/                         # 生成されたHTMLファイル保存先

📄 各ファイルの詳細仕様
1. package.json
json{
  "name": "future-you-system",
  "version": "1.0.0",
  "description": "未来の自分からのビデオメッセージ生成システム",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["ai", "video", "sora2", "gpt-4", "future"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "openai": "^4.77.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}

2. .env.example
bash# OpenAI API設定
OPENAI_API_KEY=sk-proj-your-api-key-here

# サーバー設定
PORT=3000
NODE_ENV=development

# ログ設定
LOG_LEVEL=info

3. server.js
役割: Expressサーバーのエントリーポイント
仕様:

ポート3000でHTTPサーバーを起動
/api/generate エンドポイントでPOSTリクエストを受け付け
public/ ディレクトリを静的ファイルとして配信
output/ ディレクトリを /output パスで配信
CORSを有効化
エラーハンドリング実装

実装要件:
javascriptimport express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateFutureYouContent } from './src/main-pipeline.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/output', express.static('output'));

// POST /api/generate エンドポイント
app.post('/api/generate', async (req, res) => {
  try {
    const formData = req.body;
    console.log('\n📩 新しいリクエスト受信');
    console.log(`   ニックネーム: ${formData.q8}\n`);
    
    const result = await generateFutureYouContent(formData);
    
    console.log('\n✅ 全処理完了');
    console.log(`   動画URL: ${result.videoUrl}`);
    console.log(`   記事URL: ${result.pageUrl}\n`);
    
    res.json(result);
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

4. src/main-pipeline.js
役割: 全生成処理を統括するメインパイプライン
実装要件:
javascriptimport OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { generatePersona } from './generators/persona-generator.js';
import { generateScenario } from './generators/scenario-generator.js';
import { generateArticle } from './generators/article-generator.js';
import { generateVideoPrompt } from './generators/prompt-generator.js';
import { generateVideo } from './generators/video-generator.js';
import { generateHTMLPage } from './html-generator.js';

export async function generateFutureYouContent(formData) {
  console.log('\n🎬 未来の自分コンテンツ生成開始');
  console.log(`   ニックネーム: ${formData.q8}\n`);
  
  try {
    // ステップ1: ペルソナ生成
    console.log('👤 Step 1/5: 未来のペルソナ生成中...');
    const persona = await generatePersona(formData);
    console.log(`✅ 完了: ${persona.career}\n`);
    
    // ステップ2: シナリオ生成
    console.log('📝 Step 2/5: メッセージシナリオ作成中...');
    const scenario = await generateScenario(formData, persona);
    console.log(`✅ 完了\n`);
    
    // ステップ3: ブログ記事生成
    console.log('✍️  Step 3/5: ブログ記事作成中...');
    const article = await generateArticle(formData, persona, scenario);
    console.log(`✅ 完了: ${article.title}\n`);
    
    // ステップ4: プロンプト生成
    console.log('🎨 Step 4/5: 動画プロンプト最適化中...');
    const videoPrompt = await generateVideoPrompt(persona, scenario);
    console.log(`✅ 完了\n`);
    
    // ステップ5: Sora2で動画生成
    console.log('🎬 Step 5/5: Sora2で動画生成中...');
    const video = await generateVideo(videoPrompt);
    console.log(`✅ 動画生成完了: ${video.id}\n`);
    
    // 動画URLを構築
    const videoUrl = `https://api.openai.com/v1/videos/${video.id}/content`;
    
    // HTMLページを生成
    console.log('🌐 HTMLページ生成中...');
    const htmlContent = generateHTMLPage({
      formData,
      persona,
      scenario,
      article,
      videoUrl,
      videoId: video.id,
    });
    
    // HTMLファイルを保存
    const timestamp = Date.now();
    const filename = `future-you-${formData.q8}-${timestamp}.html`;
    const outputPath = path.join('./output', filename);
    
    await fs.mkdir('./output', { recursive: true });
    await fs.writeFile(outputPath, htmlContent, 'utf-8');
    
    console.log(`✅ HTMLファイル保存: ${outputPath}\n`);
    
    return {
      success: true,
      videoId: video.id,
      videoUrl: videoUrl,
      htmlPath: outputPath,
      htmlFilename: filename,
      pageUrl: `/output/${filename}`,
      persona: persona,
      scenario: scenario,
      article: article,
      message: `${formData.q8}さんへの未来からのメッセージが完成しました！`,
    };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    throw error;
  }
}

5. src/generators/persona-generator.js
GPT-4プロンプト構造:
システムプロンプト:
あなたはキャリアカウンセラーです。
相談者の理想の未来から、3年後の成功した具体的な姿を描いてください。
ユーザープロンプト:
以下の情報から、3年後の成功した姿をJSON形式で出力してください。

【理想の仕事】
${formData.q4}

【理想のプライベート】
${formData.q5}

【理想の人間関係】
${formData.q6}

【大切にしている価値観】
${formData.q7}

出力形式:
{
  "age": "3年後の推定年齢",
  "career": "具体的な職業",
  "workplace": "職場環境の詳細な描写（映像的に）",
  "achievements": ["達成1", "達成2", "達成3"],
  "lifestyle": "プライベートの様子",
  "relationships": "人間関係の状況",
  "personality": "雰囲気・性格"
}
実装要件:
javascriptimport OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePersona(formData) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `あなたはキャリアカウンセラーです。
相談者の理想の未来から、3年後の成功した具体的な姿を描いてください。`
    }, {
      role: 'user',
      content: `以下の情報から、3年後の成功した姿をJSON形式で出力してください。

【理想の仕事】
${formData.q4}

【理想のプライベート】
${formData.q5}

【理想の人間関係】
${formData.q6}

【大切にしている価値観】
${formData.q7}

出力形式:
{
  "age": "3年後の推定年齢",
  "career": "具体的な職業",
  "workplace": "職場環境の詳細な描写（映像的に）",
  "achievements": ["達成したこと1", "達成したこと2", "達成したこと3"],
  "lifestyle": "プライベートの様子",
  "relationships": "人間関係の状況",
  "personality": "雰囲気・性格"
}`
    }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });
  
  return JSON.parse(response.choices[0].message.content);
}

6. src/generators/scenario-generator.js
GPT-4プロンプト構造:
システムプロンプト:
あなたは3年後の成功した自分です。
過去の自分（${formData.q8}さん）に向けて、温かく具体的な励ましのメッセージを作成してください。

メッセージは15秒の動画で伝えることを想定：
- 冒頭: 共感と理解（2-3秒）
- アドバイス: 具体的な3つ（9-10秒）
- 締め: 力強い応援（2-3秒）
ユーザープロンプト:
【未来の自分の情報】
職業: ${persona.career}
達成: ${persona.achievements.join(', ')}
ライフスタイル: ${persona.lifestyle}

【過去の自分への理解】
理想の仕事: ${formData.q4}
理想のプライベート: ${formData.q5}
理想の人間関係: ${formData.q6}
大切な価値観: ${formData.q7}

15秒の動画メッセージのシナリオをJSON形式で:
{
  "opening": "冒頭の挨拶（${formData.q8}さん、と呼びかける）",
  "advice": [
    "具体的なアドバイス1（30文字程度）",
    "具体的なアドバイス2（30文字程度）",
    "具体的なアドバイス3（30文字程度）"
  ],
  "closing": "締めの力強い言葉（20-30文字）",
  "summary": "メッセージ全体の要約（1文）",
  "fullText": "メッセージ全文（読みやすい形式で）"
}
実装要件:
javascriptimport OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateScenario(formData, persona) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `あなたは3年後の成功した自分です。
過去の自分（${formData.q8}さん）に向けて、温かく具体的な励ましのメッセージを作成してください。

メッセージは15秒の動画で伝えることを想定：
- 冒頭: 共感と理解（2-3秒）
- アドバイス: 具体的な3つ（9-10秒）
- 締め: 力強い応援（2-3秒）`
    }, {
      role: 'user',
      content: `【未来の自分の情報】
職業: ${persona.career}
達成: ${persona.achievements.join(', ')}
ライフスタイル: ${persona.lifestyle}

【過去の自分への理解】
理想の仕事: ${formData.q4}
理想のプライベート: ${formData.q5}
理想の人間関係: ${formData.q6}
大切な価値観: ${formData.q7}

15秒の動画メッセージのシナリオをJSON形式で:
{
  "opening": "冒頭の挨拶（${formData.q8}さん、と呼びかける）",
  "advice": [
    "具体的なアドバイス1（30文字程度）",
    "具体的なアドバイス2（30文字程度）",
    "具体的なアドバイス3（30文字程度）"
  ],
  "closing": "締めの力強い言葉（20-30文字）",
  "summary": "メッセージ全体の要約（1文）",
  "fullText": "メッセージ全文（読みやすい形式で）"
}`
    }],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });
  
  return JSON.parse(response.choices[0].message.content);
}

7. src/generators/article-generator.js
GPT-4プロンプト構造:
システムプロンプト:
あなたはプロのライターです。
未来の自分からのメッセージをベースに、感動的で実用的なブログ記事を作成してください。

記事構成:
1. トレンド（現在の課題と背景）
2. 未来の自分から学んだこと（具体的なエピソード）
3. 実践すべきこと（実践的なアドバイス）
4. 今後のキャリアで目指したいこと（未来展望）

読者が共感でき、行動を起こしたくなる内容にしてください。
実装要件:
javascriptimport OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateArticle(formData, persona, scenario) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `あなたはプロのライターです。
未来の自分からのメッセージをベースに、感動的で実用的なブログ記事を作成してください。

記事構成:
1. トレンド（現在の課題と背景）
2. 未来の自分から学んだこと（具体的なエピソード）
3. 実践すべきこと（実践的なアドバイス）
4. 今後のキャリアで目指したいこと（未来展望）

読者が共感でき、行動を起こしたくなる内容にしてください。`
    }, {
      role: 'user',
      content: `以下の情報からブログ記事を作成してください。

【ニックネーム】
${formData.q8}

【現在の理想】
仕事: ${formData.q4}
プライベート: ${formData.q5}
人間関係: ${formData.q6}
価値観: ${formData.q7}

【未来のペルソナ】
職業: ${persona.career}
達成: ${persona.achievements.join(', ')}
ライフスタイル: ${persona.lifestyle}

【メッセージ】
${scenario.fullText}

JSON形式で出力:
{
  "title": "記事タイトル（キャッチーで具体的に）",
  "subtitle": "サブタイトル",
  "sections": [
    {
      "heading": "1. トレンド（${formData.q8}が直面していること）",
      "content": "現在の課題と背景を説明（200-300文字）"
    },
    {
      "heading": "2. 未来の自分から学んだこと",
      "content": "具体的なエピソードと学び（300-400文字）"
    },
    {
      "heading": "3. 実践すべきこと",
      "content": "具体的なアドバイス（箇条書き含む、300文字）"
    },
    {
      "heading": "4. 今後のキャリアで目指したいこと",
      "content": "未来展望とモチベーション（200-300文字）"
    }
  ],
  "summary": [
    "ポイント1（20-30文字）",
    "ポイント2（20-30文字）",
    "ポイント3（20-30文字）"
  ],
  "conclusion": "締めの言葉（100-150文字）"
}`
    }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });
  
  return JSON.parse(response.choices[0].message.content);
}

8. src/generators/prompt-generator.js
実装要件:
javascriptimport OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateVideoPrompt(persona, scenario) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `あなたはSora2のプロンプトエンジニアです。
以下を含む映像的なプロンプトを英語で1文で作成してください：
- Medium shot（推奨）
- Subject（人物の詳細）
- Setting（環境）
- Lighting（自然光など）
- Action（カメラに向かって語りかける仕草）
- Mood（温かい、励ましの雰囲気）
- Technical（cinematic, soft focus など）

80-120語程度で。`
    }, {
      role: 'user',
      content: `職業: ${persona.career}
職場: ${persona.workplace}
性格: ${persona.personality}
メッセージ: ${scenario.summary}

この人物が、カメラに向かって温かく励ましのメッセージを伝えるシーンのプロンプトを作成してください。`
    }],
    temperature: 0.7,
  });
  
  return response.choices[0].message.content;
}

9. src/generators/video-generator.js
実装要件:
javascriptimport OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateVideo(prompt) {
  console.log('   プロンプト:', prompt.substring(0, 60) + '...');
  
  // 動画生成開始
  let video = await openai.videos.create({
    model: 'sora-2-pro',
    prompt: prompt,
    size: '1280x720',
    seconds: '15',
  });
  
  console.log(`   動画ジョブ作成: ${video.id}`);
  console.log(`   初期ステータス: ${video.status}`);
  
  // ポーリングで完了を待つ
  let lastProgress = 0;
  console.log('   進捗:');
  
  while (true) {
    video = await openai.videos.retrieve(video.id);
    
    const progress = video.progress || 0;
    if (progress !== lastProgress) {
      const filled = Math.floor((progress / 100) * 30);
      const bar = '█'.repeat(filled) + '░'.repeat(30 - filled);
      process.stdout.write(`\r   [${bar}] ${progress}%`);
      lastProgress = progress;
    }
    
    if (video.status === 'completed') {
      console.log('\n');
      break;
    }
    
    if (video.status === 'failed') {
      throw new Error(`動画生成失敗: ${video.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return video;
}

10. src/html-generator.js
実装要件: HTMLページを生成する関数。以下の要素を含む完全なHTMLを返す関数を実装してください。

レスポンシブデザイン（モバイル・タブレット・デスクトップ対応）
ヘッダー（ロゴ + タイトル）
ヒーローセクション（グラデーション背景: #667eea → #764ba2）
動画セクション（16:9アスペクト比、controls、autoplay、muted）
ペルソナ紹介カード（オレンジ系グラデーション背景）
記事本文（各セクション）
まとめボックス（緑系グラデーション背景）
締めの言葉
フッター

スタイル要件:

フォント: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans"
カードの角丸: border-radius: 12px
影: box-shadow: 0 2px 12px rgba(0,0,0,0.08)


11. public/index.html
フォームページの完全な実装。以下の要素を含む:
フォーム項目:

Q3: 性別（select - 任意）
Q4: 3年後の理想の仕事イメージ（textarea - 必須）
Q5: 3年後の理想のプライベートイメージ（textarea - 必須）
Q6: 3年後の理想の人間関係（textarea - 必須）
Q7: 大切にしている価値観（textarea - 必須）
Q8: ニックネーム（text - 必須）

画面状態:

フォーム入力画面
ローディング画面（スピナー + 進捗メッセージ）
成功画面（完成メッセージ + リンクボタン）

JavaScript処理:

フォーム送信時にFormDataを収集
/api/generate にPOSTリクエスト
ローディング表示の切り替え
レスポンス受信後、成功画面を表示
2秒後に記事ページを自動で開く


12. .gitignore
node_modules/
.env
output/*.html
*.log
.DS_Store

13. README.md
markdown# Future You System

未来の自分からのビデオメッセージ生成システム

## セットアップ
```bash
npm install
cp .env.example .env
# .envファイルにOPENAI_API_KEYを設定
起動
bashnpm start
http://localhost:3000 にアクセス
技術スタック

Node.js + Express
OpenAI GPT-4
OpenAI Sora2

ライセンス
MIT

---

## 🔧 環境変数

| 変数名 | 説明 | 必須 | デフォルト値 |
|--------|------|------|--------------|
| OPENAI_API_KEY | OpenAI APIキー | ✅ | - |
| PORT | サーバーポート | ❌ | 3000 |
| NODE_ENV | 環境（development/production） | ❌ | development |

---

## 🎯 Claude Code 実装指示

### フェーズ1: プロジェクトセットアップ
package.jsonを作成してください。
dependencies: openai, express, cors, dotenv
devDependencies: nodemon
type: module
scripts: start, dev

必要なディレクトリ構造を作成してください:

src/generators/
public/
output/


.env.exampleファイルを作成してください

.gitignoreファイルを作成してください

---

### フェーズ2: 基本サーバー実装
server.jsを実装してください。
要件:

Express.jsでHTTPサーバーを起動
ポート3000でリッスン
/api/generateエンドポイント（POST）を実装
publicディレクトリを静的ファイルとして配信
outputディレクトリを/outputパスで配信
CORSを有効化
エラーハンドリング


---

### フェーズ3: GPT-4生成機能実装
src/generators/persona-generator.jsを実装してください。
generatePersona(formData)関数を実装:

GPT-4を使用
モデル: gpt-4
response_format: json_object
temperature: 0.7
システムプロンプトとユーザープロンプトは設計書を参照
戻り値: ペルソナオブジェクト（JSON）


src/generators/scenario-generator.jsを実装してください。
generateScenario(formData, persona)関数を実装:

GPT-4を使用
設計書のプロンプト仕様に従う
戻り値: シナリオオブジェクト（JSON）


src/generators/article-generator.jsを実装してください。
generateArticle(formData, persona, scenario)関数を実装:

GPT-4を使用
設計書のプロンプト仕様に従う
戻り値: 記事オブジェクト（JSON）


src/generators/prompt-generator.jsを実装してください。
generateVideoPrompt(persona, scenario)関数を実装:

GPT-4を使用
英語で80-120語のSora2プロンプトを生成
戻り値: プロンプト文字列


---

### フェーズ4: Sora2動画生成実装
src/generators/video-generator.jsを実装してください。
generateVideo(prompt)関数を実装:

openai.videos.create()でジョブ作成
model: sora-2-pro, size: 1280x720, seconds: 15
ポーリングで完了を待つ（2秒間隔）
進捗バーをコンソールに表示（30文字幅）
ステータスがcompletedになったら動画オブジェクトを返す
エラーハンドリング


---

### フェーズ5: HTMLページ生成実装
src/html-generator.jsを実装してください。
generateHTMLPage(data)関数を実装:

設計書のHTML構造に従う
レスポンシブデザイン
モダンなスタイル（グラデーション背景、影、角丸）
動画プレイヤー（16:9、controls、autoplay、muted）
ペルソナカード、記事セクション、まとめボックスを含む
戻り値: HTML文字列


---

### フェーズ6: メインパイプライン実装
src/main-pipeline.jsを実装してください。
generateFutureYouContent(formData)関数を実装:

全生成処理を順番に実行:

generatePersona
generateScenario
generateArticle
generateVideoPrompt
generateVideo
generateHTMLPage
fs.writeFileでHTMLファイルを保存


各ステップで進捗をコンソールにログ出力
エラーハンドリング
戻り値: 結果オブジェクト（videoUrl, pageUrl等）


---

### フェーズ7: フロントエンド実装
public/index.htmlを実装してください。
要件:

フォーム（Q3-Q8）
ローディング画面
成功画面
JavaScript:

フォーム送信処理
/api/generateにPOSTリクエスト
ローディング表示切り替え
レスポンス受信後、成功画面表示
2秒後に記事ページを自動で開く


スタイル:

グラデーション背景
モダンなフォームデザイン
レスポンシブ対応




---

### フェーズ8: 統合とテスト
server.jsを完成させてください。
main-pipeline.jsをインポートして、/api/generateエンドポイントで呼び出す。
エラーハンドリングを実装。

README.mdを作成してください。
セットアップ手順、起動方法、技術スタックを記載。

---

## 🧪 テストケース

### 正常系テスト

**入力**:
```json
{
  "q3": "male",
  "q4": "リードエンジニアとしてチームを率いている",
  "q5": "ワークライフバランスを保ち、趣味も楽しんでいる",
  "q6": "信頼できる仲間と切磋琢磨している",
  "q7": "誠実さ、成長、バランス",
  "q8": "テスト太郎"
}
期待結果:

ペルソナが生成される
シナリオが生成される
記事が生成される
動画プロンプトが英語で生成される
Sora2動画が生成される（15秒、1280x720）
HTMLファイルが output/ に保存される
レスポンスに videoUrl と pageUrl が含まれる


📊 実装優先順位

最優先: server.js, main-pipeline.js
高優先: persona-generator.js, scenario-generator.js, video-generator.js
中優先: article-generator.js, prompt-generator.js, html-generator.js
低優先: public/index.html（デザイン調整）