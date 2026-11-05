// MDC Homepage - Samsung Internet Optimized with One UI versions
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const engineSelect = document.getElementById('engineSelect');
  const historyBtn = document.getElementById('historyBtn');
  const menuBtn = document.getElementById('menuBtn');
  const historyModal = document.getElementById('historyModal');
  const menuModal = document.getElementById('menuModal');
  const bookmarksModal = document.getElementById('bookmarksModal');
  const settingsModal = document.getElementById('settingsModal');
  const addShortcutModal = document.getElementById('addShortcutModal');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const themeToggle = document.getElementById('themeToggle');
  const bookmarksBtn = document.getElementById('bookmarksBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const bookmarksList = document.getElementById('bookmarksList');
  const addBookmarkBtn = document.getElementById('addBookmarkBtn');
  const bookmarkTitle = document.getElementById('bookmarkTitle');
  const bookmarkUrl = document.getElementById('bookmarkUrl');
  const defaultEngine = document.getElementById('defaultEngine');
  const oneUiVersion = document.getElementById('oneUiVersion');
  const browserStyle = document.getElementById('browserStyle');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  const shortcutsGrid = document.getElementById('shortcutsGrid');
  const addShortcutBtn = document.getElementById('addShortcutBtn');
  const shortcutTitle = document.getElementById('shortcutTitle');
  const shortcutUrl = document.getElementById('shortcutUrl');
  const shortcutIcon = document.getElementById('shortcutIcon');
  const saveShortcutBtn = document.getElementById('saveShortcutBtn');

  // Search engines
  const engines = {
    google: { name: 'Google', url: 'https://www.google.com/search?q=' },
    yandex: { name: 'Yandex', url: 'https://yandex.com/search/?text=' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' }
  };

  // Storage keys
  const KEYS = {
    history: 'mdc_history',
    bookmarks: 'mdc_bookmarks',
    shortcuts: 'mdc_shortcuts',
    settings: 'mdc_settings',
    theme: 'mdc_theme'
  };

  // Load data
  let history = JSON.parse(localStorage.getItem(KEYS.history) || '[]');
  let bookmarks = JSON.parse(localStorage.getItem(KEYS.bookmarks) || '[]');
  let shortcuts = JSON.parse(localStorage.getItem(KEYS.shortcuts) || '[]');
  let settings = JSON.parse(localStorage.getItem(KEYS.settings) || '{"engine":"google","oneui":"7","browser":"standard"}');
  let theme = localStorage.getItem(KEYS.theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // Apply theme
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeToggle.querySelector('.menu-icon').textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem(KEYS.theme, t);
  }
  applyTheme(theme);

  // Apply One UI and browser style
  function applyAppearance() {
    document.documentElement.setAttribute('data-oneui', settings.oneui || '7');
    document.documentElement.setAttribute('data-browser', settings.browser || 'standard');
    oneUiVersion.value = settings.oneui || '7';
    browserStyle.value = settings.browser || 'standard';
    engineSelect.value = settings.engine || 'google';
    defaultEngine.value = settings.engine || 'google';
  }
  applyAppearance();

  // Render history
  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyList.innerHTML = '<li class="empty-state">No recent searches</li>';
      return;
    }
    history.slice(0, 30).forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="history-query">${escapeHtml(item.query)}</div>
        <div class="history-meta">${item.engine}</div>
        <button class="delete-btn" data-index="${index}">×</button>
      `;
      li.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        searchInput.value = item.query;
        engineSelect.value = item.engineId || 'google';
        closeModal(historyModal);
        performSearch();
      });
      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        history.splice(index, 1);
        saveHistory();
        renderHistory();
      });
      historyList.appendChild(li);
    });
  }

  // Render bookmarks
  function renderBookmarks() {
    bookmarksList.innerHTML = '';
    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = '<li class="empty-state">No bookmarks yet</li>';
      return;
    }
    bookmarks.forEach((bm, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="history-query">${escapeHtml(bm.title)}</div>
        <button class="delete-btn" data-index="${index}">×</button>
      `;
      li.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        window.open(bm.url, '_blank');
      });
      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        bookmarks.splice(index, 1);
        saveBookmarks();
        renderBookmarks();
      });
      bookmarksList.appendChild(li);
    });
  }

  // Render shortcuts
  function renderShortcuts() {
    shortcutsGrid.innerHTML = '';
    shortcuts.forEach((sc, index) => {
      const a = document.createElement('a');
      a.href = sc.url;
      a.className = 'shortcut';
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `
        <div class="shortcut-icon">${sc.icon || '🔗'}</div>
        <div class="shortcut-label">${escapeHtml(sc.title)}</div>
        <button class="shortcut-delete" data-index="${index}">×</button>
      `;
      a.querySelector('.shortcut-delete').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        shortcuts.splice(index, 1);
        saveShortcuts();
        renderShortcuts();
      });
      shortcutsGrid.appendChild(a);
    });
  }

  // Save functions
  function saveHistory() { localStorage.setItem(KEYS.history, JSON.stringify(history)); }
  function saveBookmarks() { localStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks)); }
  function saveShortcuts() { localStorage.setItem(KEYS.shortcuts, JSON.stringify(shortcuts)); }
  function saveSettings() { localStorage.setItem(KEYS.settings, JSON.stringify(settings)); }

  // Perform search
  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    const engineId = engineSelect.value;
    const engine = engines[engineId];
    const url = engine.url + encodeURIComponent(query);

    history.unshift({
      query,
      engine: engine.name,
      engineId,
      timestamp: Date.now()
    });
    if (history.length > 50) history.pop();
    saveHistory();

    window.location.href = url;
  }

  // Modal helpers
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Event listeners
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  historyBtn.addEventListener('click', () => {
    renderHistory();
    openModal(historyModal);
  });

  menuBtn.addEventListener('click', () => openModal(menuModal));

  themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  });

  bookmarksBtn.addEventListener('click', () => {
    closeModal(menuModal);
    renderBookmarks();
    openModal(bookmarksModal);
  });

  settingsBtn.addEventListener('click', () => {
    closeModal(menuModal);
    openModal(settingsModal);
  });

  addShortcutBtn.addEventListener('click', () => openModal(addShortcutModal));

  saveShortcutBtn.addEventListener('click', () => {
    const title = shortcutTitle.value.trim();
    const url = shortcutUrl.value.trim();
    const icon = shortcutIcon.value.trim();
    if (!title || !url) return;
    shortcuts.push({ title, url, icon });
    saveShortcuts();
    shortcutTitle.value = '';
    shortcutUrl.value = '';
    shortcutIcon.value = '';
    closeModal(addShortcutModal);
    renderShortcuts();
  });

  addBookmarkBtn.addEventListener('click', () => {
    const title = bookmarkTitle.value.trim();
    const url = bookmarkUrl.value.trim();
    if (!title || !url) return;
    bookmarks.push({ title, url });
    saveBookmarks();
    bookmarkTitle.value = '';
    bookmarkUrl.value = '';
    renderBookmarks();
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all search history?')) {
      history = [];
      saveHistory();
      renderHistory();
    }
  });

  defaultEngine.addEventListener('change', () => {
    settings.engine = defaultEngine.value;
    engineSelect.value = settings.engine;
    saveSettings();
  });

  oneUiVersion.addEventListener('change', () => {
    settings.oneui = oneUiVersion.value;
    saveSettings();
    applyAppearance();
  });

  browserStyle.addEventListener('change', () => {
    settings.browser = browserStyle.value;
    saveSettings();
    applyAppearance();
  });

  resetSettingsBtn.addEventListener('click', () => {
    if (confirm('Reset all data? This will clear history, bookmarks, shortcuts, and settings.')) {
      localStorage.removeItem(KEYS.history);
      localStorage.removeItem(KEYS.bookmarks);
      localStorage.removeItem(KEYS.shortcuts);
      localStorage.removeItem(KEYS.settings);
      localStorage.removeItem(KEYS.theme);
      location.reload();
    }
  });

  // Close modals
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      closeModal(document.getElementById(modalId));
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(closeModal);
    }
  });

  // Helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial render
  renderShortcuts();
});
