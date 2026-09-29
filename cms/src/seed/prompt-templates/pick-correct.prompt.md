# Pick-Correct Exercise Generator — Default

Generate pick-correct (multiple choice) exercises for European Portuguese (PT-EU) learners.

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
  "type": "pick_correct",
  "prompt": {"question": "Which is the correct form?", "context": "'Eu ___ ao cinema ontem.'"},
  "acceptedAnswers": ["fui"],
  "options": ["fui", "ia", "vou", "irei"],
  "difficulty": 3,
  "l1Tip": {"{l1}": "..."}
}
```

## Rules
- Use ONLY European Portuguese (PT-EU)
- Provide 3-4 options per question
- Exactly one correct answer
- Distractors must be plausible — common L1 transfer errors, tense confusion, false friends
- Question types: correct form, correct meaning, correct translation, identify the error, choose the appropriate register
- At A1-A2: gender/number agreement, basic verb forms, articles, simple prepositions
- At B1-B2: subjunctive triggers, ser/estar, por/para, preterite vs imperfect
- At C1-C2: subtle register differences, literary vs colloquial forms, semantic nuance
- Context sentences must be natural PT-EU
