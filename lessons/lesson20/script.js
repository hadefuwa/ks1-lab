const app = document.getElementById("app");

// Game Configuration & Data
const lessonData = {
  title: "KS1 Lab",
  mascot: "Bouncy",
  introText: "Welcome to KS1 Lab! I'm Bouncy. Let's learn some 5-letter magic words!",
  teachWords: [
  {
    "word": "apple",
    "context": "A red or green fruit."
  },
  {
    "word": "chair",
    "context": "You sit on this."
  },
  {
    "word": "table",
    "context": "Eat dinner on this."
  },
  {
    "word": "train",
    "context": "A vehicle that runs on tracks."
  },
  {
    "word": "bread",
    "context": "A baked food made from flour."
  },
  {
    "word": "spoon",
    "context": "A utensil used for eating soup."
  },
  {
    "word": "clock",
    "context": "A device that shows time."
  },
  {
    "word": "house",
    "context": "A building where people live."
  },
  {
    "word": "smile",
    "context": "An expression showing happiness."
  },
  {
    "word": "grape",
    "context": "A small, round fruit."
  }
],
  challengeWords: [
  "apple",
  "chair",
  "table",
  "train",
  "bread",
  "spoon",
  "clock",
  "house",
  "smile",
  "grape"
],
  passScore: 80
};

let state = {
  phase: "intro", // intro, teach, play, victory, gameover
  score: 0,
  currentIndex: 0,
  hearts: 3,
  streak: 0,
  currentAttempts: 0
};

// Initialize
function init() {
  render();
}

// Main Render Loop
function render() {
  app.innerHTML = "";

  // Background layers
  const bg = document.createElement("div");
  bg.className = "bg";
  bg.innerHTML = `
    <div class="sparkle-field"></div>
    <div class="cloud c1"></div>
    <div class="cloud c2"></div>
    <div class="cloud c3"></div>
    <div class="cloud c4"></div>
  `;
  app.appendChild(bg);

  const container = document.createElement("div");
  container.className = "layout";

  // Sidebar / Stats
  const sidebar = document.createElement("div");
  sidebar.className = "panel";
  sidebar.innerHTML = `
    <div class="mascot" id="mascot" onclick="speak('${lessonData.introText}')">
      <div class="mascot-face">
        <div class="eye"></div>
        <div class="eye"></div>
        <div class="smile"></div>
      </div>
      <div class="sparkle s1"></div>
      <div class="sparkle s2"></div>
    </div>
    <div class="stat-grid" style="margin-top: 20px;">
      <div class="stat">
        <div class="stat-label">Score</div>
        <div class="stat-value" id="score-display">${state.score}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Streak</div>
        <div class="stat-value">🔥 ${state.streak}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Lives</div>
        <div class="stat-value">❤️ ${state.hearts}</div>
      </div>
    </div>
  `;

  // Main Content Area
  const content = document.createElement("div");
  content.className = "card";

  if (state.phase === "intro") {
    content.innerHTML = `
      <div class="hero">
        <div>
          <h1 class="hero-title">${lessonData.title}</h1>
          <p class="hero-sub">${lessonData.introText}</p>
          <div class="cta-row">
            <button onclick="startTeach()">Start Learning</button>
          </div>
        </div>
      </div>
    `;
  } else if (state.phase === "teach") {
    const wordObj = lessonData.teachWords[state.currentIndex];
    content.innerHTML = `
      <div style="text-align: center;">
        <h2 class="task-title">Let's Learn: <span style="color: var(--accent);">${wordObj.word}</span></h2>
        <p class="hero-sub">${wordObj.context}</p>
        <div class="word-build" style="margin: 20px auto; width: 200px; display: flex; align-items: center; justify-content: center;">
            ${wordObj.word.split('').map(l => `<span class="counter">${l}</span>`).join('')}
        </div>
        <div class="cta-row" style="justify-content: center;">
            <button class="secondary" onclick="speak('${wordObj.word}')">🔊 Listen</button>
            <button onclick="nextTeach()">Got it!</button>
        </div>
      </div>
    `;
  } else if (state.phase === "play") {
    const currentWord = lessonData.challengeWords[state.currentIndex];
    content.innerHTML = `
      <div style="text-align: center;">
        <div class="badge" style="margin-bottom: 20px;">Word ${state.currentIndex + 1} / ${lessonData.challengeWords.length}</div>
        <h2 class="task-title">Spell the word!</h2>
        <div class="cta-row" style="justify-content: center; margin-bottom: 20px;">
           <button class="secondary" id="listen-btn" onclick="speak('${currentWord}')">🔊 Listen</button>
        </div>

        <div class="word-input" id="word-input"></div>

        <div class="cta-row" style="justify-content: center; margin-top: 20px;">
          <button onclick="checkAnswer()">✨ check</button>
        </div>
        <div id="feedback-area"></div>
      </div>
    `;

    // Populate word input
    const wordInput = document.getElementById("word-input");
    const letters = currentWord.split('');
    for (let i = 0; i < letters.length; i++) {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.maxLength = 1;
      inp.className = "letter-input";
      if (i === 0 || i === letters.length - 1) {
        inp.value = letters[i];
        inp.disabled = true;
      } else {
        inp.placeholder = "_";
      }
      wordInput.appendChild(inp);
    }

    // Add event listeners
    const editableInputs = wordInput.querySelectorAll("input:not([disabled])");
    editableInputs.forEach((inp, index) => {
      inp.addEventListener('input', function() {
        if (this.value) {
          if (index < editableInputs.length - 1) {
            editableInputs[index + 1].focus();
          } else {
            // Last one filled, auto-check
            checkAnswer();
          }
        }
      });
      inp.addEventListener('keydown', function(event) {
        if (event.key === 'Backspace' && !this.value) {
          event.preventDefault();
          if (index > 0) {
            editableInputs[index - 1].focus();
          }
        }
      });
    });

    // Focus first editable
    if (editableInputs.length > 0) editableInputs[0].focus();
  } else if (state.phase === "victory") {
    content.innerHTML = `
      <div style="text-align: center;">
        <h1 class="hero-title">🎉 You Did It!</h1>
        <p class="hero-sub">Final Score: ${state.score}</p>
        <button onclick="resetGame()">Play Again</button>
      </div>
    `;
  } else if (state.phase === "gameover") {
    content.innerHTML = `
      <div style="text-align: center;">
        <h1 class="hero-title">😢 Oh no!</h1>
        <p class="hero-sub">You ran out of lives.</p>
        <button onclick="resetGame()">Try Again</button>
      </div>
    `;
  }

  container.appendChild(content);
  container.appendChild(sidebar);

  app.appendChild(container);
}

