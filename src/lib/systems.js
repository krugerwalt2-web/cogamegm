export const SYSTEM_PACKS = {
  'D&D 5e': {
    name: 'Dungeons & Dragons 5th Edition',
    rules: `CORE MECHANICS: Roll d20 + ability modifier + proficiency bonus vs Difficulty Class (DC). Advantage = roll 2d20 take higher. Disadvantage = roll 2d20 take lower.
COMBAT: Initiative = d20+DEX. Action, Bonus Action, Movement, Reaction per turn. Attack roll vs AC. Critical hit on natural 20 (double damage dice).
ABILITY CHECKS: STR(athletics,lifting), DEX(acrobatics,stealth,sleight of hand), CON(concentration,endurance), INT(arcana,history,investigation,nature,religion), WIS(animal handling,insight,medicine,perception,survival), CHA(deception,intimidation,performance,persuasion).
SAVING THROWS: d20+modifier vs DC. Six saves match six abilities.
CONDITIONS: Blinded(-attack,+attack vs), Charmed(can't attack charmer), Frightened(disadvantage near source), Grappled(speed 0), Incapacitated(no actions/reactions), Invisible(advantage attack,disadvantage vs), Paralyzed(incapacitated,auto-crit melee), Petrified(incapacitated,resistance all), Poisoned(disadvantage attack/checks), Prone(disadvantage attack,melee advantage vs,ranged disadvantage vs), Restrained(speed 0,disadvantage attack,advantage vs), Stunned(incapacitated,auto-fail STR/DEX saves), Unconscious(incapacitated,prone,auto-crit melee within 5ft).
SURPRISE: Creatures unaware of combat are surprised on first round — no action/bonus action/reaction, no movement.
GRAPPLE: STR(Athletics) vs STR(Athletics) or DEX(Acrobatics). Grappled = speed 0. Can drag at half speed. Escape: action + same contest.
DEATH SAVES: 3 successes = stable. 3 failures = dead. Natural 1 = 2 failures. Natural 20 = 1 HP.
SPELLCASTING: Spell slots consumed per spell level. Concentration = only one at a time, CON save DC10 or half damage taken when hit.
SKILLS: Proficiency bonus = +2 to +6 based on level. Expertise = double proficiency.
RESTING: Short rest = 1+ hours, spend Hit Dice to heal. Long rest = 8 hours, regain all HP and spell slots.`
  },
  'Pathfinder 2e': {
    name: 'Pathfinder 2nd Edition',
    rules: `CORE MECHANICS: d20 + modifier vs DC. Four degrees of success: Critical Success(beat DC by 10+), Success, Failure, Critical Failure(miss DC by 10+).
ACTIONS: 3 actions per turn + 1 reaction. Activities cost 2-3 actions. Free actions cost 0.
PROFICIENCY: Untrained(+0+level), Trained(+2+level), Expert(+4+level), Master(+6+level), Legendary(+8+level).
MAP: Multiple Attack Penalty: 2nd attack -5 (agile -4), 3rd attack -10 (agile -8).
CONDITIONS: Grades matter. Frightened(1-4), Sickened(1-4), Stunned(1-3) reduce by 1 per turn end.
HERO POINTS: 1 per session start. Spend to reroll. Spend all to avoid death.
DYING: Dying 0=unconscious, 1-3=dying, 4=dead. Wounded increases dying threshold.
EXPLORATION: Avoid Notice, Defend, Detect Magic, Follow the Expert, Hustle, Investigate, Repeat a Spell, Scout, Search, Sense Direction, Squeeze, Track.
RECALL KNOWLEDGE: Arcana(arcane,constructs,dragons,magic), Nature(animals,fey,plants,weather), Occultism(aberrations,spirits,undead), Religion(celestials,fiends,undead), Society(humanoids), Medicine(diseases,poisons).`
  },
  'Daggerheart': {
    name: 'Daggerheart (Darrington Press)',
    rules: `CORE MECHANICS: Roll 2d12 (Hope die + Fear die) + trait modifier vs Difficulty. Hope die higher = with Hope. Fear die higher = with Fear. Equal = with Hope but GM gains Fear.
HOPE & FEAR: GM tracks Fear tokens (max 6). Players track Hope on character sheet. Spend Hope to enhance rolls. GM spends Fear for complications, environmental hazards, villain actions.
TRAITS: Agility(athletics,stealth,quick action), Strength(force,endurance,intimidate), Finesse(precision,trickery,ranged), Instinct(perception,survival,animal handling), Presence(charm,persuade,perform), Knowledge(lore,magic,history).
DIFFICULTY: Easy=8, Standard=12, Hard=17, Very Hard=22.
DAMAGE & HP: Weapon damage on successful attacks. Hit Points + Stress both track. Stress = mental/emotional strain.
ARMOR: Reduces damage. Armor Slots = uses before needing repair.
ACTION ROLLS: Player rolls for player actions only. GM never rolls — uses Fear instead.
ADVERSARY ACTIONS: GM spends Fear to activate adversary moves, complications, or spotlight moments.
DOWNTIME: Recovery, crafting, investigation, relationship building between sessions.
EXPERIENCE: Mark XP on success or failure. Level up when XP track fills.
CARDS: Class and ancestry cards define abilities. Each card has a feature and sometimes a special move.`
  },
  'Call of Cthulhu 7e': {
    name: 'Call of Cthulhu 7th Edition',
    rules: `CORE MECHANICS: Roll d100 under skill value to succeed. Half skill value = Hard success. One-fifth = Extreme success.
OPPOSED ROLLS: Both roll, compare levels of success. Ties go to player or higher skill.
PUSHING ROLLS: If failed, may push (reroll once) but failure has worse consequences. GM sets stakes first.
SANITY: Current Sanity / Max Sanity. SAN loss from mythos, violence, unnatural. 0 SAN = permanently insane. Lose 5+ in one roll = temporary insanity.
COMBAT: DEX order. Actions: attack, dodge, maneuver, use item, flee. Fighting(Brawl) for melee. Firearms for ranged.
DAMAGE BONUS: Based on STR+SIZ. +1d4, +1d6, or -1 for small characters.
LUCK: Spend Luck points to adjust rolls (1 point = 1 on roll). Cannot use Luck on Luck rolls or SAN rolls.
SKILLS: Accounting, Anthropology, Appraise, Archaeology, Art/Craft, Charm, Climb, Credit Rating, Cthulhu Mythos (never starts above 5), Disguise, Dodge, Drive, Elec Repair, Fast Talk, Fighting, Firearms, First Aid, History, Intimidate, Jump, Language, Law, Library Use, Listen, Locksmith, Mech Repair, Medicine, Natural World, Navigate, Occult, Op Heavy Machinery, Persuade, Pilot, Psychology, Psychoanalysis, Ride, Science, Sleight of Hand, Spot Hidden, Stealth, Survival, Swim, Throw, Track.
MYTHOS: Cthulhu Mythos skill grows with exposure. Higher = more knowledge, lower max SAN.`
  },
  'Shadowrun 6e': {
    name: 'Shadowrun 6th Edition',
    rules: `CORE MECHANICS: Pool of d6s (attribute + skill). Each 5 or 6 = hit. Compare hits to threshold or opponent hits. Glitch = half or more dice show 1s.
INITIATIVE: Reaction + Intuition + d6 (+ extra dice for cyberware). Highest goes first, subtract 10 each pass.
COMBAT: Attacker rolls Attack + weapon dice. Defender rolls Reaction + Intuition. Net hits add to base damage. Soak: Body + Armor dice, each hit reduces damage. Stun filled = unconscious, Physical filled = dying.
MATRIX: Noise reduces dice pools. Actions: Hack on the Fly, Brute Force, Edit File, Crack File, Trace Icon, Jack Out, Reboot Device.
MAGIC: Drain after casting = resist with Willpower + appropriate attribute. Sustaining spells = -2 dice per spell sustained.
EDGE: Situational bonus currency. Gain from narrative advantage, spend for bonus dice, rerolls, or special effects. Max 4.
ATTRIBUTES: Body, Agility, Reaction, Strength, Willpower, Logic, Intuition, Charisma, Edge, Magic/Resonance.
SOCIAL: Face off with Social limit. Etiquette avoids default penalties in social situations.
CONTACTS: Connection (how useful) + Loyalty (how willing to help). Roll Connection for info, Loyalty for favors.`
  },
  'Custom / Homebrew': {
    name: 'Custom or Homebrew System',
    rules: `No pre-loaded rules. Use the World Lore and Rules Reference fields in your campaign to define your system's mechanics. The AI will reference whatever rules context you provide.`
  }
}

export const SYSTEM_NAMES = Object.keys(SYSTEM_PACKS)
