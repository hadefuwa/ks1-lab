const animals = ['🐘', '🦁', '🐯', '🐼', '🐵', '🐶', '🐱', '🦊', '🐻', '🐨'];
let currentLeft = 0;
let currentRight = 0;
let score = 0;
const goal = 10;
const lessonId = 37;

// DOM elements
const leftGroup = document.getElementById('left-group');
const rightGroup = document.getElementById('right-group');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const mascot = document.getElementById('mascot');

function init() {
  score = 0;
  updateScore();
  generateQuestion();
}

function generateQuestion() {
  // Clear previous
  leftGroup.innerHTML = '';
  rightGroup.innerHTML = '';
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  
  // Pick random numbers 1-9
  currentLeft = Math.floor(Math.random() * 9) + 1;
  currentRight = Math.floor(Math.random() * 9) + 1;
  
  // Pick a random animal for this round
  const animal = animals[Math.floor(Math.random() * animals.length)];

  // Render left
  for(let i=0; i<currentLeft; i++) {
    const span = document.createElement('span');
    span.textContent = animal;
    span.className = 'item-img';
    leftGroup.appendChild(span);
  }

  // Render right
  for(let i=0; i<currentRight; i++) {
    const span = document.createElement('span');
    span.textContent = animal;
    span.className = 'item-img';
    rightGroup.appendChild(span);
  }
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
  feedbackEl.textContent = "Correct! Great Job!";
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
