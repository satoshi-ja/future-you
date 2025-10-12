import mongoose from 'mongoose';

let isConnected = false;

/**
 * MongoDB接続管理
 */
export async function connectDB() {
  if (isConnected) {
    console.log('📦 既存のMongoDB接続を使用');
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/future-you';

    console.log('📦 MongoDBに接続中...');

    await mongoose.connect(MONGODB_URI, {
      // Mongoose 6+のデフォルト設定を使用
      serverSelectionTimeoutMS: 5000, // 5秒でタイムアウト
      socketTimeoutMS: 45000, // 45秒でソケットタイムアウト
    });

    isConnected = true;
    console.log('✅ MongoDB接続成功:', MONGODB_URI);

    // 接続エラーハンドリング
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB接続エラー:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDBから切断されました');
      isConnected = false;
    });

    // プロセス終了時の処理
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB接続をクローズしました');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB接続失敗:', error.message);
    throw error;
  }
}

/**
 * MongoDB接続を切断
 */
export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB接続をクローズしました');
  } catch (error) {
    console.error('MongoDB切断エラー:', error);
    throw error;
  }
}

/**
 * 接続状態を取得
 */
export function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  };
}
