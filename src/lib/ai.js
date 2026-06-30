import { SYSTEM_PACKS } from './systems'

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
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return data.content.map(b => b.text || '').join('')
}

export async function generateImage(prompt, lore) {
  const style = 'fantasy tabletop RPG art, detailed illustration, dramatic lighting'
  const full = (style + ', ' + prompt + ', ' + (lore || ''))
    .replace(/[^\w\s,.-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250)
  return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) +
    '?width=768&height=512&nologo=true&seed=' + Math.floor(Math.random() * 99999)
}

export function detectIntent(text) {
  const t = text.toLowerCase()
  if (t.match(/\bshow (me|image|picture)\b|\bdraw\b|\bimage of\b|\bpicture of\b|\bgenerate (an? )?(image|picture)\b/)) return 'image'
  if (t.match(/\bwhat rule\b|\brule for\b|\bhow does .+ work\b|\bruling\b|\bcan (i|a player)\b|\bdc for\b/)) return 'rules'
  if (t.match(/\bnote that\b|\bremember\b|\bmark down\b|\badd a note\b/)) return 'note'
  if (t.match(/\bcreature\b|\bmonster\b|\bbeast\b|\bfiend\b|\bdragon\b|\bundead\b|\bgolem\b|\bwarforged\b|\bdemon\b|\bgoblin\b|\borc\b|\btroll\b|\bgiant\b|\bvampire\b|\bzombie\b/)) return 'creature'
  if (t.match(/\bnpc\b|\binnkeeper\b|\bmerchant\b|\bguard\b|\bwizard\b|\bpriest\b|\bwarrior\b|\bknight\b|\bstranger\b|\bperson\b|\bwoman\b|\bman\b|\bcharacter\b|\bhero\b|\bvillain\b/)) return 'npc'
  if (t.match(/\benvironment\b|\bweather\b|\btrap\b|\bdarkness\b|\bflood\b|\bfire\b|\brain\b|\bwind\b|\bfog\b|\bsmoke\b|\bhazard\b|\bchallenge\b/)) return 'environment'
  return 'location'
}

export function buildSystemPrompt(intent, campaign, memory, sceneNPCs) {
  const pack = SYSTEM_PACKS[campaign.system]
  const rulesCtx = pack?.rules ? '\n\nSystem rules:\n' + pack.rules : ''
  const customRules = campaign.rules_reference ? '\n\nCustom rules:\n' + campaign.rules_reference : ''
  const memCtx = memory?.length
    ? '\n\nSession memory:\n' + memory.map(m => '[' + m.tag.toUpperCase() + '] ' + m.text).join('\n')
    : ''
  const npcCtx = sceneNPCs?.length
    ? '\n\nNPCs in this scene:\n' + sceneNPCs.map(n => '- ' + n.name + ': ' + n.role + ', ' + n.tone + '. Wants: ' + n.motivation).join('\n')
    : ''
  const base = 'Campaign: "' + campaign.name + '" | System: ' + campaign.system + '\nWorld lore: ' + campaign.lore
  const LIMIT = '\n\nSTRICT LIMIT: Maximum 60 words. One short paragraph only. GM reads this aloud to players.'

  const prompts = {
    location: 'You are an atmospheric RPG narrator. Write ONE paragraph (max 60 words) describing this location. Focus on world lore, environment, and what dangers or wonders it holds. End with one vivid sensory detail.' + LIMIT + '\n\n' + base + memCtx + npcCtx,
    creature: 'You are an atmospheric RPG narrator. Write ONE paragraph (max 60 words) describing this creature. Focus on menacing presence, movement, and lore origin. If it can speak per the lore, end with a short threatening phrase in quotes.' + LIMIT + '\n\n' + base + memCtx + npcCtx,
    npc: 'You are an atmospheric RPG narrator. Write ONE paragraph (max 60 words) describing this NPC. Include their name, race, tone (aggressive/helpful/cheery/preoccupied/suspicious), and role. Build tension. End with a phrase they say directly to players in quotes.' + LIMIT + '\n\n' + base + memCtx + npcCtx,
    environment: 'You are an atmospheric RPG narrator. Write ONE paragraph (max 60 words) describing the environmental challenge. Pick one hazard: trap, darkness, flooding, fire, rain, wind, fog, or extreme temperature. Make it feel immediate and dangerous.' + LIMIT + '\n\n' + base + memCtx + npcCtx,
    rules: 'You are a precise RPG rules reference. Answer in 2-3 sentences. Be specific and cite mechanics. If unsure, say so.\n\n' + base + rulesCtx + customRules + memCtx,
    note: 'Extract the key fact. Return ONLY valid JSON: {"tag":"npc"|"location"|"creature"|"environment"|"plot"|"rule","text":"fact in under 12 words"}. No markdown, no extra text.',
    image: 'You are a visual prompt writer for AI image generation. Write 1-2 sentences describing a fantasy art scene. Specific: appearance, lighting, mood, composition. Never ask questions — use campaign lore to fill gaps. Output ONLY the visual description.\n\n' + base + memCtx,
    oneshot: 'You are a tabletop RPG adventure designer. Generate a one-shot scene from the GM concept. Return ONLY valid JSON, no markdown:\n{"title":"string","setting":"string","tone":"string","hook":"string","complication":"string","goal":"string","environment":"string","system_note":"string","npcs":[{"name":"string","role":"string","motivation":"string","tone":"string"},{"name":"string","role":"string","motivation":"string","tone":"string"}]}\nExactly 2 NPCs. Use the campaign system and lore.\n\n' + base
  }
  return prompts[intent] || prompts.location
}
