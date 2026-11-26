(() => {
  'use strict';

  const phases = [
    { file: '01-foundations.md', name: 'Programming foundations', short: 'FOUNDATIONS', range: '01 — 12', description: 'Learn to think in steps, write your first programs, and build reliable fundamentals.' },
    { file: '02-core-cpp.md', name: 'Core C++ & data structures', short: 'CORE C++', range: '13 — 29', description: 'Understand object lifetime, modern C++, standard tools, and how to design programs.' },
    { file: '03-algorithms-systems.md', name: 'Algorithms, systems & modern C++', short: 'SYSTEMS', range: '30 — 42', description: 'Explore algorithms, performance, operating systems, concurrency, and security.' },
    { file: '04-engineering-capstone.md', name: 'Engineering & capstone', short: 'ENGINEERING', range: '43 — 48', description: 'Practice collaboration, delivery, architecture, and a complete project.' }
  ];

  const storageKeys = {
    completed: 'fieldnotes-cpp-completed-v1',
    bookmarks: 'fieldnotes-cpp-bookmarks-v1',
    lastLesson: 'fieldnotes-cpp-last-lesson-v1',
    theme: 'fieldnotes-cpp-theme-v1'
  };
  const allLessons = [];
  let currentLessonId = null;
  let showingBookmarks = false;
  let toastTimer;

  const $ = (selector) => document.querySelector(selector);
  const nav = $('#phase-nav');
  const loadingState = $('#loading-state');
  const errorState = $('#error-state');
  const homeView = $('#home-view');
  const lessonView = $('#lesson-view');
  const searchInput = $('#lesson-search');
  const sidebar = $('#sidebar');
  const scrim = $('#sidebar-scrim');

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeLink(rawHref) {
    const href = rawHref.trim();
    if (/^(https?:|mailto:)/i.test(href) || /^(?!\s*javascript:)[\w./#-]+(?:\?[\w=&%-]+)?$/i.test(href)) {
      return href;
    }
    return '#';
  }

  function inlineMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const safe = escapeHtml(safeLink(href));
      const external = /^https?:/i.test(href.trim()) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${safe}"${external}>${label}</a>`;
    });
    return html;
  }

  function renderMarkdown(markdown) {
    const lines = markdown.split(/\r?\n/);
    const output = [];
    let paragraph = [];
    let listType = '';
    let codeLines = [];
    let codeLanguage = '';
    let insideCode = false;

    const flushParagraph = () => {
      if (paragraph.length) {
        output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
        paragraph = [];
      }
    };
    const closeList = () => {
      if (listType) {
        output.push(`</${listType}>`);
        listType = '';
      }
    };

    for (const line of lines) {
      const fence = line.match(/^```([\w+-]*)\s*$/);
      if (fence && !insideCode) {
        flushParagraph();
        closeList();
        insideCode = true;
        codeLanguage = fence[1] || 'text';
        codeLines = [];
        continue;
      }
      if (fence && insideCode) {
        output.push(`<div class="code-wrap"><button class="copy-code" type="button" aria-label="Copy code example">Copy</button><pre><code class="language-${escapeHtml(codeLanguage)}">${escapeHtml(codeLines.join('\n'))}</code></pre></div>`);
        insideCode = false;
        continue;
      }
      if (insideCode) {
        codeLines.push(line);
        continue;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        closeList();
        const level = Math.min(heading[1].length + 1, 4);
        output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        flushParagraph();
        if (listType !== 'ul') {
          closeList();
          output.push('<ul>');
          listType = 'ul';
        }
        output.push(`<li>${inlineMarkdown(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        flushParagraph();
        if (listType !== 'ol') {
          closeList();
          output.push('<ol>');
          listType = 'ol';
        }
        output.push(`<li>${inlineMarkdown(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
        continue;
      }
      if (/^\s*>\s?/.test(line)) {
        flushParagraph();
        closeList();
        output.push(`<blockquote>${inlineMarkdown(line.replace(/^\s*>\s?/, ''))}</blockquote>`);
        continue;
      }
      if (/^\s*---+\s*$/.test(line)) {
        flushParagraph();
        closeList();
        output.push('<hr>');
        continue;
      }
      if (!line.trim()) {
        flushParagraph();
        closeList();
      } else {
        paragraph.push(line.trim());
      }
    }
    flushParagraph();
    closeList();
    if (insideCode) {
      output.push(`<div class="code-wrap"><pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre></div>`);
    }
    return output.join('\n');
  }

  function parseLessons(markdown, phaseIndex) {
    const matches = [...markdown.matchAll(/^## Lesson (\d+) — (.+)$/gm)];
    return matches.map((match, index) => {
      const start = match.index;
      const bodyStart = start + match[0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index : markdown.length;
      const body = markdown.slice(bodyStart, end).trim();
      return {
        id: Number(match[1]),
        title: match[2].trim(),
        body,
        phaseIndex,
        searchable: `${match[2]} ${body}`.toLowerCase()
      };
    });
  }

  async function loadCourse() {
    try {
      const loaded = await Promise.all(phases.map(async (phase, phaseIndex) => {
        const response = await fetch(`lessons/${phase.file}`);
        if (!response.ok) throw new Error(`Could not load ${phase.file} (${response.status}).`);
        return parseLessons(await response.text(), phaseIndex);
      }));
      allLessons.push(...loaded.flat());
      if (allLessons.length !== 48) throw new Error(`Expected 48 lessons but found ${allLessons.length}.`);
      loadingState.hidden = true;
      renderNavigation();
      renderPhaseCards();
      updateProgress();
      const requestedId = Number(location.hash.replace('#lesson-', ''));
      const lastId = Number(localStorage.getItem(storageKeys.lastLesson));
      const initialLesson = allLessons.find((lesson) => lesson.id === requestedId)
        || allLessons.find((lesson) => lesson.id === lastId);
      if (initialLesson && location.hash.startsWith('#lesson-')) {
        showLesson(initialLesson.id, false);
      } else {
        showHome();
      }
    } catch (error) {
      loadingState.hidden = true;
      errorState.hidden = false;
      $('#error-detail').textContent = error.message;
    }
  }

  function renderNavigation() {
    nav.innerHTML = '';
    phases.forEach((phase, phaseIndex) => {
      const lessons = allLessons.filter((lesson) => lesson.phaseIndex === phaseIndex);
      const group = document.createElement('section');
      group.className = 'phase-group';
      group.dataset.phase = phaseIndex;
      const toggle = document.createElement('button');
      toggle.className = 'phase-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.innerHTML = `<span class="phase-toggle-copy"><span class="phase-kicker">STAGE 0${phaseIndex + 1}</span><span class="phase-name">${escapeHtml(phase.name)}</span></span><span class="phase-count">${phase.range}</span>`;
      const list = document.createElement('ol');
      list.className = 'lesson-list';
      lessons.forEach((lesson) => {
        const item = document.createElement('li');
        item.className = 'lesson-item';
        item.dataset.lessonId = lesson.id;
        item.dataset.search = lesson.searchable;
        const button = document.createElement('button');
        button.className = 'lesson-link';
        button.type = 'button';
        button.dataset.lessonId = lesson.id;
        button.innerHTML = `<span class="lesson-index">${String(lesson.id).padStart(2, '0')}</span><span>${escapeHtml(lesson.title)}</span><span class="lesson-check" aria-label="Completed"></span>`;
        button.addEventListener('click', () => showLesson(lesson.id));
        item.append(button);
        list.append(item);
      });
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        list.hidden = expanded;
      });
      group.append(toggle, list);
      nav.append(group);
    });
    updateNavigationState();
  }

  function renderPhaseCards() {
    const container = $('#phase-cards');
    container.innerHTML = '';
    phases.forEach((phase, phaseIndex) => {
      const card = document.createElement('button');
      card.className = 'phase-card';
      card.type = 'button';
      const phaseLessons = allLessons.filter((lesson) => lesson.phaseIndex === phaseIndex);
      const completed = readList(storageKeys.completed)
        .filter((id) => phaseLessons.some((lesson) => lesson.id === id)).length;
      const percentage = Math.round(completed / phaseLessons.length * 100);
      card.innerHTML = `<span class="phase-card-top"><span class="phase-card-number">0${phaseIndex + 1} / STAGE</span><span class="phase-card-count">${phase.range}</span></span><h3>${escapeHtml(phase.name)}</h3><p>${escapeHtml(phase.description)}</p><span class="phase-card-progress"><span style="width:${percentage}%"></span></span>`;
      card.addEventListener('click', () => showLesson(phaseLessons[0].id));
      container.append(card);
    });
  }

  function updateProgress() {
    const completed = readList(storageKeys.completed);
    const percent = Math.round(completed.length / 48 * 100);
    $('#progress-percent').textContent = `${percent}%`;
    $('#home-progress').textContent = `${percent}%`;
    $('#progress-count').textContent = `${completed.length} of 48 lessons complete`;
    $('#progress-fill').style.width = `${percent}%`;
    $('#bookmark-count').textContent = String(readList(storageKeys.bookmarks).length);
    $('#continue-label').textContent = completed.length ? 'Continue learning' : 'Start learning';
    const resumeId = Number(localStorage.getItem(storageKeys.lastLesson));
    const resumeLesson = allLessons.find((lesson) => lesson.id === resumeId);
    if (resumeLesson) {
      $('#continue-label').textContent = completed.length ? `Continue: ${resumeLesson.title}` : 'Start learning';
    }
    updateNavigationState();
    if (allLessons.length) renderPhaseCards();
  }

  function updateNavigationState() {
    const completed = readList(storageKeys.completed);
    nav.querySelectorAll('.lesson-link').forEach((button) => {
      const id = Number(button.dataset.lessonId);
      button.classList.toggle('active', id === currentLessonId);
      button.setAttribute('aria-current', id === currentLessonId ? 'page' : 'false');
      button.querySelector('.lesson-check').textContent = completed.includes(id) ? '✓' : '';
    });
  }

  function showHome() {
    currentLessonId = null;
    homeView.hidden = false;
    lessonView.hidden = true;
    $('#breadcrumb-current').textContent = 'OVERVIEW';
    updateNavigationState();
    closeSidebar();
  }

  function showLesson(id, updateHash = true) {
    const lesson = allLessons.find((item) => item.id === Number(id));
    if (!lesson) return;
    currentLessonId = lesson.id;
    const phase = phases[lesson.phaseIndex];
    homeView.hidden = true;
    lessonView.hidden = false;
    $('#breadcrumb-current').textContent = `LESSON ${String(lesson.id).padStart(2, '0')}`;
    $('#lesson-stage').textContent = `STAGE 0${lesson.phaseIndex + 1} · ${phase.short}`;
    $('#lesson-number').textContent = `LESSON ${String(lesson.id).padStart(2, '0')} / 48`;
    $('#lesson-title').textContent = lesson.title;
    $('#lesson-deck').textContent = getDeck(lesson.body);
    const wordCount = lesson.body.trim().split(/\s+/).length;
    $('#reading-time').textContent = `${Math.max(3, Math.ceil(wordCount / 180))} MIN READ`;
    $('#lesson-content').innerHTML = renderMarkdown(lesson.body);

    const completeButton = $('#complete-button');
    const completed = readList(storageKeys.completed).includes(lesson.id);
    completeButton.classList.toggle('completed', completed);
    completeButton.setAttribute('aria-pressed', String(completed));
    $('#complete-label').textContent = completed ? 'Lesson completed' : 'Mark lesson complete';

    const bookmarks = readList(storageKeys.bookmarks);
    const isSaved = bookmarks.includes(lesson.id);
    $('#bookmark-button').classList.toggle('saved', isSaved);
    $('#bookmark-button').setAttribute('aria-pressed', String(isSaved));
    $('#bookmark-button span').textContent = isSaved ? 'Saved for review' : 'Save for review';

    const index = allLessons.findIndex((item) => item.id === lesson.id);
    const previous = allLessons[index - 1];
    const next = allLessons[index + 1];
    $('#previous-button').disabled = !previous;
    $('#previous-title').textContent = previous ? previous.title : 'Beginning of course';
    $('#next-button').disabled = !next;
    $('#next-title').textContent = next ? next.title : 'End of course';

    $('#lesson-notes').value = localStorage.getItem(`fieldnotes-cpp-note-${lesson.id}`) || '';
    updateNotesCount();
    localStorage.setItem(storageKeys.lastLesson, String(lesson.id));
    if (updateHash) history.replaceState(null, '', `#lesson-${lesson.id}`);
    updateNavigationState();
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getDeck(body) {
    const text = body.replace(/```[\s\S]*?```/g, '').trim();
    const match = text.match(/\*\*Core idea:\*\*\s*([^\n]+)/);
    if (match) return match[1].trim();
    const firstParagraph = text.split(/\n\s*\n/).find((part) => part.trim());
    return firstParagraph ? firstParagraph.replace(/\*\*/g, '').trim().slice(0, 210) : 'Build understanding one idea and one experiment at a time.';
  }

  function updateNotesCount() {
    $('#notes-count').textContent = `${$('#lesson-notes').value.length} chars`;
  }

  function toggleCompletion() {
    if (!currentLessonId) return;
    const completed = readList(storageKeys.completed);
    const index = completed.indexOf(currentLessonId);
    if (index >= 0) completed.splice(index, 1);
    else completed.push(currentLessonId);
    writeList(storageKeys.completed, completed);
    $('#complete-button').classList.toggle('completed', index < 0);
    $('#complete-button').setAttribute('aria-pressed', String(index < 0));
    $('#complete-label').textContent = index < 0 ? 'Lesson completed' : 'Mark lesson complete';
    updateProgress();
    showToast(index < 0 ? 'Progress saved on this device.' : 'Lesson marked incomplete.');
  }

  function toggleBookmark() {
    if (!currentLessonId) return;
    const bookmarks = readList(storageKeys.bookmarks);
    const index = bookmarks.indexOf(currentLessonId);
    if (index >= 0) bookmarks.splice(index, 1);
    else bookmarks.push(currentLessonId);
    writeList(storageKeys.bookmarks, bookmarks);
    const saved = index < 0;
    $('#bookmark-button').classList.toggle('saved', saved);
    $('#bookmark-button').setAttribute('aria-pressed', String(saved));
    $('#bookmark-button span').textContent = saved ? 'Saved for review' : 'Save for review';
    updateProgress();
    applySearch();
    showToast(saved ? 'Added to your review list.' : 'Removed from your review list.');
  }

  function applySearch() {
    const query = searchInput.value.trim().toLowerCase();
    const bookmarks = new Set(readList(storageKeys.bookmarks));
    let visibleCount = 0;
    nav.querySelectorAll('.lesson-item').forEach((item) => {
      const visible = (!query || item.dataset.search.includes(query))
        && (!showingBookmarks || bookmarks.has(Number(item.dataset.lessonId)));
      item.hidden = !visible;
      if (visible) visibleCount++;
    });
    nav.querySelectorAll('.phase-group').forEach((group) => {
      const visibleItems = group.querySelectorAll('.lesson-item:not([hidden])').length;
      group.hidden = Boolean(query || showingBookmarks) && visibleItems === 0;
      if ((query || showingBookmarks) && visibleItems > 0) {
        group.querySelector('.lesson-list').hidden = false;
        group.querySelector('.phase-toggle').setAttribute('aria-expanded', 'true');
      }
    });
    let empty = nav.querySelector('.no-results');
    if ((query || showingBookmarks) && visibleCount === 0) {
      if (!empty) {
        empty = document.createElement('p');
        empty.className = 'no-results';
        empty.textContent = showingBookmarks
          ? 'No saved lessons yet. Save a lesson for review as you study.'
          : 'No lessons found. Try another term.';
        nav.append(empty);
      }
      if (showingBookmarks && query) empty.textContent = 'No saved lessons match this search.';
    } else if (empty) {
      empty.remove();
    }
  }

  function closeSidebar() {
    document.body.classList.remove('nav-open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
    $('#menu-toggle').setAttribute('aria-label', 'Open course navigation');
    scrim.hidden = true;
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2100);
  }

  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    $('#theme-toggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    localStorage.setItem(storageKeys.theme, theme);
  }

  $('#continue-button').addEventListener('click', () => {
    const lastId = Number(localStorage.getItem(storageKeys.lastLesson));
    const firstIncomplete = allLessons.find((lesson) => !readList(storageKeys.completed).includes(lesson.id));
    const lesson = allLessons.find((item) => item.id === lastId) || firstIncomplete || allLessons[0];
    if (lesson) showLesson(lesson.id);
  });
  $('#home-link').addEventListener('click', (event) => {
    event.preventDefault();
    history.replaceState(null, '', location.pathname);
    showHome();
  });
  $('#complete-button').addEventListener('click', toggleCompletion);
  $('#bookmark-button').addEventListener('click', toggleBookmark);
  $('#previous-button').addEventListener('click', () => showLesson(currentLessonId - 1));
  $('#next-button').addEventListener('click', () => showLesson(currentLessonId + 1));
  $('#print-button').addEventListener('click', () => {
    if (currentLessonId) window.print();
    else showToast('Open a lesson to print its study notes.');
  });
  $('#theme-toggle').addEventListener('click', () => {
    applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
  });
  $('#review-filter').addEventListener('click', () => {
    showingBookmarks = !showingBookmarks;
    $('#review-filter').classList.toggle('active', showingBookmarks);
    $('#review-filter').setAttribute('aria-pressed', String(showingBookmarks));
    applySearch();
  });
  $('#reset-progress').addEventListener('click', () => {
    if (!readList(storageKeys.completed).length && !readList(storageKeys.bookmarks).length) {
      showToast('There is no progress to reset.');
      return;
    }
    if (confirm('Clear completed lessons and saved-for-review items on this device? Your notes will stay.')) {
      writeList(storageKeys.completed, []);
      writeList(storageKeys.bookmarks, []);
      showingBookmarks = false;
      $('#review-filter').classList.remove('active');
      $('#review-filter').setAttribute('aria-pressed', 'false');
      updateProgress();
      applySearch();
      if (currentLessonId) showLesson(currentLessonId, false);
      showToast('Course progress was reset.');
    }
  });
  searchInput.addEventListener('input', applySearch);
  $('#lesson-notes').addEventListener('input', () => {
    if (!currentLessonId) return;
    localStorage.setItem(`fieldnotes-cpp-note-${currentLessonId}`, $('#lesson-notes').value);
    updateNotesCount();
    $('#notes-status').textContent = 'Saved just now';
  });
  $('#lesson-content').addEventListener('click', async (event) => {
    const button = event.target.closest('.copy-code');
    if (!button) return;
    const code = button.parentElement.querySelector('code').textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = 'Copy'; }, 1400);
    } catch {
      showToast('Clipboard access is unavailable in this browser.');
    }
  });
  $('#menu-toggle').addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
    $('#menu-toggle').setAttribute('aria-label', open ? 'Close course navigation' : 'Open course navigation');
    scrim.hidden = !open;
  });
  scrim.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (event.key === '/' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      event.preventDefault();
      searchInput.focus();
    } else if (event.key === 'Escape') {
      closeSidebar();
      searchInput.blur();
    } else if (currentLessonId && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      if (event.key === 'ArrowLeft' && currentLessonId > 1) showLesson(currentLessonId - 1);
      if (event.key === 'ArrowRight' && currentLessonId < 48) showLesson(currentLessonId + 1);
    }
  });

  const savedTheme = localStorage.getItem(storageKeys.theme);
  if (savedTheme) applyTheme(savedTheme);
  loadCourse();
})();
