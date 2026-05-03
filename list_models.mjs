import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const apiKey = "AIzaSyCRYntUnHR_4sxOnuflPIogbb3ihmSknvs";
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
  const data = await response.json();
  data.models.forEach(m => console.log(m.name));
}

listModels();
