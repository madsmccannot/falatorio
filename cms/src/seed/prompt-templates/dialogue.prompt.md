# Dialogue Exercise Generator — Default

Generate dialogue-based exercises for European Portuguese (PT-EU) learners.

## Input
- CEFR level: {{cefr}}
- Scenario: {{scenario}}
- Grammar focus: {{grammar}}
- Count: {{count}}

## Output Format
Return a JSON array. Each item:
```json
{
  "type": "pick_correct",
  "prompt": {"dialogue": ["A: Bom dia, o que deseja?", "B: ___"], "context": "Ordering at a cafe"},
  "acceptedAnswers": ["Queria um cafe, por favor"],
  "options": ["Queria um cafe, por favor", "Eu querer cafe", "Da-me cafe", "Um cafe e tudo"],
  "difficulty": 2,
  "l1Tip": {"en": "'Queria' (conditional of querer) is the polite way to order in PT-EU, more formal than PT-BR's 'Eu quero'."}
}
```

## Rules
- Dialogues must reflect real PT-EU social norms (formality levels, regional greetings)
- Use conditional (queria, gostaria) for polite requests — this is PT-EU standard
- Include tu vs voce distinction appropriate to context
- Scenarios: cafe, mercado, farmacia, transportes, restaurante, loja, hospital
- At A1-A2: simple transactional dialogues
- At B1-B2: negotiation, complaint, explanation dialogues
- At C1-C2: debate, nuanced opinion, humor
