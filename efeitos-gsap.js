
/* ============================================
   VICTOR & ANA 2.0
   EDIÇÃO CINEMATOGRÁFICA

   Corações, transições, fotografias
   e microinterações com GSAP
   ============================================ */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    if (typeof gsap === "undefined") {
      console.warn("GSAP não foi carregado.");
      return;
    }

    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mobile = window.matchMedia(
      "(max-width: 600px)"
    ).matches;

    const animacoesCenas = new WeakMap();

    // ============================================
    // 1. CORAÇÕES FLUTUANDO NO FUNDO
    // ============================================

    function criarAtmosfera() {
      if (reduzirMovimento) return;

      if (document.getElementById("amor-atmosfera")) {
        return;
      }

      const camada = document.createElement("div");

      camada.id = "amor-atmosfera";
      camada.setAttribute("aria-hidden", "true");

      document.body.prepend(camada);

      const quantidade = mobile ? 9 : 18;

      const cores = [
        "#A63842",
        "#7D94BC",
        "#B5A0C9",
        "#D9B5A9"
      ];

      for (let i = 0; i < quantidade; i++) {

        const coracao = document.createElement("span");

        coracao.className = "amor-particula";
        coracao.textContent = "♥";

        const tamanho = gsap.utils.random(9, 24);

        coracao.style.setProperty(
          "--tamanho",
          `${tamanho}px`
        );

        coracao.style.setProperty(
          "--cor",
          cores[i % cores.length]
        );

        camada.appendChild(coracao);

        const xInicial = gsap.utils.random(2, 98);

        gsap.set(coracao, {
          left: `${xInicial}%`,
          y: 0,
          x: 0,
          opacity: 0
        });

        const duracao = gsap.utils.random(13, 22);

        const movimento = gsap.timeline({
          repeat: -1,
          delay: gsap.utils.random(0, 12),
          repeatDelay: gsap.utils.random(0, 5)
        });

        movimento.to(coracao, {
          opacity: gsap.utils.random(.12, .30),
          duration: 2,
          ease: "sine.out"
        });

        movimento.to(coracao, {
          y: () => -window.innerHeight - 100,
          x: gsap.utils.random(-65, 65),
          rotation: gsap.utils.random(-80, 80),
          duration: duracao,
          ease: "none"
        }, 0);

        movimento.to(coracao, {
          opacity: 0,
          duration: 3,
          ease: "sine.in"
        }, duracao - 3);
      }
    }

    // ============================================
    // 2. IDENTIFICAR CENAS ATIVAS
    // ============================================

    function cenaEstaAtiva(cena) {
      if (!cena) return false;

      if (!cena.classList.contains("is-active")) {
        return false;
      }

      if (cena.hidden) return false;

      if (getComputedStyle(cena).display === "none") {
        return false;
      }

      return true;
    }

    // ============================================
    // 3. TRANSIÇÃO CINEMATOGRÁFICA
    // ============================================

    function animarCena(cena) {
      if (reduzirMovimento) return;

      if (!cenaEstaAtiva(cena)) return;

      // A abertura original possui animações
      // próprias e deve ser preservada.
      if (
        cena.id === "scene-opening" ||
        cena.classList.contains("scene--opening")
      ) {
        return;
      }

      const conteudo = cena.querySelector(
        ".scene__content"
      );

      if (!conteudo) return;

      const anterior = animacoesCenas.get(cena);

      if (anterior) {
        anterior.kill();
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out"
        }
      });

      // Entrada cinematográfica do capítulo.
      timeline.fromTo(
        conteudo,
        {
          autoAlpha: 0,
          y: 30,
          scale: .985,
          filter: "blur(6px)"
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.15,
          clearProps:
            "opacity,visibility,transform,filter"
        }
      );

      animacoesCenas.set(cena, timeline);
    }

    // ============================================
    // 4. OBSERVAR MUDANÇAS DE CAPÍTULO
    // ============================================

    function observarCenas() {

      const cenas = document.querySelectorAll(
        ".scene"
      );

      if (!cenas.length) return;

      const observador = new MutationObserver(
        (alteracoes) => {

          const cenasAlteradas = new Set();

          for (const alteracao of alteracoes) {

            const cena = alteracao.target;

            if (cenaEstaAtiva(cena)) {
              cenasAlteradas.add(cena);
            } else {
              const animacao = animacoesCenas.get(cena);

              if (animacao) {
                animacao.kill();
                animacoesCenas.delete(cena);
              }

              const conteudo = cena.querySelector(
                ".scene__content"
              );

              if (conteudo) {
                gsap.set(conteudo, {
                  clearProps:
                    "opacity,visibility,transform,filter"
                });
              }
            }
          }

          cenasAlteradas.forEach(animarCena);
        }
      );

      cenas.forEach((cena) => {

        observador.observe(cena, {
          attributes: true,
          attributeFilter: [
            "class",
            "hidden"
          ]
        });
      });
    }

    // ============================================
    // 5. MICROINTERAÇÃO DOS BOTÕES
    // ============================================

    function configurarBotoes() {

      if (reduzirMovimento) return;

      document.addEventListener(
        "pointerdown",
        (evento) => {

          if (!(evento.target instanceof Element)) {
            return;
          }

          const botao = evento.target.closest(
            ".btn"
          );

          if (!botao || botao.disabled) return;

          // Preservar a lógica do botão que foge.
          if (botao.id === "no-btn") return;

          gsap.fromTo(
            botao,
            {
              scale: 1
            },
            {
              scale: .97,
              duration: .12,
              repeat: 1,
              yoyo: true,
              ease: "power2.out",
              overwrite: "auto",
              onComplete: () => {
                gsap.set(botao, {
                  clearProps: "scale"
                });
              }
            }
          );
        }
      );
    }

    // ============================================
    // 6. ANIMAÇÃO DAS FOTOGRAFIAS
    // ============================================

    function configurarFotos() {

      if (reduzirMovimento) return;

      const galeria = document.getElementById(
        "gallery"
      );

      if (!galeria) return;

      galeria.addEventListener(
        "pointerdown",
        (evento) => {

          if (!(evento.target instanceof Element)) {
            return;
          }

          const quadro = evento.target.closest(
            ".frame"
          );

          if (!quadro) return;

          gsap.fromTo(
            quadro,
            {
              scale: 1
            },
            {
              scale: .975,
              duration: .12,
              repeat: 1,
              yoyo: true,
              ease: "power2.out",
              overwrite: "auto",
              onComplete: () => {
                gsap.set(quadro, {
                  clearProps: "scale"
                });
              }
            }
          );
        }
      );
    }

    // ============================================
    // 7. INICIALIZAÇÃO
    // ============================================

    criarAtmosfera();

    observarCenas();

    configurarBotoes();

    configurarFotos();

    console.log(
      "Victor & Ana 2.0 — Edição Cinematográfica ❤️"
    );

  });

})();
