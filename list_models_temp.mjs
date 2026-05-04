import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function list() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const keyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
  const apiKey = keyLine.split('=')[1].trim();

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
  const data = await response.json();
  if (data.models) {
    console.log(data.models.map(m => m.name).join('\n'));
  } else {
    console.log(data);
  }
}
list();
