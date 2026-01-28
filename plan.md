KS1 Reading + Maths Plan (Nursery -> Reception -> Year 1 -> Year 2)
Desktop-first, GitHub Pages, TTS-first, no timers, no MCQ

Core approach (Concrete -> Pictorial -> Abstract)

- Concrete: manipulate objects (counters, tens frames, bar models)
- Pictorial: pictures and diagrams
- Abstract: number sentences and short written answers
- No MCQ. The child must do the thing.

Top priority: TTS-first reading

- Every reading task starts with audio.
- "Play word", "Play sentence", "Slow playback" always available.
- Focus on listen -> blend -> decode -> read -> type.
- Comprehension still happens, but only after decoding is stable.

Progression by stage (custom sequence, phonics-informed)

Nursery (pre-reading)
- Sound play: rhymes, syllables, initial sounds
- TTS reads a word; child matches picture/first sound
- Build awareness without heavy written output

Reception (early decoding)
- CVC words (cat, pin, sun)
- Sound tiles -> build word after TTS says it
- Child reads aloud, then types

Year 1 (decoding breadth)
- Digraphs/trigraphs, CCVC/CVCC, common tricky words
- Short sentences; TTS reads the sentence
- Child reads aloud, then types or fills missing word

Year 2 (fluency + meaning)
- Longer sentences, short paragraphs
- TTS can read full paragraph or per sentence
- Comprehension: answer by selecting words in text, then type short answer

Game modes that actually teach (not baby-ish)

Maths (Singapore style)

- Number Bonds Builder
  - Drag counters into two groups to make 10 (then 20).
  - Then type the number sentence.
  - Assessment: model must match; equation must be equivalent (commutative accepted).

- Bar Model Builder (key Singapore skill)
  - Given a story, child builds the bar and types total.
  - Assessment: correct bar partition + correct answer.

- Part-Whole Explorer
  - Show a whole number; child splits into two parts with a divider, lists pairs.
  - Assessment: completeness + correctness of pairs.

- Place Value Blocks
  - Drag tens rods and ones cubes to build a number.
  - Then write it in digits and words.
  - Assessment: model matches typed value; accept simple spelling variants.

- Add/Sub with Regrouping Visual
  - Use base-10 blocks to perform 23 + 18 by regrouping.
  - Assessment: correct regroup action sequence + final answer.

Reading (TTS-first, game-like)

- Sentence Builder
  - Words are tiles. Child drags into order after TTS reads it.
  - Then types the full sentence.
  - Assessment: order correctness + typed accuracy (tolerate minor punctuation).

- Cloze Passage (type the missing word)
  - Short sentence with blank; TTS reads the full sentence.
  - Child types the missing word.
  - Assessment: spelling and context; allow small variants.

- Word Hunt (reading for meaning)
  - Short paragraph; TTS reads it.
  - Child clicks the word that answers the question.
  - Assessment: correct selection in the text (not MCQ).

- Build a Word (sound tiles)
  - Tiles: sh, ch, th, ee, oa, etc.
  - TTS says the word; child constructs it and types it.
  - Assessment: correct construction + correct final spelling.

Assessment model (no MCQ, mastery)

- Every interaction ends with a check:
  - Correct: short success animation + next
  - Incorrect: explain and show a similar follow-up question
- Track per skill:
  - attempts
  - accuracy
  - last-seen difficulty
  - common error types (eg place value mistake, missing regroup)
- No timers. Progress is mastery.

Content design (scale via JSON tasks)

Each activity is driven by JSON tasks with clear constraints.

Bar Model task:
- storyText
- numbers involved
- operation type
- expected bar partitions
- accepted answers
- hint text

Cloze task:
- sentence with blank marker
- answer word(s)
- acceptable variants
- optional phonics focus

TTS task hints:
- ttsText (full text to read)
- ttsWordList (optional per-word playback)
- ttsSlowText (optional slow or syllable-broken text)

Desktop-first UX choices

- Keyboard-first for answers (enter to submit)
- Drag-and-drop with mouse
- Big clear feedback panel on the right
- Minimal animations, clean modern look

Key constraints (for "games not multiple choice")

- Drag/drop engine
- Input validation (fuzzy matching for spelling)
- Content authoring format (JSON)
- TTS engine (browser-based)

Implementation notes (GitHub Pages)

- Use browser TTS (Web Speech API).
- All data and tasks shipped client-side.
- Works offline once loaded, but no requirement for offline TTS.

MVP build checklist (desktop-first, TTS-first)

Milestone 1: Core shell
- App shell: Home -> Practice -> Progress
- Local storage for progress (per skill, attempts, accuracy)
- Settings panel: voice, rate, pitch, autoplay on/off

Milestone 2: TTS foundation
- Web Speech API wrapper (play, stop, rate, voice selection)
- Per-task "Play" buttons (word/sentence/slow)
- Auto-play on task load (toggleable)

Milestone 3: First reading activity
- Build a Word (sound tiles + TTS)
- Input validation (exact + small spelling variants)
- Feedback panel (correct/incorrect + hint)

Milestone 4: First maths activity
- Number Bonds Builder (drag counters + equation)
- Model validation + equation equivalence (commutative)
- Feedback panel reuse

Milestone 5: Content system
- JSON task loader for at least 2 activities
- Authoring folder structure + sample tasks
- Simple task picker (by stage: Nursery/Reception/Y1/Y2)

Milestone 6: Progress + mastery
- Per-skill mastery rules (eg 5 correct in a row)
- Error types tracking (eg missing sound, wrong bar partition)
- Review queue (repeat weak skills)

Milestone 7: Polish
- Minimal animations (success/incorrect)
- Consistent typography and spacing
- Smoke test for GitHub Pages build/deploy
