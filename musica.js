(() => {
  "use strict";

  const musica = document.getElementById("musica-romantica");
  const controle = document.getElementById("controle-musica");
  const iniciar = document.getElementById("start-btn");

  if (!musica || !controle || !iniciar) {
    console.error("Elementos da música não encontrados.");
    return;
  }

  const VOLUME_MAXIMO = 0.04;
  const DURACAO_FADE = 2500;
  const INTERVALO = 50;

  let fadeAtual = null;
  let iniciada = false;

  musica.volume = 0;
  musica.loop = true;

  function pararFade() {
    if (fadeAtual !== null) {
      clearInterval(fadeAtual);
      fadeAtual = null;
    }
  }

  function atualizarBotao() {
    const tocando = !musica.paused;

    controle.hidden = false;
    controle.textContent = tocando ? "♫" : "▶";
    controle.setAttribute(
      "aria-label",
      tocando ? "Pausar música" : "Reproduzir música"
    );
    controle.setAttribute(
      "title",
      tocando ? "Pausar música" : "Reproduzir música"
    );
    controle.setAttribute(
      "aria-pressed",
      String(tocando)
    );
  }

  function aumentarVolumeSuavemente() {
    pararFade();

    musica.volume = 0;

    const passos = DURACAO_FADE / INTERVALO;
    let passo = 0;

    fadeAtual = setInterval(() => {
      if (musica.paused) {
        pararFade();
        return;
      }

      passo++;

      musica.volume = Math.min(
        VOLUME_MAXIMO,
        (passo / passos) * VOLUME_MAXIMO
      );

      if (passo >= passos) {
        musica.volume = VOLUME_MAXIMO;
        pararFade();
      }
    }, INTERVALO);
  }

  async function reproduzir() {
    try {
      // A chamada ocorre diretamente após uma interação
      // da pessoa com o botão.
      const tentativa = musica.play();

      if (tentativa) {
        await tentativa;
      }

      iniciada = true;
      atualizarBotao();
      aumentarVolumeSuavemente();
    } catch (erro) {
      pararFade();
      atualizarBotao();
      console.warn("Não foi possível iniciar a música:", erro);
    }
  }

  function pausar() {
    pararFade();
    musica.pause();
    atualizarBotao();
  }

  iniciar.addEventListener("click", () => {
    if (!iniciada) {
      reproduzir();
    }
  });

  controle.addEventListener("click", () => {
    if (musica.paused) {
      reproduzir();
    } else {
      pausar();
    }
  });

  musica.addEventListener("pause", atualizarBotao);
  musica.addEventListener("play", atualizarBotao);

  musica.addEventListener("error", () => {
    console.error(
      "Erro ao carregar a música. Verifique o caminho do MP3."
    );
    pausar();
  });

  document.addEventListener("visibilitychange", () => {
    // Não reiniciamos a música quando a aba fica visível.
    // O navegador mantém o controle da reprodução.
  });

})();