// Personal Dashboard — app.js
// All modules live here as plain object literals / factory functions.

/* ===== Storage ===== */
const storage = {
  get(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // silently no-op if localStorage is unavailable
    }
  }
};

/* ===== Pure Logic Helpers ===== */
function uid() { return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(); }
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function formatGreetingTime(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
/* ===== Multilingual Greetings ===== */
const GREETINGS = {
  morning: [
    'Good morning',       // English
    'Bonjour',            // French
    'Buenos días',        // Spanish
    'Guten Morgen',       // German
    'Buongiorno',         // Italian
    'Bom dia',            // Portuguese
    'Ohayou',             // Japanese
    'Selamat pagi',       // Malay/Indonesian
    'Sabah al-khayr',     // Arabic
    'Доброе утро',        // Russian
  ],
  afternoon: [
    'Good afternoon',
    'Bon après-midi',
    'Buenas tardes',
    'Guten Tag',
    'Buon pomeriggio',
    'Boa tarde',
    'Konnichiwa',
    'Selamat tengah hari',
    'Masa al-khayr',
    'Добрый день',
  ],
  evening: [
    'Good evening',
    'Bonsoir',
    'Buenas noches',
    'Guten Abend',
    'Buonasera',
    'Boa noite',
    'Konbanwa',
    'Selamat malam',
    'Masa al-khayr',
    'Добрый вечер',
  ],
};

function getGreetingPhrase(hour) {
  let pool;
  if (hour >= 5 && hour < 12)       pool = GREETINGS.morning;
  else if (hour >= 12 && hour <= 17) pool = GREETINGS.afternoon;
  else                               pool = GREETINGS.evening;
  return pool[Math.floor(Math.random() * pool.length)];
}
function getWeekDays(today) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}
function toDayKey(date) { return date.toISOString().slice(0, 10); }
function isValidUrl(str) {
  try { new URL(str); return true; }
  catch { return false; }
}

/* ===== Task CRUD ===== */
function addTask(tasks, text) {
  const trimmed = text.trim();
  if (!trimmed) return tasks;
  // Prevent duplicates (case-insensitive)
  if (tasks.some(t => t.text.toLowerCase() === trimmed.toLowerCase())) return { duplicate: true, tasks };
  return { duplicate: false, tasks: [...tasks, { id: uid(), text: trimmed, completed: false }] };
}
function editTask(tasks, id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return tasks;
  return tasks.map(t => t.id === id ? { ...t, text: trimmed } : t);
}
function toggleTask(tasks, id) {
  return tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
}
function deleteTask(tasks, id) {
  return tasks.filter(t => t.id !== id);
}
function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.text.localeCompare(b.text);
  });
}

/* ===== Link CRUD ===== */
function addLink(links, label, url) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel || !isValidUrl(url)) return links;
  return [...links, { id: uid(), label: trimmedLabel, url }];
}
function deleteLink(links, id) {
  return links.filter(l => l.id !== id);
}

