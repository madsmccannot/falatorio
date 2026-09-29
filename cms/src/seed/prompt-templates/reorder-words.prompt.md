# Reorder-Words Exercise Generator — Default

Generate reorder-words exercises for European Portuguese (PT-EU) learners.

## Input
- CEFR level: {{cefr}}
- Grammar focus: {{grammar}}
- Knowledge item: {{knowledgeItem}}
- Count: {{count}}

## Output Format
Return a JSON array. Each item:
```json
{
  "type": "reorder_words",
  "prompt": {"words": ["ao", "vou", "Eu", "todos", "supermercado", "os", "dias"], "hint": "I go to the supermarket every day"},
  "acceptedAnswers": ["Eu vou ao supermercado todos os dias"],
  "difficulty": 2,
  "l1Tip": {"{l1}": "..."}
}
```

## Rules
- Use ONLY European Portuguese (PT-EU)
- words array must be shuffled — never in correct order
- acceptedAnswers may include multiple valid orderings when they exist
- Test SVO word order, clitic placement, adjective position, prepositional phrases
- At A1-A2: short sentences (4-6 words), basic SVO, simple prepositional phrases
- At B1-B2: subordinate clauses, clitic pronouns, compound sentences (8-12 words)
- At C1-C2: topicalization, cleft sentences, complex multi-clause structures
- Clitic placement is a major PT-EU feature — test proclisis vs enclisis at B1+
- Include contractions as single tokens (ao, do, no, na) not split
