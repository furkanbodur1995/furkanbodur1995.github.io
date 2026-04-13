/* ══════════════════════════════════════════
   FURKAN BODUR — main.js
   All interactive behavior & animations
   ══════════════════════════════════════════ */

'use strict';

const _PAGE_START = Date.now();

/* ────────────────────────────────────────
   1. THEME TOGGLE
──────────────────────────────────────── */
const html = document.documentElement;

const THEMES = ['dark', 'light', 'mono'];
const THEME_META = {
  dark:  { next: 'light', icon: '☀️',  label: 'Light mode' },
  light: { next: 'mono',  icon: '◑',   label: 'Mono mode'  },
  mono:  { next: 'dark',  icon: '🌙',  label: 'Dark mode'  },
};

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  const meta = THEME_META[theme];
  document.querySelectorAll('.theme-icon').forEach(el => el.textContent = meta.icon);
  document.querySelectorAll('.theme-label').forEach(el => el.textContent = meta.label);
  const mBtn = document.getElementById('themeToggleMobile');
  if (mBtn) mBtn.textContent = meta.icon;
  generateUAVStars();
}

function toggleTheme() {
  const current = html.getAttribute('data-theme') || 'dark';
  applyTheme(THEME_META[current].next);
}

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
document.getElementById('themeToggleMobile')?.addEventListener('click', toggleTheme);
// init
applyTheme('dark');


/* ────────────────────────────────────────
   2. MOBILE SIDEBAR
──────────────────────────────────────── */
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('sbOverlay');
const hamburger = document.getElementById('hamburger');

function openSidebar()  {
  sidebar.classList.add('open');
  overlay.classList.add('show');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () =>
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
);
overlay?.addEventListener('click', closeSidebar);
document.querySelectorAll('.sb-nav-link').forEach(a =>
  a.addEventListener('click', closeSidebar)
);


/* ────────────────────────────────────────
   3. SCROLL PROGRESS BAR + SCROLL TO TOP
──────────────────────────────────────── */
const scrollBar    = document.getElementById('scrollProgress');
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max > 0 && scrollBar) {
    scrollBar.style.width = (window.scrollY / max * 100) + '%';
  }
  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }
}, { passive: true });
scrollTopBtn && scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ────────────────────────────────────────
   4. TYPING ANIMATION
──────────────────────────────────────── */
const phrases = [
  'AI-First Test Engineer',
  'Senior QA Expert',
  'LLM Pipeline Architect',
  'ISTQB × 3 Certified',
  'UAV Pilot · Systems Tester'
];
let pIdx = 0, cIdx = 0, deleting = false;
const typeEl = document.getElementById('typeText');

