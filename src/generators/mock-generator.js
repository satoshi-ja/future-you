/**
 * モックジェネレータ - APIキーがない場合や開発時のテスト用
 */

export function generateMockPersona(formData) {
  return {
    age: `${parseInt(formData.userAge || 25) + 3}歳`,
    career: '成功したソフトウェアエンジニア',
    workplace: 'モダンなオフィス環境。大きな窓から自然光が差し込み、最新のデュアルモニターが並ぶデスク。',
    achievements: [
      '複数の大規模プロジェクトをリード',
      'チーム内で技術的リーダーシップを発揮',
      '新しい技術スタックの導入に成功'
    ],
    lifestyle: '仕事とプライベートのバランスが取れた充実した日々を送っている',
    relationships: '信頼できる同僚たちと良好な関係を築き、メンターとしても活躍',
    personality: '自信に満ち、落ち着いた雰囲気。経験から得た知恵と温かさを感じさせる'
  };
}

export function generateMockScenario(formData, persona) {
  const userName = formData.q8 || formData.userName || 'あなた';

  return {
    opening: `${userName}さん、未来の自分です。`,
    advice: [
      '今の挑戦を恐れずに続けてください',
      '小さな成功を積み重ねることが大切です',
      '仲間との繋がりを大切にしてください'
    ],
    closing: '未来で待っています。あなたなら必ずできます！',
    summary: '今の努力が3年後の成功につながっています。',
    fullText: `${userName}さん、未来の自分です。

今の挑戦を恐れずに続けてください。小さな成功を積み重ねることが大切です。仲間との繋がりを大切にしてください。

未来で待っています。あなたなら必ずできます！`
  };
}

export function generateMockArticle(formData, persona, scenario) {
  const userName = formData.q8 || formData.userName || 'あなた';

  return {
    title: '3年後の自分からのメッセージ - 成功への道のり',
    subtitle: '未来の自分が教えてくれた大切なこと',
    sections: [
      {
        heading: `1. トレンド（${userName}が直面していること）`,
        content: '現代のビジネス環境は急速に変化しており、継続的な学習と適応が求められています。特に技術分野では、新しいスキルの習得が成功への鍵となっています。'
      },
      {
        heading: '2. 未来の自分から学んだこと',
        content: '3年後、私は理想としていたキャリアを実現していました。その過程で最も重要だったのは、小さな挑戦を恐れずに続けたこと、そして周囲の人々との良好な関係を築いたことでした。'
      },
      {
        heading: '3. 実践すべきこと',
        content: `• 毎日少しずつスキルを磨く習慣をつける
• メンターや仲間との繋がりを大切にする
• 失敗を恐れず、そこから学ぶ姿勢を持つ
• 自分の成長を記録し、振り返る時間を作る`
      },
      {
        heading: '4. 今後のキャリアで目指したいこと',
        content: '技術的な成長だけでなく、リーダーシップやコミュニケーション能力も磨いていくこと。そして、自分が学んだことを次の世代に伝えていくことが、本当の成功につながると未来の自分は教えてくれました。'
      }
    ],
    summary: [
      '小さな挑戦の積み重ねが成功への道',
      '人との繋がりが最大の財産',
      '失敗から学ぶ姿勢が成長を加速'
    ],
    conclusion: '未来の自分からのメッセージは、今の努力が確実に実を結ぶことを教えてくれています。一歩一歩、着実に前進していきましょう。'
  };
}

export function generateMockVideoPrompt(persona, scenario) {
  return `Medium shot of a confident software engineer in their late 20s, sitting in a modern office with natural lighting from large windows. The person looks directly at camera with a warm, encouraging smile. Professional yet approachable appearance. Soft focus background with dual monitors visible. Cinematic lighting, warm color grading. The engineer gestures gently while speaking, conveying wisdom and warmth gained from experience.`;
}

export async function generateMockVideo() {
  // モック動画生成（実際には動画ファイルを生成しない）
  return {
    id: 'mock-video-' + Date.now(),
    status: 'completed',
    url: null,
    message: 'モックモード: Sora APIキーが必要です'
  };
}
