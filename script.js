(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

  /* ================= ABERTURA ================= */

  const TIMING = {
    appear: 200,
    meet: 1000,
    united: 2800,
    title: 3000,
    ready: 4600
  };

  const FADE = reduceMotion ? 0 : 900;
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty('--fade', `${FADE}ms`);
  rootStyle.setProperty('--appear-dur', `${TIMING.meet - TIMING.appear - 300}ms`);
  rootStyle.setProperty('--meet-dur', `${TIMING.united - TIMING.meet}ms`);

  /* ================= UTILIDADES ================= */

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeHeart(color) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', HEART_PATH);
    path.setAttribute('fill', color);
    svg.appendChild(path);

    return svg;
  }

  let lastLiveText = '';
  let lastLiveAt = 0;
  let liveTimer = 0;

  function announce(text) {
    const live = $('live');
    const now = Date.now();

    if (!live || (text === lastLiveText && now - lastLiveAt < 2000)) return;

    lastLiveText = text;
    lastLiveAt = now;
    live.textContent = '';

    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      live.textContent = text;
    }, 80);
  }

  /* ================= CAMPO DE ESTRELAS ================= */

  function createStarfield(canvas) {
    const ctx = canvas.getContext && canvas.getContext('2d');

    if (!ctx) {
      canvas.hidden = true;
      return { boost() {} };
    }

    const COLORS = ['248,250,252', '196,181,253', '147,197,253'];

    let width = 0, height = 0, stars = [];
    let energy = 1, target = 1, boostTimer = 0;
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(90, (width * height) / 9000));

      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * 6.28,
        speed: Math.random() * 0.6 + 0.2,
        drift: Math.random() * 0.1 + 0.02,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));

      if (reduceMotion) draw(0);
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      energy += (target - energy) * 0.04;

      for (const s of stars) {
        const twinkle = reduceMotion
          ? 0.7
          : 0.5 + 0.5 * Math.sin((time / 1000) * s.speed + s.phase);

        const alpha = Math.min((0.3 + 0.7 * twinkle) * energy * 0.8, 1);

        ctx.fillStyle = `rgba(${s.color},${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (!reduceMotion) {
          s.y -= s.drift * energy;

          if (s.y < -2) {
            s.y = height + 2;
            s.x = Math.random() * width;
          }
        }
      }
    }

    function loop(time) {
      raf = 0;
      draw(time);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    }

    const start = () => {
      if (!raf && !reduceMotion) raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();

    let lastWidth = window.innerWidth;

    window.addEventListener('resize', () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        resize();
      }
    });

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    start();

    return {
      boost() {
        target = 2.2;
        clearTimeout(boostTimer);
        boostTimer = setTimeout(() => {
          target = 1;
        }, 1400);
      }
    };
  }

  /* ================= EXPLOSÃO DE CORAÇÕES ================= */

  function clearBurst() {
    const layer = $('burst');
    if (layer) layer.replaceChildren();
  }

  function burstHearts(origin, count = 26) {
    const layer = $('burst');

    if (reduceMotion || !layer || !layer.animate || layer.childElementCount > 60) return;

    const range = Math.min(window.innerWidth, window.innerHeight);

    for (let i = 0; i < count; i++) {
      const size = 12 + Math.random() * 16;
      const heart = makeHeart(i % 2 ? '#3B82F6' : '#8B5CF6');

      heart.classList.add('burst__heart');
      heart.style.cssText = `width:${size}px;height:${size}px;left:${origin.x - size / 2}px;top:${origin.y - size / 2}px`;

      layer.appendChild(heart);

      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * range * 0.4;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 120;

      const anim = heart.animate([
        {
          transform: 'translate(0,0) scale(.3) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translate(${dx}px,${dy}px) scale(1) rotate(${rot}deg)`,
          opacity: 1,
          offset: 0.7
        },
        {
          transform: `translate(${dx * 1.1}px,${dy * 1.1 + 30}px) scale(.8) rotate(${rot * 1.2}deg)`,
          opacity: 0
        }
      ], {
        duration: 1400 + Math.random() * 500,
        easing: 'cubic-bezier(.2,.7,.3,1)',
        fill: 'forwards'
      });

      anim.onfinish = () => heart.remove();
    }
  }

  /* ================= GERENCIADOR DE CENAS ================= */

  const scenes = {};

  document.querySelectorAll('[data-scene]').forEach((node) => {
    scenes[node.dataset.scene] = node;
  });

  let currentScene = 'opening';
  let transitioning = false;

  function initScenes() {
    Object.entries(scenes).forEach(([name, node]) => {
      if (name !== currentScene) node.inert = true;
    });

    requestAnimationFrame(() => {
      scenes[currentScene].classList.add('is-active');
    });
  }

  async function showScene(name) {
    if (transitioning || name === currentScene || !scenes[name]) return;

    transitioning = true;

    const from = scenes[currentScene];
    const to = scenes[name];

    from.inert = true;
    from.classList.remove('is-active');

    await wait(FADE);

    from.hidden = true;
    clearBurst();

    to.hidden = false;
    to.inert = false;

    window.scrollTo(0, 0);
    void to.offsetWidth;

    to.classList.add('is-active');

    const focusTarget = to.querySelector('[data-focus]');

    if (focusTarget) {
      focusTarget.focus({ preventScroll: true });
    }

    currentScene = name;
    transitioning = false;
  }

  /* ================= ETAPA 1: ABERTURA ================= */

  function playOpening(scene) {
    const stages = {
      appear: 'is-appear',
      meet: 'is-meet',
      united: 'is-united',
      title: 'is-title',
      ready: 'is-ready'
    };

    if (reduceMotion) {
      scene.classList.add(...Object.values(stages));
      return;
    }

    Object.entries(stages).forEach(([key, cls]) => {
      setTimeout(() => scene.classList.add(cls), TIMING[key]);
    });
  }

  function setupStartButton(starfield) {
    const button = $('start-btn');
    let started = false;

    button.addEventListener('click', () => {
      if (started) return;

      started = true;
      button.disabled = true;

      starfield.boost();
      showScene('question');
    });
  }

  /* ================= ETAPA 2: PERGUNTA ================= */

  const NO_HINTS = [
    'Opa, esse botão não funciona! 😂',
    'Tem certeza disso, Ana? 👀',
    'Acho melhor tentar o outro botão... 💜',
    'Não adianta fugir do destino! ❤️',
    'Esse botão é mais tímido que eu! 😂'
  ];

  const YES_REPLY = 'Eu sabia! E escolheria você em todas as versões da minha vida. 💙💜';
  const FLEE_GAP = 420;

  function setupQuestion(starfield) {
    const yes = $('yes-btn');
    const no = $('no-btn');
    const arena = $('choices');
    const slot = $('slot');
    const hint = $('hint');
    const reply = $('reply');

    let answered = false;
    let lastFlee = 0;
    let guardUntil = 0;
    let hintIndex = 0;
    let tx = 0;
    let ty = 0;

    function showHint(text) {
      hint.textContent = text;
      hint.classList.remove('is-show');
      void hint.offsetWidth;
      hint.classList.add('is-show');
    }

    const nextHint = () => NO_HINTS[hintIndex++ % NO_HINTS.length];

    function pickTarget(ref) {
      const a = arena.getBoundingClientRect();
      const w = no.offsetWidth;
      const h = no.offsetHeight;
      const m = 8;
      const pad = 16;

      const minX = Math.max(0, m - a.left);
      const maxX = Math.min(arena.clientWidth, window.innerWidth - m - a.left) - w;
      const minY = Math.max(0, m - a.top);
      const maxY = Math.min(arena.clientHeight, window.innerHeight - m - a.top) - h;

      if (maxX < minX || maxY < minY) return null;

      const yl = yes.offsetLeft - pad;
      const yr = yes.offsetLeft + yes.offsetWidth + pad;
      const yt = yes.offsetTop - pad;
      const yb = yes.offsetTop + yes.offsetHeight + pad;

      const from = ref
        ? { x: ref.x - a.left, y: ref.y - a.top }
        : { x: no.offsetLeft + tx + w / 2, y: no.offsetTop + ty + h / 2 };

      const candidates = [];

      for (let i = 0; i < 60; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);

        if (x < yr && x + w > yl && y < yb && y + h > yt) continue;

        candidates.push({
          x,
          y,
          d: Math.hypot(x + w / 2 - from.x, y + h / 2 - from.y)
        });
      }

      if (!candidates.length) return null;

      candidates.sort((p, q) => q.d - p.d);

      const pick = candidates[Math.floor(Math.random() * Math.min(4, candidates.length))];

      return {
        x: pick.x - no.offsetLeft,
        y: pick.y - no.offsetTop
      };
    }

    function flee(ref) {
      const now = performance.now();

      if (answered || now - lastFlee < FLEE_GAP) return;
      if (getComputedStyle(arena).transform !== 'none') return;

      lastFlee = now;

      const target = pickTarget(ref);

      tx = target ? target.x : 0;
      ty = target ? target.y : 0;

      no.style.transform = tx || ty ? `translate(${tx}px, ${ty}px)` : '';

      showHint(nextHint());
    }

    no.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      guardUntil = performance.now() + 700;
      flee({ x: e.clientX, y: e.clientY });
    });

    arena.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || answered) return;

      const r = no.getBoundingClientRect();

      const dist = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2)
      );

      if (dist < 80) flee({ x: e.clientX, y: e.clientY });
    });

    no.addEventListener('click', (e) => {
      e.preventDefault();

      if (performance.now() < guardUntil || answered) return;

      showHint(NO_HINTS[2]);
      announce('O botão Não é brincalhão. Use o botão SIM para continuar.');
    });

    let resizeTimer = 0;

    const resetNo = () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        if (!answered) {
          tx = 0;
          ty = 0;
          no.style.transform = '';
        }
      }, 150);
    };

    window.addEventListener('resize', resetNo);
    window.addEventListener('orientationchange', resetNo);

    yes.addEventListener('click', async () => {
      if (answered) return;

      answered = true;
      yes.disabled = true;
      no.disabled = true;

      const r = yes.getBoundingClientRect();

      arena.classList.add('is-answered');
      starfield.boost();

      burstHearts({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
      });

      reply.textContent = YES_REPLY;
      slot.classList.add('is-replied');

      announce(YES_REPLY);

      await wait(reduceMotion ? 1800 : 3200);

      showScene('memories');
    });
  }

  /* ================= ETAPA 3: MUSEU ================= */

  const MEMORIES = [
    {
      id: 1,
      image: 'imagens/foto1.jpg',
      title: 'Nosso primeiro registro juntos',
      subtitle: '',
      message: 'Talvez a gente não imaginasse quantas lembranças ainda viveríamos. Mas hoje, olhando para essa foto, vejo o começo de uma coleção de momentos que eu quero guardar para sempre.'
    },
    {
      id: 2,
      image: 'imagens/foto2.jpg',
      title: 'Nossa primeira foto namorando',
      subtitle: 'O dia em que assumimos nosso amor na internet.',
      message: 'Foi o dia em que deixamos o mundo saber de algo que já era tão especial para nós. E eu teria orgulho de escolher você publicamente mais um milhão de vezes.'
    },
    {
      id: 3,
      image: 'imagens/foto3.jpg',
      title: 'Os olhos que me encantam',
      subtitle: '',
      message: 'Tem alguma coisa nos seus olhos que eu nunca vou conseguir explicar direito. Eu poderia olhar para eles mil vezes e, ainda assim, encontrar um novo motivo para me apaixonar.'
    },
    {
      id: 4,
      image: 'imagens/foto4.jpg',
      title: 'Nosso primeiro ano de namoro',
      subtitle: '',
      message: 'Um ano de nós. De risadas, aprendizados, carinho e momentos que construíram a nossa história. E pensar que esse foi apenas o primeiro capítulo de tantos que ainda quero viver com você.'
    },
    {
      id: 5,
      image: 'imagens/foto5.jpg',
      title: 'Nossa primeira virada de ano juntos',
      subtitle: '',
      message: 'Entre tantas coisas que eu poderia desejar para um novo ano, uma das mais importantes era continuar tendo você ao meu lado. Que venham muitas outras viradas, sempre com a gente escolhendo ficar juntos.'
    },
    {
      id: 6,
      image: 'imagens/foto6.jpg',
      title: 'Nosso amor virou arte',
      subtitle: 'O date do nosso quadro pintado com as mãos.',
      message: 'Naquele dia, a gente não pintou apenas um quadro. A gente transformou um momento nosso em algo que podemos guardar e olhar sempre que quisermos lembrar. Você transforma momentos simples em lembranças que eu nunca quero perder.',
      featured: true
    }
  ];

  const FINAL_MESSAGE = 'Seis lembranças, infinitos motivos para continuar criando novas histórias com você. 💙💜';
  const pad = (n) => String(n).padStart(2, '0');

  function createPhoto(memory, eager) {
    const wrap = el('span', 'photo');
    const ph = el('span', 'photo__ph');

    ph.setAttribute('aria-hidden', 'true');
    ph.append(makeHeart('#C4B5FD'), el('span', '', pad(memory.id)));

    wrap.appendChild(ph);

    const img = new Image();

    img.alt = memory.title;
    img.decoding = 'async';
    img.loading = eager ? 'eager' : 'lazy';

    img.addEventListener('load', () => wrap.classList.add('is-loaded'));
    img.addEventListener('error', () => img.remove());

    img.src = memory.image;

    wrap.appendChild(img);

    return wrap;
  }

  function setupMuseum(starfield, startQuiz) {
    const gallery = $('gallery');
    const dialog = $('memory-dialog');
    const inner = $('modal-inner');
    const media = $('modal-media');
    const numEl = $('modal-num');
    const titleEl = $('modal-title');
    const subEl = $('modal-sub');
    const msgEl = $('modal-msg');
    const closeBtn = $('modal-close');
    const counterN = $('counter-n');
    const fill = $('progress-fill');
    const finale = $('finale');
    const finaleBtn = $('finale-btn');

    const discovered = new Set();
    const frames = new Map();

    let unlocked = false;
    let lastFrame = null;

    $('counter-total').textContent = String(MEMORIES.length);

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 })
      : null;

    MEMORIES.forEach((memory, index) => {
      const item = el(
        'li',
        `gallery__item${memory.featured ? ' gallery__item--featured' : ''}`
      );

      const btn = el(
        'button',
        `frame${memory.featured ? ' frame--featured' : ''}`
      );

      btn.type = 'button';
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.style.setProperty('--i', String(index % 3));

      const mat = el('span', 'frame__mat');
      mat.appendChild(createPhoto(memory, false));

      const num = el('span', 'frame__num', pad(memory.id));
      num.setAttribute('aria-hidden', 'true');

      const seen = el('span', 'sr-only');

      btn.append(
        mat,
        num,
        el('span', 'frame__title', memory.title),
        seen
      );

      btn.addEventListener('click', () => openMemory(memory, btn));

      item.appendChild(btn);
      gallery.appendChild(item);

      frames.set(memory.id, { btn, seen });

      if (observer) {
        observer.observe(btn);
      } else {
        btn.classList.add('is-visible');
      }
    });

    function fillModal(memory) {
      media.replaceChildren(createPhoto(memory, true));

      numEl.textContent = `Memória ${pad(memory.id)}`;
      titleEl.textContent = memory.title;
      subEl.textContent = memory.subtitle || '';
      subEl.hidden = !memory.subtitle;
      msgEl.textContent = memory.message;

      dialog.classList.toggle('modal--featured', Boolean(memory.featured));

      inner.scrollTop = 0;
    }

    function openMemory(memory, btn) {
      if (dialog.open) return;

      lastFrame = btn;
      fillModal(memory);

      document.documentElement.classList.add('is-locked');

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }

      markDiscovered(memory);
    }

    function hideDialog() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        handleClosed();
      }
    }

    function handleClosed() {
      document.documentElement.classList.remove('is-locked');
      media.replaceChildren();

      if (lastFrame) {
        lastFrame.focus({ preventScroll: true });
      }

      if (!unlocked && discovered.size === MEMORIES.length) {
        unlockSurprise();
      }
    }

    closeBtn.addEventListener('click', hideDialog);

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) hideDialog();
    });

    dialog.addEventListener('close', handleClosed);

    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Escape' &&
        dialog.open &&
        typeof dialog.showModal !== 'function'
      ) {
        hideDialog();
      }
    });

    function markDiscovered(memory) {
      if (discovered.has(memory.id)) return;

      discovered.add(memory.id);

      counterN.textContent = String(discovered.size);
      counterN.classList.remove('is-bump');
      void counterN.offsetWidth;
      counterN.classList.add('is-bump');

      fill.style.setProperty('--p', String(discovered.size / MEMORIES.length));

      const frame = frames.get(memory.id);

      frame.btn.classList.add('is-seen');
      frame.seen.textContent = ' (já descoberta)';
    }

    function unlockSurprise() {
      unlocked = true;
      finale.hidden = false;
      finaleBtn.disabled = false;

      void finale.offsetWidth;
      finale.classList.add('is-open');

      finale.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center'
      });

      starfield.boost();

      burstHearts({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }, 18);

      announce(FINAL_MESSAGE);
    }

    finaleBtn.addEventListener('click', () => {
      if (finaleBtn.disabled) return;

      finaleBtn.disabled = true;
      starfield.boost();
      startQuiz();
    });
  }

  /* ================= ETAPA 4: QUIZ ================= */

  const QUIZ = [
    {
      question: 'Quando foi que nós conversamos um com o outro pela primeira vez?',
      options: [
        '03/03/2024',
        '13/03/2024',
        '03/04/2024',
        '23/03/2024'
      ],
      correct: 0,
      message: 'Foi aqui que a nossa história começou. 💙💜'
    },
    {
      question: 'Em que dia e mês comemoramos nosso aniversário de namoro?',
      options: [
        '13/11',
        '13/12',
        '12/12',
        '13/01'
      ],
      correct: 1,
      message: '13 de dezembro. Uma data que merece ser comemorada todos os anos, porque celebrar nosso amor nunca perde a importância. ❤️'
    },
    {
      question: 'Quando eu te pedi em namoro?',
      options: [
        '13/03/2025',
        '15/02/2025',
        '15/03/2025',
        '25/03/2025'
      ],
      correct: 2,
      message: 'O dia em que te fiz uma pergunta que mudou a minha vida. 💍'
    }
  ];

  const LETTERS = ['A', 'B', 'C', 'D'];

  function setupQuiz(starfield) {
    const card = $('quiz-card');
    const progress = $('quiz-progress');
    const dots = Array.from(document.querySelectorAll('.quiz__dot'));
    const questionEl = $('quiz-question');
    const optionsEl = $('quiz-options');
    const feedback = $('quiz-feedback');
    const verdict = $('quiz-verdict');
    const message = $('quiz-message');
    const nextBtn = $('quiz-next');
    const scoreEl = $('result-score');
    const replayBtn = $('replay-btn');
    const continueBtn = $('continue-btn');

    let index = 0;
    let score = 0;
    let answered = false;
    let busy = false;
    let focusTimer = 0;

    function render() {
      const q = QUIZ[index];

      answered = false;
      progress.textContent = `Pergunta ${index + 1} de ${QUIZ.length}`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('is-on', i <= index);
      });

      questionEl.textContent = q.question;

      optionsEl.replaceChildren(...q.options.map((text, i) => {
        const btn = el('button', 'quiz__opt');
        btn.type = 'button';

        const letter = el('span', 'quiz__letter', LETTERS[i]);
        letter.setAttribute('aria-hidden', 'true');

        btn.append(
          letter,
          el('span', 'quiz__text', text),
          el('span', 'sr-only')
        );

        btn.addEventListener('click', () => answer(i, btn));

        return btn;
      }));

      feedback.classList.remove('is-shown');
      feedback.setAttribute('aria-hidden', 'true');

      verdict.textContent = '';
      message.textContent = '';

      nextBtn.classList.remove('is-visible');
      nextBtn.disabled = true;

      nextBtn.textContent = index === QUIZ.length - 1
        ? 'Ver resultado ❤️'
        : 'Próxima pergunta →';
    }

    function answer(choice, btn) {
      if (answered || busy) return;

      answered = true;

      const q = QUIZ[index];
      const correct = choice === q.correct;

      if (correct) score += 1;

      const buttons = Array.from(optionsEl.children);

      buttons.forEach((b) => {
        b.disabled = true;
      });

      const right = buttons[q.correct];

      right.classList.add('is-correct');
      right.lastChild.textContent = ' (resposta correta)';

      if (!correct) {
        btn.classList.add('is-wrong');
        btn.lastChild.textContent = ' (sua resposta, incorreta)';
      }

      verdict.textContent = correct
        ? 'Acertou! 💙'
        : 'Quase! A resposta certa está destacada.';

      message.textContent = q.message;

      feedback.classList.add('is-shown');
      feedback.setAttribute('aria-hidden', 'false');

      if (correct) {
        const r = btn.getBoundingClientRect();

        starfield.boost();

        burstHearts({
          x: r.left + r.width / 2,
          y: r.top + r.height / 2
        }, 14);
      }

      nextBtn.disabled = false;
      nextBtn.classList.add('is-visible');

      announce(
        `${correct ? 'Resposta correta.' : `Resposta incorreta. A correta era ${q.options[q.correct]}.`} ${q.message}`
      );

      clearTimeout(focusTimer);

      focusTimer = setTimeout(() => {
        if (answered) nextBtn.focus({ preventScroll: true });
      }, reduceMotion ? 200 : 900);
    }

    async function finish() {
      scoreEl.textContent = `Você acertou ${score} de ${QUIZ.length}!`;

      replayBtn.disabled = false;
      continueBtn.disabled = false;

      await showScene('quizend');
      await wait(reduceMotion ? 0 : 500);

      if (currentScene !== 'quizend') return;

      const r = scoreEl.getBoundingClientRect();

      starfield.boost();

      burstHearts({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
      }, 20);
    }

    nextBtn.addEventListener('click', async () => {
      if (!answered || busy) return;

      busy = true;
      nextBtn.disabled = true;

      clearTimeout(focusTimer);

      if (index === QUIZ.length - 1) {
        await finish();
        busy = false;
        return;
      }

      card.classList.add('is-swapping');

      await wait(reduceMotion ? 0 : 350);

      index += 1;
      render();

      card.classList.remove('is-swapping');
      questionEl.focus({ preventScroll: true });

      busy = false;
    });

    function reset() {
      clearTimeout(focusTimer);

      index = 0;
      score = 0;
      busy = false;

      card.classList.remove('is-swapping');

      render();
    }

    replayBtn.addEventListener('click', () => {
      if (replayBtn.disabled) return;

      replayBtn.disabled = true;
      continueBtn.disabled = true;

      reset();
      showScene('game');
    });

    continueBtn.addEventListener('click', () => {
      if (continueBtn.disabled) return;

      replayBtn.disabled = true;
      continueBtn.disabled = true;

      starfield.boost();
      showScene('stage5');
    });

    reset();

    return {
      start() {
        reset();
        return showScene('game');
      }
    };
  }

  /* ================= ETAPA 5: QUEM É MAIS PROVÁVEL ================= */

  function setupCoupleGame(starfield) {
    const questions = [
      'Quem é mais provável de sentir ciúmes por uma besteirinha? 👀',
      'Quem é mais provável de ficar emburrado e depois querer carinho? 😂',
      'Quem é mais provável de dormir durante um filme? 😴',
      'Quem é mais provável de começar uma discussão e depois querer um abraço? 🥹',
      'Quem é mais provável de fazer uma surpresa romântica do nada? 💌',
      'Quem é mais provável de querer passar o resto da vida juntinho? 💍'
    ];

    const game = $('couple-game');
    const result = $('couple-result');
    const victor = $('choose-victor');
    const ana = $('choose-ana');

    let index = 0;
    let picks = [];
    let busy = false;

    function render() {
      game.hidden = false;
      result.hidden = true;

      $('couple-progress').textContent = `Pergunta ${index + 1} de ${questions.length}`;
      $('couple-percent').textContent = `${Math.round(index / questions.length * 100)}%`;
      $('couple-fill').style.width = `${index / questions.length * 100}%`;
      $('couple-question').textContent = questions[index];

      [victor, ana].forEach((b) => {
        b.disabled = false;
        b.classList.remove('is-picked');
      });
    }

    function reset() {
      index = 0;
      picks = [];
      busy = false;
      render();
    }

    async function choose(person, button) {
      if (busy || currentScene !== 'stage5') return;

      busy = true;
      picks.push(person);

      [victor, ana].forEach((b) => {
        b.disabled = true;
      });

      button.classList.add('is-picked');

      const r = button.getBoundingClientRect();

      burstHearts({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
      }, 12);

      await wait(reduceMotion ? 0 : 700);

      if (index === questions.length - 1) {
        $('victor-score').textContent = picks.filter(p => p === 'Victor').length;
        $('ana-score').textContent = picks.filter(p => p === 'Ana').length;

        $('couple-fill').style.width = '100%';

        game.hidden = true;
        result.hidden = false;

        starfield.boost();
        announce('No final, sempre nós dois.');
      } else {
        index++;
        render();
        $('couple-question').focus({ preventScroll: true });
      }

      busy = false;
    }

    victor.addEventListener('click', () => choose('Victor', victor));
    ana.addEventListener('click', () => choose('Ana', ana));

    $('couple-replay').addEventListener('click', () => {
      reset();
      $('couple-question').focus({ preventScroll: true });
    });

    $('couple-continue').addEventListener('click', () => {
      showScene('stage6');
    });

    reset();

    return { reset };
  }

  /* ================= ETAPA 6: CARTA ================= */

  function setupLoveLetter() {
    const envelope = $('open-letter');
    const intro = $('letter-intro');
    const letter = $('love-letter');

    let opening = false;

    async function openLetter() {
      if (opening || !letter.hidden) return;

      opening = true;
      envelope.classList.add('is-opening');

      $('open-letter-btn').disabled = true;

      await wait(reduceMotion ? 0 : 1000);

      intro.hidden = true;
      letter.hidden = false;

      letter.scrollIntoView({
        behavior: reduceMotion ? 'instant' : 'smooth',
        block: 'start'
      });

      announce('Meu amor, uma carta para você.');
    }

    envelope.addEventListener('click', openLetter);
    $('open-letter-btn').addEventListener('click', openLetter);

    $('letter-continue').addEventListener('click', () => {
      showScene('stage7');
    });
  }

  /* ================= ETAPA 7: FINAL ================= */

  function setupEnding(starfield) {
    let finished = false;

    $('last-surprise').addEventListener('click', async () => {
      if (finished) return;

      finished = true;

      $('last-chapter').hidden = true;
      $('ending').hidden = false;

      window.scrollTo(0, 0);

      starfield.boost();

      await wait(reduceMotion ? 0 : 3100);

      $('ending-title').focus({ preventScroll: true });

      const r = $('ending-title').getBoundingClientRect();

      burstHearts({
        x: r.left + r.width / 2,
        y: Math.max(60, r.top)
      }, 24);
    });

    $('restart-story').addEventListener('click', () => {
      window.location.reload();
    });
  }

  /* ================= INICIALIZAÇÃO ================= */

  function init() {
    const starfield = createStarfield($('starfield'));

    initScenes();
    setupStartButton(starfield);
    setupQuestion(starfield);

    const quiz = setupQuiz(starfield);

    setupMuseum(starfield, quiz.start);
    setupCoupleGame(starfield);
    setupLoveLetter();
    setupEnding(starfield);

    playOpening(scenes.opening);
  }

  init();
})();