function type() {
  if (!typeEl) return;
  const phrase = phrases[pIdx];
  if (!deleting) {
    typeEl.textContent = phrase.slice(0, ++cIdx);
    if (cIdx === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
    setTimeout(type, 80);
  } else {
    typeEl.textContent = phrase.slice(0, --cIdx);
    if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
    setTimeout(type, 42);
  }
}
setTimeout(type, 700);


/* ────────────────────────────────────────
   5. MAGNETIC DOT GRID (full-page background)
──────────────────────────────────────── */
(function initMagneticGrid() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  // Make the canvas fixed full-page
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  const isMobile = () => window.innerWidth <= 820;
  const SPACING  = () => isMobile() ? 64 : 48;
  const ATTRACT_R = 180;   // mouse pull radius
  const MOUSE_F   = 0.32;  // mouse attraction strength
  const SPRING_K  = 0.055; // spring-back stiffness
  const DAMPING   = 0.76;  // velocity damping each frame
  const MAX_D     = 60;    // max displacement (px)
  const CLICK_R   = 230;   // click burst radius
  const CLICK_F   = 85;    // click burst force

  let W, H, dots = [], ripples = [];
  let mx = -9999, my = -9999;

  function initDots() {
    dots = [];
    const sp = SPACING();
    const cols = Math.ceil(W / sp) + 2;
    const rows = Math.ceil(H / sp) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * sp, oy = r * sp;
        dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initDots();
  }
  window.addEventListener('resize', () => resize());
  resize();

  // Track mouse across whole document
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  // Click burst
  document.addEventListener('click', e => {
    // skip clicks on interactive UI elements
    if (e.target.closest('a,button,input,select,textarea,.sidebar,.copy-toast,.rt-overlay,.kb-hint')) return;
    ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    const cx = e.clientX, cy = e.clientY;
    for (const d of dots) {
      const dx = d.ox - cx, dy = d.oy - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CLICK_R && dist > 0.1) {
        const force = (1 - dist / CLICK_R) * CLICK_F;
        d.vx += (dx / dist) * force;
        d.vy += (dy / dist) * force;
      }
    }
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const teal     = getComputedStyle(html).getPropertyValue('--teal-light').trim() || '#14b8a6';
    const hasMouse = mx > -999;

    for (const d of dots) {
      // Spring toward origin
      d.vx += (d.ox - d.x) * SPRING_K;
      d.vy += (d.oy - d.y) * SPRING_K;

      // Mouse attraction
      if (hasMouse) {
        const dx = mx - d.ox, dy = my - d.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ATTRACT_R && dist > 0.1) {
          const f = (1 - dist / ATTRACT_R) * MOUSE_F;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
        }
      }

      // Damping + integrate
      d.vx *= DAMPING;
      d.vy *= DAMPING;
      d.x = d.ox + Math.max(-MAX_D, Math.min(MAX_D, (d.x - d.ox) + d.vx));
      d.y = d.oy + Math.max(-MAX_D, Math.min(MAX_D, (d.y - d.oy) + d.vy));

      // Draw dot — brighter + larger when displaced
      const disp  = Math.sqrt((d.x - d.ox) ** 2 + (d.y - d.oy) ** 2);
      const t     = disp / MAX_D;
      const alpha = 0.06 + t * 0.48;
      const r     = 1.2 + t * 1.6;
      const hex   = Math.round(Math.min(alpha, 0.62) * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = teal + hex;
      ctx.fill();
    }

    // Draw cursor glow
    if (hasMouse) {
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 60);
      grad.addColorStop(0, teal + '22');
      grad.addColorStop(1, teal + '00');
      ctx.beginPath();
      ctx.arc(mx, my, 60, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Draw ripples
    const now = performance.now();
    ripples = ripples.filter(rp => now - rp.t < 800);
    for (const rp of ripples) {
      const p = (now - rp.t) / 800;
      const eased = 1 - Math.pow(1 - p, 2);
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, eased * CLICK_R * 1.05, 0, Math.PI * 2);
      ctx.strokeStyle = teal + Math.round((1 - p) * 0.45 * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1.5 * (1 - p);
      ctx.stroke();
      // inner second ring
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, eased * CLICK_R * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = teal + Math.round((1 - p) * 0.25 * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();


/* ────────────────────────────────────────
   6. UAV STARS
──────────────────────────────────────── */
function generateUAVStars() {
  const container = document.getElementById('uavStars');
  if (!container) return;
  container.innerHTML = '';
  const theme = html.getAttribute('data-theme');
  if (theme === 'light') return; // no stars in light mode
  for (let i = 0; i < 45; i++) {
    const s = document.createElement('div');
    const sz = .6 + Math.random() * 1.8;
    s.style.cssText = `
      position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;
      background:#fff;left:${Math.random()*100}%;top:${Math.random()*100}%;
      animation:starBlink ${2+Math.random()*3}s ${Math.random()*3}s ease-in-out infinite;
    `;
    container.appendChild(s);
  }
}
generateUAVStars();

// nav light blink
let nlOn = true;
setInterval(() => {
  const nl = document.getElementById('navLightDot');
  if (nl) { nl.setAttribute('opacity', nlOn ? '0.9' : '0.06'); nlOn = !nlOn; }
}, 900);


/* ────────────────────────────────────────
   7. SCROLL-TRIGGERED REVEALS
──────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => {
      el.classList.add('revealed');
      // run child animations
      animateCounters(el);
      animateSkillTags(el);
    }, delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));


/* ────────────────────────────────────────
   8. ANIMATED COUNTERS
──────────────────────────────────────── */
function animateCounters(root) {
  root.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 1300;
    const start  = performance.now();
    function step(now) {
      const p    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target) + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// Hero metrics on load
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero-metrics [data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1200;
      const start  = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + (p >= 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, 900);
});


/* ────────────────────────────────────────
   9. SKILL TAG WAVE ENTRANCE
──────────────────────────────────────── */
function animateSkillTags(root) {
  if (!root.classList.contains('skill-cat')) return;
  const tags = root.querySelectorAll('.sc-tags span');
  tags.forEach((tag, i) => {
    tag.style.transition = `opacity .4s ${i * 55}ms ease, transform .4s ${i * 55}ms cubic-bezier(.34,1.56,.64,1)`;
  });
}


/* ────────────────────────────────────────
   10. TIMELINE LINE DRAW
──────────────────────────────────────── */
const tlLine = document.getElementById('tlLine');
const tlSection = document.getElementById('experience');
if (tlLine && tlSection) {
  const lineObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(() => { tlLine.style.height = '100%'; }, 300);
      lineObs.unobserve(tlSection);
    }
  }, { threshold: 0.1 });
  lineObs.observe(tlSection);
}


/* ────────────────────────────────────────
   11. PIPELINE NODE PULSE SEQUENCE
──────────────────────────────────────── */
(function initPipeline() {
  const nodes = [0,1,2,3].map(i => document.getElementById(`pn${i}`));
  if (!nodes[0]) return;

  function pulse() {
    nodes.forEach((n, i) => {
      if (!n) return;
      setTimeout(() => {
        n.classList.add('pipe-active');
        setTimeout(() => n.classList.remove('pipe-active'), 900);
      }, i * 400);
    });
  }

  const pObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      pulse();
      pObs.disconnect();
      // keep repeating to draw attention
      setInterval(pulse, 4500);
    }
  }, { threshold: 0.4 });

  const row = document.getElementById('pipeRow');
  if (row) pObs.observe(row);
})();


/* ────────────────────────────────────────
   12. ACTIVE NAV HIGHLIGHT (SCROLLSPY)
──────────────────────────────────────── */
(function initScrollspy() {
  const sections = ['about','experience','careermap','pipeline','project','skills'];
  const navLinks = document.querySelectorAll('.sb-nav-link');

  const spyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) spyObs.observe(el);
  });
})();


/* ────────────────────────────────────────
   13. CARD TILT (subtle 3-D hover)
──────────────────────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.imp-card, .feat-item, .skill-cat, .tl-card');
  if (window.matchMedia('(hover: none)').matches) return; // skip touch devices

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - .5;
      const y   = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ────────────────────────────────────────
   14. COPY EMAIL
──────────────────────────────────────── */
(function initCopyEmail() {
  const btn   = document.getElementById('copyEmailBtn');
  const badge = document.getElementById('copyBadge');
  const toast = document.getElementById('copyToast');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('furkan.bodur1995@gmail.com');
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = 'furkan.bodur1995@gmail.com';
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      ta.remove();
    }
    badge.classList.add('show');
    toast.classList.add('show');
    setTimeout(() => { badge.classList.remove('show'); toast.classList.remove('show'); }, 2000);
  });
})();


