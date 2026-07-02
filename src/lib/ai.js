import { SYSTEM_PACKS } from './systems'

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY

// ── Text generation ──────────────────────────────────────────────────────────
export async function askAI(systemPrompt, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
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
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content.map(b => b.text || '').join('')
}

// ── Image generation (Pollinations.AI — free, no key) ───────────────────────
export async function generateImage(prompt, lore) {
  const style = 'fantasy tabletop RPG art, detailed illustration, dramatic lighting, epic composition'
  const full = (style + ', ' + prompt + (lore ? ', ' + lore.slice(0, 100) : ''))
    .replace(/[^\w\s,.-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
  return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) +
    '?width=768&height=512&nologo=true&seed=' + Math.floor(Math.random() * 99999)
}

// ── Intent detection ─────────────────────────────────────────────────────────
export function detectIntent(text) {
  const t = text.toLowerCase()
  if (t.match(/\bshow (me|image|picture)\b|\bdraw\b|\bimage of\b|\bpicture of\b|\bgenerate (an? )?(image|picture)\b/)) return 'image'
  if (t.match(/\bwhat rule\b|\brule for\b|\bhow does .+ work\b|\bruling\b|\bcan (i|a player)\b|\bdc for\b/)) return 'rules'
  if (t.match(/\bnote that\b|\bremember\b|\bmark down\b|\badd a note\b/)) return 'note'
  if (t.match(/\bcreature\b|\bmonster\b|\bbeast\b|\bfiend\b|\bdragon\b|\bundead\b|\bgolem\b|\bwarforged\b|\bdemon\b|\bgoblin\b|\borc\b|\btroll\b|\bgiant\b|\bvampire\b|\bzombie\b|\bguardian\b|\bsentry\b/)) return 'creature'
  if (t.match(/\bnpc\b|\binnkeeper\b|\bmerchant\b|\bguard\b|\bwizard\b|\bpriest\b|\bwarrior\b|\bknight\b|\bstranger\b|\bperson\b|\bwoman\b|\bman\b|\bcharacter\b|\bhero\b|\bvillain\b|\bsoldier\b/)) return 'npc'
  if (t.match(/\benvironment\b|\bweather\b|\btrap\b|\bdarkness\b|\bflood\b|\bfire\b|\brain\b|\bwind\b|\bfog\b|\bsmoke\b|\bhazard\b|\bchallenge\b|\bterrain\b/)) return 'environment'
  if (t.match(/\bitem\b|\bartifact\b|\bweapon\b|\barmor\b|\barmour\b|\bsword\b|\bstaff\b|\bamulet\b|\bscroll\b|\bpotion\b|\bgem\b|\brelic\b/)) return 'item'
  return 'location'
}

// ── System prompts — built around the 8-level hierarchy ─────────────────────
export function buildSystemPrompt(intent, campaign, memory, sceneNPCs) {
  const pack = SYSTEM_PACKS[campaign.system]
  const rulesCtx = pack?.rules ? '\n\nSystem rules (' + campaign.system + '):\n' + pack.rules : ''
  const customRules = campaign.rules_reference ? '\n\nCustom rules & house rules:\n' + campaign.rules_reference : ''
  const memCtx = memory?.length
    ? '\n\nSession memory (established facts — never contradict these):\n' +
      memory.map(m => {
        const text = m.text.replace(/\s*\[IMAGE:[^\]]+\]/, '').trim()
        return '[' + m.tag.toUpperCase() + '] ' + text
      }).join('\n')
    : ''
  const npcCtx = sceneNPCs?.length
    ? '\n\nNPCs present in this scene:\n' +
      sceneNPCs.map(n => '- ' + n.name + ' (' + n.role + ', ' + n.tone + '): wants ' + n.motivation).join('\n')
    : ''

  // Full hierarchy context
  const hierarchy =
    'Game system: ' + campaign.system + '\n' +
    'Campaign: ' + campaign.name + '\n' +
    'World lore & setting: ' + (campaign.lore || '') + '\n'

  const LIMIT = '\n\nSTRICT OUTPUT RULE: Write exactly ONE paragraph. Maximum 60 words. No headers, no lists. The GM reads this aloud directly to players at the table.'

  return {
    location:
      'You are an atmospheric narrator for a tabletop RPG session. Describe this location in one vivid paragraph (max 60 words). Focus on: world lore details unique to this setting, the physical environment, and one sensory detail that draws players in. Hint at what dangers or wonders this place holds.' +
      LIMIT + '\n\n' + hierarchy + memCtx + npcCtx,

    creature:
      'You are an atmospheric narrator for a tabletop RPG session. Describe this creature in one menacing paragraph (max 60 words). Focus on: its world lore origin, its physical presence and how it moves, and the threat it represents. If this creature can speak according to the lore and setting, end with a short phrase it says directly to the players in quotes.' +
      LIMIT + '\n\n' + hierarchy + memCtx + npcCtx,

    npc:
      'You are an atmospheric narrator for a tabletop RPG session. Describe this NPC in one paragraph (max 60 words). Include: a name fitting the world, their race, a clear tone (aggressive/helpful/cheery/preoccupied/suspicious/desperate), and their role. Build social tension — this encounter could go either way. End with a phrase this NPC says directly to the players in quotes.' +
      LIMIT + '\n\n' + hierarchy + memCtx + npcCtx,

    environment:
      'You are an atmospheric narrator for a tabletop RPG session. Describe the environmental challenge in one paragraph (max 60 words). Choose one specific hazard active right now: a trap, flooding, fire, darkness, rain, wind, earthquake, fog, poison gas, extreme cold or heat. Make it feel immediate and urgent — the party must deal with this.' +
      LIMIT + '\n\n' + hierarchy + memCtx + npcCtx,

    item:
      'You are an atmospheric narrator for a tabletop RPG session. Describe this item or artifact in one paragraph (max 60 words). Focus on: its appearance, how it feels in hand, and a hint of its power or history within the world lore. Make it feel significant and worth remembering.' +
      LIMIT + '\n\n' + hierarchy + memCtx + npcCtx,

    rules:
      'You are a precise rules reference for ' + campaign.system + '. Answer the GM\'s rules question in 2-3 sentences. Be specific — cite the mechanic, the dice, the DC or difficulty. If you are unsure, say so clearly rather than guessing.' +
      '\n\n' + hierarchy + rulesCtx + customRules + memCtx,

    note:
      'Extract the key fact from the GM\'s note and classify it. Return ONLY valid JSON, no markdown, no backticks:\n{"tag":"npc"|"creature"|"location"|"environment"|"item"|"plot"|"rule","text":"the key fact in under 15 words"}\n\nClassification guide:\n- npc: a named person, villain, hero, ally, enemy\n- creature: a monster, beast, alien, supernatural being\n- location: a place, room, building, city, region, dungeon\n- environment: a hazard, weather, trap, obstacle, condition\n- item: an object, weapon, artifact, gear, canister, device, tool, relic\n- plot: an event, decision, revelation, story beat\n- rule: a game mechanic or ruling\n\nWhen in doubt between location and item: if it is an OBJECT the party can pick up or interact with, it is item. If it is a PLACE, it is location.',

    image:
      'You are a visual prompt writer for AI image generation. Convert the GM\'s request into a vivid 1-2 sentence description for a fantasy art generator. Be specific about: visual appearance, lighting, mood, and composition. Never ask for clarification — use the world lore to fill any gaps. Output ONLY the visual description, nothing else.' +
      '\n\n' + hierarchy + memCtx,

    oneshot:
      'You are a tabletop RPG adventure designer. Generate a one-shot scene from the GM concept below.' +
      '\n\nRETURN ONLY VALID JSON. Rules for the JSON output:\n' +
      '- No apostrophes anywhere — use commas or rephrase instead\n' +
      '- No smart quotes or special characters\n' +
      '- No line breaks inside string values\n' +
      '- All strings must be properly terminated\n' +
      '- Exactly 2 NPCs in the npcs array\n\n' +
      'JSON format:\n' +
      '{"title":"scene title","setting":"location in 2-3 sentences","tone":"atmosphere in 6-10 words","hook":"how scene begins","complication":"unexpected twist mid-scene","goal":"what party must achieve","environment":"one environmental hazard","system_note":"one key ' + campaign.system + ' mechanic for this scene","npcs":[{"name":"NPC name","role":"their role","motivation":"what they want","tone":"aggressive"},{"name":"NPC name","role":"their role","motivation":"what they want","tone":"helpful"}]}' +
      '\n\n' + hierarchy
  }[intent] || ''
}
