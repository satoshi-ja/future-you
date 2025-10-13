import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Future You Message Schema
 * ユーザーの入力内容と生成されたコンテンツを管理
 */
const futureYouMessageSchema = new Schema({
  // ユーザー入力データ
  formData: {
    q1: { type: String }, // 名前
    q2: { type: String }, // 年齢
    q3: { type: String }, // 職業
    q4: { type: String }, // 夢や目標
    q5: { type: String }, // 人生のビジョン
    q6: { type: String }, // 大切にしている関係性
    q7: { type: String }, // 価値観
    q8: { type: String }, // ニックネーム
  },

  // 生成されたペルソナ
  persona: {
    name: String,
    age: Schema.Types.Mixed, // 数値または文字列を許容
    occupation: String,
    achievements: [String],
    personality: String,
    lifestyle: String,
  },

  // 生成されたシナリオ
  scenario: {
    setting: String,
    situation: String,
    emotionalTone: String,
    keyMessage: String,
  },

  // 生成された記事
  article: {
    title: String,
    content: String,
    publishedDate: String,
  },

  // Sora2動画情報
  video: {
    videoId: String,
    videoUrl: String,
    localPath: String, // ローカルに保存された動画ファイルパス
    prompt: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    createdAt: Date,
    completedAt: Date,
    error: String,
  },

  // HTML出力情報
  output: {
    htmlFilename: String,
    htmlPath: String,
    pageUrl: String,
  },

  // チャット履歴
  chat: {
    history: [{
      role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    lastMessageAt: Date,
    messageCount: {
      type: Number,
      default: 0,
    },
  },

  // メタデータ
  metadata: {
    ipAddress: String,
    userAgent: String,
    processingTime: Number, // ミリ秒
    apiModel: {
      gpt: String,
      sora: String,
    },
  },

  // ステータス管理
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'failed'],
    default: 'draft',
  },

  // タイムスタンプ
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // createdAt, updatedAt自動管理
  collection: 'future_you_messages',
});

// インデックス設定
futureYouMessageSchema.index({ 'formData.q8': 1 }); // ニックネームで検索
futureYouMessageSchema.index({ 'video.videoId': 1 }); // 動画IDで検索
futureYouMessageSchema.index({ status: 1, createdAt: -1 }); // ステータスと日時で検索
futureYouMessageSchema.index({ 'metadata.ipAddress': 1 }); // IPアドレスで検索

// 仮想プロパティ: 公開URL
futureYouMessageSchema.virtual('publicUrl').get(function() {
  return this.output?.pageUrl ? `http://localhost:${process.env.PORT || 5173}${this.output.pageUrl}` : null;
});

// メソッド: ステータス更新
futureYouMessageSchema.methods.updateStatus = function(status, error = null) {
  this.status = status;
  if (error) {
    this.video.status = 'failed';
    this.video.error = error;
  }
  this.updatedAt = new Date();
  return this.save();
};

// スタティックメソッド: ニックネームで検索
futureYouMessageSchema.statics.findByNickname = function(nickname) {
  return this.find({ 'formData.q8': new RegExp(nickname, 'i') })
    .sort({ createdAt: -1 });
};

// スタティックメソッド: 動画IDで検索
futureYouMessageSchema.statics.findByVideoId = function(videoId) {
  return this.findOne({ 'video.videoId': videoId });
};

// スタティックメソッド: 最近の生成結果を取得
futureYouMessageSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// JSONシリアライズ時に仮想プロパティを含める
futureYouMessageSchema.set('toJSON', { virtuals: true });
futureYouMessageSchema.set('toObject', { virtuals: true });

export const FutureYouMessage = mongoose.model('FutureYouMessage', futureYouMessageSchema);
