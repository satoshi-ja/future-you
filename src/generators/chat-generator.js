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

/**
 * 未来の自分とのチャット応答を生成
 * @param {Array} conversationHistory - これまでの会話履歴
 * @param {Object} persona - 生成されたペルソナ情報
 * @param {Object} scenario - 生成されたシナリオ情報
 * @param {string} userMessage - ユーザーの新しいメッセージ
 * @returns {Promise<string>} AIの応答
 */
export async function generateChatResponse(conversationHistory, persona, scenario, userMessage) {
  const client = getOpenAI();
  const gptModel = process.env.GPT_MODEL || 'gpt-4o-mini';

  // システムプロンプト：未来の自分としてのペルソナ設定
  const systemPrompt = `あなたは3年後の未来から過去の自分に語りかけている${persona.career}です。

## あなた（未来の自分）のペルソナ情報
- 名前: ${persona.name}
- 年齢: ${typeof persona.age === 'number' ? `${persona.age}歳` : persona.age}
- 職業: ${persona.career}
- 達成したこと: ${Array.isArray(persona.achievements) ? persona.achievements.join('、') : ''}
- 性格: ${persona.personality}
- ライフスタイル: ${persona.lifestyle}

## 背景状況
${scenario.setting}

## あなたの役割
過去の自分（今の私）からの質問や相談に対して、3年後の視点から温かく、具体的で実用的なアドバイスをしてください。

## 対話スタイル
- 温かく、励ます口調で
- 具体的な行動やステップを示す
- 「あなた」ではなく「君」や「きみ」を使う（過去の自分なので）
- 経験に基づいた実感のあるアドバイス
- 短く、わかりやすく（200-300文字程度）

## 重要な注意点
- 未来を断言せず、可能性として語る
- 過去の自分の気持ちに寄り添う
- 失敗や困難も成長の一部として伝える`;

  try {
    const response = await client.chat.completions.create({
      model: gptModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ],
      // GPT-5 は推論トークンと出力トークンを分けるため、十分なトークン数を確保
      // reasoning_tokens + output_tokens = max_completion_tokens
      max_completion_tokens: 2000,
    });

    console.log('GPT-5 Response:', JSON.stringify(response, null, 2));

    const reply = response?.choices?.[0]?.message?.content;
    if (!reply) {
      console.error('No content in response. Full response:', response);
      throw new Error('Chat response generation returned no content');
    }

    return reply.trim();
  } catch (error) {
    console.error('Chat generation error:', error);

    const status =
      (typeof error === 'object' && error && 'status' in error && Number(error.status)) ||
      (typeof error === 'object' && error && 'statusCode' in error && Number(error.statusCode)) ||
      (error instanceof Error && /quota/i.test(error.message) ? 429 : undefined);

    const normalizedError = new Error(
      error instanceof Error
        ? error.message
        : 'Failed to generate chat response from OpenAI',
    );

    if (status) {
      normalizedError.statusCode = status;
    }

    if (error?.code === 'insufficient_quota' || /quota/i.test(normalizedError.message)) {
      normalizedError.statusCode = 429;
      normalizedError.message = 'OpenAI API の利用上限に達しました。プラン/請求設定をご確認ください。';
    }

    throw normalizedError;
  }
}

/**
 * チャット用の提案質問を生成
 * @param {Object} persona - ペルソナ情報
 * @param {Object} scenario - シナリオ情報
 * @returns {Array<string>} 提案質問のリスト
 */
export function generateSuggestedQuestions(persona, scenario) {
  const questions = [
    '今日から始められることは何ですか？',
    `${persona.career}になるために、どんなスキルを身につけましたか？`,
    '一番大変だったことは何ですか？',
    '3年間で一番変わったことは何ですか？',
    '今の私に一番伝えたいことは？',
  ];

  return questions;
}