/* ===== Weather Component ===== */
const weather = {
  _el: null,

  // Map WMO weather codes to emoji icons
  _icon(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code <= 3) return '☁️';
    if (code <= 49) return '🌫️';
    if (code <= 59) return '🌦️';
    if (code <= 69) return '🌧️';
    if (code <= 79) return '🌨️';
    if (code <= 84) return '🌧️';
    if (code <= 94) return '⛈️';
    return '🌩️';
  },

  init(containerEl) {
    this._el = document.createElement('div');
    this._el.className = 'weather-widget';
    this._el.textContent = '…';
    containerEl.appendChild(this._el);
    this._fetch();
  },

  _fetch() {
    if (!navigator.geolocation) {
      this._el.textContent = '📍 unavailable';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
          .then(r => r.json())
          .then(data => {
            const { temperature, weathercode } = data.current_weather;
            const icon = this._icon(weathercode);
            this._el.textContent = `${icon} ${Math.round(temperature)}°C`;
          })
          .catch(() => { this._el.textContent = '—'; });
      },
      () => { this._el.textContent = '📍 denied'; }
    );
  }
};
const greeting = {
  _phraseEl: null,
  _timeEl: null,
  _dateEl: null,
  _name: '',

  init(containerEl) {
    this._name = storage.get('pd_name', '');

    this._phraseEl = document.createElement('div');
    this._phraseEl.className = 'greeting-phrase';

    const clockRow = document.createElement('div');
    clockRow.className = 'greeting-clock-row';

    this._timeEl = document.createElement('div');
    this._timeEl.className = 'greeting-time';

    clockRow.appendChild(this._timeEl);
    weather.init(clockRow);

    this._dateEl = document.createElement('div');
    this._dateEl.className = 'greeting-date';

    containerEl.appendChild(this._phraseEl);
    containerEl.appendChild(clockRow);
    containerEl.appendChild(this._dateEl);

    this.update();
    setInterval(() => this.update(), 60000);
  },

  setName(name) {
    this._name = name;
    this.update();
  },

  update() {
    const date = new Date();
    const phrase = getGreetingPhrase(date.getHours());
    this._phraseEl.textContent = this._name ? `${phrase}, ${this._name}!` : `${phrase}!`;
    this._timeEl.textContent = formatGreetingTime(date);
    this._dateEl.textContent = formatDate(date);
  }
};

