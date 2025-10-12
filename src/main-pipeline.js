import fs from 'fs/promises';
import path from 'path';

import { generatePersona } from './generators/persona-generator.js';
import { generateScenario } from './generators/scenario-generator.js';
import { generateArticle } from './generators/article-generator.js';
import { generateVideoPrompt } from './generators/prompt-generator.js';
import { generateVideo } from './generators/video-generator.js';
import {
  generateMockPersona,
  generateMockScenario,
  generateMockArticle,
  generateMockVideoPrompt,
  generateMockVideo
} from './generators/mock-generator.js';
import { generateHTMLPage } from './html-generator.js';
import { FutureYouMessage } from './db/schema.js';

const OUTPUT_DIR = path.resolve(process.cwd(), 'output');
const USE_MOCK = process.env.USE_MOCK === 'true';

function sanitizeSlug(value) {
  return (value ?? '')
    .toString()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40);
}

export async function generateFutureYouContent(formData, metadata = {}) {
  if (!formData) {
    throw new Error('formData is required');
  }

  const startTime = Date.now();
  let dbRecord = null;

  try {
    const mode = USE_MOCK ? 'モック' : 'API';
    console.log(`🚀 未来メッセージ生成パイプライン開始 (${mode}モード)`);

    // DB初期レコード作成
    dbRecord = new FutureYouMessage({
      formData,
      status: 'processing',
      metadata: {
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        apiModel: {
          gpt: process.env.GPT_MODEL || 'gpt-5',
          sora: process.env.SORA_MODEL || 'sora-2',
        },
      },
    });
    await dbRecord.save();
    console.log(`📦 DBレコード作成: ${dbRecord._id}`);

    console.log('1️⃣ ペルソナ生成中...');
    const persona = USE_MOCK ? generateMockPersona(formData) : await generatePersona(formData);
    console.log('   ✅ ペルソナ生成完了');
    dbRecord.persona = persona;
    await dbRecord.save();

    console.log('2️⃣ シナリオ生成中...');
    const scenario = USE_MOCK ? generateMockScenario(formData, persona) : await generateScenario(formData, persona);
    console.log('   ✅ シナリオ生成完了');
    dbRecord.scenario = scenario;
    await dbRecord.save();

    console.log('3️⃣ 記事生成中...');
    const article = USE_MOCK ? generateMockArticle(formData, persona, scenario) : await generateArticle(formData, persona, scenario);
    console.log('   ✅ 記事生成完了');
    dbRecord.article = article;
    await dbRecord.save();

    console.log('4️⃣ Sora2プロンプト生成中...');
    const videoPrompt = USE_MOCK ? generateMockVideoPrompt(persona, scenario) : await generateVideoPrompt(persona, scenario);
    console.log('   ✅ プロンプト生成完了');

    console.log('5️⃣ Sora2動画生成中...');
    dbRecord.video = {
      prompt: videoPrompt,
      status: 'processing',
      createdAt: new Date(),
    };
    await dbRecord.save();

    const video = USE_MOCK ? await generateMockVideo() : await generateVideo(videoPrompt);
    console.log('   ✅ 動画生成完了');

    // 動画ファイルをダウンロードして保存
    let localVideoPath = null;
    let publicVideoUrl = null;
    if (!USE_MOCK && video.id) {
      try {
        console.log('   📥 動画ファイルをダウンロード中...');
        const videoUrl = `https://api.openai.com/v1/videos/${video.id}/content`;
        const response = await fetch(videoUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });

        if (response.ok) {
          const videoBuffer = Buffer.from(await response.arrayBuffer());
          const videoFilename = `${video.id}.mp4`;
          localVideoPath = path.join(OUTPUT_DIR, videoFilename);
          await fs.mkdir(OUTPUT_DIR, { recursive: true });
          await fs.writeFile(localVideoPath, videoBuffer);
          publicVideoUrl = `/output/${videoFilename}`;
          console.log(`   ✅ 動画保存完了: ${localVideoPath}`);
        } else {
          console.warn(`   ⚠️  動画ダウンロード失敗: ${response.status}`);
        }
      } catch (error) {
        console.error('   ❌ 動画ダウンロードエラー:', error);
      }
    }

    const videoUrl =
      publicVideoUrl ||
      video.url ||
      (video._isMock ? null : `https://api.openai.com/v1/videos/${video.id}/content`);

    dbRecord.video = {
      videoId: video.id,
      videoUrl,
      localPath: localVideoPath,
      prompt: videoPrompt,
      status: 'completed',
      createdAt: dbRecord.video.createdAt,
      completedAt: new Date(),
    };
    await dbRecord.save();

    console.log('6️⃣ HTMLページ生成中...');
    const htmlContent = generateHTMLPage({
      formData,
      persona,
      scenario,
      article,
      videoUrl,
      videoId: video.id,
    });
    console.log('   ✅ HTML生成完了');

    const nicknameSlug = sanitizeSlug(formData.q8 || 'future-you');
    const timestamp = Date.now();
    const filename = `future-you-${nicknameSlug || 'user'}-${timestamp}.html`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, htmlContent, 'utf-8');
    console.log(`💾 HTMLファイル保存: ${outputPath}`);

    // 最終レコード更新
    dbRecord.output = {
      htmlFilename: filename,
      htmlPath: outputPath,
      pageUrl: `/output/${filename}`,
    };
    dbRecord.status = 'completed';
    dbRecord.metadata.processingTime = Date.now() - startTime;
    await dbRecord.save();

    console.log(`✅ 処理完了 (${dbRecord.metadata.processingTime}ms) - DB ID: ${dbRecord._id}`);

    return {
      success: true,
      dbId: dbRecord._id,
      videoId: video.id,
      videoUrl,
      videoPrompt,
      htmlPath: outputPath,
      htmlFilename: filename,
      pageUrl: `/output/${filename}`,
      persona,
      scenario,
      article,
      message: `${formData.q8 ?? 'ユーザー'}さんへの未来からのメッセージが完成しました！`,
    };
  } catch (error) {
    console.error('❌ パイプラインエラー:', error);

    // エラー時のDB更新
    if (dbRecord) {
      try {
        await dbRecord.updateStatus('failed', error.message);
        dbRecord.metadata.processingTime = Date.now() - startTime;
        await dbRecord.save();
      } catch (dbError) {
        console.error('❌ DB更新エラー:', dbError);
      }
    }

    throw error;
  }
}
