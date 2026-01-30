const sidebar = document.getElementById("sidebar");
const lessonFrame = document.getElementById("lesson-frame");

let lessons = [];
let completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || [];
let currentLessonId = 1;

async function init() {
  await loadLessons();
  renderSidebar();
  
  // Load first uncompleted lesson or first lesson
  const nextLesson = lessons.find(l => !completedLessons.includes(l.id)) || lessons[0];
  if (nextLesson) {
    loadLesson(nextLesson.id);
  }
}

async function loadLessons() {
  try {
    const response = await fetch('lessons.json');
    lessons = await response.json();
  } catch (error) {
    console.error('Failed to load lessons:', error);
    lessons = [
      { id: 1, title: 'Lesson 1: Spelling', path: 'lessons/lesson1/index.html' },
      { id: 2, title: 'Lesson 2: 4-Letter Words', path: 'lessons/lesson2/index.html' }
    ];
  }
}

function renderSidebar() {
  sidebar.innerHTML = `
    <h2>Lesson Progress</h2>
    <ul>
      ${lessons.map(lesson => `
        <li>
          <button onclick="loadLesson(${lesson.id})" class="${currentLessonId === lesson.id ? 'active' : ''}">
            ${lesson.title} ${completedLessons.includes(lesson.id) ? '✅' : '❌'}
          </button>
        </li>
      `).join('')}
    </ul>
  `;
}

function loadLesson(lessonId) {
  const lesson = lessons.find(l => l.id === lessonId);
  if (lesson) {
    currentLessonId = lessonId;
    lessonFrame.src = lesson.path;
    renderSidebar();
  }
}

window.loadLesson = loadLesson;

function markCompleted(lessonId) {
  if (!completedLessons.includes(lessonId)) {
    completedLessons.push(lessonId);
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    renderSidebar();
  }
  
  // Automatically try to load the next lesson
  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  if (currentIndex < lessons.length - 1) {
    const nextLesson = lessons[currentIndex + 1];
    setTimeout(() => {
      if (confirm(`Great job! Lesson ${lessonId} finished. Move to "${nextLesson.title}"?`)) {
        loadLesson(nextLesson.id);
      }
    }, 2000);
  } else {
    setTimeout(() => alert("Congratulations! You've finished all the lessons!"), 2000);
  }
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'lessonCompleted') {
    markCompleted(event.data.lessonId);
  }
});

init();
