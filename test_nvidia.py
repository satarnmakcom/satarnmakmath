import requests
import json
import os

# Helper to read .env file manually
env_path = ".env"
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if "=" in line:
                key, val = line.strip().split("=", 1)
                val = val.strip('"').strip("'")
                os.environ[key] = val

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
stream = False

api_key = os.environ.get("NVIDIA_NIM_API_KEY")
if not api_key:
    print("Error: NVIDIA_NIM_API_KEY not found in .env")
    exit(1)

headers = {
  "Authorization": f"Bearer {api_key}",
  "Accept": "text/event-stream" if stream else "application/json",
  "Content-Type": "application/json"
}

payload = {
  "model": "moonshotai/kimi-k2.6",
  "messages": [{"role":"user","content":"สวัสดี"}],
  "max_tokens": 16384,
  "temperature": 1.00,
  "top_p": 1.00,
  "stream": stream,
}

response = requests.post(invoke_url, headers=headers, json=payload, stream=stream)
if stream:
    for line in response.iter_lines():
        if line:
            print(line.decode("utf-8"))
else:
    data = response.json()
    print(json.dumps(data, indent=2))
    if "choices" in data and len(data["choices"]) > 0:
        print("\nResponse:", data["choices"][0]["message"]["content"])
