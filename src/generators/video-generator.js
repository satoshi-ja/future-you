function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function renderProgressBar(progress) {
  const value = Math.max(0, Math.min(100, Number(progress) || 0));
  const filled = Math.round((value / 100) * 30);
  const bar = '#'.repeat(filled) + '-'.repeat(30 - filled);
  return `[${bar}] ${value.toFixed(0)}%`;
}

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}

export async function generateVideo(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const preview = prompt.length > 60 ? `${prompt.slice(0, 60)}...` : prompt;
  console.log(`   プロンプト: ${preview}`);

  const soraModel = process.env.SORA_MODEL || 'sora-2';
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = 'https://api.openai.com/v1/videos';

  // Create video generation job
  let video;
  try {
    // Use FormData for multipart/form-data
    const formData = new FormData();
    formData.append('model', soraModel);
    formData.append('prompt', prompt);
    formData.append('size', '1280x720');
    formData.append('seconds', '8');

    const createResponse = await fetchWithRetry(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
        // Note: Don't set Content-Type header, let fetch set it automatically with boundary
      },
      body: formData
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(`動画生成ジョブの作成に失敗しました: ${createResponse.status} ${errorData.error?.message || createResponse.statusText}`);
    }

    video = await createResponse.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`動画生成ジョブの作成に失敗しました: ${message}`);
  }

  console.log(`   動画ジョブ作成: ${video.id}`);
  console.log(`   初期ステータス: ${video.status}`);
  console.log('   進捗:');

  let lastLogged = -1;
  const maxPollingTime = 1800000; // 30 minutes
  const startTime = Date.now();

  // Poll for video completion
  while (true) {
    if (Date.now() - startTime > maxPollingTime) {
      throw new Error('動画生成がタイムアウトしました（30分以上）');
    }

    try {
      const statusResponse = await fetchWithRetry(`${baseUrl}/${video.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json().catch(() => ({}));
        throw new Error(`動画ステータスの取得に失敗しました: ${statusResponse.status} ${errorData.error?.message || statusResponse.statusText}`);
      }

      video = await statusResponse.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`動画ステータスの取得に失敗しました: ${message}`);
    }

    const progressValue = typeof video.progress === 'number' ? video.progress : Number(video.progress ?? 0);

    if (!Number.isNaN(progressValue) && progressValue !== lastLogged) {
      process.stdout.write(`\r   ${renderProgressBar(progressValue)}`);
      lastLogged = progressValue;
    }

    // デバッグ: 進捗が99以上でもcompletedでない場合、ステータスを表示
    if (progressValue >= 99 && video.status !== 'completed') {
      console.log(`\n   [DEBUG] Progress: ${progressValue}%, Status: ${video.status}`);
    }

    if (video.status === 'completed') {
      process.stdout.write('\n');
      break;
    }

    if (video.status === 'failed') {
      const errorMessage = video.error?.message ?? '動画生成失敗';
      throw new Error(`動画生成失敗: ${errorMessage}`);
    }

    // 99%以上の場合はポーリング間隔を短くする
    const pollInterval = progressValue >= 99 ? 5000 : 2000;
    await sleep(pollInterval);
  }

  // Add content URL for completed video
  if (video.status === 'completed') {
    video.url = `${baseUrl}/${video.id}/content`;
  }

  return video;
}
