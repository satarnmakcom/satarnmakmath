import fs from 'fs';

// Helper function to load .env manually (if not using dotenv)
function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.error("Could not load .env file", err);
  }
}

loadEnv();

async function testNvidiaNim() {
  const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
  const stream = false;
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!apiKey) {
    console.error("NVIDIA_NIM_API_KEY is not set in .env");
    return;
  }

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Accept": stream ? "text/event-stream" : "application/json",
    "Content-Type": "application/json"
  };

  const payload = {
    model: "moonshotai/kimi-k2.6",
    messages: [
      {
        role: "user",
        content: "สวัสดี แนะนำตัวสั้นๆ ให้หน่อย"
      }
    ],
    max_tokens: 16384,
    temperature: 1.00,
    top_p: 1.00,
    stream: stream,
  };

  try {
    const response = await fetch(invokeUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (stream) {
      // Basic stream handling in fetch
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log(decoder.decode(value, { stream: true }));
      }
    } else {
      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
      if (data.choices && data.choices.length > 0) {
        console.log("\nResponse:", data.choices[0].message.content);
      }
    }
  } catch (error) {
    console.error("Error calling NVIDIA NIM:", error);
  }
}

testNvidiaNim();
