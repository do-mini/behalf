export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = req.body;
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing API Key in Vercel environment' });
    }

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Provided text is empty' });
    }

    const prompt = `다음 텍스트를 분석하여 각 사람의 이름과 그에 해당하는 기도제목들을 추출해 주세요.
반드시 마크다운 없이 순수한 JSON 배열 형식(Array of objects)으로만 출력해야 합니다.
다른 인사말이나 설명, 백틱(\`\`\`)은 절대로 출력하지 마세요.

형식 예제:
[
  {
    "name": "홍길동",
    "topics": ["건강 회복", "이직 준비"]
  }
]

분석할 텍스트:
${text}`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!anthropicRes.ok) {
      const errorText = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: `Anthropic API Error: ${anthropicRes.status} - ${errorText}` });
    }

    const data = await anthropicRes.json();
    let reply = data.content?.[0]?.text;
    
    if (!reply) {
      throw new Error("Claude returned empty response");
    }

    reply = reply.trim();
    if (reply.startsWith("```json")) {
      reply = reply.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (reply.startsWith("```")) {
      reply = reply.replace(/^```/, "").replace(/```$/, "").trim();
    }

    try {
      const parsedData = JSON.parse(reply);
      return res.status(200).json(parsedData);
    } catch (parseErr) {
      console.error("AI JSON 파싱 실패:", reply);
      return res.status(500).json({ error: "Failed to parse JSON string from AI", rawResponse: reply });
    }

  } catch (err) {
    console.error("Vercel Parse Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
