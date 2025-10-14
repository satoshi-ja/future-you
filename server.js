import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { generateFutureYouContent } from './src/main-pipeline.js';
import { connectDB, getConnectionStatus } from './src/db/connection.js';
import { FutureYouMessage } from './src/db/schema.js';
import { generateChatResponse } from './src/generators/chat-generator.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5173;
const publicDir = path.resolve(process.cwd(), 'public');
const outputDir = path.resolve(process.cwd(), 'output');

// MongoDB接続
await connectDB();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));
app.use('/output', express.static(outputDir));

// メイン生成API
app.post('/api/generate', async (req, res) => {
  try {
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const result = await generateFutureYouContent(req.body, metadata);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('POST /api/generate error:', error);
    res.status(500).json({ error: message });
  }
});

// 動画プロキシエンドポイント（OpenAI APIから動画を取得してストリーム配信）
app.get('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const apiKey = process.env.OPENAI_API_KEY;
    const videoUrl = `https://api.openai.com/v1/videos/${videoId}/content`;

    const response = await fetch(videoUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }

    // ヘッダーを設定してストリーム配信
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');

    // レスポンスボディをそのままパイプ
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('GET /api/video/:videoId error:', error);
    res.status(500).json({ error: message });
  }
});

// 生成履歴取得API
app.get('/api/history', async (req, res) => {
  try {
    const { limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const history = await FutureYouMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('-__v');

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('GET /api/history error:', error);
    res.status(500).json({ error: message });
  }
});

// 個別レコード取得API
app.get('/api/record/:id', async (req, res) => {
  try {
    const record = await FutureYouMessage.findById(req.params.id).select('-__v');

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('GET /api/record/:id error:', error);
    res.status(500).json({ error: message });
  }
});

// ニックネーム検索API
app.get('/api/search/:nickname', async (req, res) => {
  try {
    const records = await FutureYouMessage.findByNickname(req.params.nickname)
      .select('-__v');

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('GET /api/search/:nickname error:', error);
    res.status(500).json({ error: message });
  }
});

// レコード削除API
app.delete('/api/record/:id', async (req, res) => {
  try {
    const record = await FutureYouMessage.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('DELETE /api/record/:id error:', error);
    res.status(500).json({ error: message });
  }
});

// チャットAPI
app.post('/api/chat/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // レコードを取得
    const record = await FutureYouMessage.findById(recordId);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (record.status !== 'completed') {
      return res.status(400).json({ error: 'Cannot chat with incomplete record' });
    }

    // 会話履歴を取得（最新10件）
    const conversationHistory = record.chat?.history || [];
    const recentHistory = conversationHistory.slice(-10);

    // GPT-5で応答を生成
    const reply = await generateChatResponse(
      recentHistory,
      record.persona,
      record.scenario,
      message
    );

    // 会話履歴を更新
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: reply, timestamp: new Date() }
    ];

    await FutureYouMessage.findByIdAndUpdate(recordId, {
      'chat.history': newHistory,
      'chat.lastMessageAt': new Date(),
      'chat.messageCount': newHistory.length / 2,
    });

    res.json({ success: true, reply });
  } catch (error) {
    const status =
      (typeof error === 'object' && error && 'statusCode' in error && Number(error.statusCode)) ||
      (typeof error === 'object' && error && 'status' in error && Number(error.status)) ||
      (error instanceof Error && /quota/i.test(error.message) ? 429 : 500);

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('POST /api/chat/:recordId error:', error);
    res.status(status >= 400 && status <= 599 ? status : 500).json({ error: message });
  }
});

// ========================================
// ChatKit関連エンドポイント（新規追加）
// ========================================

// ChatKitセッション作成
app.post('/api/chatkit/session', async (req, res) => {
  try {
    const { recordId } = req.body;

    if (!recordId) {
      return res.status(400).json({ error: 'recordIdが必要です' });
    }

    // レコードからペルソナ情報を取得
    const record = await FutureYouMessage.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: 'レコードが見つかりません' });
    }

    if (record.status !== 'completed') {
      return res.status(400).json({
        error: '動画生成が完了していません。先に動画を生成してください。'
      });
    }

    console.log('📱 ChatKitセッション作成開始:', recordId);

    // ChatKitセッション作成（直接HTTPリクエスト）
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1'
      },
      body: JSON.stringify({
        workflow: {
          id: process.env.CHATKIT_WORKFLOW_ID
        },
        user: `user_${recordId}`,
        chatkit_configuration: {
          file_upload: {
            enabled: false
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ChatKit API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const session = await response.json();
    console.log('✅ ChatKitセッション作成成功:', session.id);

    res.json({
      client_secret: session.client_secret,
      session_id: session.id,
      expires_after: session.expires_after
    });

  } catch (error) {
    console.error('❌ ChatKitセッション作成エラー:', error);
    res.status(500).json({
      error: 'セッション作成に失敗しました',
      details: error.message
    });
  }
});

// ========================================
// ヘルスチェックAPI
// ========================================

app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
    },
    chatkit: {
      enabled: !!process.env.CHATKIT_WORKFLOW_ID,
      workflowId: process.env.CHATKIT_WORKFLOW_ID ? '設定済み' : '未設定'
    }
  });
});

app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  console.error('Unhandled error:', err);
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`✅ Future You server running on http://localhost:${port}`);
});
