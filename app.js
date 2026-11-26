(() => {
  'use strict';

  const TRACK_STORAGE_KEY = 'fieldnotes-active-track-v1';

  const tracks = {
    cpp: {
      id: 'cpp',
      expectedLessons: 48,
      defaultTheme: 'light',
      subtitle: ' C++ learning studio',
      breadcrumbRoot: 'LEARNING PATH',
      sidebarStatus: 'Built for steady progress',
      showPrereq: false,
      themeColors: { light: '#f5f6f3', dark: '#0e1511' },
      hero: {
        eyebrow: 'THE COMPLETE STUDY PATH',
        titleHtml: 'Learn C++.<br><em>Think like a computer scientist.</em>',
        description: 'A deliberate path from your first program to algorithms, systems, and software engineering. Learn deeply, build often, and keep what you learn.',
        caption: '48 lessons · learn at your own pace',
        codeTitle: 'first-principles.cpp',
        codeHtml: `<span class="code-muted">01</span> <b>#include</b> <span class="code-green">&lt;iostream&gt;</span>\n<span class="code-muted">02</span>\n<span class="code-muted">03</span> <b>int</b> <span class="code-blue">main</span>() {\n<span class="code-muted">04</span>   std::cout &lt;&lt; <span class="code-green">"keep learning"</span>;\n<span class="code-muted">05</span> }`,
        artCaption: 'small ideas. strong foundations.',
        statLessons: '48',
        statStages: '04',
        statPractice: '∞',
        sectionEyebrow: 'THE CURRICULUM',
        sectionTitle: 'One step at a time.',
        sectionAside: 'Build confidence by building knowledge.',
        footer: 'A learning resource, not a race. Make the ideas yours.'
      },
      phases: [
        { file: 'lessons/01-foundations.md', name: 'Programming foundations', short: 'FOUNDATIONS', range: '01 — 12', description: 'Learn to think in steps, write your first programs, and build reliable fundamentals.' },
        { file: 'lessons/02-core-cpp.md', name: 'Core C++ & data structures', short: 'CORE C++', range: '13 — 29', description: 'Understand object lifetime, modern C++, standard tools, and how to design programs.' },
        { file: 'lessons/03-algorithms-systems.md', name: 'Algorithms, systems & modern C++', short: 'SYSTEMS', range: '30 — 42', description: 'Explore algorithms, performance, operating systems, concurrency, and security.' },
        { file: 'lessons/04-engineering-capstone.md', name: 'Engineering & capstone', short: 'ENGINEERING', range: '43 — 48', description: 'Practice collaboration, delivery, architecture, and a complete project.' }
      ],
      storageKeys: {
        completed: 'fieldnotes-cpp-completed-v1',
        bookmarks: 'fieldnotes-cpp-bookmarks-v1',
        lastLesson: 'fieldnotes-cpp-last-lesson-v1',
        theme: 'fieldnotes-cpp-theme-v1',
        notePrefix: 'fieldnotes-cpp-note-'
      },
      lessons: []
    },
    pytorch: {
      id: 'pytorch',
      expectedLessons: 10,
      defaultTheme: 'dark',
      subtitle: ' neural core // pytorch',
      breadcrumbRoot: 'NEURAL GRID',
      sidebarStatus: 'TENSOR LINK ONLINE',
      showPrereq: true,
      themeColors: { light: '#f2f5fb', dark: '#06070d' },
      hero: {
        eyebrow: 'CYBERNETIC AI FIELD MANUAL',
        titleHtml: 'Learn PyTorch.<br><em>Build machines that predict.</em>',
        description: 'From raw predictions, weights, and matrix math to y = x + 1, curved neural nets, image vision CNNs, and modern LLMs — distilled into 10 sharp chapters.',
        caption: '10 chapters · requires basic Python',
        codeTitle: 'neural_pulse.py',
        codeHtml: `<span class="code-muted">01</span> <b>import</b> torch, torch.nn <span class="code-blue">as</span> nn\n<span class="code-muted">02</span>\n<span class="code-muted">03</span> model = nn.<span class="code-blue">Linear</span>(1, 1)\n<span class="code-muted">04</span> y_hat = model(x) <span class="code-green"># predict y = x + 1</span>\n<span class="code-muted">05</span> loss.<span class="code-blue">backward</span>()`,
        artCaption: 'inputs in. predictions out.',
        statLessons: '10',
        statStages: '04',
        statPractice: '05',
        sectionEyebrow: 'NEURAL SYLLABUS',
        sectionTitle: 'Ten chapters to LLMs.',
        sectionAside: 'Zero fluff. Interactive sandboxes offline.',
        footer: 'Warning: neural networks only optimize what you measure.'
      },
      phases: [
        { file: 'lessons/pytorch/01-ai-and-math.md', name: 'AI & Math Intuition', short: 'INTUITION', range: '01 — 03', description: 'Predictions, ML vs deep learning, CPU/CUDA/TPU/ROCm, weights, biases & matrices.' },
        { file: 'lessons/pytorch/02-first-models.md', name: 'First PyTorch Models', short: 'FIRST NETS', range: '04 — 06', description: 'Basic Python check, tensors, learning y = x + 1 from scratch, and the 5-step training loop.' },
        { file: 'lessons/pytorch/03-curves-and-vision.md', name: 'Curves & Computer Vision', short: 'VISION', range: '07 — 09', description: 'Bending straight lines with ReLU, images as [B, C, H, W] tensors, and CNN classifiers.' },
        { file: 'lessons/pytorch/04-llms.md', name: 'Large Language Models', short: 'LLMS', range: '10', description: 'Tokens, embeddings, causal self-attention, and how LLMs predict the next token.' }
      ],
      storageKeys: {
        completed: 'fieldnotes-pytorch-completed-v1',
        bookmarks: 'fieldnotes-pytorch-bookmarks-v1',
        lastLesson: 'fieldnotes-pytorch-last-lesson-v1',
        theme: 'fieldnotes-pytorch-theme-v1',
        notePrefix: 'fieldnotes-pytorch-note-'
      },
      lessons: []
    }
  };

  let activeTrackId = 'cpp';
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

  function activeTrack() {
    return tracks[activeTrackId];
  }

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
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const safe = escapeHtml(safeLink(href));
      const external = /^https?:/i.test(href.trim()) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${safe}"${external}>${label}</a>`;
    });
    return html;
  }

  function splitTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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

      const widgetMatch = line.trim().match(/^::widget\[([\w-]+)\]$/);
      if (widgetMatch) {
        flushParagraph();
        closeList();
        output.push(`<div class="interactive-slot" data-widget="${escapeHtml(widgetMatch[1])}"></div>`);
        continue;
      }

      if (
        line.trim().startsWith('|') &&
        i + 1 < lines.length &&
        /^\s*\|?(\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?\s*$/.test(lines[i + 1])
      ) {
        flushParagraph();
        closeList();
        const headers = splitTableRow(line);
        i++; // skip separator row
        const rows = [];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
          i++;
          rows.push(splitTableRow(lines[i]));
        }
        const thead = `<thead><tr>${headers.map((h) => `<th>${inlineMarkdown(h)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
        output.push(`<div class="table-wrap"><table>${thead}${tbody}</table></div>`);
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

  async function loadTrackFiles(track) {
    const loaded = await Promise.all(track.phases.map(async (phase, phaseIndex) => {
      const response = await fetch(phase.file);
      if (!response.ok) throw new Error(`Could not load ${phase.file} (${response.status}).`);
      return parseLessons(await response.text(), phaseIndex);
    }));
    track.lessons = loaded.flat();
    if (track.lessons.length !== track.expectedLessons) {
      throw new Error(`Expected ${track.expectedLessons} lessons in ${track.id} but found ${track.lessons.length}.`);
    }
  }

  async function loadCourse() {
    try {
      await Promise.all([loadTrackFiles(tracks.cpp), loadTrackFiles(tracks.pytorch)]);
      loadingState.hidden = true;

      const hash = location.hash;
      const savedTrack = localStorage.getItem(TRACK_STORAGE_KEY);
      let initialTrack = savedTrack && tracks[savedTrack] ? savedTrack : 'cpp';
      let initialLessonId = null;

      if (hash.startsWith('#pytorch-lesson-')) {
        initialTrack = 'pytorch';
        initialLessonId = Number(hash.replace('#pytorch-lesson-', ''));
      } else if (hash === '#pytorch') {
        initialTrack = 'pytorch';
      } else if (hash.startsWith('#lesson-')) {
        initialTrack = 'cpp';
        initialLessonId = Number(hash.replace('#lesson-', ''));
      }

      switchTrack(initialTrack, false);

      if (initialLessonId && activeTrack().lessons.some((l) => l.id === initialLessonId)) {
        showLesson(initialLessonId, false);
      } else {
        showHome();
      }
    } catch (error) {
      loadingState.hidden = true;
      errorState.hidden = false;
      $('#error-detail').textContent = error.message;
    }
  }

  function applyTrackChrome() {
    const track = activeTrack();
    const hero = track.hero;
    document.body.dataset.track = track.id;

    $('#brand-subtitle').textContent = track.subtitle;
    $('#breadcrumb-root').textContent = track.breadcrumbRoot;
    const statusText = $('#sidebar-status-text');
    statusText.textContent = track.sidebarStatus;
    statusText.dataset.normalText = track.sidebarStatus;
    statusText.classList.remove('status-corrupt');

    $('#hero-eyebrow-text').textContent = hero.eyebrow;
    $('#hero-title').innerHTML = hero.titleHtml;
    $('#hero-description').textContent = hero.description;
    $('#hero-caption').textContent = hero.caption;
    $('#hero-code-title').textContent = hero.codeTitle;
    $('#hero-code-body').innerHTML = hero.codeHtml;
    $('#hero-art-caption').textContent = hero.artCaption;
    $('#prereq-banner').hidden = !track.showPrereq;

    $('#stat-lessons').textContent = hero.statLessons;
    $('#stat-stages').textContent = hero.statStages;
    $('#stat-practice').textContent = hero.statPractice;
    $('#section-eyebrow').textContent = hero.sectionEyebrow;
    $('#section-title').textContent = hero.sectionTitle;
    $('#section-aside').textContent = hero.sectionAside;
    $('#home-footer').textContent = hero.footer;

    document.querySelectorAll('[data-track-btn]').forEach((btn) => {
      const isCurrent = btn.dataset.trackBtn === track.id;
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-pressed', String(isCurrent));
    });
  }

  function switchTrack(trackId, navigateHome = true) {
    if (!tracks[trackId]) return;
    activeTrackId = trackId;
    localStorage.setItem(TRACK_STORAGE_KEY, trackId);

    showingBookmarks = false;
    searchInput.value = '';
    $('#review-filter').classList.remove('active');
    $('#review-filter').setAttribute('aria-pressed', 'false');

    applyTrackChrome();
    const track = activeTrack();
    const savedTheme = localStorage.getItem(track.storageKeys.theme) || track.defaultTheme;
    applyTheme(savedTheme);

    renderNavigation();
    renderPhaseCards();
    updateProgress();

    if (window.PyTorchLab) window.PyTorchLab.setTrack(track.id);

    if (navigateHome) {
      history.replaceState(null, '', track.id === 'pytorch' ? '#pytorch' : location.pathname);
      showHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function renderNavigation() {
    const track = activeTrack();
    nav.innerHTML = '';
    track.phases.forEach((phase, phaseIndex) => {
      const lessons = track.lessons.filter((lesson) => lesson.phaseIndex === phaseIndex);
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
    const track = activeTrack();
    const container = $('#phase-cards');
    container.innerHTML = '';
    track.phases.forEach((phase, phaseIndex) => {
      const card = document.createElement('button');
      card.className = 'phase-card';
      card.type = 'button';
      const phaseLessons = track.lessons.filter((lesson) => lesson.phaseIndex === phaseIndex);
      const completed = readList(track.storageKeys.completed)
        .filter((id) => phaseLessons.some((lesson) => lesson.id === id)).length;
      const percentage = phaseLessons.length ? Math.round(completed / phaseLessons.length * 100) : 0;
      card.innerHTML = `<span class="phase-card-top"><span class="phase-card-number">0${phaseIndex + 1} / STAGE</span><span class="phase-card-count">${phase.range}</span></span><h3>${escapeHtml(phase.name)}</h3><p>${escapeHtml(phase.description)}</p><span class="phase-card-progress"><span style="width:${percentage}%"></span></span>`;
      card.addEventListener('click', () => {
        if (phaseLessons[0]) showLesson(phaseLessons[0].id);
      });
      container.append(card);
    });
  }

  function updateProgress() {
    const track = activeTrack();
    const total = track.lessons.length || track.expectedLessons;
    const completed = readList(track.storageKeys.completed);
    const percent = Math.round(completed.length / total * 100);
    $('#progress-percent').textContent = `${percent}%`;
    $('#home-progress').textContent = `${percent}%`;
    $('#progress-count').textContent = `${completed.length} of ${total} lessons complete`;
    $('#progress-fill').style.width = `${percent}%`;
    $('#bookmark-count').textContent = String(readList(track.storageKeys.bookmarks).length);
    $('#continue-label').textContent = completed.length ? 'Continue learning' : 'Start learning';
    const resumeId = Number(localStorage.getItem(track.storageKeys.lastLesson));
    const resumeLesson = track.lessons.find((lesson) => lesson.id === resumeId);
    if (resumeLesson) {
      $('#continue-label').textContent = completed.length ? `Continue: ${resumeLesson.title}` : 'Start learning';
    }
    updateNavigationState();
    if (track.lessons.length) renderPhaseCards();
  }

  function updateNavigationState() {
    const track = activeTrack();
    const completed = readList(track.storageKeys.completed);
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
    if (window.PyTorchLab) window.PyTorchLab.onLessonView(activeTrackId, null, null);
  }

  function showLesson(id, updateHash = true) {
    const track = activeTrack();
    const total = track.lessons.length;
    const lesson = track.lessons.find((item) => item.id === Number(id));
    if (!lesson) return;

    currentLessonId = lesson.id;
    const phase = track.phases[lesson.phaseIndex];
    homeView.hidden = true;
    lessonView.hidden = false;
    $('#breadcrumb-current').textContent = `LESSON ${String(lesson.id).padStart(2, '0')}`;
    $('#lesson-stage').textContent = `STAGE 0${lesson.phaseIndex + 1} · ${phase.short}`;
    $('#lesson-number').textContent = `LESSON ${String(lesson.id).padStart(2, '0')} / ${total}`;
    $('#lesson-title').textContent = lesson.title;
    $('#lesson-deck').textContent = getDeck(lesson.body);
    const wordCount = lesson.body.trim().split(/\s+/).length;
    $('#reading-time').textContent = `${Math.max(3, Math.ceil(wordCount / 180))} MIN READ`;
    const lessonContent = $('#lesson-content');
    lessonContent.innerHTML = renderMarkdown(lesson.body);

    const completeButton = $('#complete-button');
    const completed = readList(track.storageKeys.completed).includes(lesson.id);
    completeButton.classList.toggle('completed', completed);
    completeButton.setAttribute('aria-pressed', String(completed));
    $('#complete-label').textContent = completed ? 'Lesson completed' : 'Mark lesson complete';

    const bookmarks = readList(track.storageKeys.bookmarks);
    const isSaved = bookmarks.includes(lesson.id);
    $('#bookmark-button').classList.toggle('saved', isSaved);
    $('#bookmark-button').setAttribute('aria-pressed', String(isSaved));
    $('#bookmark-button span').textContent = isSaved ? 'Saved for review' : 'Save for review';

    const index = track.lessons.findIndex((item) => item.id === lesson.id);
    const previous = track.lessons[index - 1];
    const next = track.lessons[index + 1];
    $('#previous-button').disabled = !previous;
    $('#previous-title').textContent = previous ? previous.title : 'Beginning of course';
    $('#next-button').disabled = !next;
    $('#next-title').textContent = next ? next.title : 'End of course';

    $('#lesson-notes').value = localStorage.getItem(`${track.storageKeys.notePrefix}${lesson.id}`) || '';
    updateNotesCount();
    localStorage.setItem(track.storageKeys.lastLesson, String(lesson.id));
    if (updateHash) {
      const hashPrefix = track.id === 'pytorch' ? '#pytorch-lesson-' : '#lesson-';
      history.replaceState(null, '', `${hashPrefix}${lesson.id}`);
    }
    updateNavigationState();
    closeSidebar();
    if (window.PyTorchLab) window.PyTorchLab.onLessonView(track.id, lesson.id, lessonContent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getDeck(body) {
    const text = body.replace(/```[\s\S]*?```/g, '').replace(/::widget\[[^\]]+\]/g, '').trim();
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
    const track = activeTrack();
    const completed = readList(track.storageKeys.completed);
    const index = completed.indexOf(currentLessonId);
    if (index >= 0) completed.splice(index, 1);
    else completed.push(currentLessonId);
    writeList(track.storageKeys.completed, completed);
    $('#complete-button').classList.toggle('completed', index < 0);
    $('#complete-button').setAttribute('aria-pressed', String(index < 0));
    $('#complete-label').textContent = index < 0 ? 'Lesson completed' : 'Mark lesson complete';
    updateProgress();
    showToast(index < 0 ? 'Progress saved on this device.' : 'Lesson marked incomplete.');
  }

  function toggleBookmark() {
    if (!currentLessonId) return;
    const track = activeTrack();
    const bookmarks = readList(track.storageKeys.bookmarks);
    const index = bookmarks.indexOf(currentLessonId);
    if (index >= 0) bookmarks.splice(index, 1);
    else bookmarks.push(currentLessonId);
    writeList(track.storageKeys.bookmarks, bookmarks);
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
    const track = activeTrack();
    const bookmarks = new Set(readList(track.storageKeys.bookmarks));
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
    const track = activeTrack();
    document.body.classList.toggle('dark', theme === 'dark');
    $('#theme-toggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    localStorage.setItem(track.storageKeys.theme, theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', track.themeColors[theme] || track.themeColors.light);
  }

  document.querySelectorAll('[data-track-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.trackBtn !== activeTrackId) {
        switchTrack(btn.dataset.trackBtn, true);
      }
    });
  });

  $('#continue-button').addEventListener('click', () => {
    const track = activeTrack();
    const lastId = Number(localStorage.getItem(track.storageKeys.lastLesson));
    const firstIncomplete = track.lessons.find((lesson) => !readList(track.storageKeys.completed).includes(lesson.id));
    const lesson = track.lessons.find((item) => item.id === lastId) || firstIncomplete || track.lessons[0];
    if (lesson) showLesson(lesson.id);
  });
  $('#home-link').addEventListener('click', (event) => {
    event.preventDefault();
    history.replaceState(null, '', activeTrackId === 'pytorch' ? '#pytorch' : location.pathname);
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
    const track = activeTrack();
    if (!readList(track.storageKeys.completed).length && !readList(track.storageKeys.bookmarks).length) {
      showToast('There is no progress to reset.');
      return;
    }
    if (confirm('Clear completed lessons and saved-for-review items on this device? Your notes will stay.')) {
      writeList(track.storageKeys.completed, []);
      writeList(track.storageKeys.bookmarks, []);
      showingBookmarks = false;
      $('#review-filter').classList.remove('active');
      $('#review-filter').setAttribute('aria-pressed', 'false');
      updateProgress();
      applySearch();
      if (currentLessonId) showLesson(currentLessonId, false);
      showToast('Course progress was reset.');
    }
  });
  searchInput.addEventListener('input', () => {
    applySearch();
    if (window.PyTorchLab) window.PyTorchLab.onSearch(activeTrackId, searchInput.value);
  });
  $('#lesson-notes').addEventListener('input', () => {
    if (!currentLessonId) return;
    const track = activeTrack();
    localStorage.setItem(`${track.storageKeys.notePrefix}${currentLessonId}`, $('#lesson-notes').value);
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
      const total = activeTrack().lessons.length;
      if (event.key === 'ArrowLeft' && currentLessonId > 1) showLesson(currentLessonId - 1);
      if (event.key === 'ArrowRight' && currentLessonId < total) showLesson(currentLessonId + 1);
    }
  });

  if (window.PyTorchLab) window.PyTorchLab.init({ showToast });
  loadCourse();
})();