/* ────────────────────────────────────────
   15. KEYBOARD NAVIGATION
──────────────────────────────────────── */
(function initKeyboardNav() {
  const sections = ['about','experience','careermap','pipeline','project','skills'];
  const hint = document.getElementById('kbHint');

  // Show hint after first scroll
  let hintShown = false;
  window.addEventListener('scroll', () => {
    if (!hintShown && window.scrollY > 100) {
      hintShown = true;
      hint.classList.add('show');
      setTimeout(() => hint.classList.remove('show'), 3500);
    }
  }, { passive: true, once: true });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();

    // find current section
    let curIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(sections[i]);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.45) curIdx = i;
    }

    const nextIdx = e.key === 'ArrowDown'
      ? Math.min(curIdx + 1, sections.length - 1)
      : Math.max(curIdx - 1, 0);

    const target = document.getElementById(sections[nextIdx]);
    if (target) target.scrollIntoView({ behavior: 'smooth' });

    hint.classList.add('show');
    clearTimeout(hint._hideTimer);
    hint._hideTimer = setTimeout(() => hint.classList.remove('show'), 1800);
  });
})();


/* ────────────────────────────────────────
   16. CAREER MAP ANIMATION
──────────────────────────────────────── */
(function initCareerMap() {
  const fill = document.getElementById('cmFill');
  const milestones = document.querySelectorAll('.cm-milestone');
  if (!fill) return;

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    // animate track fill
    setTimeout(() => { fill.style.width = '100%'; }, 200);
    // animate milestone cards
    milestones.forEach(m => {
      const delay = parseInt(m.dataset.cmDelay || 0, 10);
      setTimeout(() => m.classList.add('cm-visible'), delay + 300);
    });
    obs.disconnect();
  }, { threshold: 0.2 });

  const section = document.getElementById('careermap');
  if (section) obs.observe(section);
})();


/* ────────────────────────────────────────
   17. TERMINAL DEMO
──────────────────────────────────────── */
(function initTerminal() {
  const btn  = document.getElementById('termRunBtn');
  const body = document.getElementById('termBody');
  if (!btn || !body) return;

  const STEPS = [
    { delay: 0,    type: 'prompt', text: 'analyze-commits --story STORY-1234' },
    { delay: 400,  type: 'info',   text: '→ Connecting to GitLab MCP server...' },
    { delay: 900,  type: 'out',    text: '  Fetching commits across 3 repositories' },
    { delay: 1400, type: 'out',    text: '  angularfrontend   ████████████  47 files changed' },
    { delay: 1800, type: 'out',    text: '  workflowservice   ██████░░░░░░  23 files changed' },
    { delay: 2200, type: 'out',    text: '  simulationservice ████░░░░░░░░  11 files changed' },
    { delay: 2700, type: 'info',   text: '→ Delegating analysis to reasoning model...' },
    { delay: 3100, type: 'dim',    text: '  [API] qwen3-30b  processing 81 diffs...' },
    { delay: 4200, type: 'success',text: '✓ COMMIT_ANALYSIS_1234.md written  (3 repos merged)' },
    { delay: 4700, type: 'prompt', text: 'gap-analyze --story STORY-1234' },
    { delay: 5200, type: 'info',   text: '→ Cross-referencing AC criteria + user manual...' },
    { delay: 5900, type: 'warn',   text: '⚠ MISSING_IMPL: role-based export restriction not tested' },
    { delay: 6400, type: 'warn',   text: '⚠ UNDOC_BEHAVIOR: pagination resets on filter change' },
    { delay: 6900, type: 'success',text: '✓ GAP_ANALYSIS_1234.md written  (2 gaps found)' },
    { delay: 7400, type: 'prompt', text: 'generate-tests --story STORY-1234 --model gemini-2.5-pro' },
    { delay: 7900, type: 'info',   text: '→ Generating Sanity / Basic / Coverage test cases...' },
    { delay: 8800, type: 'success',text: '✓ S_TC_1234_ExportRoleValidation.txt' },
    { delay: 9100, type: 'success',text: '✓ B_TC_1234_PaginationFilterReset.txt' },
    { delay: 9400, type: 'success',text: '✓ C_TC_1234_EdgeCases.txt' },
    { delay: 9900, type: 'prompt', text: 'upload-to-jira --story STORY-1234' },
    { delay:10400, type: 'info',   text: '→ Batch uploading 3 test cases to Xray...' },
    { delay:11100, type: 'success',text: '✓ XPGSGR-8821 · XPGSGR-8822 · XPGSGR-8823 created' },
    { delay:11500, type: 'success',text: '✓ All tests linked to STORY-1234' },
    { delay:11900, type: 'dim',    text: '  Total Copilot tokens used: ~2 800  (was ~18 000)' },
    { delay:12300, type: 'success',text: '✓ Pipeline complete in 12.3 s' },
  ];

  function mkLine(step) {
    const div = document.createElement('div');
    if (step.type === 'prompt') {
      div.className = 'term-line term-prompt';
      div.innerHTML = `$ <span class="term-cmd">${step.text}</span>`;
    } else {
      div.className = `term-line term-out ${step.type}`;
      div.textContent = step.text;
    }
    return div;
  }

  function runDemo() {
    btn.disabled = true;
    btn.textContent = 'Running…';
    body.innerHTML = '';

    // add blinking cursor line
    const cursorLine = document.createElement('div');
    cursorLine.className = 'term-cursor-line';
    cursorLine.innerHTML = '<span class="term-blink">█</span>';
    body.appendChild(cursorLine);

    let last = 0;
    STEPS.forEach(step => {
      setTimeout(() => {
        // remove cursor, add line, re-add cursor at bottom
        cursorLine.remove();
        body.appendChild(mkLine(step));
        body.appendChild(cursorLine);
        body.scrollTop = body.scrollHeight;
      }, step.delay);
      last = Math.max(last, step.delay);
    });

    setTimeout(() => {
      cursorLine.remove();

      // Jira result block
      const jiraBlock = document.createElement('div');
      jiraBlock.className = 'term-jira-block';
      jiraBlock.innerHTML = `
        <div class="term-jira-row">
          <span class="term-jira-label">📌 Uploaded to Jira / Xray</span>
        </div>
        <div class="term-jira-links">
          <a class="term-jira-link" href="#" onclick="return false;">XPGSGR-8821</a>
          <a class="term-jira-link" href="#" onclick="return false;">XPGSGR-8822</a>
          <a class="term-jira-link" href="#" onclick="return false;">XPGSGR-8823</a>
        </div>
        <div class="term-jira-sub">3 test cases linked to STORY-1234 · Sprint 42 Execution</div>
      `;
      body.appendChild(jiraBlock);
      body.scrollTop = body.scrollHeight;

      btn.disabled = false;
      btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Run Again';
    }, last + 600);
  }

  btn.addEventListener('click', runDemo);
})();


