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

function advanceTask() {
  if (state.mode === "reading") {
    state.readingIndex += 1;
  } else {
    state.mathIndex += 1;
  }
  state.feedback = "";
  state.feedbackType = "";
  render();
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
      <div class="hero card">
        <div>
          <div class="badge">Today’s mission</div>
          <div class="task-title hero-title">Listen, build, read, and win</div>
          <p class="subtle hero-sub">Friendly, TTS-first learning for Nursery to Year 2. Every question starts with audio.</p>
          <div class="cta-row">
            <button data-mode="reading">Start Reading Quest</button>
            <button class="secondary" data-mode="math">Start Maths Quest</button>
          </div>
          <div class="stage-chips">
            <span class="chip">Nursery</span>
            <span class="chip">Reception</span>
            <span class="chip">Year 1</span>
            <span class="chip">Year 2</span>
          </div>
        </div>
        <div class="mascot">
          <div class="mascot-face">
            <span class="eye"></span>
            <span class="eye"></span>
            <span class="smile"></span>
          </div>
          <div class="sparkle s1"></div>
          <div class="sparkle s2"></div>
          <div class="sparkle s3"></div>
        </div>
      </div>
      <div class="card mission">
        <div class="task-title">Quick start</div>
        <div class="subtle">Pick a stage, then hit play on every task.</div>
        <div class="stat-grid">
          <div class="stat">
            <div class="stat-label">Focus</div>
            <div class="stat-value">Reading</div>
          </div>
          <div class="stat">
            <div class="stat-label">Mode</div>
            <div class="stat-value">TTS-first</div>
          </div>
          <div class="stat">
            <div class="stat-label">Goal</div>
            <div class="stat-value">Mastery</div>
          </div>
        </div>
        <div class="mode-toggle">
          <button class="secondary" data-mode="reading">Reading</button>
          <button class="secondary" data-mode="math">Maths</button>
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
        <div class="practice-header">
          <div>
            <div class="task-title">${state.mode === "reading" ? "Reading Quest" : "Maths Quest"}</div>
            <div class="subtle">Pick a stage and press play to hear the task.</div>
          </div>
          <div class="mode-toggle">
            <button class="${state.mode === "reading" ? "" : "secondary"}" data-mode="reading">Reading</button>
            <button class="${state.mode === "math" ? "" : "secondary"}" data-mode="math">Maths</button>
          </div>
        </div>
        <div class="stage-row">
          <label class="subtle">Stage</label>
          <select id="stage-select">
            ${stageOptions
              .map((stage) => `<option ${stage === state.stage ? "selected" : ""}>${stage}</option>`)
              .join("")}
          </select>
        </div>
        ${panel}
      </div>
      <div class="panel coach">
        <div class="task-title">Coach</div>
        <div class="subtle">Tips for this session</div>
        <div class="coach-card">
          <div class="coach-bubble">Press Play, listen, then build the answer.</div>
          <div class="coach-bubble">Keep it short. Celebrate small wins.</div>
          <div class="coach-bubble">Repeat tricky sounds after the slow button.</div>
        </div>
        <div class="coach-meter">
          <div class="meter-ring" style="--pct: 0.72"></div>
          <div>
            <div class="subtle">Session energy</div>
            <div class="stat-value">72%</div>
          </div>
        </div>
      </div>
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
        <div class="task-title">Progress Map</div>
        <div class="subtle">Mastery grows with consistent success.</div>
        <div class="progress-grid">
          <div class="progress-badge">
            <div class="meter-ring large" style="--pct: 0.58"></div>
            <div>
              <div class="stat-label">Reading</div>
              <div class="stat-value">58%</div>
            </div>
          </div>
          <div class="progress-badge">
            <div class="meter-ring large" style="--pct: 0.42"></div>
            <div>
              <div class="stat-label">Maths</div>
              <div class="stat-value">42%</div>
            </div>
          </div>
        </div>
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
  if (task.type === "soundMatch") {
    return renderSoundMatch(task);
  }
  if (task.type === "cloze") {
    return renderCloze(task);
  }
  if (task.type === "sentenceBuilder") {
    return renderSentenceBuilder(task);
  }
  if (task.type === "wordHunt") {
    return renderWordHunt(task);
  }
  if (task.type === "numberBonds") {
    return renderNumberBonds(task);
  }
  if (task.type === "placeValue") {
    return renderPlaceValue(task);
  }
  if (task.type === "barModel") {
    return renderBarModel(task);
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
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
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
        <button class="secondary" id="next-task">Next</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function renderSoundMatch(task) {
  const tts = task.ttsText;

  setTimeout(() => {
    if (state.settings.autoplay) speak(tts);
    document.getElementById("play-word")?.addEventListener("click", () => speak(tts));
    document.getElementById("play-slow")?.addEventListener("click", () => speak(tts, true));
    document.querySelectorAll(".sound-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.value;
        const ok = choice.toLowerCase() === task.answer.toLowerCase();
        updateProgress("reading/soundMatch", ok);
        state.feedback = ok ? "Yes! That is the first sound." : "Not quite. Listen again.";
        state.feedbackType = ok ? "success" : "error";
        render();
      });
    });
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
  }, 0);

  return `
    <div class="panel">
      <div class="task-title">${task.title}</div>
      <div class="subtle">${task.prompt}</div>
      <div class="tts-row">
        <button class="secondary" id="play-word">Play word</button>
        <button class="secondary" id="play-slow">Play slow</button>
      </div>
      <div class="tiles">
        ${task.options
          .map((opt) => `<button class="tile sound-option" data-value="${opt}">${opt}</button>`)
          .join("")}
      </div>
      <div class="tts-row">
        <button class="secondary" id="next-task">Next</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function renderCloze(task) {
  const tts = task.ttsText;

  setTimeout(() => {
    if (state.settings.autoplay) speak(tts);
    document.getElementById("play-sentence")?.addEventListener("click", () => speak(tts));
    document.getElementById("play-slow")?.addEventListener("click", () => speak(tts, true));
    document.getElementById("check-cloze")?.addEventListener("click", () => {
      const input = document.getElementById("cloze-input").value.trim().toLowerCase();
      const answers = task.answers.map((a) => a.toLowerCase());
      const ok = answers.includes(input);
      updateProgress("reading/cloze", ok);
      state.feedback = ok ? "Great! You found the missing word." : "Try again and listen to the sentence.";
      state.feedbackType = ok ? "success" : "error";
      render();
    });
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
  }, 0);

  return `
    <div class="panel">
      <div class="task-title">${task.title}</div>
      <div class="subtle">${task.sentence}</div>
      <div class="tts-row">
        <button class="secondary" id="play-sentence">Play sentence</button>
        <button class="secondary" id="play-slow">Play slow</button>
      </div>
      <input id="cloze-input" class="equation" placeholder="Type the missing word" />
      <div class="tts-row">
        <button id="check-cloze">Check</button>
        <button class="secondary" id="next-task">Next</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function renderSentenceBuilder(task) {
  const tts = task.ttsText;

  setTimeout(() => {
    if (state.settings.autoplay) speak(tts);
    document.getElementById("play-sentence")?.addEventListener("click", () => speak(tts));
    document.getElementById("play-slow")?.addEventListener("click", () => speak(tts, true));
    const buildEl = document.getElementById("built-sentence");
    document.querySelectorAll(".sentence-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        const piece = tile.dataset.value;
        buildEl.textContent = [buildEl.textContent.trim(), piece].filter(Boolean).join(" ");
      });
    });
    document.getElementById("clear-sentence")?.addEventListener("click", () => {
      buildEl.textContent = "";
    });
    document.getElementById("check-sentence")?.addEventListener("click", () => {
      const built = buildEl.textContent.trim();
      const typed = document.getElementById("typed-sentence").value.trim();
      const answers = task.answers;
      const ok = answers.includes(built) && answers.includes(typed);
      updateProgress("reading/sentenceBuilder", ok);
      state.feedback = ok ? "Nice sentence!" : "Try again. Listen and build it in order.";
      state.feedbackType = ok ? "success" : "error";
      render();
    });
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
  }, 0);

  return `
    <div class="panel">
      <div class="task-title">${task.title}</div>
      <div class="subtle">Listen, build, then type the sentence.</div>
      <div class="tts-row">
        <button class="secondary" id="play-sentence">Play sentence</button>
        <button class="secondary" id="play-slow">Play slow</button>
      </div>
      <div class="tiles">
        ${task.tiles.map((tile) => `<div class="tile sentence-tile" data-value="${tile}">${tile}</div>`).join("")}
      </div>
      <div class="word-build" id="built-sentence"></div>
      <div class="tts-row">
        <button class="secondary" id="clear-sentence">Clear</button>
      </div>
      <input id="typed-sentence" class="equation" placeholder="Type the sentence" />
      <div class="tts-row">
        <button id="check-sentence">Check</button>
        <button class="secondary" id="next-task">Next</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function renderWordHunt(task) {
  const tts = task.ttsText;
  const tokens = task.paragraph.split(" ");

  setTimeout(() => {
    if (state.settings.autoplay) speak(tts);
    document.getElementById("play-paragraph")?.addEventListener("click", () => speak(tts));
    document.getElementById("play-slow")?.addEventListener("click", () => speak(tts, true));
    document.querySelectorAll(".hunt-word").forEach((word) => {
      word.addEventListener("click", () => {
        const picked = word.dataset.word.toLowerCase().replace(/[^\w]/g, "");
        const ok = picked === task.answer.toLowerCase();
        updateProgress("reading/wordHunt", ok);
        state.feedback = ok ? "Great spotting!" : "Try again. Look for the answer word.";
        state.feedbackType = ok ? "success" : "error";
        render();
      });
    });
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
  }, 0);

  return `
    <div class="panel hunt">
      <div class="task-title">${task.title}</div>
      <div class="subtle">${task.question}</div>
      <div class="tts-row">
        <button class="secondary" id="play-paragraph">Play paragraph</button>
        <button class="secondary" id="play-slow">Play slow</button>
      </div>
      <div class="hunt-text">
        ${tokens
          .map((token) => {
            const safe = token.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return `<button class="hunt-word" data-word="${safe}">${safe}</button>`;
          })
          .join(" ")}
      </div>
      <div class="tts-row">
        <button class="secondary" id="next-task">Next</button>
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
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
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
        <button class="secondary" id="next-task">Next</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function renderPlaceValue(task) {
  setTimeout(() => {
    const pool = document.getElementById("pv-pool");
    const build = document.getElementById("pv-build");
    const blocks = document.querySelectorAll(".pv-block");

    blocks.forEach((block) => {
      block.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", block.dataset.id);
      });
    });

    [pool, build].forEach((zone) => {
      zone.addEventListener("dragover", (e) => e.preventDefault());
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const el = document.querySelector(`.pv-block[data-id="${id}"]`);
        if (el) zone.appendChild(el);
      });
    });

    document.getElementById("check-pv")?.addEventListener("click", () => {
      const blocksInBuild = build.querySelectorAll(".pv-block");
      let total = 0;
      blocksInBuild.forEach((b) => {
        total += Number(b.dataset.value);
      });
      const typed = Number(document.getElementById("pv-input").value.trim());
      const ok = total === task.number && typed === task.number;
      updateProgress("math/placeValue", ok);
      state.feedback = ok ? "Nice! You built " + task.number + "." : "Try again. Count tens and ones.";
      state.feedbackType = ok ? "success" : "error";
      render();
    });
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
  }, 0);

  const tensBlocks = Array.from({ length: 6 }, (_, i) => {
    return `<div class="pv-block tens" draggable="true" data-id="t${i}" data-value="10">10</div>`;
  }).join("");
  const onesBlocks = Array.from({ length: 9 }, (_, i) => {
    return `<div class="pv-block ones" draggable="true" data-id="o${i}" data-value="1">1</div>`;
  }).join("");

  return `
    <div class="panel place-value">
      <div class="task-title">${task.title}</div>
      <div class="subtle">Drag tens and ones to build ${task.number}, then type it.</div>
      <div class="pv-area">
        <div>
          <div class="subtle">Blocks</div>
          <div id="pv-pool" class="pv-pool">${tensBlocks}${onesBlocks}</div>
        </div>
        <div>
          <div class="subtle">Build area</div>
          <div id="pv-build" class="pv-build"></div>
        </div>
      </div>
      <input id="pv-input" class="equation" placeholder="Type the number" />
      <div class="tts-row">
        <button id="check-pv">Check</button>
        <button class="secondary" id="next-task">Next</button>
      </div>
      ${renderFeedback()}
    </div>
  `;
}

