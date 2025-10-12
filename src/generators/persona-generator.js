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

export async function generatePersona(formData) {
  const client = getOpenAI();

  // 環境変数で変更可能（デフォルト: gpt-4o-mini）
  const gptModel = process.env.GPT_MODEL || 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model: gptModel,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'あなたはキャリアカウンセラーです。\n相談者の理想の未来から、3年後の成功した具体的な姿を描いてください。',
      },
      {
        role: 'user',
        content: `以下の情報から、3年後の成功した姿をJSON形式で出力してください。\n
${formData.q3 ? `【性別】\n${formData.q3 === 'female' ? '女性' : formData.q3 === 'male' ? '男性' : 'その他'}\n\n` : ''}【理想の仕事】
${formData.q4}

【理想のプライベート】
${formData.q5}

【理想の人間関係】
${formData.q6}

【大切にしている価値観】
${formData.q7}

出力形式:
{
  "gender": "${formData.q3 || 'unspecified'}",
  "age": "3年後の推定年齢",
  "career": "具体的な職業",
  "workplace": "職場環境の詳細な描写（映像的に）",
  "achievements": ["達成したこと1", "達成したこと2", "達成したこと3"],
  "lifestyle": "プライベートの様子",
  "relationships": "人間関係の状況",
  "personality": "雰囲気・性格"
}`,
      },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Persona generation returned no content');
  }

  return parseJsonContent(content, 'persona');
}
