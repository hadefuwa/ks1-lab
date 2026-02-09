const sidebar = document.getElementById("sidebar");

let lessons = [];
let completedLessons = [];

// Safely get stored data
try {
  const stored = localStorage.getItem('completedLessons');
  if (stored) {
    completedLessons = JSON.parse(stored);
  }
} catch (error) {
  console.warn('localStorage not available:', error.message);
  completedLessons = [];
}

async function init() {
  if (!sidebar) {
    console.error('Sidebar element not found');
    return;
  }
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
      ${lessons.map(lesson => `
        <li>
          <button onclick="loadLesson('${lesson.path}')">
            ${lesson.title} ${completedLessons.includes(lesson.id) ? '✅' : '❌'}
          </button>
        </li>
      `).join('')}
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
    try {
      localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    } catch (error) {
      console.warn('Could not save to localStorage:', error.message);
    }
    renderSidebar();
  }
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'lessonCompleted') {
    markCompleted(event.data.lessonId);
  }
});

init();
