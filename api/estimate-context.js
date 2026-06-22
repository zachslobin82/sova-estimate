export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

const { system } = req.body || {}

  if (typeof system !== 'string' || system.length === 0 || system.length > 4000) {
    return res.status(400).json({ error: 'Invalid request' })
  }

try {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 150,
      system,
      messages: [{
        role: 'user',
        content: 'Write the personalized context. Exactly 2 sentences. Maximum 45 words.',
      }],
    }),
  })

  const data = await response.json()
  return res.status(response.status).json(data)
} catch (err) {
  return res.status(500).json({ error: 'API call failed' })
}
}
