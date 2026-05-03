import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  try {
    const apiKey = "AIzaSyCRYntUnHR_4sxOnuflPIogbb3ihmSknvs";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent("Hello, what model are you?");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