// Logic Functions
function startTeach() {
  state.phase = "teach";
  state.currentIndex = 0;
  speak("Let's look at some words.");
  render();
}

function nextTeach() {
  if (state.currentIndex < lessonData.teachWords.length - 1) {
    state.currentIndex++;
    render();
  } else {
    startGame();
  }
}

function startGame() {
  state.phase = "play";
  state.currentIndex = 0;
  state.score = 0;
  state.hearts = 3;
  state.streak = 0;
  state.currentAttempts = 0;
  speak("Time to play! Type the words you hear.");
  render();
}

function checkAnswer() {
  const inputs = document.querySelectorAll("#word-input input");
  const feedback = document.getElementById("feedback-area");

  if (!inputs || inputs.length === 0) return;

  const userWord = Array.from(inputs).map(inp => inp.value).join('').toLowerCase();
  const targetWord = lessonData.challengeWords[state.currentIndex];

  if (userWord === targetWord) {
    state.score += 10 + (state.streak * 2);
    state.streak++;
    state.currentAttempts = 0;
    playSound("correct");
    feedback.innerHTML = `<div class="feedback success">🌟 Correct! Amazing!</div>`;
    playSparkleEffect();
    burstConfetti();
    mascotPulse();

    setTimeout(() => {
      nextWord();
    }, 1400);
  } else {
    state.currentAttempts++;
    state.streak = 0;

    if (state.currentAttempts < 3) {
      // Give more chances
      playSound("incorrect");
      feedback.innerHTML = `<div class="feedback error">❌ Not quite! Try again. (${3 - state.currentAttempts} tries left)</div>`;
      // Clear editable inputs
      inputs.forEach(inp => { if (!inp.disabled) inp.value = ""; });
      // Shake the word-input
      const wordInput = document.getElementById("word-input");
      if (wordInput) {
        wordInput.classList.add("shake");
        setTimeout(() => wordInput.classList.remove("shake"), 400);
      }
      // Focus first editable
      const editableInputs = document.querySelectorAll("#word-input input:not([disabled])");
      if (editableInputs.length > 0) editableInputs[0].focus();
    } else {
      // Failed after 3 attempts
      state.hearts--;
      state.currentAttempts = 0;
      playSound("incorrect");
      feedback.innerHTML = `<div class="feedback error">❌ Oops! It was "${targetWord}". You lost a life!</div>`;
      // Clear editable inputs
      inputs.forEach(inp => { if (!inp.disabled) inp.value = ""; });

      if (state.hearts <= 0) {
        setTimeout(() => {
          state.phase = "gameover";
          render();
        }, 1500);
      } else {
        setTimeout(() => {
          nextWord();
        }, 1800);
      }
    }
  }
  updateStats();
}

function nextWord() {
  state.currentAttempts = 0;
  if (state.currentIndex < lessonData.challengeWords.length - 1) {
    state.currentIndex++;
    render();
    setTimeout(() => speak(lessonData.challengeWords[state.currentIndex]), 500);
  } else {
    state.phase = "victory";
    playSound("win");
    burstConfetti(50);
    render();
    window.parent.postMessage({type: 'lessonCompleted', lessonId: 20}, '*');
  }
}

function resetGame() {
  state.phase = "intro";
  render();
}

function updateStats() {
  const scoreEl = document.getElementById("score-display");
  if (scoreEl) scoreEl.textContent = state.score;
}

// Utils
function speak(text) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

function playSound(type) {
  if (type === "correct") speak("Correct!");
  if (type === "incorrect") speak("Oh no.");
  if (type === "win") speak("You are a champion!");
}

function playSparkleEffect() {
  const mascot = document.getElementById("mascot");
  if (!mascot) return;

  const star = document.createElement("div");
  star.className = "star-burst";
  star.textContent = "✨";
  star.style.left = Math.random() * 120 + "px";
  star.style.top = Math.random() * 120 + "px";
  mascot.appendChild(star);
  setTimeout(() => star.remove(), 1200);
}

function mascotPulse() {
  const mascot = document.getElementById("mascot");
  if (!mascot) return;
  mascot.classList.add("burst");
  setTimeout(() => mascot.classList.remove("burst"), 600);
}

function burstConfetti(count = 30) {
  for (let i = 0; i < count; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti-piece";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
    conf.style.animationDelay = Math.random() * 0.2 + "s";
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 3000);
  }
}

// Start
init();
