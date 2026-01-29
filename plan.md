# KS1 Reading App Plan

## Overview
- **Platform**: Hosted on GitHub Pages (https://hadefuwa.github.io/ks1-lab/)
- **Target**: Kids learning to read English at KS1 level (Reception to Year 2)
- **Approach**: TTS-first, game-like lessons with assessment and progression
- **Tech Stack**: HTML, CSS, JS (one-page app)
- **Progress**: Saved locally; kids must pass assessments to unlock next lessons

## App Structure
- **Home Screen**: Welcome, select level (Reception, Year 1, Year 2), show progress
- **Lesson Screen**: Teach concept, practice activities, then assessment
- **Assessment**: Quiz to pass (e.g., 80% correct to unlock next)
- **Progress Tracking**: Completed lessons, scores

## Levels and Lessons

### Reception Level (Early Decoding - CVC Words)
1. **Lesson 1: Introduction to CVC Words**
   - **Teach**: What are CVC words? Listen to examples (cat, dog, pig)
   - **Activity**: Play word -> Type it (10 words)
   - **Assessment**: Type 8/10 words correctly
   - **Pass Criteria**: 80% accuracy

2. **Lesson 2: Sound Matching**
   - **Teach**: Initial sounds (c in cat, d in dog)
   - **Activity**: TTS says word, child clicks matching picture
   - **Assessment**: 8/10 correct matches
   - **Pass Criteria**: 80%

3. **Lesson 3: Building CVC Words**
   - **Teach**: Blend sounds to make words
   - **Activity**: Sound tiles (c-a-t), drag to build word, type it
   - **Assessment**: Build and type 8/10 words
   - **Pass Criteria**: 80%

4. **Lesson 4: Reading CVC Sentences**
   - **Teach**: Short sentences with CVC words
   - **Activity**: TTS reads sentence, child types it
   - **Assessment**: Type 5/6 sentences correctly
   - **Pass Criteria**: 80%

5. **Lesson 5: Reception Review**
   - **Teach**: Mix of above
   - **Assessment**: 20 questions, 16 correct
   - **Pass Criteria**: 80% -> Unlock Year 1

### Year 1 Level (Digraphs and Trigraphs)
6. **Lesson 6: Digraphs (sh, ch, th)**
   - **Teach**: New sounds
   - **Activity**: Words like ship, chip, thin
   - **Assessment**: Type 8/10 words
   - **Pass Criteria**: 80%

7. **Lesson 7: CCVC Words**
   - **Teach**: Consonant clusters (bl, st)
   - **Activity**: Words like blue, stop
   - **Assessment**: 8/10
   - **Pass Criteria**: 80%

8. **Lesson 8: Tricky Words**
   - **Teach**: Common tricky words (the, said)
   - **Activity**: Listen and type
   - **Assessment**: 8/10
   - **Pass Criteria**: 80%

9. **Lesson 9: Short Sentences**
   - **Activity**: Cloze (fill blank)
   - **Assessment**: 8/10
   - **Pass Criteria**: 80%

10. **Lesson 10: Year 1 Review**
    - **Assessment**: 20 questions, 16 correct
    - **Pass Criteria**: 80% -> Unlock Year 2

### Year 2 Level (Fluency and Comprehension)
11. **Lesson 11: Longer Sentences**
    - **Teach**: Read for meaning
    - **Activity**: TTS reads, child types sentence
    - **Assessment**: 8/10
    - **Pass Criteria**: 80%

12. **Lesson 12: Paragraph Reading**
    - **Activity**: Word hunt (find answer in text)
    - **Assessment**: 8/10
    - **Pass Criteria**: 80%

13. **Lesson 13: Comprehension Questions**
    - **Activity**: Read paragraph, answer questions
    - **Assessment**: 8/10
    - **Pass Criteria**: 80%

14. **Lesson 14: Full Review**
    - **Assessment**: 30 questions, 24 correct
    - **Pass Criteria**: 80%

## Implementation Plan
- **Data**: Store lessons in JS arrays/objects
- **Progress**: localStorage for passed lessons
- **UI**: Simple, kid-friendly, TTS buttons
- **Assessment**: Immediate feedback, retry if fail
- **Expansion**: Add more lessons as needed

## Folder Structure for 1000 Lessons
To support 1000 individual HTML lessons, each with its own JS and CSS:
```
lessons/
  lesson1/
    index.html
    script.js
    styles.css
  lesson2/
    index.html
    script.js
    styles.css
  ...
  lesson1000/
    index.html
    script.js
    styles.css
```
- Main `index.html` in root loads the sidebar and navigates to lessons.
- Each lesson is a self-contained HTML page with its own script and styles.
- Progress tracked globally in localStorage.

## Next Steps
- Implement lesson navigation in app.js
- Add assessment logic
- Test on GitHub Pages
