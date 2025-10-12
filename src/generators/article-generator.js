import OpenAI from 'openai';

let openai = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

function parseJsonContent(content, context) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse ${context} JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateArticle(formData, persona, scenario) {
  const client = getOpenAI();

  const gptModel = process.env.GPT_MODEL || 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model: gptModel,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `あなたはプロのライターです。
未来の自分からのメッセージをベースに、感動的で実用的なブログ記事を作成してください。

記事構成:
1. トレンド（現在の課題と背景）
2. 未来の自分から学んだこと（具体的なエピソード）
3. 実践すべきこと（実践的なアドバイス）
4. 今後のキャリアで目指したいこと（未来展望）

読者が共感でき、行動を起こしたくなる内容にしてください。`,
      },
      {
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
達成: ${Array.isArray(persona.achievements) ? persona.achievements.join(', ') : ''}
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
}`,
      },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Article generation returned no content');
  }

  return parseJsonContent(content, 'article');
}