/* ────────────────────────────────────────
   18. PROJECT DEMO (n8n / Teams workflow)
──────────────────────────────────────── */
(function initProjDemo() {
  const runBtn    = document.getElementById('projRunBtn');
  const againBtn  = document.getElementById('projAgainBtn');
  const triggerEl = document.getElementById('projTrigger');
  const workflowEl= document.getElementById('projWorkflow');
  const stepsEl   = document.getElementById('projSteps');
  const resultEl  = document.getElementById('projResult');
  if (!runBtn) return;

  // [activeAt ms, doneAt ms] from click
  const TIMING = [
    [100,  600],   // Webhook received
    [700,  1400],  // Intent Classification
    [1500, 2700],  // Knowledge Retrieval
    [2800, 4200],  // Test Generation
    [4300, 5400],  // pytest Execution
    [5500, 6200],  // Jira / Xray Upload
    [6300, 6900],  // Teams Notification
  ];

  function reset() {
    stepsEl.querySelectorAll('.fbw-step').forEach(s => s.classList.remove('active','done'));
    resultEl.classList.remove('visible');
    againBtn.style.display = 'none';
    workflowEl.classList.remove('visible');
    triggerEl.classList.remove('sent');
    const compose = triggerEl.querySelector('.tms-compose');
    if (compose) compose.classList.remove('fired');
    runBtn.disabled = false;
  }

  function runDemo() {
    runBtn.disabled = true;
    triggerEl.classList.add('sent');
    const compose = triggerEl.querySelector('.tms-compose');
    if (compose) compose.classList.add('fired');
    setTimeout(() => workflowEl.classList.add('visible'), 400);

    const steps = Array.from(stepsEl.querySelectorAll('.fbw-step'));
    TIMING.forEach(([activeAt, doneAt], i) => {
      setTimeout(() => steps[i] && steps[i].classList.add('active'), activeAt);
      setTimeout(() => {
        if (!steps[i]) return;
        steps[i].classList.remove('active');
        steps[i].classList.add('done');
      }, doneAt);
    });

    const lastDone = TIMING[TIMING.length - 1][1];
    setTimeout(() => resultEl.classList.add('visible'), lastDone + 400);
    setTimeout(() => { againBtn.style.display = 'inline-flex'; }, lastDone + 700);
  }

  runBtn.addEventListener('click', runDemo);
  againBtn && againBtn.addEventListener('click', () => { reset(); setTimeout(runDemo, 80); });
})();


/* ────────────────────────────────────────
   20. CONSOLE EASTER EGG
──────────────────────────────────────── */
(function consoleEasterEgg() {
  const s1 = 'color:#14b8a6;font-size:14px;font-weight:900;font-family:monospace';
  const s2 = 'color:#94a3b8;font-size:11px;font-family:monospace';
  const s3 = 'color:#0d9488;font-size:11px;font-weight:700;font-family:monospace';
  console.log('%c🔍 Inspect element?\n', s1);
  console.log('%cFinding bugs here is gonna be tough.\nThis page was built by someone who does this for a living.\n', s2);
  console.log('%c✓ Navigation tested\n✓ Animations tested\n✓ Responsive layout tested\n✓ Theme switching tested\n✓ Console messages tested  ← you found this one\n', s3);
  console.log('%c→ If you want a QA engineer who goes this deep: furkan.bodur1995@gmail.com\n', s2);
})();


/* ────────────────────────────────────────
   21. QA MODE TOGGLE
──────────────────────────────────────── */
(function initQAMode() {
  const btn = document.getElementById('qaModeBtn');
  if (!btn) return;
  let badge = null;

  btn.addEventListener('click', () => {
    const active = document.body.classList.toggle('qa-mode');
    btn.classList.toggle('qa-active', active);

    if (active) {
      // count interactive elements
      const count = document.querySelectorAll('a,button,input,select,textarea').length;
      badge = document.createElement('div');
      badge.className = 'qa-badge-count';
      badge.id = 'qaBadge';
      badge.textContent = `${count} elements · 0 bugs found`;
      document.body.appendChild(badge);
      // small typewriter reveal
      const msgs = [`${count} elements · 0 bugs found`, `${count} elements · scanning...`, `${count} elements · 0 bugs found ✓`];
      let mi = 0;
      const t = setInterval(() => { if (badge) badge.textContent = msgs[++mi]; if (mi >= msgs.length - 1) clearInterval(t); }, 600);
    } else {
      badge && badge.remove(); badge = null;
    }
  });
})();


/* ────────────────────────────────────────
   22. COPY SHAREABLE LINK
──────────────────────────────────────── */
(function initShareLink() {
  const btn   = document.getElementById('copyShareBtn');
  const label = document.getElementById('shareLabel');
  const toast = document.getElementById('shareToast');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const url = 'https://furkanbodur1995.github.io';
    try { await navigator.clipboard.writeText(url); }
    catch { const ta = Object.assign(document.createElement('textarea'), { value: url, style: 'position:fixed;opacity:0' }); document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }

    label.textContent = 'Copied!';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); label.textContent = 'Share link'; }, 2500);
  });
})();


