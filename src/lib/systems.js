export const SYSTEM_PACKS = {
  'D&D 5e': {
    name: 'Dungeons & Dragons 5th Edition',
    rules: `CORE MECHANICS: Roll d20 + ability modifier + proficiency bonus vs Difficulty Class (DC). Advantage = roll 2d20 take higher. Disadvantage = roll 2d20 take lower.
COMBAT: Initiative = d20+DEX. Action, Bonus Action, Movement, Reaction per turn. Attack roll vs AC. Critical hit on natural 20.
ABILITY CHECKS: STR(athletics), DEX(acrobatics,stealth), CON(endurance), INT(arcana,history,investigation), WIS(insight,perception,survival), CHA(deception,intimidation,persuasion).
SURPRISE: Unaware creatures are surprised on first round — no action/bonus action/reaction.
GRAPPLE: STR(Athletics) vs STR(Athletics) or DEX(Acrobatics). Grappled = speed 0.
DEATH SAVES: 3 successes = stable. 3 failures = dead. Natural 1 = 2 failures. Natural 20 = 1 HP.
CONDITIONS: Blinded, Charmed, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious.
RESTING: Short rest = 1+ hours, spend Hit Dice. Long rest = 8 hours, regain all HP and spell slots.`
  },
  'Pathfinder 2e': {
    name: 'Pathfinder 2nd Edition',
    rules: `CORE MECHANICS: d20 + modifier vs DC. Four degrees: Critical Success(beat DC by 10+), Success, Failure, Critical Failure(miss by 10+).
ACTIONS: 3 actions per turn + 1 reaction. Multiple Attack Penalty: 2nd attack -5 (agile -4), 3rd -10 (agile -8).
PROFICIENCY: Untrained(+0+level), Trained(+2+level), Expert(+4+level), Master(+6+level), Legendary(+8+level).
CONDITIONS: Grades matter. Frightened(1-4), Sickened(1-4), Stunned(1-3) reduce by 1 per turn end.
HERO POINTS: Spend to reroll. Spend all to avoid death.
DYING: Dying 0=unconscious, 1-3=dying, 4=dead.`
  },
  'Daggerheart': {
    name: 'Daggerheart (Darrington Press)',
    rules: `CORE MECHANICS: Roll 2d12 (Hope die + Fear die) + trait modifier vs Difficulty. Hope die higher = with Hope. Fear die higher = with Fear. Equal = with Hope but GM gains Fear.
HOPE & FEAR: GM tracks Fear tokens (max 6). Players track Hope. Spend Hope to enhance rolls. GM spends Fear for complications.
TRAITS: Agility, Strength, Finesse, Instinct, Presence, Knowledge.
DIFFICULTY: Easy=8, Standard=12, Hard=17, Very Hard=22.
ADVERSARY ACTIONS: GM spends Fear to activate adversary moves — players never roll defense.
STRESS: Tracks mental/emotional strain alongside Hit Points.`
  },
  'Call of Cthulhu 7e': {
    name: 'Call of Cthulhu 7th Edition',
    rules: `CORE MECHANICS: Roll d100 under skill value. Half skill = Hard success. One-fifth = Extreme success.
PUSHING ROLLS: Failed roll may be pushed (reroll once) but worse consequences on failure.
SANITY: Lose SAN from mythos and violence. 0 SAN = permanently insane. Lose 5+ in one roll = temporary insanity.
LUCK: Spend Luck points to adjust rolls. Cannot use on Luck or SAN rolls.
COMBAT: DEX order. Fighting(Brawl) for melee. Firearms for ranged. Damage Bonus based on STR+SIZ.
MYTHOS: Cthulhu Mythos skill grows with exposure. Higher = more knowledge, lower max SAN.`
  },
  'Shadowrun 6e': {
    name: 'Shadowrun 6th Edition',
    rules: `CORE MECHANICS: Pool of d6s (attribute + skill). Each 5 or 6 = hit. Glitch = half or more dice show 1s.
INITIATIVE: Reaction + Intuition + d6. Highest goes first, subtract 10 each pass.
COMBAT: Attack dice vs defense dice. Net hits add to base damage. Soak: Body + Armor.
EDGE: Situational bonus currency. Max 4. Spend for bonus dice or rerolls.
MATRIX: Noise reduces dice pools. Hack on the Fly, Brute Force, Trace Icon are key actions.
MAGIC: Drain after casting = resist with Willpower. Sustaining spells = -2 dice per sustained spell.`
  },
  'Marvel Multiverse RPG': {
    name: 'Marvel Multiverse Role-Playing Game',
    rules: `CORE MECHANICS: Roll 3d6. Middle die is the Marvel die — if it shows 1 (Marvel logo), something spectacular happens. Total all 3 + ability rank vs Difficulty Number (DN).
ABILITY RANKS: 0-20+. Rank 1=Basic, 6=Remarkable, 10=Incredible, 15=Amazing, 20=Fantastic.
SIX ABILITIES: Might (melee, physical), Agility (speed, ranged, defense), Resilience (endurance, soak), Vigilance (awareness, initiative), Ego (willpower, psychic, social), Logic (tech, knowledge).
EDGES & TROUBLES: Edge = roll extra die drop lowest. Trouble = roll extra die drop highest.
KARMA: Earn for heroic actions. Spend to reroll, add to totals, or activate special effects.
DIFFICULTY NUMBERS: Easy=10, Average=13, Challenging=17, Incredible=21, Phenomenal=25.
NARRATOR (GM): Sets DNs. Players reach 0 Health = Defeated (not dead). Recover with rest.
POWERS: Always available — no resource cost. Signature powers are enhanced versions.`
  },
  'Custom / Homebrew': {
    name: 'Custom or Homebrew System',
    rules: `No pre-loaded rules. Use the World Lore and Rules Reference fields in your campaign to define your system mechanics. The AI will reference whatever rules context you provide.`
  }
}

export const SYSTEM_NAMES = Object.keys(SYSTEM_PACKS)
