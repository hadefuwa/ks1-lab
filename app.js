const sidebar = document.getElementById("sidebar");

function init() {
  renderSidebar();
}

function renderSidebar() {
  sidebar.innerHTML = `
    <h2>Lesson Progress</h2>
    <ul>
      <li><button onclick="loadLesson('lessons/lesson1/index.html')">Lesson 1: Spelling</button></li>
      <!-- Add more lessons here -->
    </ul>
  `;
}

function loadLesson(url) {
  document.getElementById("lesson-frame").src = url;
}

init();
