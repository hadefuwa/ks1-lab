const app = document.getElementById("app");

const STORAGE_KEYS = {
  progress: "ks1-progress",
  settings: "ks1-tts-settings"
};

const defaultSettings = {
  voiceURI: "",
  rate: 1,
  pitch: 1,
  autoplay: true
};

let tasks = { readingTasks: [], mathTasks: [] };
let state = {
  view: "home",
  mode: "reading",
  stage: "Reception",
  readingIndex: 0,
  mathIndex: 0,
  progress: loadProgress(),
  settings: loadSettings(),
  feedback: "",
  feedbackType: ""
};

let voices = [];

init();

async function init() {
  await loadTasks();
  initVoices();
  render();
}

async function loadTasks() {
  const res = await fetch("data/tasks.json");
  tasks = await res.json();
}

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEYS.progress);
  return saved ? JSON.parse(saved) : {};
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
}

function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEYS.settings);
  return saved ? JSON.parse(saved) : { ...defaultSettings };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function initVoices() {
  const hydrate = () => {
    voices = window.speechSynthesis.getVoices();
    render();
  };
  hydrate();
  window.speechSynthesis.addEventListener("voiceschanged", hydrate);
}

function speak(text, slow = false) {
  if (!text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const chosen = voices.find((v) => v.voiceURI === state.settings.voiceURI);
  if (chosen) utter.voice = chosen;
  utter.rate = slow ? Math.max(0.6, state.settings.rate * 0.7) : state.settings.rate;
  utter.pitch = state.settings.pitch;
  window.speechSynthesis.speak(utter);
}

function setView(view) {
  state.view = view;
  state.feedback = "";
  state.feedbackType = "";
  render();
}

function setMode(mode) {
  state.mode = mode;
  state.feedback = "";
  state.feedbackType = "";
  setView("practice");
}

function updateProgress(skillKey, correct) {
  const entry = state.progress[skillKey] || { attempts: 0, correct: 0 };
  entry.attempts += 1;
  if (correct) entry.correct += 1;
  state.progress[skillKey] = entry;
  saveProgress();
}

function render() {
  app.innerHTML = `
    <header>
      <div class="logo">KS1 Lab</div>
      <div class="nav">
        <button class="secondary" data-view="home">Home</button>
        <button class="secondary" data-view="practice">Practice</button>
        <button class="secondary" data-view="progress">Progress</button>
      </div>
    </header>
    ${state.view === "home" ? renderHome() : ""}
    ${state.view === "practice" ? renderPractice() : ""}
    ${state.view === "progress" ? renderProgress() : ""}
  `;

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });
}

function renderHome() {
  return `
    <div class="layout">
      <div class="card">
        <div class="task-title">TTS-first reading and maths practice</div>
        <p class="subtle">Desktop-only learning app for Nursery to Year 2. Start with audio, then build, then type.</p>
        <div class="grid-2">
          <button data-mode="reading">Reading practice</button>
          <button data-mode="math">Maths practice</button>
        </div>
      </div>
      ${renderSettingsPanel()}
    </div>
  `;
}

function renderPractice() {
  const stageOptions = ["Nursery", "Reception", "Year 1", "Year 2"];
  const task = getCurrentTask();
  const panel = task ? renderTask(task) : `<div class="card">No tasks for this stage yet.</div>`;

  setTimeout(() => {
    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => setMode(btn.dataset.mode));
    });
    const stageSelect = document.getElementById("stage-select");
    if (stageSelect) {
      stageSelect.addEventListener("change", (e) => {
        state.stage = e.target.value;
        state.feedback = "";
        state.feedbackType = "";
        render();
      });
    }
  }, 0);

  return `
    <div class="layout">
      <div class="card">
        <div class="task-title">${state.mode === "reading" ? "Reading practice" : "Maths practice"}</div>
        <div class="subtle">Stage</div>
        <select id="stage-select">
          ${stageOptions
            .map((stage) => `<option ${stage === state.stage ? "selected" : ""}>${stage}</option>`)
            .join("")}
        </select>
        ${panel}
      </div>
      ${renderSettingsPanel()}
    </div>
  `;
}

