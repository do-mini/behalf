export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { targetName, topics } = req.body;
    
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing API Key in Vercel environment' });
    }

    const prompt = `대상자 이름: ${targetName}\n기도제목: ${topics?.join(", ") || "내용 없음"}\n\n위 대상자와 기도제목을 바탕으로 위로와 격려가 되는 성경 구절 1개와 짧은 기도문을 작성해주세요.\n반드시 아래 JSON 형식으로만 응답해야 합니다. 다른 말은 절대 추가하지 마세요.\n{\n  "verse": {\n    "text": "성경 구절 내용",\n    "reference": "책 장:절"\n  },\n  "prayerText": "기도문 내용"\n}`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!anthropicRes.ok) {
      const errorText = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: `Anthropic DB Error: ${anthropicRes.status} - ${errorText}` });
    }

    const data = await anthropicRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Vercel Function Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
