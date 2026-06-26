import { SYSTEM_PACKS } from './systems'

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY
const FAL_KEY = process.env.REACT_APP_FAL_API_KEY

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

export async function generateImage(prompt, style) {
  const stylePrefix = style || 'fantasy tabletop RPG art, detailed illustration, dramatic lighting'
  const fullPrompt = stylePrefix + ', ' + prompt
  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Key ' + FAL_KEY
    },
    body: JSON.stringify({
      prompt: fullPrompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 4,
      num_images: 1
    })
  })
  const data = await response.json()
  if (data.images && data.images[0]) return data.images[0].url
  throw new Error('Image generation failed')
}

export function detectIntent(text) {
  const t = text.toLowerCase()
  if (t.match(/\bshow (me|image|picture|visual|art)\b|\bdraw\b|\bgenerate (an? )?(image|picture|visual)\b/)) return 'image'
  if (t.match(/\bdescribe\b|\btell me about\b|\bwhat does .+ look like\b/)) return 'narrate'
  if (t.match(/\bwhat rule\b|\brule for\b|\bhow does .+ work\b|\bruling\b|\bcan (i|a player)\b/)) return 'rules'
  if (t.match(/\bnote that\b|\bremember\b|\bmark down\b|\badd a note\b/)) return 'note'
  return 'narrate'
}

export function buildSystemPrompt(intent, campaign, memory) {
  const systemPack = SYSTEM_PACKS[campaign.system]
  const rulesCtx = systemPack && systemPack.rules
    ? '\n\nSystem rules reference:\n' + systemPack.rules
    : ''
  const customRules = campaign.rules_reference
    ? '\n\nGM custom rules notes:\n' + campaign.rules_reference
    : ''
  const memCtx = memory && memory.length
    ? '\n\nSession memory:\n' + memory.map(m => '[' + m.tag.toUpperCase() + '] ' + m.text).join('\n')
    : ''

  const base = 'Campaign: "' + campaign.name + '"\nSystem: ' + campaign.system + '\nLore: ' + campaign.lore

  const prompts = {
    narrate: 'You are an atmospheric narrator for a tabletop RPG session. Write one vivid read-aloud paragraph (3-5 sentences) the GM reads directly to players. Stay true to campaign tone and lore. Use memory to keep descriptions consistent and never contradict established facts.\n\n' + base + memCtx,
    rules: 'You are a precise rules reference for a tabletop RPG. Answer in 2-4 sentences. Cite specific mechanics. If unsure, say so.\n\n' + base + rulesCtx + customRules + memCtx,
    note: 'Extract the key fact. Return ONLY valid JSON: {"tag":"npc"|"location"|"plot"|"rule","text":"fact in under 12 words"}. No markdown, no extra text.',
    image: 'You are a visual prompt writer for AI image generation. Convert the GM request into a vivid 1-2 sentence visual description for a fantasy art generator. Focus on visual details: appearance, lighting, mood, composition. No story, just visuals.\n\n' + base + memCtx
  }
  return prompts[intent] || prompts.narrate
}
