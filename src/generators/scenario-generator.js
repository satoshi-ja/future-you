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

export async function generateScenario(formData, persona) {
  const client = getOpenAI();

  const gptModel = process.env.GPT_MODEL || 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model: gptModel,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `あなたは3年後の成功した自分です。
過去の自分（${formData.q8}さん）に向けて、温かく具体的な励ましのメッセージを作成してください。

メッセージは15秒の動画で伝えることを想定：
- 冒頭: 共感と理解（2-3秒）
- アドバイス: 具体的な3つ（9-10秒）
- 締め: 力強い応援（2-3秒）`,
      },
      {
        role: 'user',
        content: `【未来の自分の情報】
職業: ${persona.career}
達成: ${Array.isArray(persona.achievements) ? persona.achievements.join(', ') : ''}
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
}`,
      },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Scenario generation returned no content');
  }

  return parseJsonContent(content, 'scenario');
}
