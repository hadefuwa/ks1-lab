const app = document.getElementById("app");

// Lessons data
const lessons = [
  {
    id: 1,
    level: "Reception",
    title: "Lesson 1: Introduction to CVC Words",
    teach: "CVC words are words with a consonant, vowel, consonant pattern, like 'cat'. Listen to the word and type it!",
    words: ["cat", "dog", "pig", "sun", "run", "fun", "big", "red", "bed", "hen"],
    passThreshold: 8 // 8 out of 10
  }
  // Add more lessons later
];

let currentLesson = lessons[0];
let currentIndex = 0;
let correctCount = 0;
let phase = "practice"; // teach, practice, assess

function init() {
  render();
}

function render() {
  if (phase === "teach") {
    app.innerHTML = `
      <div class="lesson">
        <h1>${currentLesson.title}</h1>
        <p>${currentLesson.teach}</p>
        <button id="start-practice">Start Practice</button>
      </div>
    `;
    document.getElementById("start-practice").addEventListener("click", () => {
      phase = "practice";
      currentIndex = 0;
      correctCount = 0;
      render();
    });
  } else if (phase === "practice" || phase === "assess") {
    const isAssess = phase === "assess";
    const word = currentLesson.words[currentIndex];
    app.innerHTML = `
      <div class="game">
        <h1>${isAssess ? "Assessment" : "Practice"}: ${currentLesson.title}</h1>
        <p>${isAssess ? "Now, type the words correctly to pass!" : "Practice typing the words."}</p>
        <button id="play-word">Play Word</button>
        <input type="text" id="word-input" placeholder="Type the word here">
        <button id="check">Check</button>
        <p id="feedback"></p>
        <p>Word ${currentIndex + 1} of ${currentLesson.words.length}</p>
        ${isAssess ? `<p>Correct: ${correctCount}/${currentLesson.words.length}</p>` : ""}
      </div>
    `;

    document.getElementById("play-word").addEventListener("click", () => speak(word));
    document.getElementById("check").addEventListener("click", () => checkWord(isAssess));
  }
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

function checkWord(isAssess) {
  const input = document.getElementById("word-input").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");
  const correct = input === currentLesson.words[currentIndex].toLowerCase();
  if (correct) {
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
    correctCount++;
  } else {
    feedback.textContent = `Incorrect. The word is "${currentLesson.words[currentIndex]}".`;
    feedback.style.color = "red";
  }
  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= currentLesson.words.length) {
      if (phase === "practice") {
        phase = "assess";
        currentIndex = 0;
        correctCount = 0;
      } else {
        // Assessment done
        if (correctCount >= currentLesson.passThreshold) {
          alert("Well done! You passed the lesson!");
          // Unlock next lesson, but for now, restart
          phase = "teach";
        } else {
          alert(`Try again. You got ${correctCount}/${currentLesson.words.length}. Need ${currentLesson.passThreshold} to pass.`);
          phase = "assess";
          currentIndex = 0;
          correctCount = 0;
        }
      }
      render();
    } else {
      document.getElementById("word-input").value = "";
      render();
    }
  }, 2000);
}

init();