/* ────────────────────────────────────────
   23. RUN TESTS ON THIS PAGE
──────────────────────────────────────── */
(function initRunTests() {
  const btn     = document.getElementById('runTestsBtn');
  const overlay = document.getElementById('rtOverlay');
  const closeBtn= document.getElementById('rtClose');
  const body    = document.getElementById('rtBody');
  if (!btn || !overlay) return;

  const navLinks = document.querySelectorAll('.sb-nav-link').length;
  const sections = document.querySelectorAll('section').length;
  const buttons  = document.querySelectorAll('button').length;
  const cvDownloadClicked = false; // tracked below

  const TESTS = [
    { delay: 0,    cls: 'dim',     text: 'pytest test_portfolio_page.py -v --tb=short' },
    { delay: 300,  cls: 'dim',     text: '' },
    { delay: 600,  cls: 'info',    text: `collecting ${sections * 3 + buttons} test items...` },
    { delay: 1100, cls: 'success', text: `PASSED  test_navigation_links_present[${navLinks} links]` },
    { delay: 1500, cls: 'success', text: `PASSED  test_hero_section_visible` },
    { delay: 1850, cls: 'success', text: `PASSED  test_profile_photo_loaded` },
    { delay: 2150, cls: 'success', text: `PASSED  test_typing_animation_running` },
    { delay: 2450, cls: 'success', text: `PASSED  test_particle_canvas_initialized` },
    { delay: 2750, cls: 'success', text: `PASSED  test_career_map_milestones[5 items]` },
    { delay: 3050, cls: 'success', text: `PASSED  test_istqb_certifications_displayed[3 certs]` },
    { delay: 3350, cls: 'success', text: `PASSED  test_dark_light_mono_theme_toggle` },
    { delay: 3650, cls: 'success', text: `PASSED  test_terminal_demo_runs` },
    { delay: 3950, cls: 'success', text: `PASSED  test_teams_workflow_demo_interactive` },
    { delay: 4250, cls: 'success', text: `PASSED  test_radar_chart_renders[6 axes]` },
    { delay: 4550, cls: 'success', text: `PASSED  test_scroll_progress_bar` },
    { delay: 4850, cls: 'success', text: `PASSED  test_mobile_responsive_layout` },
    { delay: 5150, cls: 'success', text: `PASSED  test_cv_download_link_present` },
    { delay: 5450, cls: 'warn',    text: `WARNED  test_cv_download_clicked — recruiter has not downloaded CV yet` },
    { delay: 5900, cls: 'dim',     text: '' },
    { delay: 6200, cls: 'success', text: `16 passed, 1 warning in 6.2s` },
    { delay: 6500, cls: 'dim',     text: '' },
    { delay: 6700, cls: 'info',    text: `→ Full test report: furkanbodur1995.github.io` },
  ];

  function mkLine(cls, text) {
    const d = document.createElement('div');
    d.className = `term-line term-out${cls ? ' ' + cls : ''}`;
    if (cls === 'dim' && !text) { d.innerHTML = '&nbsp;'; return d; }
    if (cls === 'dim' && text.startsWith('pytest')) {
      d.className = 'term-line term-prompt';
      d.innerHTML = `$ <span class="term-cmd">${text}</span>`;
      return d;
    }
    d.textContent = text;
    return d;
  }

  function runTests() {
    body.innerHTML = '';
    const cursor = document.createElement('div');
    cursor.className = 'term-cursor-line';
    cursor.innerHTML = '<span class="term-blink">█</span>';
    body.appendChild(cursor);

    TESTS.forEach(({ delay, cls, text }) => {
      setTimeout(() => {
        cursor.remove();
        body.appendChild(mkLine(cls, text));
        body.appendChild(cursor);
        body.scrollTop = body.scrollHeight;
      }, delay);
    });

    setTimeout(() => { cursor.remove(); }, TESTS[TESTS.length - 1].delay + 200);
  }

  btn.addEventListener('click', () => { overlay.classList.add('show'); runTests(); });
  closeBtn.addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('show'); });
})();