function renderBarModel(task) {
  setTimeout(() => {
    const pool = document.getElementById("bar-pool");
    const bar = document.getElementById("bar-area");
    const segments = document.querySelectorAll(".bar-seg");

    segments.forEach((seg) => {
      seg.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", seg.dataset.id);
      });
    });

    [pool, bar].forEach((zone) => {
      zone.addEventListener("dragover", (e) => e.preventDefault());
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const el = document.querySelector(`.bar-seg[data-id="${id}"]`);
        if (el) zone.appendChild(el);
      });
    });

    document.getElementById("check-bar")?.addEventListener("click", () => {
      const segs = Array.from(bar.querySelectorAll(".bar-seg"));
      const values = segs.map((s) => Number(s.dataset.value)).sort((a, b) => a - b);
      const target = [...task.parts].sort((a, b) => a - b);
      const total = values.reduce((sum, v) => sum + v, 0);
      const typed = Number(document.getElementById("bar-total").value.trim());
      const partsOk = values.length === target.length && values.every((v, i) => v === target[i]);
      const ok = partsOk && total === task.total && typed === task.total;
      updateProgress("math/barModel", ok);
      state.feedback = ok ? "Nice bar model!" : "Try again. Match the parts and the total.";
      state.feedbackType = ok ? "success" : "error";
      render();
    });
    document.getElementById("next-task")?.addEventListener("click", advanceTask);
  }, 0);

  const palette = task.parts
    .map((value, i) => `<div class="bar-seg" draggable="true" data-id="p${i}" data-value="${value}">${value}</div>`)
    .join("");

  return `
    <div class="panel bar-model">
      <div class="task-title">${task.title}</div>
      <div class="subtle">${task.story}</div>
      <div class="bar-grid">
        <div>
          <div class="subtle">Parts</div>
          <div id="bar-pool" class="bar-pool">${palette}</div>
        </div>
        <div>
          <div class="subtle">Bar model</div>
          <div id="bar-area" class="bar-area"></div>
        </div>
      </div>
      <input id="bar-total" class="equation" placeholder="Type the total" />
      <div class="tts-row">
        <button id="check-bar">Check</button>
        <button class="secondary" id="next-task">Next</button>
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
