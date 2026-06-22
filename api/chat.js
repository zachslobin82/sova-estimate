export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' })
    }

  const { messages, system } = req.body || {}

      if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid request' })
      }
    if (typeof system !== 'string' || system.length === 0 || system.length > 4000) {
          return res.status(400).json({ error: 'Invalid request' })
    }

  const userTurns = messages.filter(m => m && m.role === 'user').length
    if (userTurns > 5) {
          return res.status(429).json({ error: 'Conversation limit reached' })
    }

  const payloadSize = JSON.stringify(messages).length
    if (payloadSize > 20000) {
          return res.status(413).json({ error: 'Request too large' })
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
                          max_tokens: 180,
                          system,
                          messages,
                }),
        })

      const data = await response.json()
        return res.status(response.status).json(data)
  } catch (err) {
        return res.status(500).json({ error: 'API call failed' })
  }
}
