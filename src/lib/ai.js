import { SYSTEM_PACKS } from './systems'

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY
const FAL_KEY = process.env.REACT_APP_FAL_API_KEY

// ─── Text Generation ────────────────────────────────────────────────────────

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

// ─── Image Generation (Pollinations.AI — free, no key needed) ───────────────

export async function generateImage(prompt, campaignLore) {
  const style = 'fantasy tabletop RPG art, detailed illustration, dramatic lighting, epic composition'
  const full = (style + ', ' + prompt + ', ' + (campaignLore || ''))
    .replace(/[^\w\s,.-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250)
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) +
    '?width=768&height=512&nologo=true&seed=' + Math.floor(Math.random() * 99999)
  return url
}

// ─── Intent Detection ────────────────────────────────────────────────────────

export function detectIntent(text) {
  const t = text.toLowerCase()
  // Image
  if (t.match(/\bshow (me|image|picture|visual)\b|\bdraw\b|\bimage of\b|\bpicture of\b|\bgenerate (an? )?(image|picture)\b/)) return 'image'
  // Rules
  if (t.match(/\bwhat rule\b|\brule for\b|\bhow does .+ work\b|\bruling\b|\bcan (i|a player)\b|\bdc for\b/)) return 'rules'
  // Note
  if (t.match(/\bnote that\b|\bremember\b|\bmark down\b|\badd a note\b/)) return 'note'
  // Description types — auto detect from keywords
  if (t.match(/\bcreature\b|\bmonster\b|\bbeast\b|\bfiend\b|\bdragon\b|\bundead\b|\bgolem\b|\bwarforged\b|\bdemon\b|\bspider\b|\bwolf\b|\bgoblin\b|\borc\b|\btroll\b|\bgiant\b/)) return 'creature'
  if (t.match(/\bnpc\b|\binnkeeper\b|\bmerchant\b|\bguard\b|\bwizard\b|\bpriest\b|\bthief\b|\bwarrior\b|\bknight\b|\belf\b|\bdwarf\b|\bhuman\b|\bhalfling\b|\bstranger\b|\bfigure\b|\bperson\b|\bwoman\b|\bman\b|\bcharacter\b/)) return 'npc'
  if (t.match(/\benvironment\b|\bweather\b|\btrap\b|\bdarkness\b|\bflood\b|\bfire\b|\brain\b|\bwind\b|\bquake\b|\bfog\b|\bsmoke\b|\bchallenge\b|\bhazard\b/)) return 'environment'
  // Default: location describe
  return 'location'
}

export function getDescriptionType(intent) {
  const map = { location: 'location', creature: 'creature', npc: 'npc', environment: 'environment' }
  return map[intent] || 'location'
}

// ─── System Prompts ──────────────────────────────────────────────────────────

export function buildSystemPrompt(intent, campaign, memory, sceneNPCs) {
  const systemPack = SYSTEM_PACKS[campaign.system]
  const rulesCtx = systemPack?.rules ? '\n\nSystem rules:\n' + systemPack.rules : ''
  const customRules = campaign.rules_reference ? '\n\nCustom rules:\n' + campaign.rules_reference : ''
  const memCtx = memory?.length
    ? '\n\nSession memory:\n' + memory.map(m => '[' + m.tag.toUpperCase() + '] ' + m.text).join('\n')
    : ''
  const npcCtx = sceneNPCs?.length
    ? '\n\nNPCs present in this scene:\n' + sceneNPCs.map(n => '- ' + n.name + ': ' + n.description).join('\n')
    : ''

  const base = 'Campaign: "' + campaign.name + '"\nSystem: ' + campaign.system + '\nWorld lore & tone: ' + campaign.lore

  const WORD_LIMIT = 'STRICT LIMIT: Maximum 60 words. One short paragraph only. Do not exceed this under any circumstances.'

  const prompts = {
    location: `You are an atmospheric narrator for a tabletop RPG. Write ONE short paragraph (max 60 words) describing this location. Focus on unique world lore, the environment, and what dangers or wonders it holds. End with one vivid sensory detail. The GM reads this aloud directly to players.\n\n${WORD_LIMIT}\n\n${base}${memCtx}${npcCtx}`,

    creature: `You are an atmospheric narrator for a tabletop RPG. Write ONE short paragraph (max 60 words) describing this creature. Focus on its menacing presence, movement, and world lore origin. If it can speak per the lore, end with a short threatening phrase in quotes directed at the players.\n\n${WORD_LIMIT}\n\n${base}${memCtx}${npcCtx}`,

    npc: `You are an atmospheric narrator for a tabletop RPG. Write ONE short paragraph (max 60 words) describing this NPC. Include their name, race, tone (aggressive/helpful/cheery/preoccupied/suspicious), and role. Build social tension. End with a phrase they say directly to the players in quotes.\n\n${WORD_LIMIT}\n\n${base}${memCtx}${npcCtx}`,

    environment: `You are an atmospheric narrator for a tabletop RPG. Write ONE short paragraph (max 60 words) describing the environmental challenge in this scene. Pick one specific hazard: trap, darkness, flooding, fire, rain, wind, fog, extreme temperature. Make it feel immediate and threatening.\n\n${WORD_LIMIT}\n\n${base}${memCtx}${npcCtx}`,

    rules: `You are a precise rules reference for a tabletop RPG. Answer in 2-3 sentences maximum. Be specific and cite mechanics. If unsure, say so.\n\n${base}${rulesCtx}${customRules}${memCtx}`,

    note: `Extract the key fact. Return ONLY valid JSON: {"tag":"npc"|"location"|"creature"|"environment"|"plot"|"rule","text":"fact in under 12 words"}. No markdown, no extra text.`,

    image: `You are a visual prompt writer for AI image generation. Write 1-2 sentences describing a fantasy art scene. Be specific: appearance, lighting, mood, composition. Never ask for clarification — use campaign lore to fill gaps. Output ONLY the visual description.\n\n${base}${memCtx}`,

    oneshot: `You are a tabletop RPG adventure designer. The GM gives you a one-sentence concept. Generate a complete one-shot scene brief in this exact JSON format (no markdown, no extra text):
{"title":"scene title","setting":"2-3 sentence location description","tone":"the emotional/atmospheric tone in 5-10 words","hook":"the inciting event or situation the party finds themselves in","complication":"an unexpected twist or challenge that arises mid-scene","npcs":[{"name":"NPC name","role":"their role","motivation":"what they want","tone":"aggressive|helpful|suspicious|mysterious|desperate"}],"environment":"one environmental challenge or hazard","goal":"what the party needs to achieve to succeed","system_note":"one key rule from the system most relevant to this scene"}
Generate exactly 2 NPCs. System: ${campaign.system}. World lore: ${campaign.lore}`
  }

  return prompts[intent] || prompts.location
}
