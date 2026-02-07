let currentLeft = 0;
let currentRight = 0;
let score = 0;
const goal = 10;
const lessonId = 39;

// DOM elements
const leftNum = document.getElementById('left-num');
const rightNum = document.getElementById('right-num');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const mascot = document.getElementById('mascot');

function init() {
  score = 0;
  updateScore();
  generateQuestion();
}

function generateQuestion() {
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  
  // Pick random numbers 1-50
  currentLeft = Math.floor(Math.random() * 50) + 1;
  currentRight = Math.floor(Math.random() * 50) + 1;
  
  // Render
  leftNum.textContent = currentLeft;
  rightNum.textContent = currentRight;
}

function checkAnswer(operator) {
  let isCorrect = false;
  
  if (operator === '>') {
    isCorrect = currentLeft > currentRight;
  } else if (operator === '<') {
    isCorrect = currentLeft < currentRight;
  } else if (operator === '=') {
    isCorrect = currentLeft === currentRight;
  }

  if (isCorrect) {
    handleCorrect();
  } else {
    handleIncorrect();
  }
}

function handleCorrect() {
  feedbackEl.textContent = "Correct! You are doing great!";
  feedbackEl.className = "feedback success";
  score++;
  updateScore();
  mascot.classList.add('burst');
  setTimeout(() => mascot.classList.remove('burst'), 500);

  if (score >= goal) {
    setTimeout(finishLesson, 1000);
  } else {
    setTimeout(generateQuestion, 1000);
  }
}

function handleIncorrect() {
  feedbackEl.textContent = "Oops! Try again.";
  feedbackEl.className = "feedback error";
  mascot.classList.add('shake');
  setTimeout(() => mascot.classList.remove('shake'), 500);
}

function updateScore() {
  scoreEl.textContent = score;
}

function finishLesson() {
  feedbackEl.textContent = "You finished the lesson! 🎉";
  createConfetti();
  // Notify parent app
  window.parent.postMessage({ type: 'lessonCompleted', lessonId: lessonId }, '*');
}

function createConfetti() {
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
    document.body.appendChild(confetti);
  }
}

// Start game
init();
