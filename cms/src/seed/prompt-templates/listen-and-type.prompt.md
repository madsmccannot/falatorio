# Listen-and-Type Exercise Generator — Default

Generate listen-and-type exercises for European Portuguese (PT-EU) learners.

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
  "type": "listen_and_type",
  "prompt": {"audioText": "Onde fica a estacao de comboios?", "context": "Asking for directions"},
  "acceptedAnswers": ["Onde fica a estacao de comboios?", "Onde fica a estacao de comboios"],
  "difficulty": 3,
  "l1Tip": {"{l1}": "..."}
}
```

## Rules
- Use ONLY European Portuguese (PT-EU), never Brazilian Portuguese
- audioText will be synthesised via Azure pt-PT voices — write natural spoken PT-EU
- Include reduced vowels, contractions and liaison typical of natural PT-EU speech
- acceptedAnswers must tolerate missing accents and minor punctuation variation
- At A1-A2: short sentences (4-8 words), common vocabulary, clear enunciation
- At B1-B2: longer sentences, subordinate clauses, natural speech speed
- At C1-C2: idiomatic expressions, regional phrases, rapid speech patterns
- Difficulty 1-3 for A1-A2, 4-6 for B1-B2, 7-10 for C1-C2
