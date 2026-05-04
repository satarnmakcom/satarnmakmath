import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function test() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const keyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
  const apiKey = keyLine.split('=')[1].trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  try {
    const result = await model.generateContent("Hello!");
    console.log(result.response.text());
  } catch (e) {
    console.error(e.message);
  }
}
test();
