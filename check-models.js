import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

try {
  const models = await openai.models.list();
  console.log('利用可能なモデル:');
  models.data
    .filter(m => m.id.includes('gpt'))
    .forEach(m => console.log(`- ${m.id}`));
} catch (error) {
  console.error('エラー:', error.message);
}
