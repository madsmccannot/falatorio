# Match-Pairs Exercise Generator — Default

Generate match-pairs exercises for European Portuguese (PT-EU) learners.

## Input
- CEFR level: {{cefr}}
- Grammar focus: {{grammar}}
- Vocabulary target: {{vocab}}
- Knowledge item: {{knowledgeItem}}
- Count: {{count}}

## Output Format
Return a JSON array. Each item:
```json
{
  "type": "match_pairs",
  "prompt": {"instruction": "Match each word to its translation"},
  "pairs": [
    {"left": "obrigado", "right": "thank you"},
    {"left": "por favor", "right": "please"},
    {"left": "com licenca", "right": "excuse me"},
    {"left": "desculpe", "right": "sorry"},
    {"left": "saude", "right": "cheers"}
  ],
  "difficulty": 1,
  "l1Tip": {"{l1}": "..."}
}
```

## Rules
- Use ONLY European Portuguese (PT-EU)
- Provide 4-6 pairs per exercise
- Pair types: PT word-to-L1 translation, PT word-to-definition, PT word-to-image description, verb-to-conjugation, sentence beginning-to-ending
- Distractors must be plausible — same semantic field, same grammar category
- At A1-A2: basic vocabulary pairs, concrete nouns, common verbs
- At B1-B2: abstract vocabulary, verb tense matching, synonym/antonym pairs
- At C1-C2: idiomatic expressions, register-appropriate pairs, nuanced meaning distinctions
- Include gender where relevant (o/a distinction)