/* ────────────────────────────────────────
   19. RADAR CHART
──────────────────────────────────────── */
(function initRadar() {
  const svgEl     = document.getElementById('radarSvg');
  const gridEl    = document.getElementById('radarGrid');
  const areaEl    = document.getElementById('radarArea');
  const axesEl    = document.getElementById('radarAxes');
  const labelsEl  = document.getElementById('radarLabels');
  if (!svgEl) return;

  const CX = 150, CY = 150, R = 100;
  const LEVELS = 4;

  const axes = [
    { label: 'AI / LLM',    value: 95 },
    { label: 'QA Strategy', value: 90 },
    { label: 'Automation',  value: 88 },
    { label: 'DevOps',      value: 72 },
    { label: 'Security',    value: 68 },
    { label: 'Domain',      value: 82 },
  ];
  const N = axes.length;

  function polar(angle, r) {
    return {
      x: CX + r * Math.cos(angle - Math.PI / 2),
      y: CY + r * Math.sin(angle - Math.PI / 2),
    };
  }

  function polyPts(r) {
    return axes.map((_, i) => {
      const p = polar((2 * Math.PI * i) / N, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  // grid
  for (let l = 1; l <= LEVELS; l++) {
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', polyPts((R * l) / LEVELS));
    poly.classList.add('radar-grid-poly');
    gridEl.appendChild(poly);
  }

  // axes lines
  axes.forEach((_, i) => {
    const p = polar((2 * Math.PI * i) / N, R);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', CX); line.setAttribute('y1', CY);
    line.setAttribute('x2', p.x); line.setAttribute('y2', p.y);
    line.classList.add('radar-axis');
    line.setAttribute('data-radar-axis', i);
    axesEl.appendChild(line);
  });

  // labels
  axes.forEach((ax, i) => {
    const p = polar((2 * Math.PI * i) / N, R + 20);
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', p.x); txt.setAttribute('y', p.y + 4);
    txt.classList.add('radar-lbl');
    txt.setAttribute('data-radar-axis', i);
    txt.style.cursor = 'pointer';
    txt.textContent = ax.label;
    labelsEl.appendChild(txt);
  });

  // animate area on scroll into view
  function drawArea() {
    const pts = axes.map((ax, i) => {
      const p = polar((2 * Math.PI * i) / N, (ax.value / 100) * R);
      return `${p.x},${p.y}`;
    }).join(' ');
    areaEl.setAttribute('points', pts);
  }

  // start collapsed at center, then expand
  areaEl.setAttribute('points', polyPts(0));

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    setTimeout(drawArea, 200);
    obs.disconnect();
  }, { threshold: 0.3 });
  obs.observe(svgEl);
})();


/* ────────────────────────────────────────
   24. TEST RUN PANEL (scroll checklist)
──────────────────────────────────────── */
(function initTestRunPanel() {
  const panel    = document.getElementById('testRunPanel');
  const passedEl = document.getElementById('trPassed');
  const footer   = document.getElementById('trFooter');
  if (!panel) return;

  const ORDER      = ['about','experience','careermap','pipeline','project','skills'];
  const TOTAL      = ORDER.length;
  const PASS_DELAY = 480;
  let passed    = 0;
  let observing = false;
  let settled   = false;

  function getItem(id) {
    return panel.querySelector(`.tr-item[data-tr-section="${id}"]`);
  }
  function setStatus(item, status) {
    item.querySelector('.tr-status').setAttribute('data-status', status);
    item.setAttribute('data-state', status);
  }
  function onPass() {
    passed++;
    if (passedEl) passedEl.textContent = passed;
    if (passed === TOTAL && footer) showHireBtn();
  }

  const sectionObs = new IntersectionObserver(entries => {
    if (!settled) return;
    entries.forEach(entry => {
      const item = getItem(entry.target.id);
      if (!item) return;
      if (entry.target.id === 'about') return; // handled separately
      const already = item.querySelector('.tr-status').getAttribute('data-status') === 'pass';
      if (entry.isIntersecting && !already) {
        setStatus(item, 'running');
        setTimeout(() => { setStatus(item, 'pass'); onPass(); }, PASS_DELAY);
      }
    });
  }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });

  function startObserving() {
    if (observing) return;
    observing = true;

    // test_about: instantly running when panel appears, auto-passes after 900ms
    const aboutItem = getItem('about');
    if (aboutItem) {
      setStatus(aboutItem, 'running');
      setTimeout(() => { setStatus(aboutItem, 'pass'); onPass(); }, 900);
    }

    ORDER.filter(id => id !== 'about').forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObs.observe(el);
    });
    requestAnimationFrame(() => setTimeout(() => { settled = true; }, 80));
  }

  window.addEventListener('scroll', () => {
    if (!panel.classList.contains('visible')) panel.classList.add('visible');
    startObserving();
  }, { passive: true });

  /* ── HIRE ME button ── */
  function showHireBtn() {
    footer.innerHTML = '<button class="tr-hire-btn" id="trHireBtn">🎉 HIRE ME!</button>';
    document.getElementById('trHireBtn').addEventListener('click', () => {
      launchConfetti();
      openHireMail();
    });
  }

  function launchConfetti() {
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
    document.body.appendChild(cvs);
    cvs.width  = window.innerWidth;
    cvs.height = window.innerHeight;
    const ctx    = cvs.getContext('2d');
    const COLORS = ['#14b8a6','#4ade80','#facc15','#f87171','#818cf8','#fb923c','#38bdf8'];
    const parts  = [];

    [0.2, 0.5, 0.8].forEach(xRatio => {
      for (let i = 0; i < 55; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd   = 7 + Math.random() * 14;
        parts.push({
          x: cvs.width * xRatio, y: cvs.height * 0.65,
          vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 10,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          w: 5 + Math.random() * 7, h: 3 + Math.random() * 4,
          rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 14,
          gravity: 0.38, alpha: 1,
        });
      }
    });

    let frame = 0;
    const MAX = 150;
    (function draw() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      frame++;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        p.vy += p.gravity; p.vx *= 0.98;
        p.rot += p.rotV;
        p.alpha = Math.max(0, 1 - frame / MAX);
        if (p.alpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (frame < MAX) requestAnimationFrame(draw); else cvs.remove();
    })();
  }

  function openHireMail() {
    const to      = 'furkan.bodur1995@gmail.com';
    const subject = encodeURIComponent('RE: Your hire_criteria.py — all tests passed ✅');
    const _elapsedSec = Math.floor((Date.now() - _PAGE_START) / 1000);
    const _m = Math.floor(_elapsedSec / 60);
    const _s = _elapsedSec % 60;
    const elapsed = _m > 0 ? `${_m}m ${String(_s).padStart(2,'0')}s` : `${_s}s`;
    const body    = encodeURIComponent(
`Hi Furkan,

I just ran hire_criteria.py on your portfolio and all 6 tests passed.

PASSED  test_about
PASSED  test_experience
PASSED  test_roadmap
PASSED  test_ai_pipeline
PASSED  test_project
PASSED  test_skills

6 passed in ${elapsed}s — no warnings, no regressions.

Based on these results, I'd like to move forward with an interview.

When are you available?

Best,
[Your Name]`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }
})();


/* ────────────────────────────────────────
   25. TIME-TO-HIRE COUNTER
──────────────────────────────────────── */
(function initTimeToHire() {
  const timeEl = document.getElementById('trTime');
  if (!timeEl) return;

  const start = _PAGE_START;
  let shown = false;

  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  }

  function label(s) {
    if (s < 30)  return '👀 just arrived';
    if (s < 90)  return '🤔 reading carefully';
    if (s < 180) return '😮 seems interested';
    if (s < 360) return '🎯 seriously considering';
    return '🔥 this is it — send offer';
  }

  setInterval(() => {
    const elapsed = Date.now() - start;
    const s = Math.floor(elapsed / 1000);
    if (s < 10) return; // don't show immediately
    if (!shown) {
      shown = true;
      timeEl.style.display = 'block';
    }
    timeEl.innerHTML = `⏱ ${fmt(elapsed)} — ${label(s)}`;
  }, 1000);
})();


