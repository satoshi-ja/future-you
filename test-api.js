/**
 * API動作テストスクリプト
 * OpenAI/Sora APIをスタブ化して基本動作を確認
 */

import http from 'http';

const TEST_PORT = 5173;
const TEST_HOST = 'localhost';

// テストリクエストデータ（フォーム形式に合わせる）
const testData = {
  q1: "テスト太郎",
  q2: "25",
  q3: "ソフトウェアエンジニア",
  q4: "最先端の技術を使って社会に貢献する",
  q5: "健康的で充実した生活",
  q6: "信頼できる仲間との良好な関係",
  q7: "成長と挑戦",
  q8: "テスト太郎"
};

// テスト実行
async function runTest() {
  console.log('🧪 API動作テスト開始...\n');

  const postData = JSON.stringify(testData);

  const options = {
    hostname: TEST_HOST,
    port: TEST_PORT,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      console.log(`📊 ステータスコード: ${res.statusCode}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('\n✅ レスポンス受信:');
          console.log(JSON.stringify(result, null, 2));

          if (result.videoUrl && result.htmlPath) {
            console.log('\n🎉 テスト成功！');
            console.log(`動画URL: ${result.videoUrl}`);
            console.log(`HTMLパス: ${result.htmlPath}`);
          } else if (result.error) {
            console.log('\n⚠️  エラーレスポンス:', result.error);
          }

          resolve(result);
        } catch (error) {
          console.error('\n❌ レスポンス解析エラー:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ リクエストエラー:', error.message);
      console.log(`\nサーバーが起動していることを確認してください:`);
      console.log(`  npm start`);
      console.log(`  http://localhost:${TEST_PORT}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// メイン実行
console.log('Future You API テスト');
console.log('===================\n');
console.log('テストデータ:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n');

runTest()
  .then(() => {
    console.log('\n✅ テスト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ テスト失敗:', error.message);
    process.exit(1);
  });
