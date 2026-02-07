let currentLeftVal = 0;
let currentRightVal = 0;
let score = 0;
const goal = 10;
const lessonId = 40;

// DOM elements
const leftDisplay = document.getElementById('left-display');
const rightDisplay = document.getElementById('right-display');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const mascot = document.getElementById('mascot');

function init() {
  score = 0;
  updateScore();
  generateQuestion();
}

function generateExpression() {
  // Return object { text: string, value: number }
  const isSum = Math.random() > 0.5;
  if (isSum) {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    return { text: `${a} + ${b}`, value: a + b };
  } else {
    const val = Math.floor(Math.random() * 18) + 1; // 1-18 (roughly matching sums)
    return { text: `${val}`, value: val };
  }
}

function generateQuestion() {
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  
  const left = generateExpression();
  const right = generateExpression();
  
  currentLeftVal = left.value;
  currentRightVal = right.value;
  
  leftDisplay.textContent = left.text;
  rightDisplay.textContent = right.text;
}

function checkAnswer(operator) {
  let isCorrect = false;
  
  if (operator === '>') {
    isCorrect = currentLeftVal > currentRightVal;
  } else if (operator === '<') {
    isCorrect = currentLeftVal < currentRightVal;
  } else if (operator === '=') {
    isCorrect = currentLeftVal === currentRightVal;
  }

  if (isCorrect) {
    handleCorrect();
  } else {
    handleIncorrect();
  }
}

function handleCorrect() {
  feedbackEl.textContent = "Correct! Amazing math skills!";
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
  feedbackEl.textContent = "Oops! Check your math.";
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
