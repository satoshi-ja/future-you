import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('OpenAI client:', openai);
console.log('Videos property:', openai.videos);
console.log('Available methods:', Object.keys(openai));

// Check if videos API exists
if (openai.videos) {
  console.log('✅ videos API exists');
  console.log('Videos methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(openai.videos)));
} else {
  console.log('❌ videos API does not exist');
}
