# Motif Engine Reference

## Pin Edge Cases

| Case | Expected |
|------|----------|
| Absolute pin to king | Detect — piece cannot legally move |
| Relative pin to queen/rook | Detect — removing front leaves rear undefended, underdefended with a profitable attacker, or a winning exchange for the pin attacker |
| Relative pin when rear stays adequately defended | Do not detect (e.g. queen eyes f7 pawn with defended bishop behind) |
| Pin broken by interposing piece | No pin after interposition |
| Pinned piece can capture attacker | Not a pin if capture is legal and breaks threat |

## Discovered Attack Edge Cases

| Case | Expected |
|------|----------|
| Moving pawn opens bishop diagonal | Detect with correct attacker/target |
| Discovered check | Detect — motif + check flag |
| Double discovery (two pieces) | Return both MotifResults |
| Phantom discovery (attacker still blocked) | Do not detect |
| Revealed target still adequately defended (not check) | Do not detect |

## Fork Edge Cases

Forks use the influence map (`isSquareTacticallyThreatened`). A fork is detected only when a piece attacks **two or more** enemy pieces **and** at least one of:

| Rule | Expected |
|------|----------|
| Royal fork (king is a target) | Detect — king must respond |
| At least two targets loose or underdefended | Detect — opponent cannot save both |
| Value-winning fork | Detect — forker worth **less** than the highest-value target (e.g. knight forks defended queen + rook) |
| One loose target plus adequately defended second target | Do not detect (e.g. queen eyes h5 pawn and well-defended f7 pawn) |
| Equally defended, forker not lower value | Do not detect (e.g. queen “forking” two defended rooks) |
| Only one enemy piece attacked | Do not detect |
| Mutual defense with equal counts, no value win | Do not detect (e.g. two bishops defended 1:1 by a knight) |

Discovered attacks (non-check) use the same loose/underdefended test on the revealed target.

## Overloaded Defender Edge Cases

| Case | Expected |
|------|----------|
| Knight defending two hanging pieces | Detect |
| Piece defending square and attacker simultaneously | Detect if removal causes dual threat |
| Defender can counter-attack | Still detect overload; counter-attack is separate analysis |

## Question Templates (LLM Input)

The LLM receives MotifResult JSON and a template prompt. Example inputs:

```json
{"motif": "pin", "attacker": "Bc4", "target": "Nd5", "pinned_to": "Kg8"}
```

```json
{"motif": "discovered_attack", "attacker": "Bf1", "target": "Qd8"}
```

```json
{"motif": "overloaded_defender", "square": "f6", "target": "Nf6"}
```

The LLM must ask about **structural geometry**, not "find the best move":
- "What square is the pinned knight on?"
- "What square does the White bishop attack from?" (discovered attack)
- "The White King is in check — what square is it on?" (not "hanging king")
- "What square is the knight fork on?"

## Performance

- Target: <10ms per position on mobile-class hardware
- Precompute attack maps once per ply; diff for discoveries
- No async I/O in detection hot path
