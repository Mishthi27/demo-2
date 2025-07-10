import os
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

async def resolve_query(query: str, user_role: str) -> str:
    if not GEMINI_API_KEY:
        return "Gemini API key not configured."
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": query}]}]
    }
    params = {"key": GEMINI_API_KEY}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(GEMINI_API_URL, headers=headers, params=params, json=payload, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            # Extract the AI response
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            return f"Gemini API error: {str(e)}" 