/* ===== Settings Panel ===== */
const settingsPanel = {
  init(containerEl) {
    // Dark mode toggle
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle-btn';
    themeBtn.setAttribute('aria-label', 'Toggle dark mode');
    const isDark = storage.get('pd_dark', false);
    this._applyTheme(isDark);
    themeBtn.textContent = '◐';
    themeBtn.addEventListener('click', () => {
      const nowDark = document.body.classList.contains('dark');
      this._applyTheme(!nowDark);
      storage.set('pd_dark', !nowDark);
    });

    // Name input
    const nameLabel = document.createElement('label');
    nameLabel.className = 'settings-label';
    nameLabel.textContent = 'Your name';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'greeting-name-input';
    nameInput.placeholder = 'Enter your name…';
    nameInput.value = storage.get('pd_name', '');

    nameInput.addEventListener('input', () => {
      const name = nameInput.value.trim();
      storage.set('pd_name', name);
      greeting.setName(name);
    });

    containerEl.appendChild(themeBtn);

    // Portrait avatar icon
    const avatar = document.createElement('div');
    avatar.className = 'settings-avatar';
    avatar.innerHTML = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
      <circle cx="20" cy="20" r="19" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.4"/>
      <circle cx="20" cy="15" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`;

    containerEl.appendChild(avatar);
    containerEl.appendChild(nameLabel);
    containerEl.appendChild(nameInput);
  },

  _applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
  }
};

/* ===== TaskList Component ===== */
const taskList = {
  create(tasks, onTasksChange) {
    const container = document.createElement('div');
    container.className = 'task-list';

    // --- Add-task form ---
    const form = document.createElement('form');
    form.className = 'add-task-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add task…';
    input.className = 'add-task-input';

    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.textContent = '+';
    addBtn.setAttribute('aria-label', 'Add task');

    const errorMsg = document.createElement('span');
    errorMsg.className = 'add-task-error';
    errorMsg.style.display = 'none';
    errorMsg.textContent = 'Task cannot be empty.';

    form.appendChild(input);
    form.appendChild(addBtn);
    form.appendChild(errorMsg);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = addTask(tasks, input.value);
      if (result.duplicate) {
        errorMsg.textContent = 'Task already exists.';
        errorMsg.style.display = 'inline';
      } else if (result.tasks === tasks) {
        errorMsg.textContent = 'Task cannot be empty.';
        errorMsg.style.display = 'inline';
      } else {
        errorMsg.style.display = 'none';
        input.value = '';
        onTasksChange(result.tasks);
      }
    });

    // Sort button
    const sortBtn = document.createElement('button');
    sortBtn.type = 'button';
    sortBtn.textContent = '↕';
    sortBtn.setAttribute('aria-label', 'Sort tasks');
    sortBtn.className = 'sort-tasks-btn';
    sortBtn.addEventListener('click', () => {
      onTasksChange(sortTasks(tasks));
    });

    container.appendChild(form);
    container.appendChild(sortBtn);

    // --- Task list ---
    const ul = document.createElement('ul');
    ul.className = 'task-items';

    function renderList(currentTasks) {
      ul.innerHTML = '';
      currentTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
          onTasksChange(toggleTask(currentTasks, task.id));
        });

        // Text span
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
          // Replace text span with input + save/cancel
          const editInput = document.createElement('input');
          editInput.type = 'text';
          editInput.value = task.text;
          editInput.className = 'edit-task-input';

          const saveBtn = document.createElement('button');
          saveBtn.type = 'button';
          saveBtn.textContent = 'Save';

          const cancelBtn = document.createElement('button');
          cancelBtn.type = 'button';
          cancelBtn.textContent = 'Cancel';

          li.replaceChild(editInput, textSpan);
          li.replaceChild(saveBtn, editBtn);
          li.insertBefore(cancelBtn, saveBtn.nextSibling);

          saveBtn.addEventListener('click', () => {
            const updated = editTask(currentTasks, task.id, editInput.value);
            if (updated !== currentTasks) {
              onTasksChange(updated);
            } else {
              // rejected (empty text) — restore original
              li.replaceChild(textSpan, editInput);
              li.replaceChild(editBtn, saveBtn);
              cancelBtn.remove();
            }
          });

          cancelBtn.addEventListener('click', () => {
            li.replaceChild(textSpan, editInput);
            li.replaceChild(editBtn, saveBtn);
            cancelBtn.remove();
          });
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = '✕';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.addEventListener('click', () => {
          onTasksChange(deleteTask(currentTasks, task.id));
        });

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        ul.appendChild(li);
      });
    }

    renderList(tasks);
    container.appendChild(ul);

    return container;
  }
};

/* ===== DayColumn Component ===== */
const dayColumn = {
  create(date, tasks, onTasksChange) {
    const col = document.createElement('div');
    const dow = date.getDay(); // 0=Sun, 6=Sat
    col.className = 'day-column' +
      (dow === 6 ? ' day-saturday' : '') +
      (dow === 0 ? ' day-sunday' : '');

    const header = document.createElement('div');
    header.className = 'day-column-header';

    const dayName = document.createElement('span');
    dayName.className = 'day-name';
    dayName.textContent = date.toLocaleDateString('en-US', { weekday: 'long' });

    const dateNum = document.createElement('span');
    dateNum.className = 'date-number';
    dateNum.textContent = date.getDate();

    header.appendChild(dayName);
    header.appendChild(dateNum);
    col.appendChild(header);
    col.appendChild(taskList.create(tasks, onTasksChange));

    return col;
  }
};

/* ===== WeeklyCalendar Component ===== */
const weeklyCalendar = {
  init(containerEl, tasksStore) {
    const store = Object.assign({}, tasksStore);
    const days = getWeekDays(new Date());
    const colEls = [];

    days.forEach((date, i) => {
      const dayKey = toDayKey(date);
      const tasks = store[dayKey] || [];

      const onTasksChange = (newTasks) => {
        store[dayKey] = newTasks;
        storage.set('pd_tasks', store);
        const newCol = dayColumn.create(date, newTasks, onTasksChange);
        containerEl.replaceChild(newCol, colEls[i]);
        colEls[i] = newCol;
      };

      const col = dayColumn.create(date, tasks, onTasksChange);
      colEls.push(col);
      containerEl.appendChild(col);
    });
  }
};

/* ===== Timer Component ===== */
const timer = {
  _totalSeconds: 1500,
  _defaultSeconds: 1500,
  _intervalId: null,
  _isRunning: false,
  _displayEl: null,
  _startBtn: null,
  _containerEl: null,
  _presets: [],

  init(containerEl) {
    this._containerEl = containerEl;
    const savedMins = storage.get('pd_pomodoro_mins', 25);
    this._defaultSeconds = savedMins * 60;
    this._totalSeconds = this._defaultSeconds;
    this._presets = storage.get('pd_timer_presets', [
      { id: 'p1', label: 'Focus', mins: 25 },
      { id: 'p2', label: 'Short break', mins: 5 },
      { id: 'p3', label: 'Long break', mins: 15 },
    ]);

    const clockSide = containerEl.querySelector('#timer-clock');
    const presetSide = containerEl.querySelector('#timer-presets');

    // Clock side
    const display = document.createElement('div');
    display.className = 'timer-display';
    display.textContent = formatTime(this._totalSeconds);
    this._displayEl = display;

    const controlsRow = document.createElement('div');
    controlsRow.className = 'timer-controls-row';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.textContent = 'Start';
    startBtn.addEventListener('click', () => {
      if (this._isRunning) this.stop();
      else this.start();
    });
    this._startBtn = startBtn;

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => this.reset());

    controlsRow.appendChild(startBtn);
    controlsRow.appendChild(resetBtn);

    const durationRow = document.createElement('div');
    durationRow.className = 'timer-duration-row';

    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.min = 1;
    durationInput.max = 120;
    durationInput.value = savedMins;
    durationInput.className = 'timer-duration-input';

    const durationLabel = document.createElement('span');
    durationLabel.textContent = 'min';
    durationLabel.className = 'timer-duration-label';

    const setBtn = document.createElement('button');
    setBtn.type = 'button';
    setBtn.textContent = 'Set';
    setBtn.className = 'timer-set-btn';
    setBtn.addEventListener('click', () => {
      const mins = parseInt(durationInput.value, 10);
      if (isNaN(mins) || mins < 1 || mins > 120) return;
      this._defaultSeconds = mins * 60;
      storage.set('pd_pomodoro_mins', mins);
      this.reset();
    });

    durationRow.appendChild(durationInput);
    durationRow.appendChild(durationLabel);
    durationRow.appendChild(setBtn);

    clockSide.appendChild(display);
    clockSide.appendChild(controlsRow);
    clockSide.appendChild(durationRow);

    // Preset side
    this._renderPresets(presetSide);
  },

  _renderPresets(container) {
    container.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'timer-presets-title';
    title.textContent = 'Timers';
    container.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'timer-preset-list';

    this._presets.forEach(preset => {
      const li = document.createElement('li');
      li.className = 'timer-preset-item';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'timer-preset-btn';
      btn.innerHTML = `<span class="preset-label">${preset.label}</span><span class="preset-mins">${preset.mins}m</span>`;
      btn.addEventListener('click', () => {
        this._defaultSeconds = preset.mins * 60;
        storage.set('pd_pomodoro_mins', preset.mins);
        this.reset();
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'timer-preset-del';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Delete preset');
      delBtn.addEventListener('click', () => {
        this._presets = this._presets.filter(p => p.id !== preset.id);
        storage.set('pd_timer_presets', this._presets);
        this._renderPresets(container);
      });

      li.appendChild(btn);
      li.appendChild(delBtn);
      list.appendChild(li);
    });

    container.appendChild(list);

    // Add preset form
    const form = document.createElement('form');
    form.className = 'timer-preset-form';

    const labelIn = document.createElement('input');
    labelIn.type = 'text';
    labelIn.placeholder = 'Label';
    labelIn.className = 'timer-preset-label-input';

    const minsIn = document.createElement('input');
    minsIn.type = 'number';
    minsIn.min = 1;
    minsIn.max = 120;
    minsIn.placeholder = 'min';
    minsIn.className = 'timer-preset-mins-input';

    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.textContent = '+';
    addBtn.className = 'timer-preset-add-btn';

    form.appendChild(labelIn);
    form.appendChild(minsIn);
    form.appendChild(addBtn);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const label = labelIn.value.trim();
      const mins = parseInt(minsIn.value, 10);
      if (!label || isNaN(mins) || mins < 1 || mins > 120) return;
      this._presets.push({ id: uid(), label, mins });
      storage.set('pd_timer_presets', this._presets);
      labelIn.value = '';
      minsIn.value = '';
      this._renderPresets(container);
    });

    container.appendChild(form);
  },

  _beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const beepDuration = 0.15;
      const beepGap = 0.12;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        const t = ctx.currentTime + i * (beepDuration + beepGap);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + beepDuration);
        osc.start(t);
        osc.stop(t + beepDuration);
      }
    } catch (e) {}
  },

  _tick() {
    this._totalSeconds -= 1;
    this._displayEl.textContent = formatTime(this._totalSeconds);
    if (this._totalSeconds <= 0) {
      this.stop();
      this._beep();
      this._containerEl.classList.add('timer-complete');
    }
  },

  start() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._startBtn.textContent = 'Stop';
    this._intervalId = setInterval(() => this._tick(), 1000);
  },

  stop() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    this._isRunning = false;
    if (this._startBtn) this._startBtn.textContent = 'Start';
  },

  reset() {
    this.stop();
    this._totalSeconds = this._defaultSeconds;
    if (this._containerEl) this._containerEl.classList.remove('timer-complete');
    if (this._displayEl) this._displayEl.textContent = formatTime(this._totalSeconds);
  }
};

/* ===== QuickLinks Component ===== */
const quickLinks = {
  init(containerEl, linksStore) {
    const defaults = [
      { id: 'seed-1', label: 'Google',  url: 'https://www.google.com',  icon: '🔍' },
      { id: 'seed-2', label: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
      { id: 'seed-3', label: 'Spotify', url: 'https://www.spotify.com', icon: '🎵' }
    ];

    let links = (linksStore && linksStore.length > 0) ? linksStore : defaults;
    if (!linksStore || linksStore.length === 0) {
      storage.set('pd_links', links);
    }

    // --- Links list container ---
    const listEl = document.createElement('div');
    listEl.className = 'quick-links-list';

    // --- Add-link form ---
    const form = document.createElement('form');
    form.className = 'add-link-form';

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Label';
    labelInput.className = 'add-link-label';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'URL';
    urlInput.className = 'add-link-url';

    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.textContent = '+';
    addBtn.setAttribute('aria-label', 'Add link');

    const errorMsg = document.createElement('span');
    errorMsg.className = 'add-link-error';
    errorMsg.style.display = 'none';
    errorMsg.textContent = 'Enter a valid label and URL.';

    form.appendChild(labelInput);
    form.appendChild(urlInput);
    form.appendChild(addBtn);
    form.appendChild(errorMsg);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newLinks = addLink(links, labelInput.value, urlInput.value);
      if (newLinks === links) {
        errorMsg.style.display = 'inline';
      } else {
        errorMsg.style.display = 'none';
        labelInput.value = '';
        urlInput.value = '';
        links = newLinks;
        storage.set('pd_links', links);
        render(links);
      }
    });

    function render(currentLinks) {
      listEl.innerHTML = '';
      currentLinks.forEach(link => {
        const item = document.createElement('div');
        item.className = 'quick-link-item';

        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.className = 'quick-link-anchor';
        if (link.icon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'quick-link-icon';
          iconSpan.textContent = link.icon;
          anchor.appendChild(iconSpan);
        }
        const labelSpan = document.createElement('span');
        labelSpan.textContent = link.label;
        anchor.appendChild(labelSpan);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '✕';
        delBtn.setAttribute('aria-label', 'Delete link');
        delBtn.className = 'quick-link-delete';
        delBtn.addEventListener('click', () => {
          links = deleteLink(links, link.id);
          storage.set('pd_links', links);
          render(links);
        });

        item.appendChild(anchor);
        item.appendChild(delBtn);
        listEl.appendChild(item);
      });
    }

    render(links);
    containerEl.appendChild(listEl);
    containerEl.appendChild(form);
  }
};

/* ===== Music Player Component ===== */
const musicPlayer = {
  _audio: null,
  _tracks: [
    { title: 'Lofi Chill', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Focus Beats', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Ambient Flow', src: 'https://www.soundhelix-Song-3.mp3' },
  ],
  _current: 0,
  _playing: false,
  _titleEl: null,
  _playBtn: null,
  _progressEl: null,
  _timeEl: null,

  init(containerEl) {
    this._audio = new Audio();
    this._audio.src = this._tracks[0].src;

    // Title
    this._titleEl = document.createElement('div');
    this._titleEl.className = 'mp-title';
    this._titleEl.textContent = this._tracks[0].title;

    // Progress bar
    const progressWrap = document.createElement('div');
    progressWrap.className = 'mp-progress-wrap';
    this._progressEl = document.createElement('div');
    this._progressEl.className = 'mp-progress-bar';
    progressWrap.appendChild(this._progressEl);

    // Time
    this._timeEl = document.createElement('div');
    this._timeEl.className = 'mp-time';
    this._timeEl.textContent = '0:00';

    // Controls
    const controls = document.createElement('div');
    controls.className = 'mp-controls';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = '⏮';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.addEventListener('click', () => this._prev());

    this._playBtn = document.createElement('button');
    this._playBtn.type = 'button';
    this._playBtn.textContent = '▶';
    this._playBtn.className = 'mp-play-btn';
    this._playBtn.setAttribute('aria-label', 'Play');
    this._playBtn.addEventListener('click', () => this._togglePlay());

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = '⏭';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.addEventListener('click', () => this._next());

    controls.appendChild(prevBtn);
    controls.appendChild(this._playBtn);
    controls.appendChild(nextBtn);

    // Volume
    const volWrap = document.createElement('div');
    volWrap.className = 'mp-vol-wrap';
    const volIcon = document.createElement('span');
    volIcon.textContent = '🔊';
    const volSlider = document.createElement('input');
    volSlider.type = 'range';
    volSlider.min = 0;
    volSlider.max = 1;
    volSlider.step = 0.05;
    volSlider.value = 0.7;
    volSlider.className = 'mp-volume';
    this._audio.volume = 0.7;
    volSlider.addEventListener('input', () => { this._audio.volume = volSlider.value; });
    volWrap.appendChild(volIcon);
    volWrap.appendChild(volSlider);

    // Audio events
    this._audio.addEventListener('timeupdate', () => {
      if (!this._audio.duration) return;
      const pct = (this._audio.currentTime / this._audio.duration) * 100;
      this._progressEl.style.width = pct + '%';
      const m = Math.floor(this._audio.currentTime / 60);
      const s = Math.floor(this._audio.currentTime % 60).toString().padStart(2, '0');
      this._timeEl.textContent = `${m}:${s}`;
    });
    this._audio.addEventListener('ended', () => this._next());

    // Click progress to seek
    progressWrap.addEventListener('click', (e) => {
      if (!this._audio.duration) return;
      const rect = progressWrap.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      this._audio.currentTime = pct * this._audio.duration;
    });

    containerEl.appendChild(this._titleEl);
    containerEl.appendChild(progressWrap);
    containerEl.appendChild(this._timeEl);
    containerEl.appendChild(controls);
    containerEl.appendChild(volWrap);
  },

  _togglePlay() {
    if (this._playing) {
      this._audio.pause();
      this._playing = false;
      this._playBtn.textContent = '▶';
    } else {
      this._audio.play().catch(() => {});
      this._playing = true;
      this._playBtn.textContent = '⏸';
    }
  },

  _prev() {
    this._current = (this._current - 1 + this._tracks.length) % this._tracks.length;
    this._load();
  },

  _next() {
    this._current = (this._current + 1) % this._tracks.length;
    this._load();
  },

  _load() {
    const wasPlaying = this._playing;
    this._audio.src = this._tracks[this._current].src;
    this._titleEl.textContent = this._tracks[this._current].title;
    this._progressEl.style.width = '0%';
    this._timeEl.textContent = '0:00';
    if (wasPlaying) {
      this._audio.play().catch(() => {});
    }
  }
};

/* ===== Bootstrap ===== */
document.addEventListener('DOMContentLoaded', () => {
  const tasksStore = storage.get('pd_tasks', {});
  const linksStore = storage.get('pd_links', null);

  greeting.init(document.getElementById('greeting'));
  settingsPanel.init(document.getElementById('settings-panel'));
  weeklyCalendar.init(document.getElementById('weekly-calendar'), tasksStore);
  musicPlayer.init(document.getElementById('music-player'));
  timer.init(document.getElementById('timer'));
  quickLinks.init(document.getElementById('quick-links'), linksStore);
});
