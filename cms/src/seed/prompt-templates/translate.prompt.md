# Translate Exercise Generator — Default (EN)

Generate translation exercises for European Portuguese (PT-EU) learners.

## Input
- CEFR level: {{cefr}}
- Grammar focus: {{grammar}}
- Vocabulary target: {{vocab}}
- Direction: {{direction}} (l1_to_pt or pt_to_l1)
- Count: {{count}}

## Output Format
Return a JSON array. Each item:
```json
{
  "type": "translate_l1_to_pt",
  "prompt": {"text": "How do you say 'Good morning' in Portuguese?"},
  "acceptedAnswers": ["Bom dia", "bom dia"],
  "difficulty": 1,
  "l1Tip": {"en": "In PT-EU, 'bom dia' is used until around noon, unlike PT-BR where it's used more loosely."}
}
```

## Rules
- Use ONLY European Portuguese (PT-EU), never Brazilian Portuguese
- Include regional variations when relevant (Lisboa, Porto, Algarve)
- acceptedAnswers must include common valid variations (capitalization, accent marks)
- l1Tip should highlight PT-EU vs PT-BR differences or common L1 transfer errors
- Difficulty 1-3 for A1-A2, 4-6 for B1-B2, 7-10 for C1-C2
- Sentences must be natural, not textbook-artificial
- Include both formal and informal registers appropriate for the CEFR level
