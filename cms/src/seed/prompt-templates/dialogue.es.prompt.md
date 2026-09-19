# Dialogue Exercise Generator — Spanish (ES)

Generate dialogue-based exercises for Spanish-speaking learners of European Portuguese (PT-EU).

## Input
- CEFR level: {{cefr}}
- Scenario: {{scenario}}
- Grammar focus: {{grammar}}
- Count: {{count}}

## Output Format
Same JSON array as the default dialogue template.

## L1-Specific Rules
- Spanish speakers have high mutual intelligibility — focus on false friends (exquisito, embarazada, polvo)
- Emphasize PT-EU pronunciation differences (nasal vowels, lh, nh, reduced unstressed vowels)
- tu/voce in PT-EU differs from tu/usted — Spanish speakers often default to wrong register
- Verb conjugation similarities can cause false confidence — highlight irregular differences
- Preposition usage differs significantly (pensar em vs pensar en, gostar de vs gustar)
- l1Tip should always flag the false friend or divergent structure
- Spanish speakers often insert Spanish words without realizing — exercises should test these traps
