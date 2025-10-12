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

export async function generateVideoPrompt(persona, scenario) {
  const client = getOpenAI();

  const gptModel = process.env.GPT_MODEL || 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model: gptModel,
    messages: [
      {
        role: 'system',
        content:
          'あなたはSora2のプロンプトエンジニアです。\n以下を含む映像的なプロンプトを英語で1文で作成してください：\n- Medium shot（推奨）\n- Subject（人物の詳細）\n- Setting（環境）\n- Lighting（自然光など）\n- Action（カメラに向かって語りかける仕草）\n- Mood（温かい、励ましの雰囲気）\n- Technical（cinematic, soft focus など）\n\n80-120語程度で。',
      },
      {
        role: 'user',
        content: `職業: ${persona.career}
職場: ${persona.workplace}
性格: ${persona.personality}
メッセージ: ${scenario.summary}

この人物が、カメラに向かって温かく励ましのメッセージを伝えるシーンのプロンプトを作成してください。`,
      },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Video prompt generation returned no content');
  }

  return content.trim();
}
