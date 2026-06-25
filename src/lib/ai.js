const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY

export async function askAI(systemPrompt, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return data.content.map(b => b.text || '').join('')
}

export function detectIntent(text) {
  const t = text.toLowerCase()
  if (t.match(/\bdescribe\b|\btell me about\b|\bwhat does .+ look like\b/)) return 'narrate'
  if (t.match(/\bwhat rule\b|\brule for\b|\bhow does .+ work\b|\bruling\b|\bcan (i|a player)\b/)) return 'rules'
  if (t.match(/\bnote that\b|\bremember\b|\bmark down\b|\badd a note\b/)) return 'note'
  return 'narrate'
}

export function buildSystemPrompt(intent, campaign, memory) {
  const memCtx = memory && memory.length
    ? '\n\nSession memory:\n' + memory.map(m => '[' + m.tag.toUpperCase() + '] ' + m.text).join('\n')
    : ''

  const prompts = {
    narrate: 'You are an atmospheric narrator for a tabletop RPG session. Write one vivid read-aloud paragraph (3-5 sentences) the GM reads directly to players. Stay true to campaign tone and lore. Use memory to keep descriptions consistent.\n\nCampaign: "' + campaign.name + '"\nSystem: ' + campaign.system + '\nLore: ' + campaign.lore + memCtx,
    rules: 'You are a concise rules reference. Answer in 2-4 sentences. Be precise.\n\nCampaign: "' + campaign.name + '"\nSystem: ' + campaign.system + memCtx,
    note: 'Extract the key fact. Return ONLY valid JSON: {"tag":"npc"|"location"|"plot"|"rule","text":"fact in under 12 words"}. No markdown, no extra text.'
  }
  return prompts[intent] || prompts.narrate
}
