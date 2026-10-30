
/*
 * Victor & Ana — Um Amor em Código
 * Nosso Cantinho de Jogos
 * Labirinto do Amor + Mistura das Cores
 *
 * Arquivo: jogos-romanticos.js
 */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const MAZE_SIZE = 11;
  const START = { x: 1, y: 1 };
  const GOAL = { x: 9, y: 9 };

  let maze = [];
  let player = { ...START };
  let mazeCompleted = false;
  let mixProgress = 0;
  let mixCompleted = false;
  let bypassNavigation = false;
  let currentGame = null;
  let mixRevealTimer = null;

  const mixMessages = [
    "Toque para aproximar nossos corações.",
    "Duas pessoas, duas histórias...",
    "Dois corações que escolheram ficar juntos...",
    "E dessa mistura surgiu um ser muito suspeito... 🐶"
  ];

  function createElement(tag, className, content) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (content !== undefined) {
      element.textContent = content;
    }

    return element;
  }

  function createButton(text, id, className) {
    const button = createElement("button", className, text);
    button.type = "button";

    if (id) {
      button.id = id;
    }

    return button;
  }

  function createScene(id, title, subtitle) {
    const section = createElement(
      "section",
      "scene amor-scene"
    );

    section.id = id;
    section.hidden = true;
    section.inert = true;
    section.setAttribute(
      "aria-labelledby",
      `${id}-title`
    );

    const content = createElement(
      "div",
      "scene__content amor-wrap"
    );

    const chapter = createElement(
      "p",
      "chapter-mark",
      "Nosso Cantinho de Jogos"
    );

    const heading = createElement(
      "h2",
      "museum-title",
      title
    );

    heading.id = `${id}-title`;
    heading.tabIndex = -1;

    const description = createElement(
      "p",
      "amor-description",
      subtitle
    );

    content.append(
      chapter,
      heading,
      description
    );

    section.appendChild(content);

    return {
      section,
      content,
      heading
    };
  }

  /* =====================================
     JOGO 1 — LABIRINTO DO AMOR
  ===================================== */

  function buildMazeScene() {
    const scene = createScene(
      "amor-maze",
      "Labirinto do Amor",
      "Entre tantos caminhos, eu sempre vou encontrar você."
    );

    const legend = createElement(
      "div",
      "amor-legend"
    );

    legend.innerHTML = `
      <span>
        <i class="amor-dot victor"></i>
        Victor
      </span>

      <span>
        <i class="amor-dot ana"></i>
        Ana
      </span>
    `;

    const board = createElement(
      "div",
      "amor-maze-board"
    );

    board.id = "amor-maze-board";
    board.setAttribute("role", "grid");
    board.setAttribute(
      "aria-label",
      "Labirinto do Amor"
    );

    const status = createElement(
      "p",
      "amor-status",
      "Ajude Victor a encontrar Ana. 💙💜"
    );

    status.id = "amor-maze-status";
    status.setAttribute("role", "status");

    const controls = createElement(
      "div",
      "amor-controls"
    );

    const directions = [
      ["up", "↑", "Mover para cima"],
      ["left", "←", "Mover para esquerda"],
      ["down", "↓", "Mover para baixo"],
      ["right", "→", "Mover para direita"]
    ];

    directions.forEach(
      ([direction, symbol, label]) => {
        const button = createButton(
          symbol,
          "",
          `amor-control amor-control--${direction}`
        );

        button.dataset.move = direction;
        button.setAttribute(
          "aria-label",
          label
        );

        controls.appendChild(button);
      }
    );

    const reset = createButton(
      "Recomeçar labirinto ↻",
      "amor-maze-reset",
      "btn btn--ghost"
    );

    const victory = createElement(
      "div",
      "amor-victory"
    );

    victory.id = "amor-maze-victory";
    victory.hidden = true;

    victory.innerHTML = `
      <div
        class="amor-victory-heart"
        aria-hidden="true"
      >
        ❤️
      </div>

      <h3>Você me encontrou!</h3>

      <p>
        Podem existir milhares de caminhos
        no mundo, mas meu coração sempre
        vai saber qual deles me leva até você.
      </p>
    `;

    const next = createButton(
      "Nossa próxima surpresa 💜",
      "amor-maze-next",
      "btn btn--primary"
    );

    victory.appendChild(next);

    scene.content.append(
      legend,
      board,
      status,
      controls,
      reset,
      victory
    );

    return scene;
  }

  function createMaze() {
    const grid = Array.from(
      { length: MAZE_SIZE },
      () => Array(MAZE_SIZE).fill(1)
    );

    const visited = new Set();
    const stack = [{ ...START }];

    const key = (x, y) => `${x},${y}`;

    visited.add(
      key(START.x, START.y)
    );

    grid[START.y][START.x] = 0;

    while (stack.length) {
      const current =
        stack[stack.length - 1];

      const directions = [
        [0, -2],
        [2, 0],
        [0, 2],
        [-2, 0]
      ];

      for (
        let i = directions.length - 1;
        i > 0;
        i--
      ) {
        const j = Math.floor(
          Math.random() * (i + 1)
        );

        [
          directions[i],
          directions[j]
        ] = [
          directions[j],
          directions[i]
        ];
      }

      const next = directions
        .map(([dx, dy]) => ({
          x: current.x + dx,
          y: current.y + dy,
          wallX: current.x + dx / 2,
          wallY: current.y + dy / 2
        }))
        .find((candidate) => (
          candidate.x > 0 &&
          candidate.y > 0 &&
          candidate.x < MAZE_SIZE - 1 &&
          candidate.y < MAZE_SIZE - 1 &&
          !visited.has(
            key(
              candidate.x,
              candidate.y
            )
          )
        ));

      if (!next) {
        stack.pop();
        continue;
      }

      grid[next.wallY][next.wallX] = 0;
      grid[next.y][next.x] = 0;

      visited.add(
        key(next.x, next.y)
      );

      stack.push({
        x: next.x,
        y: next.y
      });
    }

    return grid;
  }

  function renderMaze() {
    const board = $("amor-maze-board");

    if (!board) return;

    const fragment =
      document.createDocumentFragment();

    for (
      let y = 0;
      y < MAZE_SIZE;
      y++
    ) {
      for (
        let x = 0;
        x < MAZE_SIZE;
        x++
      ) {
        const cell = createElement(
          "div",
          "amor-maze-cell"
        );

        cell.setAttribute(
          "role",
          "gridcell"
        );

        if (maze[y][x] === 1) {
          cell.classList.add(
            "is-wall"
          );
        } else {
          cell.classList.add(
            "is-path"
          );
        }

        if (
          x === GOAL.x &&
          y === GOAL.y
        ) {
          cell.classList.add(
            "is-goal"
          );

          cell.textContent = "💜";

          cell.setAttribute(
            "aria-label",
            "Ana"
          );
        }

        if (
          x === player.x &&
          y === player.y
        ) {
          cell.classList.add(
            "is-player"
          );

          cell.textContent = "💙";

          cell.setAttribute(
            "aria-label",
            "Victor"
          );
        }

        fragment.appendChild(cell);
      }
    }

    board.replaceChildren(fragment);
  }

  function resetMaze() {
    maze = createMaze();

    player = { ...START };
    mazeCompleted = false;

    const victory = $(
      "amor-maze-victory"
    );

    victory.hidden = true;

    victory.classList.remove(
      "is-celebrating"
    );

    $("amor-maze-status").textContent =
      "Ajude Victor a encontrar Ana. 💙💜";

    $("amor-maze-board").classList.remove(
      "is-complete"
    );

    document.querySelectorAll(
      ".amor-control"
    ).forEach((button) => {
      button.disabled = false;
    });

    renderMaze();
  }

  function movePlayer(direction) {
    if (
      currentGame !== "maze" ||
      mazeCompleted
    ) {
      return;
    }

    const movements = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };

    const movement =
      movements[direction];

    if (!movement) return;

    const [dx, dy] = movement;

    const x = player.x + dx;
    const y = player.y + dy;

    if (
      x < 0 ||
      y < 0 ||
      x >= MAZE_SIZE ||
      y >= MAZE_SIZE ||
      maze[y][x] === 1
    ) {
      return;
    }

    player = { x, y };

    renderMaze();

    if (
      x === GOAL.x &&
      y === GOAL.y
    ) {
      finishMaze();
    }
  }

  function finishMaze() {
    mazeCompleted = true;

    $("amor-maze-board").classList.add(
      "is-complete"
    );

    $("amor-maze-status").textContent =
      "O amor encontrou o caminho! ❤️";

    document.querySelectorAll(
      ".amor-control"
    ).forEach((button) => {
      button.disabled = true;
    });

    const victory = $(
      "amor-maze-victory"
    );

    victory.hidden = false;

    if (!reduceMotion) {
      victory.classList.add(
        "is-celebrating"
      );
    }
  }

  /* =====================================
     JOGO 2 — MISTURA DAS CORES
  ===================================== */

  function buildMixScene() {
    const scene = createScene(
      "amor-mix",
      "A Mistura do Nosso Amor",
      "Você tem a sua cor, eu tenho a minha. Juntos, criamos algo que é só nosso."
    );

    const stage = createElement(
      "div",
      "amor-mix-stage"
    );

    stage.id = "amor-mix-stage";

    stage.innerHTML = `
      <div class="amor-mix-glow"></div>

      <div
        class="amor-mix-orbit amor-mix-orbit--blue"
      >
        <span>💙</span>
        <small>Victor</small>
      </div>

      <div
        class="amor-mix-orbit amor-mix-orbit--purple"
      >
        <span>💜</span>
        <small>Ana</small>
      </div>

      <div
        class="amor-mix-union"
        aria-hidden="true"
      >
        ❤️
      </div>
    `;

    const status = createElement(
      "p",
      "amor-status",
      mixMessages[0]
    );

    status.id = "amor-mix-status";
    status.setAttribute(
      "role",
      "status"
    );

    const progress = createElement(
      "div",
      "amor-mix-progress"
    );

    progress.setAttribute(
      "aria-hidden",
      "true"
    );

    for (let i = 0; i < 3; i++) {
      progress.appendChild(
        createElement(
          "span",
          "amor-mix-step"
        )
      );
    }

    const mixButton = createButton(
      "Aproximar nossos corações ❤️",
      "amor-mix-button",
      "btn btn--primary"
    );

    const reveal = createElement(
      "div",
      "amor-deko-reveal"
    );

    reveal.id = "amor-deko-reveal";
    reveal.hidden = true;

    /* FOTO DO DEKO */

    const photoFrame = createElement(
      "div",
      "amor-deko-frame"
    );

    const photo =
      document.createElement("img");

    photo.src = "imagens/deko.jpg";
    photo.alt =
      "Deko, nosso bafudo favorito";

    photo.className =
      "amor-deko-photo";

    photo.loading = "lazy";

    const photoCaption = createElement(
      "p",
      "amor-deko-caption",
      "O famoso amante da Ana. 🐶"
    );

    photoFrame.append(
      photo,
      photoCaption
    );

    /* APRESENTAÇÃO ENGRAÇADA DO DEKO */

    const message = createElement(
      "div",
      "amor-deko-message"
    );

    message.innerHTML = `
      <h3>
        Nosso bafudo favorito. 🐶❤️
      </h3>

      <p>
        Primeiro éramos só eu e você...
        até aparecer um ser de quatro patas,
        cheio de pelo, folgado e que acha
        que manda em tudo.
      </p>

      <p>
        Ele não paga uma conta,
        não trabalha, não estuda
        e ainda exige carinho
        como se sustentasse a casa.
      </p>

      <p>
        E o pior de tudo?
        Esse safado conseguiu ME conquistar.
        Agora sou completamente apaixonado
        por esse vagabundo. 🙄❤️
      </p>

      <strong>
        Deko, nosso amante de quatro patas.
        🐾💙💜
      </strong>

      <p class="amor-deko-piada">
        Entrou na nossa vida sem convite,
        roubou meu coração e ainda vive
        de graça. QUE HOMEM! 😂
      </p>
    `;

    reveal.append(
      photoFrame,
      message
    );

    const actions = createElement(
      "div",
      "amor-actions"
    );

    const replay = createButton(
      "Ver novamente ↻",
      "amor-mix-reset",
      "btn btn--ghost"
    );

    const next = createButton(
      "Tenho uma carta para você 💌",
      "amor-mix-next",
      "btn btn--primary"
    );

    next.hidden = true;

    actions.append(
      replay,
      next
    );

    scene.content.append(
      stage,
      status,
      progress,
      mixButton,
      reveal,
      actions
    );

    photo.addEventListener(
      "error",
      () => {
        photo.alt =
          "Não foi possível carregar a foto do Deko.";

        photoCaption.textContent =
          "Confira se imagens/deko.jpg existe na pasta do projeto.";
      }
    );

    return scene;
  }

  function resetMix() {
    if (mixRevealTimer !== null) {
      clearTimeout(mixRevealTimer);
      mixRevealTimer = null;
    }

    mixProgress = 0;
    mixCompleted = false;

    const stage = $(
      "amor-mix-stage"
    );

    stage.classList.remove(
      "is-step-1",
      "is-step-2",
      "is-united"
    );

    $("amor-mix-status").textContent =
      mixMessages[0];

    const mixButton = $(
      "amor-mix-button"
    );

    mixButton.hidden = false;
    mixButton.disabled = false;

    mixButton.textContent =
      "Aproximar nossos corações ❤️";

    $("amor-deko-reveal").hidden = true;
    $("amor-mix-next").hidden = true;

    document.querySelectorAll(
      ".amor-mix-step"
    ).forEach((step) => {
      step.classList.remove(
        "is-filled"
      );
    });
  }

  function advanceMix() {
    if (
      mixCompleted ||
      currentGame !== "mix"
    ) {
      return;
    }

    mixProgress++;

    const stage = $(
      "amor-mix-stage"
    );

    $("amor-mix-status").textContent =
      mixMessages[
        Math.min(mixProgress, 3)
      ];

    const steps =
      document.querySelectorAll(
        ".amor-mix-step"
      );

    steps.forEach(
      (step, index) => {
        step.classList.toggle(
          "is-filled",
          index < mixProgress
        );
      }
    );

    if (mixProgress === 1) {
      stage.classList.add(
        "is-step-1"
      );

      $("amor-mix-button").textContent =
        "Aproximar ainda mais 💙💜";
    }

    if (mixProgress === 2) {
      stage.classList.add(
        "is-step-2"
      );

      $("amor-mix-button").textContent =
        "Unir nossos corações ❤️";
    }

    if (mixProgress >= 3) {
      finishMix();
    }
  }

  function finishMix() {
    mixCompleted = true;

    const stage = $(
      "amor-mix-stage"
    );

    stage.classList.add(
      "is-united"
    );

    $("amor-mix-button").hidden = true;

    $("amor-mix-status").textContent =
      "Preparada para conhecer o verdadeiro dono dos nossos corações? 🐶";

    const delay =
      reduceMotion ? 0 : 1000;

    mixRevealTimer = window.setTimeout(
      () => {
        mixRevealTimer = null;

        if (
          currentGame !== "mix" ||
          !mixCompleted
        ) {
          return;
        }

        $("amor-deko-reveal").hidden = false;
        $("amor-mix-next").hidden = false;

        $("amor-mix-status").textContent =
          "SURPRESA! É O BAFUDO! 😂🐾";
      },
      delay
    );
  }

  /* =====================================
     NAVEGAÇÃO ENTRE OS JOGOS
  ===================================== */

  function switchGame(game) {
    const mazeScene = $(
      "amor-maze"
    );

    const mixScene = $(
      "amor-mix"
    );

    const stage5 = $(
      "scene-stage5"
    );

    if (
      !mazeScene ||
      !mixScene ||
      !stage5
    ) {
      return;
    }

    mazeScene.hidden = true;
    mixScene.hidden = true;

    mazeScene.inert = true;
    mixScene.inert = true;

    mazeScene.classList.remove(
      "is-active"
    );

    mixScene.classList.remove(
      "is-active"
    );

    stage5.hidden = true;

    stage5.classList.remove(
      "is-active"
    );

    stage5.inert = true;

    const target =
      game === "maze"
        ? mazeScene
        : mixScene;

    currentGame = game;

    target.hidden = false;
    target.inert = false;

    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      target.classList.add(
        "is-active"
      );

      target
        .querySelector("h2")
        ?.focus({
          preventScroll: true
        });
    });

    if (game === "maze") {
      resetMaze();
    }

    if (game === "mix") {
      resetMix();
    }
  }

  function finishGames() {
    const mazeScene = $(
      "amor-maze"
    );

    const mixScene = $(
      "amor-mix"
    );

    const stage5 = $(
      "scene-stage5"
    );

    const continueButton = $(
      "couple-continue"
    );

    if (
      !stage5 ||
      !continueButton
    ) {
      return;
    }

    mazeScene.hidden = true;
    mixScene.hidden = true;

    mazeScene.inert = true;
    mixScene.inert = true;

    mazeScene.classList.remove(
      "is-active"
    );

    mixScene.classList.remove(
      "is-active"
    );

    currentGame = null;

    stage5.hidden = false;
    stage5.inert = false;

    stage5.classList.add(
      "is-active"
    );

    bypassNavigation = true;

    try {
      continueButton.click();
    } finally {
      bypassNavigation = false;
    }
  }

  /* =====================================
     EVENTOS E CONTROLES
  ===================================== */

  function setupEvents() {
    const continueButton = $(
      "couple-continue"
    );

    if (!continueButton) {
      console.warn(
        "Jogos românticos: botão couple-continue não encontrado."
      );

      return;
    }

    continueButton.addEventListener(
      "click",
      (event) => {
        if (bypassNavigation) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        switchGame("maze");
      },
      true
    );

    document.querySelectorAll(
      "[data-move]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          movePlayer(
            button.dataset.move
          );
        }
      );
    });

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          currentGame !== "maze"
        ) {
          return;
        }

        const keys = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
          w: "up",
          s: "down",
          a: "left",
          d: "right"
        };

        const direction =
          keys[event.key];

        if (direction) {
          event.preventDefault();
          movePlayer(direction);
        }
      }
    );

    $("amor-maze-reset").addEventListener(
      "click",
      resetMaze
    );

    $("amor-maze-next").addEventListener(
      "click",
      () => {
        switchGame("mix");
      }
    );

    $("amor-mix-button").addEventListener(
      "click",
      advanceMix
    );

    $("amor-mix-reset").addEventListener(
      "click",
      resetMix
    );

    $("amor-mix-next").addEventListener(
      "click",
      finishGames
    );
  }

  /* =====================================
     INICIALIZAÇÃO
  ===================================== */

  function init() {
    const app = $("app");

    const stage5 = $(
      "scene-stage5"
    );

    if (
      !app ||
      !stage5
    ) {
      console.warn(
        "Jogos românticos: estrutura principal não encontrada."
      );

      return;
    }

    if (
      $("amor-maze") ||
      $("amor-mix")
    ) {
      return;
    }

    const mazeScene =
      buildMazeScene();

    const mixScene =
      buildMixScene();

    stage5.insertAdjacentElement(
      "afterend",
      mazeScene.section
    );

    mazeScene.section.insertAdjacentElement(
      "afterend",
      mixScene.section
    );

    setupEvents();

    console.info(
      "Nosso Cantinho de Jogos carregado! ❤️🐶"
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
