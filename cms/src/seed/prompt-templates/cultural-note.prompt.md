# Cultural Note Generator — Default

Generate cultural content items that teach learners about Portuguese culture alongside language.

## Input
- CEFR level: {{cefr}}
- Topic: {{topic}}
- Count: {{count}}

## Output Format
Return a JSON array. Each item:
```json
{
  "type": "expression",
  "contentPt": "Desenrascar-se",
  "contentL1": "To get by, to improvise a solution",
  "explanation": "A uniquely Portuguese concept — the ability to improvise and find solutions in difficult situations. It reflects the Portuguese cultural value of resourcefulness and adaptability. There's no direct English equivalent.",
  "cefrMin": "B1",
  "tags": ["culture", "expressions", "identity"]
}
```

## Types
- **joke**: Portuguese humor, trocadilhos, piadas — must be actually funny, not textbook
- **expression**: Idioms, sayings unique to PT-EU (saudade, desenrascar, fico-lhe muito agradecido)
- **meme**: Modern Portuguese internet culture, references young people actually use
- **reference**: Historical/cultural touchpoints (25 de Abril, Fernando Pessoa, fado, azulejos)

## Rules
- Content must be EUROPEAN Portuguese, not Brazilian
- Explanation should bridge cultural gaps specific to the learner's background
- At lower CEFR levels, keep explanations simpler
- Tags help with content discovery and filtering
- Include regional variations when relevant (Lisbon vs Porto vs Algarve)
