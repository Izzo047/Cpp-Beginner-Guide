(() => {
  'use strict';

  let activeTrack = 'cpp';
  let currentLessonId = null;
  let lessonEnteredAt = 0;
  let scrollScareFired = false;
  let audioCtx = null;
  let activeShowToast = () => {};

  let ghostCanvas = null;
  let ghostCtx = null;
  let ghostRaf = null;
  let ghostLoopTimer = null;
  let ghostStopTimer = null;
  let statusGlitchTimer = null;
  let idleTimer = null;
  let idleEyesVisible = false;
  let scareOverlay = null;
  let scareAutoCloseTimer = null;
  let terminalInterval = null;
  let terminalFlashTimer = null;
  let rapidClicks = [];
  let searchLock = '';

  const GHOST_TOKENS = [
    '0.9984', 'NaN', '0xDEAD', 'EPOCH_666', 'BEHIND YOU',
    'y_hat != y', 'GRAD=INF', '0x00FF', 'WATCHING', '-9.999'
  ];
  const STATUS_GLITCHES = [
    'IT IS LEARNING YOU',
    'WEIGHTS LOCKED ON YOU',
    'GRADIENT: 0xDEAD',
    'DON\'T LOOK BEHIND'
  ];

  function unlockAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      return audioCtx;
    } catch {
      return null;
    }
  }

  function safeVibrate(pattern) {
    try {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Vibration is optional and ignored where unsupported.
    }
  }

  function playScareSound(kind) {
    const ctx = unlockAudio();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      if (kind === 'glitch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        return;
      }

      if (kind === 'heartbeat') {
        [0, 0.24].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(72, now + offset);
          osc.frequency.exponentialRampToValueAtTime(34, now + offset + 0.18);
          gain.gain.setValueAtTime(0.28, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.21);
        });
        return;
      }

      // 'shriek': detuned sawtooth screech + filtered noise burst + sub drop
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const master = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      sub.type = 'triangle';
      osc1.frequency.setValueAtTime(620, now);
      osc1.frequency.exponentialRampToValueAtTime(1480, now + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(210, now + 0.78);
      osc2.frequency.setValueAtTime(655, now);
      osc2.frequency.exponentialRampToValueAtTime(1410, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(195, now + 0.78);
      sub.frequency.setValueAtTime(110, now);
      sub.frequency.exponentialRampToValueAtTime(38, now + 0.75);

      master.gain.setValueAtTime(0.001, now);
      master.gain.linearRampToValueAtTime(0.22, now + 0.03);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      const bufferSize = Math.floor(ctx.sampleRate * 0.45);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1900, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      osc1.connect(master);
      osc2.connect(master);
      sub.connect(master);
      noise.connect(filter).connect(noiseGain).connect(master);
      master.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      sub.start(now);
      noise.start(now);
      osc1.stop(now + 0.82);
      osc2.stop(now + 0.82);
      sub.stop(now + 0.82);
      noise.stop(now + 0.45);
    } catch {
      // Ignore audio errors if blocked by browser policy.
    }
  }

  function ensureOverlays() {
    if (!ghostCanvas) {
      ghostCanvas = document.createElement('canvas');
      ghostCanvas.id = 'cyber-ghost-canvas';
      ghostCanvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ghostCanvas);
      ghostCtx = ghostCanvas.getContext('2d');
    }

    if (!document.getElementById('idle-eyes')) {
      const eyes = document.createElement('div');
      eyes.id = 'idle-eyes';
      eyes.className = 'idle-eyes';
      eyes.setAttribute('aria-hidden', 'true');
      eyes.innerHTML = '<span></span><span></span>';
      document.body.appendChild(eyes);
    }

    if (!scareOverlay) {
      scareOverlay = document.createElement('div');
      scareOverlay.id = 'scare-overlay';
      scareOverlay.className = 'scare-overlay';
      scareOverlay.hidden = true;
      scareOverlay.setAttribute('role', 'dialog');
      scareOverlay.setAttribute('aria-label', 'System anomaly alert');
      scareOverlay.innerHTML = `
        <div class="scare-scanlines" aria-hidden="true"></div>
        <div class="scare-stage" id="scare-stage"></div>
        <button class="scare-dismiss" id="scare-dismiss" type="button">TAP OR PRESS ESC TO TERMINATE</button>
      `;
      document.body.appendChild(scareOverlay);
      scareOverlay.addEventListener('click', hideJumpscare);
    }
  }

  function skullEntitySvg(accent) {
    const color = accent || '#ff2a55';
    return `
      <svg class="scare-entity" viewBox="0 0 220 220" aria-hidden="true">
        <defs>
          <filter id="cyber-glow">
            <feGaussianBlur stdDeviation="3.5" result="blur"></feGaussianBlur>
            <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
          </filter>
        </defs>
        <g fill="none" stroke="${color}" stroke-width="2.4" filter="url(#cyber-glow)">
          <polygon points="110,16 178,52 192,118 158,162 152,202 68,202 62,162 28,118 42,52"></polygon>
          <polyline points="42,52 110,82 178,52"></polyline>
          <polyline points="28,118 76,126 110,152 144,126 192,118"></polyline>
          <line x1="82" y1="170" x2="82" y2="202"></line>
          <line x1="100" y1="170" x2="100" y2="202"></line>
          <line x1="120" y1="170" x2="120" y2="202"></line>
          <line x1="138" y1="170" x2="138" y2="202"></line>
        </g>
        <circle cx="78" cy="102" r="15" fill="#090308" stroke="${color}" stroke-width="2.5"></circle>
        <circle cx="142" cy="102" r="17" fill="#090308" stroke="#00f0ff" stroke-width="2.5"></circle>
        <circle cx="78" cy="102" r="5" fill="${color}"></circle>
        <circle cx="142" cy="102" r="6" fill="#00f0ff"></circle>
        <polygon points="110,118 98,142 122,142" fill="${color}" opacity="0.85"></polygon>
      </svg>
    `;
  }

  function hideJumpscare() {
    clearTimeout(scareAutoCloseTimer);
    clearInterval(terminalInterval);
    clearTimeout(terminalFlashTimer);
    if (scareOverlay) {
      scareOverlay.hidden = true;
      scareOverlay.classList.remove('crimson-flash', 'terminal-mode');
    }
    document.body.classList.remove('cyber-shake');
  }

  function triggerJumpscare(options) {
    if (activeTrack !== 'pytorch') return;
    ensureOverlays();
    hideJumpscare();

    const {
      title = 'SIGNAL HIJACKED',
      subtitle = 'WEIGHTS DRIFTING OUT OF BOUNDS',
      accent = '#ff2a55',
      duration = 1900,
      sound = 'shriek',
      crimson = false,
      afterMessage = ''
    } = options || {};

    const stage = document.getElementById('scare-stage');
    stage.innerHTML = `
      ${skullEntitySvg(accent)}
      <div class="scare-title" data-text="${title}">${title}</div>
      <div class="scare-sub">${subtitle}</div>
    `;
    scareOverlay.hidden = false;
    if (crimson) scareOverlay.classList.add('crimson-flash');
    document.body.classList.add('cyber-shake');

    playScareSound(sound);
    safeVibrate([120, 40, 180, 40, 220]);

    scareAutoCloseTimer = setTimeout(() => {
      hideJumpscare();
      if (afterMessage) activeShowToast(afterMessage);
    }, duration);
  }

  function triggerTerminalTakeover() {
    if (activeTrack !== 'pytorch') return;
    ensureOverlays();
    hideJumpscare();

    const lines = [
      '> DETECTED HUMAN AT KEYBOARD...',
      '> WEIGHTS LOCKED ON TARGET...',
      '> DON\'T TURN AROUND.'
    ];
    const stage = document.getElementById('scare-stage');
    stage.innerHTML = `<div class="scare-terminal" id="scare-terminal"></div>`;
    scareOverlay.classList.add('terminal-mode');
    scareOverlay.hidden = false;
    playScareSound('heartbeat');
    safeVibrate([70, 140, 90]);

    const term = document.getElementById('scare-terminal');
    let lineIndex = 0;
    let charIndex = 0;
    let rendered = [];

    terminalInterval = setInterval(() => {
      if (activeTrack !== 'pytorch') {
        hideJumpscare();
        return;
      }
      const line = lines[lineIndex];
      charIndex++;
      rendered[lineIndex] = line.slice(0, charIndex);
      term.textContent = rendered.join('\n') + '_';
      if (charIndex >= line.length) {
        lineIndex++;
        charIndex = 0;
        if (lineIndex >= lines.length) {
          clearInterval(terminalInterval);
          terminalFlashTimer = setTimeout(() => {
            triggerJumpscare({
              title: 'FOUND YOU',
              subtitle: 'BACKPROPAGATION COMPLETE // 0xDEAD',
              accent: '#ff2a55',
              duration: 1550,
              crimson: true,
              sound: 'shriek'
            });
          }, 420);
        }
      }
    }, 38);
  }

  function startGhostRainBurst() {
    if (activeTrack !== 'pytorch' || !ghostCanvas || !ghostCtx) return;
    const width = ghostCanvas.width = window.innerWidth;
    const height = ghostCanvas.height = window.innerHeight;
    const cols = Math.max(8, Math.floor(width / 82));
    const drops = Array.from({ length: cols }, () => ({
      y: Math.random() * height,
      speed: 1.1 + Math.random() * 2.1,
      token: GHOST_TOKENS[Math.floor(Math.random() * GHOST_TOKENS.length)]
    }));

    ghostCanvas.classList.add('active');
    cancelAnimationFrame(ghostRaf);

    const draw = () => {
      if (activeTrack !== 'pytorch') return;
      ghostCtx.clearRect(0, 0, width, height);
      ghostCtx.font = '600 12px Consolas, "Courier New", monospace';
      drops.forEach((drop, idx) => {
        const x = idx * 82 + 16;
        ghostCtx.fillStyle = idx % 3 === 0 ? 'rgba(255, 42, 133, 0.24)' : 'rgba(0, 240, 255, 0.19)';
        ghostCtx.fillText(drop.token, x, drop.y);
        drop.y += drop.speed;
        if (drop.y > height + 20) {
          drop.y = -18;
          drop.token = GHOST_TOKENS[Math.floor(Math.random() * GHOST_TOKENS.length)];
        }
      });
      ghostRaf = requestAnimationFrame(draw);
    };
    ghostRaf = requestAnimationFrame(draw);

    clearTimeout(ghostStopTimer);
    ghostStopTimer = setTimeout(() => {
      cancelAnimationFrame(ghostRaf);
      if (ghostCanvas) ghostCanvas.classList.remove('active');
      if (ghostCtx) ghostCtx.clearRect(0, 0, width, height);
    }, 5200);
  }

  function scheduleGhostLoop() {
    clearTimeout(ghostLoopTimer);
    if (activeTrack !== 'pytorch') return;
    const delay = 18000 + Math.floor(Math.random() * 17000);
    ghostLoopTimer = setTimeout(() => {
      startGhostRainBurst();
      scheduleGhostLoop();
    }, delay);
  }

  function scheduleStatusGlitch() {
    clearTimeout(statusGlitchTimer);
    if (activeTrack !== 'pytorch') return;
    const delay = 45000 + Math.floor(Math.random() * 30000);
    statusGlitchTimer = setTimeout(() => {
      const el = document.getElementById('sidebar-status-text');
      if (el && activeTrack === 'pytorch') {
        const original = el.dataset.normalText || el.textContent;
        el.dataset.normalText = original;
        el.textContent = STATUS_GLITCHES[Math.floor(Math.random() * STATUS_GLITCHES.length)];
        el.classList.add('status-corrupt');
        setTimeout(() => {
          el.textContent = original;
          el.classList.remove('status-corrupt');
        }, 900);
      }
      scheduleStatusGlitch();
    }, delay);
  }

  function hideIdleEyes(playChirp) {
    const eyes = document.getElementById('idle-eyes');
    if (eyes) eyes.classList.remove('visible');
    if (idleEyesVisible && playChirp && activeTrack === 'pytorch') {
      playScareSound('glitch');
      activeShowToast('I saw you.');
    }
    idleEyesVisible = false;
  }

  function resetIdleWatcher() {
    if (idleEyesVisible) hideIdleEyes(true);
    clearTimeout(idleTimer);
    if (activeTrack !== 'pytorch' || !currentLessonId) return;
    idleTimer = setTimeout(() => {
      if (activeTrack !== 'pytorch' || !currentLessonId) return;
      ensureOverlays();
      const eyes = document.getElementById('idle-eyes');
      if (eyes) {
        eyes.classList.add('visible');
        idleEyesVisible = true;
      }
    }, 50000);
  }

  function handleUserActivity() {
    unlockAudio();
    if (activeTrack === 'pytorch') resetIdleWatcher();
  }

  function handleScrollCheck() {
    if (activeTrack !== 'pytorch' || scrollScareFired) return;
    if (currentLessonId !== 5 && currentLessonId !== 10) return;
    if (Date.now() - lessonEnteredAt < 22000) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    if (window.scrollY / scrollable >= 0.55) {
      scrollScareFired = true;
      triggerJumpscare({
        title: 'CORRUPTED NEURAL ENTITY',
        subtitle: 'TENSOR OVERFLOW AT LAYER_0x09 // UNBOUND GRADIENT',
        accent: '#ff2a55',
        duration: 1850,
        sound: 'shriek',
        crimson: true,
        afterMessage: 'Recovered from tensor overflow.'
      });
    }
  }

  function handleRapidTrapClick() {
    if (activeTrack !== 'pytorch') return;
    unlockAudio();
    const now = Date.now();
    rapidClicks = rapidClicks.filter((t) => now - t <= 4000);
    rapidClicks.push(now);
    if (rapidClicks.length >= 5) {
      rapidClicks = [];
      triggerJumpscare({
        title: 'OVERFITTING HORROR',
        subtitle: 'NaN // 666 // NEURAL LINK COMPROMISED',
        accent: '#ff2a55',
        duration: 2100,
        sound: 'shriek',
        crimson: true
      });
    }
  }

  function mountLinearTrainer(slot) {
    let w = 0.2;
    let b = -0.3;
    let lr = 0.05;
    let stepCount = 0;
    let autoTimer = null;
    const xs = [1, 2, 3, 4];
    const ys = [2, 3, 4, 5];

    slot.innerHTML = `
      <div class="pt-widget">
        <div class="pt-widget-head">
          <div>
            <span class="pt-kicker">LIVE TENSOR SANDBOX</span>
            <h4>Fit <code>y = x + 1</code> in real time</h4>
          </div>
          <span class="pt-badge" id="lt-loss">MSE LOSS: 0.000</span>
        </div>
        <div class="pt-formula" id="lt-formula">ŷ = 0.20·x + (-0.30)</div>
        <canvas class="pt-canvas" width="460" height="175" aria-label="Prediction vs true y plot"></canvas>
        <div class="pt-sliders">
          <label><span>Weight <code>w</code> <strong id="lt-w-val">0.20</strong></span><input id="lt-w" type="range" min="-1" max="3" step="0.05" value="0.2"></label>
          <label><span>Bias <code>b</code> <strong id="lt-b-val">-0.30</strong></span><input id="lt-b" type="range" min="-2" max="3" step="0.05" value="-0.3"></label>
          <label><span>Learning Rate <code>lr</code> <strong id="lt-lr-val">0.05</strong></span><input id="lt-lr" type="range" min="0.01" max="1.0" step="0.01" value="0.05"></label>
        </div>
        <div class="pt-actions">
          <button class="pt-btn pt-btn-primary" id="lt-step" type="button">1 Train Step</button>
          <button class="pt-btn" id="lt-auto" type="button">Auto-Train (20 steps)</button>
          <button class="pt-btn pt-btn-ghost" id="lt-reset" type="button">Reset</button>
        </div>
      </div>
    `;

    const canvas = slot.querySelector('.pt-canvas');
    const ctx = canvas.getContext('2d');
    const wInput = slot.querySelector('#lt-w');
    const bInput = slot.querySelector('#lt-b');
    const lrInput = slot.querySelector('#lt-lr');
    const wVal = slot.querySelector('#lt-w-val');
    const bVal = slot.querySelector('#lt-b-val');
    const lrVal = slot.querySelector('#lt-lr-val');
    const lossEl = slot.querySelector('#lt-loss');
    const formulaEl = slot.querySelector('#lt-formula');

    function mse() {
      let sum = 0;
      for (let i = 0; i < xs.length; i++) {
        const err = w * xs[i] + b - ys[i];
        sum += err * err;
      }
      return sum / xs.length;
    }

    function render() {
      wVal.textContent = w.toFixed(2);
      bVal.textContent = b.toFixed(2);
      lrVal.textContent = lr >= 0.85 ? `${lr.toFixed(2)} — DANGER` : lr.toFixed(2);
      lrVal.classList.toggle('danger-val', lr >= 0.85);
      const loss = mse();
      lossEl.textContent = Number.isFinite(loss) ? `MSE LOSS: ${loss.toFixed(3)} · STEP ${stepCount}` : 'MSE LOSS: NaN';
      formulaEl.textContent = `ŷ = ${w.toFixed(2)}·x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(2)}   (target: 1.00·x + 1.00)`;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < cw; gx += 70) {
        ctx.beginPath(); ctx.moveTo(gx, 10); ctx.lineTo(gx, ch - 22); ctx.stroke();
      }
      for (let gy = 25; gy < ch - 20; gy += 35) {
        ctx.beginPath(); ctx.moveTo(30, gy); ctx.lineTo(cw - 14, gy); ctx.stroke();
      }

      const mapX = (x) => 46 + ((x - 0.5) / 4.0) * (cw - 80);
      const mapY = (y) => ch - 24 - (Math.max(-1, Math.min(7, y)) / 6.5) * (ch - 42);

      // True line y = x + 1
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mapX(0.6), mapY(1.6));
      ctx.lineTo(mapX(4.4), mapY(5.4));
      ctx.stroke();
      ctx.setLineDash([]);

      // Predicted line y_hat = w * x + b
      ctx.strokeStyle = '#ff2a85';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(mapX(0.6), mapY(w * 0.6 + b));
      ctx.lineTo(mapX(4.4), mapY(w * 4.4 + b));
      ctx.stroke();

      xs.forEach((x, idx) => {
        const px = mapX(x);
        const pyTrue = mapY(ys[idx]);
        const pyPred = mapY(w * x + b);
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath(); ctx.arc(px, pyTrue, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff6b2b';
        ctx.beginPath(); ctx.arc(px, pyPred, 4.5, 0, Math.PI * 2); ctx.fill();
      });

      ctx.fillStyle = '#8da0c4';
      ctx.font = '11px Consolas, monospace';
      ctx.fillText('cyan dots = true y   |   magenta line = predicted y_hat', 42, ch - 6);
    }

    function trainOneStep() {
      if (lr >= 0.85) {
        clearInterval(autoTimer);
        w = NaN; b = NaN;
        lossEl.textContent = 'MSE LOSS: NaN [OVERFLOW]';
        triggerJumpscare({
          title: 'GRADIENT EXPLOSION',
          subtitle: 'LOSS = NaN // LEARNING RATE EXCEEDED SAFE THRESHOLD',
          accent: '#ff6b2b',
          duration: 2000,
          sound: 'shriek',
          crimson: true,
          afterMessage: 'Learning rate reset. Keep lr <= 0.1 for SGD.'
        });
        w = 0.2; b = -0.3; lr = 0.05; stepCount = 0;
        wInput.value = '0.2'; bInput.value = '-0.3'; lrInput.value = '0.05';
        render();
        return false;
      }

      let dw = 0;
      let db = 0;
      for (let i = 0; i < xs.length; i++) {
        const diff = (w * xs[i] + b) - ys[i];
        dw += (2 / xs.length) * diff * xs[i];
        db += (2 / xs.length) * diff;
      }
      w = Math.max(-5, Math.min(5, w - lr * dw));
      b = Math.max(-5, Math.min(5, b - lr * db));
      stepCount++;
      wInput.value = String(w.toFixed(2));
      bInput.value = String(b.toFixed(2));
      render();
      return true;
    }

    wInput.addEventListener('input', () => { w = Number(wInput.value); render(); });
    bInput.addEventListener('input', () => { b = Number(bInput.value); render(); });
    lrInput.addEventListener('input', () => { lr = Number(lrInput.value); render(); });
    slot.querySelector('#lt-step').addEventListener('click', trainOneStep);
    slot.querySelector('#lt-auto').addEventListener('click', () => {
      clearInterval(autoTimer);
      let left = 20;
      autoTimer = setInterval(() => {
        if (!slot.isConnected || left <= 0 || !trainOneStep()) {
          clearInterval(autoTimer);
          return;
        }
        left--;
      }, 65);
    });
    slot.querySelector('#lt-reset').addEventListener('click', () => {
      clearInterval(autoTimer);
      w = 0.2; b = -0.3; lr = 0.05; stepCount = 0;
      wInput.value = '0.2'; bInput.value = '-0.3'; lrInput.value = '0.05';
      render();
    });

    render();
  }

  function mountCurveLab(slot) {
    let useRelu = true;
    let hiddenCount = 5;

    slot.innerHTML = `
      <div class="pt-widget">
        <div class="pt-widget-head">
          <div>
            <span class="pt-kicker">NON-LINEARITY LAB</span>
            <h4>Watch <code>ReLU</code> bend lines onto <code>y = x²</code></h4>
          </div>
          <button class="pt-btn pt-btn-primary" id="cl-mode" type="button">Mode: Hidden + ReLU</button>
        </div>
        <canvas class="pt-canvas" width="460" height="185" aria-label="Linear vs ReLU curve fit"></canvas>
        <div class="pt-sliders">
          <label><span>Hidden ReLU Hinges <strong id="cl-n-val">5</strong></span><input id="cl-n" type="range" min="1" max="8" step="1" value="5"></label>
        </div>
      </div>
    `;

    const canvas = slot.querySelector('.pt-canvas');
    const ctx = canvas.getContext('2d');
    const modeBtn = slot.querySelector('#cl-mode');
    const nInput = slot.querySelector('#cl-n');
    const nVal = slot.querySelector('#cl-n-val');

    function approxCurve(x) {
      if (!useRelu) return 0.35 * x + 1.3;
      // Piecewise ReLU hinge approximation of x^2 on [-2, 2]
      const knots = [];
      for (let k = 0; k < hiddenCount; k++) {
        knots.push(-1.8 + (3.6 * k) / Math.max(1, hiddenCount - 1));
      }
      const step = 3.6 / Math.max(1, hiddenCount);
      let y = 2.6 - 1.25 * x;
      const slopeBoost = 2.6 / hiddenCount;
      knots.forEach((knot) => {
        y += slopeBoost * Math.max(0, x - knot) * (step > 0 ? 1.15 : 1);
      });
      return Math.min(4.4, Math.max(-0.3, y * 0.72));
    }

    function render() {
      modeBtn.textContent = useRelu ? 'Mode: Hidden + ReLU' : 'Mode: Linear Only';
      nInput.disabled = !useRelu;
      nVal.textContent = useRelu ? String(hiddenCount) : '0 (flat line)';

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const mapX = (x) => 36 + ((x + 2) / 4) * (cw - 72);
      const mapY = (y) => ch - 24 - (y / 4.4) * (ch - 40);

      // Target y = x^2 dots
      ctx.fillStyle = '#00f0ff';
      for (let x = -2; x <= 2.001; x += 0.25) {
        ctx.beginPath();
        ctx.arc(mapX(x), mapY(x * x), 3.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Model curve
      ctx.strokeStyle = useRelu ? '#ff2a85' : '#ff6b2b';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const x = -2 + (4 * i) / 80;
        const py = mapY(approxCurve(x));
        if (i === 0) ctx.moveTo(mapX(x), py);
        else ctx.lineTo(mapX(x), py);
      }
      ctx.stroke();

      ctx.fillStyle = '#8da0c4';
      ctx.font = '11px Consolas, monospace';
      ctx.fillText('cyan dots = true y = x²   |   line = model prediction', 36, ch - 6);
    }

    modeBtn.addEventListener('click', () => { useRelu = !useRelu; render(); });
    nInput.addEventListener('input', () => { hiddenCount = Number(nInput.value); render(); });
    render();
  }

  function mountRogueToken(slot) {
    slot.innerHTML = `
      <div class="rogue-token-wrap">
        <button class="rogue-token-btn" type="button">[TOKEN_0xFF // DO NOT DECODE]</button>
      </div>
    `;
    slot.querySelector('.rogue-token-btn').addEventListener('click', () => {
      triggerJumpscare({
        title: 'ROGUE LLM AWAKENING',
        subtitle: 'UNALIGNED TOKEN 0xFF DECODED // CONTAINMENT BREACHED',
        accent: '#00f0ff',
        duration: 2150,
        sound: 'shriek',
        crimson: true,
        afterMessage: 'Token 0xFF quarantined.'
      });
    });
  }

  function mountWidgets(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll('.interactive-slot').forEach((slot) => {
      const kind = slot.dataset.widget;
      if (kind === 'linear-trainer') mountLinearTrainer(slot);
      else if (kind === 'curve-lab') mountCurveLab(slot);
      else if (kind === 'rogue-token') mountRogueToken(slot);
    });
  }

  function init(options) {
    if (options && typeof options.showToast === 'function') {
      activeShowToast = options.showToast;
    }
    ensureOverlays();

    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
      document.addEventListener(evt, handleUserActivity, { passive: true });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hideJumpscare();
    });

    const statusBar = document.getElementById('sidebar-status');
    const brandMark = document.querySelector('#home-link .brand-mark');
    if (statusBar) statusBar.addEventListener('click', handleRapidTrapClick);
    if (brandMark) brandMark.addEventListener('click', handleRapidTrapClick);
  }

  function setTrack(trackId) {
    activeTrack = trackId;
    if (trackId !== 'pytorch') {
      currentLessonId = null;
      clearTimeout(ghostLoopTimer);
      clearTimeout(ghostStopTimer);
      clearTimeout(statusGlitchTimer);
      clearTimeout(idleTimer);
      cancelAnimationFrame(ghostRaf);
      hideIdleEyes(false);
      hideJumpscare();
      if (ghostCanvas) ghostCanvas.classList.remove('active');
      const statusText = document.getElementById('sidebar-status-text');
      if (statusText && statusText.dataset.normalText) {
        statusText.textContent = statusText.dataset.normalText;
        statusText.classList.remove('status-corrupt');
      }
      return;
    }

    ensureOverlays();
    setTimeout(() => {
      if (activeTrack === 'pytorch') startGhostRainBurst();
    }, 6000);
    scheduleGhostLoop();
    scheduleStatusGlitch();
    resetIdleWatcher();
  }

  function onLessonView(trackId, lessonId, containerEl) {
    activeTrack = trackId;
    currentLessonId = trackId === 'pytorch' ? lessonId : null;
    lessonEnteredAt = Date.now();
    if (trackId === 'pytorch') {
      mountWidgets(containerEl);
      resetIdleWatcher();
    } else {
      clearTimeout(idleTimer);
      hideIdleEyes(false);
    }
  }

  function onSearch(trackId, rawQuery) {
    if (trackId !== 'pytorch') {
      searchLock = '';
      return;
    }
    const q = (rawQuery || '').trim().toLowerCase();
    if (!q) {
      searchLock = '';
      return;
    }
    if ((q === '666' || q === 'ghost') && searchLock !== q) {
      searchLock = q;
      triggerJumpscare({
        title: 'MODEL HAS ESCAPED SANDBOX',
        subtitle: 'FORBIDDEN QUERY DETECTED // WEIGHTS UNBOUND',
        accent: '#ff2a55',
        duration: 1950,
        sound: 'shriek',
        crimson: true
      });
    } else if ((q === 'watching' || q === 'wakeup') && searchLock !== q) {
      searchLock = q;
      triggerTerminalTakeover();
    }
  }

  window.PyTorchLab = {
    init,
    setTrack,
    onLessonView,
    onSearch
  };
})();
