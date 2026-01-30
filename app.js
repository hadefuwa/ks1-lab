const sidebar = document.getElementById("sidebar");

let lessons = [];
let completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || [];

async function init() {
  await loadLessons();
  renderSidebar();
}

async function loadLessons() {
  try {
    const response = await fetch('lessons.json');
    lessons = await response.json();
  } catch (error) {
    console.error('Failed to load lessons:', error);
    // Fallback to hardcoded
    lessons = [
      { id: 1, title: 'Lesson 1: Spelling', path: 'lessons/lesson1/index.html' },
      { id: 2, title: 'Lesson 2: 4-Letter Words', path: 'lessons/lesson2/index.html' },
      { id: 3, title: 'Lesson 3: Space Sums', path: 'lessons/lesson3/index.html' }
    ];
  }
}

function renderSidebar() {
  sidebar.innerHTML = `
    <h2>Lesson Progress</h2>
    <ul>
      ${lessons.map(lesson => `<li>${lesson.title} ${completedLessons.includes(lesson.id) ? '✅' : '❌'}</li>`).join('')}
    </ul>
  `;
}

function loadLesson(url) {
  document.getElementById("lesson-frame").src = url;
}

window.loadLesson = loadLesson;

function markCompleted(lessonId) {
  if (!completedLessons.includes(lessonId)) {
    completedLessons.push(lessonId);
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    renderSidebar();
  }
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'lessonCompleted') {
    markCompleted(event.data.lessonId);
  }
});

init();