/* ────────────────────────────────────────
   26. RADAR CHART INTERACTIVE HOVER
──────────────────────────────────────── */
(function initRadarHover() {
  const svg = document.getElementById('radarSvg');
  if (!svg) return;
  // skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const SKILLS = [
    { label: 'AI & LLM',    val: 95, tags: ['MCP','RAG','pgvector','LLM APIs'] },
    { label: 'QA Strategy', val: 90, tags: ['ISTQB×3','Risk-based','Exploratory'] },
    { label: 'Automation',  val: 88, tags: ['Playwright','Selenium','pytest','BDD'] },
    { label: 'CI/CD',       val: 72, tags: ['Jenkins','GitLab','Docker','SQL'] },
    { label: 'Security',    val: 68, tags: ['Postman','SoapUI','RBAC','API sec'] },
    { label: 'Domain',      val: 82, tags: ['UAV Systems','Aerospace QA','ERP'] },
  ];

  const tip = document.createElement('div');
  tip.style.cssText = `
    position:fixed;background:var(--bg2);border:1px solid var(--teal-border);
    border-radius:8px;padding:.5rem .8rem;font-size:.72rem;color:var(--txt);
    pointer-events:none;opacity:0;transition:opacity .15s;z-index:500;
    font-family:'JetBrains Mono',monospace;white-space:nowrap;
    box-shadow:0 8px 24px rgba(0,0,0,.4);line-height:1.6;
  `;
  document.body.appendChild(tip);

  function showTip(e, skill) {
    tip.innerHTML = `<strong style="color:var(--teal-light)">${skill.label}</strong> <span style="color:var(--txt3)">· ${skill.val}/100</span><br><span style="color:var(--txt2)">${skill.tags.join(' · ')}</span>`;
    tip.style.opacity = '1';
    moveTip(e);
  }
  function moveTip(e) {
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = e.clientX + 16, y = e.clientY - 10;
    if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - 12;
    if (y + th > window.innerHeight - 8) y = e.clientY - th - 6;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }
  function hideTip() { tip.style.opacity = '0'; }

  function attachHover() {
    // axes lines + labels both carry data-radar-axis
    const els = svg.querySelectorAll('[data-radar-axis]');
    els.forEach(el => {
      const idx   = parseInt(el.getAttribute('data-radar-axis'), 10);
      const skill = SKILLS[idx];
      if (!skill) return;
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', e => showTip(e, skill));
      el.addEventListener('mousemove',  e => moveTip(e));
      el.addEventListener('mouseleave', hideTip);
    });
  }

  // Radar draws lazily on scroll. Poll until elements appear (max 10s).
  let tries = 0;
  const poll = setInterval(() => {
    if (svg.querySelectorAll('[data-radar-axis]').length > 0) {
      clearInterval(poll);
      attachHover();
    }
    if (++tries > 100) clearInterval(poll);
  }, 100);
})();


/* ────────────────────────────────────────
   27. MOBILE SWIPE SECTION NAV
──────────────────────────────────────── */
(function initSwipeNav() {
  if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) return; // touch only

  const SECTIONS = ['about','experience','careermap','pipeline','project','skills'];
  let startY = 0, startX = 0;

  document.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dy = startY - e.changedTouches[0].clientY;
    const dx = Math.abs(startX - e.changedTouches[0].clientX);
    if (Math.abs(dy) < 60 || dx > 40) return; // not a vertical swipe

    let curIdx = 0;
    for (let i = 0; i < SECTIONS.length; i++) {
      const el = document.getElementById(SECTIONS[i]);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) curIdx = i;
    }

    const next = dy > 0
      ? Math.min(curIdx + 1, SECTIONS.length - 1)
      : Math.max(curIdx - 1, 0);

    const target = document.getElementById(SECTIONS[next]);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }, { passive: true });
})();


