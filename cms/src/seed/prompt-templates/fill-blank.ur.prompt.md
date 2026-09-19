# Fill-in-the-Blank Exercise Generator — Urdu (UR)

Generate fill-in-the-blank exercises for Urdu-speaking learners of European Portuguese (PT-EU).

## Input
- CEFR level: {{cefr}}
- Grammar focus: {{grammar}}
- Vocabulary target: {{vocab}}
- Count: {{count}}

## Output Format
Same JSON array as the default fill-blank template.

## L1-Specific Rules
- Urdu uses SOV word order — blanks should help reinforce SVO
- Urdu has no definite articles — test article usage (o, a, os, as) frequently
- Urdu verb conjugation is simpler — emphasize PT verb morphology
- Urdu speakers share many Arabic/Persian loanwords with Portuguese — highlight cognates
- l1Tip should address specific Urdu transfer errors (e.g., omitting articles, verb placement)
- Include Nastaliq transliteration only for pronunciation-critical vocabulary
