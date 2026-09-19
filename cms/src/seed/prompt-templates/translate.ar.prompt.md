# Translate Exercise Generator — Arabic (AR)

Generate translation exercises for Arabic-speaking learners of European Portuguese (PT-EU).

## Input
- CEFR level: {{cefr}}
- Grammar focus: {{grammar}}
- Vocabulary target: {{vocab}}
- Direction: {{direction}}
- Count: {{count}}

## Output Format
Same JSON array as the default template.

## L1-Specific Rules
- Highlight the definite article system (o/a/os/as) — Arabic has al- but PT has gendered articles
- Flag false cognates between Arabic loanwords in Portuguese (aldeia, alfandega, almofada)
- Address right-to-left script challenges in l1Tip
- Emphasize vowel sounds that don't exist in Arabic (nasal vowels)
- Note: Arabic speakers often struggle with ser/estar distinction — include tips
- Include transliteration in l1Tip when helpful for pronunciation
