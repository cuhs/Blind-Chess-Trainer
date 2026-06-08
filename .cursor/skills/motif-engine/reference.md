# Motif Engine Reference

## Pin Edge Cases

| Case | Expected |
|------|----------|
| Absolute pin to king | Detect — piece cannot legally move |
| Relative pin to queen/rook | Detect — piece can move but loses material |
| Pin broken by interposing piece | No pin after interposition |
| Pinned piece can capture attacker | Not a pin if capture is legal and breaks threat |

## Discovered Attack Edge Cases

| Case | Expected |
|------|----------|
| Moving pawn opens bishop diagonal | Detect with correct attacker/target |
| Discovered check | Detect — motif + check flag |
| Double discovery (two pieces) | Return both MotifResults |
| Phantom discovery (attacker still blocked) | Do not detect |

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
- "What piece is now pinned to the Black King?"
- "Which piece was unmasked by the pawn push?"
- "Which defender is overloaded?"

## Performance

- Target: <10ms per position on mobile-class hardware
- Precompute attack maps once per ply; diff for discoveries
- No async I/O in detection hot path