function renderProgress() {
  const rows = Object.entries(state.progress)
    .map(([key, entry]) => {
      const rate = entry.attempts ? Math.round((entry.correct / entry.attempts) * 100) : 0;
      return `<div class="pill">${key}: ${rate}% (${entry.correct}/${entry.attempts})</div>`;
    })
    .join("");

  return `
    <div class="layout">
      <div class="card">
        <div class="task-title">Progress</div>
        <div class="subtle">Mastery grows with consistent success.</div>
        <div class="tiles">${rows || "<span class='subtle'>No progress yet.</span>"}</div>
      </div>
      ${renderSettingsPanel()}
    </div>
  `;
}

function renderSettingsPanel() {
  const voiceOptions = voices
    .map((v) => `<option value="${v.voiceURI}" ${v.voiceURI === state.settings.voiceURI ? "selected" : ""}>${v.name}</option>`)
    .join("");

  setTimeout(() => {
    const voiceSelect = document.getElementById("voice-select");
    if (voiceSelect) {
      voiceSelect.addEventListener("change", (e) => {
        state.settings.voiceURI = e.target.value;
        saveSettings();
      });
    }
    const rateInput = document.getElementById("rate-input");
    if (rateInput) {
      rateInput.addEventListener("input", (e) => {
        state.settings.rate = Number(e.target.value);
        saveSettings();
      });
    }
    const pitchInput = document.getElementById("pitch-input");
    if (pitchInput) {
      pitchInput.addEventListener("input", (e) => {
        state.settings.pitch = Number(e.target.value);
        saveSettings();
      });
    }
    const autoplay = document.getElementById("autoplay-input");
    if (autoplay) {
      autoplay.addEventListener("change", (e) => {
        state.settings.autoplay = e.target.checked;
        saveSettings();
      });
    }
  }, 0);

  return `
    <div class="panel settings">
      <div class="task-title">TTS settings</div>
      <label>
        Voice
        <select id="voice-select">
          <option value="">Default</option>
          ${voiceOptions}
        </select>
      </label>
      <label>
        Rate: <input id="rate-input" type="range" min="0.6" max="1.4" step="0.1" value="${state.settings.rate}" />
      </label>
      <label>
        Pitch: <input id="pitch-input" type="range" min="0.6" max="1.4" step="0.1" value="${state.settings.pitch}" />
      </label>
      <label>
        <input id="autoplay-input" type="checkbox" ${state.settings.autoplay ? "checked" : ""} />
        Autoplay on task load
      </label>
    </div>
  `;
}

function getCurrentTask() {
  const list = state.mode === "reading" ? tasks.readingTasks : tasks.mathTasks;
  const filtered = list.filter((t) => t.stage === state.stage);
  if (!filtered.length) return null;
  const index = state.mode === "reading" ? state.readingIndex : state.mathIndex;
  return filtered[index % filtered.length];
}

function renderTask(task) {
  if (task.type === "buildWord") {
    return renderBuildWord(task);
  }
  if (task.type === "numberBonds") {
    return renderNumberBonds(task);
  }
  return `<div class="card">Unknown task.</div>`;
}