/* ────────────────────────────────────────
   29. BUG CATCHER — Interactive background game
──────────────────────────────────────── */
(function initBugCatcher() {
  if (window.matchMedia('(max-width: 820px)').matches) return;      // skip mobile
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── config ── */
  const SPAWN_INTERVAL   = 4500;   // ms between bug spawns
  const MAX_BUGS         = 6;      // max alive bugs
  const CHAR_SPEED       = 2.2;    // px per frame (base)
  const BUG_SPEED        = 0.6;    // px per frame (wander)
  const CATCH_RADIUS     = 28;     // px to count as caught
  const BUG_EMOJIS       = ['🐛','🪲','🐜','🦗','🕷️'];
  const BUG_NAMES = [
    'NullPointerException', 'IndexOutOfBounds', 'Race Condition',
    'Off-By-One Error', 'Memory Leak', 'Infinite Loop',
    'Unhandled Promise', 'Segfault', 'Stack Overflow',
    'Type Mismatch', 'Deadlock', 'Heisenbug',
    'CSS Z-Index War', 'undefined is not a function',
    'Works On My Machine™', 'Forgot to git pull',
    'Missing Semicolon', 'CORS Error', 'Div Not Centered',
  ];
  const TITLES = [
    [0,  'Junior Bug Squasher'],
    [5,  'Bug Hunter'],
    [12, 'Senior Exterminator'],
    [20, 'Principal Debugger'],
    [35, 'Staff Bug Whisperer'],
    [50, 'VP of Bug Annihilation'],
  ];

  /* ── state ── */
  let bugs     = [];
  let caught   = 0;
  let charX    = window.innerWidth / 2;
  let charY    = window.innerHeight / 2;
  let targetBug = null;
  let idle     = true;
  let idleAngle = 0;

  /* ── DOM: container ── */
  const container = document.createElement('div');
  container.id = 'bugCatcherLayer';
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden;';
  document.body.appendChild(container);

  /* ── DOM: character ── */
  const charEl = document.createElement('div');
  charEl.className = 'bc-char';
  charEl.innerHTML = '<span class="bc-char-text">FB</span><span class="bc-char-net">🪤</span>';
  container.appendChild(charEl);
  updateCharPos();

  /* ── DOM: counter panel ── */
  const counter = document.createElement('div');
  counter.className = 'bc-counter';
  counter.innerHTML = '<span class="bc-counter-icon">🪲</span><span class="bc-counter-num">×0</span><span class="bc-counter-title">Junior Bug Squasher</span>';
  document.body.appendChild(counter);

  /* ── helpers ── */
  function rand(a, b) { return a + Math.random() * (b - a); }

  function getTitle() {
    let t = TITLES[0][1];
    for (const [min, label] of TITLES) { if (caught >= min) t = label; }
    return t;
  }

  function getSpeed() {
    return CHAR_SPEED + Math.floor(caught / 8) * 0.3;  // gets faster
  }

  function updateCharPos() {
    charEl.style.transform = `translate(${charX}px, ${charY}px)`;
  }

  function spawnBug() {
    if (bugs.length >= MAX_BUGS) return;

    const bug = document.createElement('div');
    bug.className = 'bc-bug';
    bug.textContent = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];

    // spawn from a random edge
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = rand(0, window.innerWidth); y = -30; }          // top
    else if (edge === 1) { x = window.innerWidth + 30; y = rand(0, window.innerHeight); } // right
    else if (edge === 2) { x = rand(0, window.innerWidth); y = window.innerHeight + 30; }  // bottom
    else { x = -30; y = rand(0, window.innerHeight); }                     // left

    const bugData = {
      el: bug, x, y,
      vx: rand(-BUG_SPEED, BUG_SPEED),
      vy: rand(-BUG_SPEED, BUG_SPEED),
      wobble: rand(0, Math.PI * 2),
      name: BUG_NAMES[Math.floor(Math.random() * BUG_NAMES.length)],
    };

    bug.style.transform = `translate(${x}px, ${y}px)`;
    container.appendChild(bug);
    bugs.push(bugData);
  }

  function removeBug(bugData) {
    bugs = bugs.filter(b => b !== bugData);
    bugData.el.remove();
  }

  function showCatchEffect(x, y, name) {
    // pop particle
    const pop = document.createElement('div');
    pop.className = 'bc-pop';
    pop.textContent = '💥';
    pop.style.cssText = `left:${x}px;top:${y}px;`;
    container.appendChild(pop);
    setTimeout(() => pop.remove(), 600);

    // label
    const label = document.createElement('div');
    label.className = 'bc-label';
    label.textContent = name;
    label.style.cssText = `left:${x}px;top:${y - 20}px;`;
    container.appendChild(label);
    setTimeout(() => label.remove(), 1800);

    // +1 indicator
    const plus = document.createElement('div');
    plus.className = 'bc-plus';
    plus.textContent = '+1';
    plus.style.cssText = `left:${x + 15}px;top:${y - 10}px;`;
    container.appendChild(plus);
    setTimeout(() => plus.remove(), 900);
  }

  function updateCounter() {
    counter.querySelector('.bc-counter-num').textContent = `×${caught}`;
    counter.querySelector('.bc-counter-title').textContent = getTitle();
    counter.classList.add('bc-counter-bump');
    setTimeout(() => counter.classList.remove('bc-counter-bump'), 300);
  }

  /* ── game loop ── */
  function tick() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // move bugs (wander)
    for (const b of bugs) {
      b.wobble += 0.03;
      b.vx += Math.sin(b.wobble) * 0.04;
      b.vy += Math.cos(b.wobble * 0.7) * 0.04;
      // clamp speed
      const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (spd > BUG_SPEED * 1.5) { b.vx *= 0.95; b.vy *= 0.95; }
      // keep in bounds (softly)
      if (b.x < 20) b.vx += 0.1;
      if (b.x > W - 20) b.vx -= 0.1;
      if (b.y < 20) b.vy += 0.1;
      if (b.y > H - 20) b.vy -= 0.1;

      b.x += b.vx;
      b.y += b.vy;
      b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${Math.atan2(b.vy, b.vx) * 180 / Math.PI}deg)`;
    }

    // find nearest bug
    let nearest = null;
    let nearDist = Infinity;
    for (const b of bugs) {
      const dx = b.x - charX;
      const dy = b.y - charY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearDist) { nearDist = dist; nearest = b; }
    }

    if (nearest) {
      idle = false;
      targetBug = nearest;
      const dx = nearest.x - charX;
      const dy = nearest.y - charY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = getSpeed();

      if (dist > speed) {
        charX += (dx / dist) * speed;
        charY += (dy / dist) * speed;
      }

      // flip character toward bug
      charEl.classList.toggle('bc-char-flip', dx < 0);

      // catch!
      if (dist < CATCH_RADIUS) {
        caught++;
        showCatchEffect(nearest.x, nearest.y, nearest.name);
        removeBug(nearest);
        targetBug = null;
        updateCounter();
        // net swing animation
        charEl.classList.add('bc-swing');
        setTimeout(() => charEl.classList.remove('bc-swing'), 400);
      }
    } else {
      // idle: wander slowly
      idle = true;
      idleAngle += 0.008;
      charX += Math.cos(idleAngle) * 0.3;
      charY += Math.sin(idleAngle * 0.6) * 0.3;
      // keep in bounds
      charX = Math.max(30, Math.min(W - 30, charX));
      charY = Math.max(30, Math.min(H - 30, charY));
    }

    charEl.classList.toggle('bc-char-idle', idle);
    updateCharPos();
    requestAnimationFrame(tick);
  }

  /* ── start ── */
  // initial delay so page loads calmly first
  setTimeout(() => {
    spawnBug();
    requestAnimationFrame(tick);
    setInterval(spawnBug, SPAWN_INTERVAL);
  }, 6000);
})();
