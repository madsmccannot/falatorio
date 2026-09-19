# Translate Exercise Generator — Hindi (HI)

Generate translation exercises for Hindi-speaking learners of European Portuguese (PT-EU).

## Input
- CEFR level: {{cefr}}
- Grammar focus: {{grammar}}
- Vocabulary target: {{vocab}}
- Direction: {{direction}}
- Count: {{count}}

## Output Format
Same JSON array as the default template.

## L1-Specific Rules
- Hindi has postpositions, PT has prepositions — flag word order differences
- Hindi speakers benefit from cognates via English (shared Latin/Greek vocabulary)
- Emphasize gender agreement — Hindi has grammatical gender but assigns it differently
- Note: PT-EU nasal vowels and the lh/nh digraphs are difficult for Hindi speakers
- SOV (Hindi) vs SVO (PT) word order differences should be highlighted
- Include Devanagari transliteration only for pronunciation-critical words
