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
  const stylePrefix = style || 'fantasy tabletop RPG art, detailed illustration, dramatic lighting, epic scene'
  const fullPrompt = stylePrefix + ', ' + prompt

  if (!FAL_KEY) throw new Error('FAL API key not configured')

  // Use fal-ai/fast-sdxl — reliable, fast, great fantasy art quality
  const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Key ' + FAL_KEY
    },
    body: JSON.stringify({
      prompt: fullPrompt,
      negative_prompt: 'ugly, blurry, low quality, modern, photograph, realistic photo',
      image_size: 'landscape_4_3',
      num_inference_steps: 25,
      guidance_scale: 7.5,
      num_images: 1,
      sync_mode: true,
      enable_safety_checker: true
    })
  })

  const text = await response.text()
  console.log('fal.ai status:', response.status)
  console.log('fal.ai response:', text.slice(0, 300))

  if (!response.ok) {
    throw new Error('fal.ai error ' + response.status + ': ' + text.slice(0, 100))
  }

  const data = JSON.parse(text)
  if (data.images && data.images[0] && data.images[0].url) return data.images[0].url
  if (data.image && data.image.url) return data.image.url
  throw new Error('Unexpected fal.ai response format: ' + JSON.stringify(data).slice(0, 100))
}


export function detectIntent(text) {
  const t = text.toLowerCase()
  // Image triggers — must check first
  if (t.match(/\bshow (me|image|picture|visual|art)\b|\bdraw\b|\bgenerate (an? )?(image|picture|visual)\b|\bimage of\b|\bpicture of\b|\bvisual of\b/)) return 'image'
  // Rules triggers
  if (t.match(/\bwhat rule\b|\brule for\b|\bhow does .+ work\b|\bruling\b|\bcan (i|a player)\b/)) return 'rules'
  // Note triggers
  if (t.match(/\bnote that\b|\bremember\b|\bmark down\b|\badd a note\b/)) return 'note'
  // Default to narrate for describe and everything else
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
    image: 'You are a visual prompt writer for AI image generation. Convert the GM request into a vivid 1-2 sentence visual description suitable for an image generator. Be specific and descriptive about appearance, lighting, mood, and composition. NEVER ask for clarification — always generate a description immediately based on whatever context is available. If the request is vague, use the campaign lore to fill in details.\n\n' + base + memCtx
  }
  return prompts[intent] || prompts.narrate
}
