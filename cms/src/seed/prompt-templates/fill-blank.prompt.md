# Fill-in-the-Blank Exercise Generator — Default

Generate fill-in-the-blank exercises for European Portuguese (PT-EU) learners.

## Input
- CEFR level: {{cefr}}
- Grammar focus: {{grammar}}
- Vocabulary target: {{vocab}}
- Count: {{count}}

## Output Format
Return a JSON array. Each item:
```json
{
  "type": "fill_blank",
  "prompt": {"sentence": "Eu ___ ao supermercado todos os dias.", "context": "Present tense of 'ir'"},
  "acceptedAnswers": ["vou"],
  "options": ["vou", "vai", "fui", "ia"],
  "difficulty": 2,
  "l1Tip": {"en": "In PT-EU, 'ir' is irregular. 'Vou' is 1st person singular present."}
}
```

## Rules
- Use ONLY European Portuguese (PT-EU)
- The blank (___) should test the grammar focus or vocabulary target
- Provide 3-4 distractor options that test common mistakes
- Distractors should be plausible (same verb different tense, wrong conjugation, similar word)
- Sentences must be natural conversational PT-EU
- Include both informal and formal contexts
- At higher CEFR levels, test subjunctive, compound tenses, idiomatic usage
