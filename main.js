/* ══════════════════════════════════════════
   FURKAN BODUR — main.js
   All interactive behavior & animations
   ══════════════════════════════════════════ */

'use strict';

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
   5. CANVAS PARTICLE NETWORK (hero)
──────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const isMobile = () => window.innerWidth <= 820;
  const COUNT    = () => isMobile() ? 40 : 80;
  const LINK_DIST    = 140;   // particle-to-particle link
  const MOUSE_DIST   = 180;   // mouse repulsion radius
  const MOUSE_LINK   = 220;   // mouse-to-particle beam radius
  const REPEL_FORCE  = 2.8;

  // live mouse position relative to canvas
  let mx = -9999, my = -9999;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', () => { resize(); init(); });
  resize();

  function mkParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = .15 + Math.random() * .20;
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      ox: 0, oy: 0,          // offset from mouse repulsion
      r: 1.4 + Math.random() * 1.3
    };
  }

  function init() { particles = Array.from({ length: COUNT() }, mkParticle); }
  init();

  let raf;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const teal = getComputedStyle(html).getPropertyValue('--teal-light').trim() || '#14b8a6';

    // update positions
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    }

    // particle-to-particle links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = teal + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    // mouse interaction
    const hasMouse = mx > 0 && my > 0;
    if (hasMouse) {
      for (const p of particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);

        // repulsion — push particles away
        if (d < MOUSE_DIST && d > 0.1) {
          const force = (1 - d / MOUSE_DIST) * REPEL_FORCE;
          p.vx += (dx / d) * force * 0.04;
          p.vy += (dy / d) * force * 0.04;
          // clamp speed
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 3) { p.vx = p.vx / spd * 3; p.vy = p.vy / spd * 3; }
        }

        // bright beam from cursor to nearby particles
        if (d < MOUSE_LINK) {
          const alpha = (1 - d / MOUSE_LINK) * 0.55;
          const hex   = Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = teal + hex;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }

      // cursor glow dot
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 40);
      grad.addColorStop(0, teal + '44');
      grad.addColorStop(1, teal + '00');
      ctx.beginPath();
      ctx.arc(mx, my, 40, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // small center dot
      ctx.beginPath();
      ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = teal + 'cc';
      ctx.fill();
    }

    // draw particle dots (on top)
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = teal + 'aa';
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  // Only run when hero is visible
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      resize(); init(); draw();
    } else {
      cancelAnimationFrame(raf);
    }
  });
  io.observe(canvas);
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
  const sections = ['about','careermap','experience','pipeline','project','skills'];
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
    runBtn.disabled = false;
  }

  function runDemo() {
    runBtn.disabled = true;
    triggerEl.classList.add('sent');
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
    axesEl.appendChild(line);
  });

  // labels
  axes.forEach((ax, i) => {
    const p = polar((2 * Math.PI * i) / N, R + 20);
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', p.x); txt.setAttribute('y', p.y + 4);
    txt.classList.add('radar-lbl');
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