function renderBuildWord(task) {
  const tts = task.ttsText;

  setTimeout(() => {
    if (state.settings.autoplay) speak(tts);

    document.getElementById("play-word")?.addEventListener("click", () => speak(tts));
    document.getElementById("play-slow")?.addEventListener("click", () => speak(tts, true));

    const buildEl = document.getElementById("built-word");
    const typedInput = document.getElementById("typed-word");
    const tiles = document.querySelectorAll(".tile");
    tiles.forEach((tile) => {
      tile.addEventListener("click", () => {
        buildEl.textContent += tile.dataset.value;
      });
    });
    document.getElementById("clear-word")?.addEventListener("click", () => {
      buildEl.textContent = "";
    });
    document.getElementById("check-word")?.addEventListener("click", () => {
      const built = buildEl.textContent.trim().toLowerCase();
      const typed = typedInput.value.trim().toLowerCase();
      const answers = task.answers.map((a) => a.toLowerCase());
      const ok = answers.includes(built) && answers.includes(typed);
      updateProgress("reading/buildWord", ok);
      state.feedback = ok ? "Nice! You built the word." : "Try again. Listen carefully and blend the sounds.";
      state.feedbackType = ok ? "success" : "error";
      render();
    });
  }, 0);

  return `
    <div class="panel">
      <div class="task-title">${task.title}</div>
      <div class="subtle">Listen, build, then type it.</div>
      <div class="tts-row">
        <button class="secondary" id="play-word">Play word</button>
        <button class="secondary" id="play-slow">Play slow</button>
      </div>
      <div class="tiles">
        ${task.tiles.map((tile) => `<div class="tile" data-value="${tile}">${tile}</div>`).join("")}
      </div>
      <div class="word-build" id="built-word"></div>
      <div class="tts-row">
        <button class="secondary" id="clear-word">Clear</button>
      </div>
      <input id="typed-word" class="equation" placeholder="Type the word" />
      <div class="tts-row">
        <button id="check-word">Check</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function renderNumberBonds(task) {
  setTimeout(() => {
    const pool = document.getElementById("counter-pool");
    const left = document.getElementById("basket-left");
    const right = document.getElementById("basket-right");
    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
      counter.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", counter.dataset.id);
      });
    });

    [pool, left, right].forEach((zone) => {
      zone.addEventListener("dragover", (e) => e.preventDefault());
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const el = document.querySelector(`.counter[data-id="${id}"]`);
        if (el) zone.appendChild(el);
      });
    });

    document.getElementById("check-bonds")?.addEventListener("click", () => {
      const leftCount = left.querySelectorAll(".counter").length;
      const rightCount = right.querySelectorAll(".counter").length;
      const equation = document.getElementById("equation").value;
      const parsed = parseEquation(equation);
      const total = task.total;

      const countsOk = leftCount + rightCount === total;
      const eqOk =
        parsed &&
        parsed.total === total &&
        ((parsed.a === leftCount && parsed.b === rightCount) || (parsed.a === rightCount && parsed.b === leftCount));

      const ok = countsOk && eqOk;
      updateProgress("math/numberBonds", ok);
      state.feedback = ok ? "Great! That makes " + total + "." : "Check the counters and the equation.";
      state.feedbackType = ok ? "success" : "error";
      render();
    });
  }, 0);

  const counters = Array.from({ length: task.total }, (_, i) => `<div class="counter" draggable="true" data-id="${i + 1}">${i + 1}</div>`).join("");

  return `
    <div class="panel">
      <div class="task-title">${task.title}</div>
      <div class="subtle">Drag counters into two groups, then write the equation.</div>
      <div class="counter-area">
        <div>
          <div class="subtle">Pool</div>
          <div id="counter-pool" class="counter-pool">${counters}</div>
        </div>
        <div>
          <div class="subtle">Group A</div>
          <div id="basket-left" class="basket"></div>
        </div>
        <div>
          <div class="subtle">Group B</div>
          <div id="basket-right" class="basket"></div>
        </div>
      </div>
      <input id="equation" class="equation" placeholder="e.g., 7 + 3 = ${task.total}" />
      <div class="tts-row">
        <button id="check-bonds">Check</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function parseEquation(input) {
  const match = input.replace(/\s+/g, "").match(/^(\d+)\+(\d+)=(\d+)$/);
  if (!match) return null;
  return {
    a: Number(match[1]),
    b: Number(match[2]),
    total: Number(match[3])
  };
}

function renderFeedback() {
  if (!state.feedback) return "";
  return `<div class="feedback ${state.feedbackType}">${state.feedback}</div>`;
}
