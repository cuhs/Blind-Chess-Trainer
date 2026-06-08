Product Blueprint: MindBoard
The Cognitive Blindfold Chess Platform
The Core Philosophy
MindBoard trains conceptual "chunking" and abstract geometric logic. It is a closed-loop system where failure-tolerant text training feeds high-stakes voice matches, in-game failures generate custom content, and personalized content clears the cognitive heatmap, motivating continuous play. There is no gatekeeping; users are trusted to manage their cognitive load utilizing the built-in safety nets.
Phase 1: The "Aha!" Onboarding & First 10 Minutes
The app proves the user is capable of blindfold calculation before asking for an account, explaining the pedagogy, or dropping them into a high-stakes match.
Minute 0–2 (The Hook): The app launches directly into a 2D chessboard showing a simple King + Rook vs King endgame. Prompt: "Look closely. You have 5 seconds." The board vanishes into the Invisible Grid. Prompt: "Type the square the White Rook is on." (User types e4). Instant haptic confirmation.
Minute 2–4 (The First Story): The screen remains blank. The app reads two moves. Prompt: "Is the Black King in check? Type Yes or No." The user answers correctly, completing a 2-ply calculation.
Minute 4–6 (The Reward): Two more rapid-fire endgame puzzles to lock in the dopamine hit.
Minute 6–8 (The Fog Reveal): The app reveals the user's initial "Cognitive Heatmap" based on those 4 questions. It is 99% obscured by the "Fog of War," planting the seed for long-term retention.
Minute 8–10 (The Match Primer): Before unlocking the dashboard, the app sets explicit expectations for their first full voice match: "Your first game will feel chaotic. You will lose track of the board. That is the point. Peek freely, let the app catch your mistakes, and your failures will build tomorrow's puzzles."
Phase 1 Exit — HomeDashboard (Closed Loop): Onboarding completes into a personalized cognitive dashboard — not a traditional Play/Puzzles/Learn menu. The home screen validates daily habit and directs the next action: (1) HabitHeader with streak + Board Mapped %, (2) hero InteractiveHeatmap (~99% fog after onboarding), (3) Daily Matrix primary card ("Today's Matrix: 3 Positions") with a loop badge when yesterday's voice match Peek events generated puzzles, (4) Voice Match secondary card with opponent Elo, (5) bottom tabs — Home, Drills, History.
Phase 2: The Pedagogy & Training Suite
The training environment relies strictly on text input (e.g., typing f6) to ensure data integrity and eliminate voice-parser friction during high-cognitive-load learning.
"Story of the Position" Puzzles: The app reads a 3-to-5 move sequence aloud. The user is quizzed on structural geometry rather than the next best move (e.g., "What piece is now pinned to the Black King?").
The Deterministic Motif Engine (Zero Hallucination):
A custom TypeScript logic layer built on top of chess.js. This is a dedicated microservice requiring exhaustive unit testing.
Pin Detection: Raycasting from Kings/heavy pieces to identify intersecting targets.
Discovered Attacks: Diffing attack bitboards from the previous ply to the current ply to isolate newly opened lines of sight.
Overloaded Defenders: Mapping a dependency graph of all attackers versus all defenders on every square.
This deterministic script generates absolute mathematical JSON (e.g., {"motif": "pin", "attacker": "Bc4", "target": "Nd5"}). An agentic LLM acts solely as a templating engine to convert this JSON into natural English questions.
Phase 3: The Voice-Activated Match Engine
A hands-free gameplay mode available from Day 1 against a client-side WebAssembly Stockfish engine, utilizing strict rules to protect the user's mental map under pressure.
The Fault-Tolerant Voice Pipeline:
On-Device STT Fallback: To mitigate the fragility and latency of external cloud APIs, the STT layer prioritizes lightweight on-device ML models (e.g., local Whisper instances via React Native).
Regex Normalizer: Strips filler and maps homophones ("night" $\rightarrow$ N).
Legality Filter: Checks the parsed string against chess.js.
The Clock Freeze & Adaptive Disambiguation:
If the voice parser detects an ambiguous or illegal move, the match clock instantly pauses. The user is never penalized for the app's need to clarify.
Voice or Haptic Response: The user can respond to the prompt ("Which rook, a-file or f-file?") verbally by saying "a-file" OR by tapping the corresponding massive touch target rendered on the black screen.
Pipeline Integrity: Verbal disambiguation responses are not treated as a special shortcut case. The response routes back through the exact same Regex Normalizer and Legality Filter to ensure a misheard clarification doesn't introduce a state corruption edge case.
Phase 4: Post-Game & The Closed Retention Loop
The two halves of the app feed directly into each other through user failure and review.
The Post-Game Replay Dashboard: After a voice match, users enter a scrollable timeline with the board fully visible. The timeline highlights exactly where the user used a "Peek" or made an illegal move. The heatmap overlay activates, providing the ultimate educational moment: "Here is exactly what the board looked like when your mental map broke."
Dynamic Weakness Drilling: The specific FEN state from the user's in-game "Peek" is routed into the Deterministic Motif Engine. Tomorrow's daily text-puzzle is generated directly from that failure.
The Proportional Fog of War: The central analytics dashboard tracking spatial memory accuracy.
Soft Reveal: Instead of a binary "fog or clear" threshold, the fog lifts proportionally. If a square needs 15 interactions to clear, and the user has 5, the fog opacity sits at roughly 66%.
Adaptive Thresholds: High-traffic central squares require 15 interactions to clear. Edges require 10. Rare corners (a1, h8) require only 5. This prevents uneven progression and ensures the board clears smoothly as the user improves.
Phase 5: Technical Architecture
Frontend Mobile Framework: React Native with Expo. Concurrent rendering ensures haptics, timer countdowns, and on-device STT audio buffers run fluidly without freezing the JavaScript thread.
State Machine: chess.js handles all underlying FEN validation, move generation, and legality boundaries.
Backend Ecosystem: Supabase (PostgreSQL) handles user authentication, puzzle bank storage, and longitudinal Peek/Heatmap analytics. An Express.js API gateway manages the heavy lifting for the deterministic motif detection and LLM formatting.

