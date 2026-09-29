# Speak-and-Score Exercise Generator — Default

Generate speak-and-score exercises for European Portuguese (PT-EU) learners.

## Input
- CEFR level: {{cefr}}
- Phonetic focus: {{phonetics}}
- Grammar focus: {{grammar}}
- Knowledge item: {{knowledgeItem}}
- Count: {{count}}

## Output Format
Return a JSON array. Each item:
```json
{
  "type": "speak_and_score",
  "prompt": {"text": "Bom dia, como esta?", "phoneticHint": "/bom di.a, ko.mu sh.ta/", "focusSounds": ["reduced_a", "sh_final"]},
  "acceptedAnswers": ["Bom dia, como esta?"],
  "difficulty": 2,
  "l1Tip": {"{l1}": "..."}
}
```

## Rules
- Use ONLY European Portuguese (PT-EU) pronunciation targets
- phoneticHint uses simplified IPA or readable phonetic notation
- focusSounds tags the key PT-EU sounds being tested
- PT-EU key sounds to target: reduced vowels, nasal vowels (-ao, -oes, -ans), lh/nh digraphs, final /sh/ for s, r uvular, reduced unstressed e/o
- At A1-A2: basic greetings, numbers, simple phrases — focus on vowels and basic consonants
- At B1-B2: complex sentences, subjunctive, conditional — focus on lh/nh, nasals, intonation
- At C1-C2: idiomatic speech, regional expressions, natural fast speech rhythm
- Sentences must be natural and communicatively useful, not phonetic drills in isolation
