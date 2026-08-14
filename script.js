/* ============================================================
   MAHRU BIRTHDAY WEBSITE
   script.js
   No puzzle
   No progress checklist
   ============================================================ */

(() => {

  "use strict";


  /* ==========================================================
     BASIC SETTINGS
     ========================================================== */

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const isSmallScreen =
    window.innerWidth < 700;

  const lowPower =
    (
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency <= 4
    ) || isSmallScreen;


  /* ==========================================================
     DOM
     ========================================================== */

  const steps =
    Array.from(
      document.querySelectorAll(".step")
    );

  const fxLayer =
    document.getElementById("fx-layer");


  /* ==========================================================
     EFFECTS
     ========================================================== */

  function spawnHeart(x, y, size = 20) {

    if (!fxLayer) return;

    const el =
      document.createElement("div");

    el.className = "fx-heart";

    el.textContent =
      [
        "💗",
        "💕",
        "💖",
        "✨"
      ][
        Math.floor(
          Math.random() * 4
        )
      ];

    el.style.left =
      `${x}px`;

    el.style.top =
      `${y}px`;

    el.style.fontSize =
      `${size}px`;

    fxLayer.appendChild(el);

    setTimeout(
      () => el.remove(),
      1200
    );
  }


  function spawnSparkBurst(
    x,
    y,
    count = 8
  ) {

    if (!fxLayer) return;

    const n =
      prefersReducedMotion
        ? 0
        : count;

    for (
      let i = 0;
      i < n;
      i++
    ) {

      const el =
        document.createElement("div");

      el.className =
        "fx-spark";

      const angle =
        (
          Math.PI * 2 * i
        ) / n;

      const distance =
        30 +
        Math.random() * 30;

      el.style.setProperty(
        "--dx",
        `${Math.cos(angle) * distance}px`
      );

      el.style.setProperty(
        "--dy",
        `${Math.sin(angle) * distance}px`
      );

      el.style.left =
        `${x}px`;

      el.style.top =
        `${y}px`;

      fxLayer.appendChild(el);

      setTimeout(
        () => el.remove(),
        750
      );
    }
  }


  function fireConfetti(
    options = {}
  ) {

    if (
      typeof confetti !==
      "function"
    ) return;

    if (
      prefersReducedMotion
    ) return;

    confetti({

      particleCount: 90,

      spread: 75,

      origin: {
        y: .6
      },

      colors: [
        "#ff8fab",
        "#ffd98e",
        "#e9dfff",
        "#ffe3cc",
        "#ffffff"
      ],

      ...options

    });
  }


  /* ==========================================================
     TAP HEARTS
     ========================================================== */

  document.addEventListener(
    "pointerdown",
    event => {

      const interactive =
        event.target.closest(
          "button, input, .polaroid, .letter-paper"
        );

      if (interactive) return;

      spawnHeart(
        event.clientX,
        event.clientY,
        18 +
        Math.random() * 10
      );

      if (
        Math.random() < .5
      ) {

        spawnSparkBurst(
          event.clientX,
          event.clientY,
          4
        );
      }

    }
  );


  /* ==========================================================
     BALLOONS
     ========================================================== */

  const balloonMessages = [

    "You're so loved, Mahru! 💗",

    "Pop! Another reason you're amazing 🥹",

    "Happy Birthday energy incoming ✨",

    "Yay! 🎉",

    "My sweetheart deserves all the happiness 💕"

  ];


  function spawnBalloon() {

    if (document.hidden) return;

    const balloon =
      document.createElement("button");

    balloon.className =
      "balloon";

    balloon.setAttribute(
      "aria-label",
      "Pop balloon"
    );

    balloon.textContent =
      "🎈";

    balloon.style.left =
      `${5 + Math.random() * 85}vw`;

    const duration =
      9 +
      Math.random() * 6;

    balloon.style.animationDuration =
      `${duration}s`;

    document.body.appendChild(
      balloon
    );


    const remove =
      () => balloon.remove();


    balloon.addEventListener(
      "animationend",
      () => {

        if (
          !balloon.classList.contains(
            "popped"
          )
        ) {

          remove();
        }

      }
    );


    balloon.addEventListener(
      "click",
      () => {

        if (
          balloon.classList.contains(
            "popped"
          )
        ) return;

        const rect =
          balloon.getBoundingClientRect();

        balloon.classList.add(
          "popped"
        );

        spawnSparkBurst(
          rect.left +
          rect.width / 2,

          rect.top +
          rect.height / 2,

          10
        );

        fireConfetti({

          particleCount: 24,

          spread: 50,

          origin: {

            x:
              rect.left /
              window.innerWidth,

            y:
              rect.top /
              window.innerHeight
          }

        });


        const message =
          document.createElement("div");

        message.className =
          "fx-heart";

        message.style.left =
          `${
            rect.left +
            rect.width / 2
          }px`;

        message.style.top =
          `${rect.top}px`;

        message.style.fontSize =
          "13px";

        message.style.fontWeight =
          "700";

        message.style.whiteSpace =
          "nowrap";

        message.textContent =
          balloonMessages[
            Math.floor(
              Math.random() *
              balloonMessages.length
            )
          ];

        fxLayer.appendChild(
          message
        );

        setTimeout(
          () => message.remove(),
          1300
        );

        setTimeout(
          remove,
          400
        );

      }
    );
  }


  let balloonInterval =
    null;


  function startBalloons() {

    if (
      prefersReducedMotion
    ) return;

    if (
      balloonInterval
    ) return;

    balloonInterval =
      setInterval(
        () => {

          if (
            Math.random() < .7
          ) {

            spawnBalloon();
          }

        },
        4200
      );
  }


  /* ==========================================================
     STEP NAVIGATION
     ========================================================== */

  function showStep(number) {

    steps.forEach(
      step => {

        step.classList.toggle(
          "active",
          Number(
            step.dataset.step
          ) === number
        );

      }
    );


    window.scrollTo({
      top: 0,
      behavior: "auto"
    });


    initStepContent(
      number
    );
  }


  function goToStep(number) {

    showStep(number);
  }


  /* ==========================================================
     GAME INITIALIZERS
     ========================================================== */

  const initializers = {};


  /* ==========================================================
     GAME 1 — CATCH HEARTS
     ========================================================== */

  initializers[1] =
    function initGame1() {

      const area =
        document.getElementById(
          "game1-area"
        );

      const counter =
        document.getElementById(
          "game1-count"
        );

      if (!area || !counter)
        return;


      area.innerHTML = "";

      let caught = 0;

      const NEEDED = 5;

      const HEART_COUNT = 8;


      counter.textContent =
        "0";


      for (
        let i = 0;
        i < HEART_COUNT;
        i++
      ) {

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "float-heart-btn";

        button.textContent =
          "💗";

        button.setAttribute(
          "aria-label",
          "Catch heart"
        );


        button.style.left =
          `${
            6 +
            Math.random() * 82
          }%`;

        button.style.top =
          `${
            6 +
            Math.random() * 78
          }%`;

        button.style.animationDelay =
          `${
            Math.random() * 2
          }s`;


        button.addEventListener(
          "click",
          () => {

            if (
              button.classList.contains(
                "popped"
              )
            ) return;


            button.classList.add(
              "popped"
            );


            const rect =
              button.getBoundingClientRect();


            spawnSparkBurst(
              rect.left +
              rect.width / 2,

              rect.top +
              rect.height / 2,

              6
            );


            caught++;


            counter.textContent =
              String(
                Math.min(
                  caught,
                  NEEDED
                )
              );


            if (
              caught >= NEEDED
            ) {

              fireConfetti();

              setTimeout(
                () => goToStep(2),
                700
              );
            }

          }
        );


        area.appendChild(
          button
        );
      }

    };


  /* ==========================================================
     GAME 2 — HIDDEN FLOWER
     ========================================================== */

  initializers[3] =
    function initGame2() {

      const area =
        document.getElementById(
          "game2-area"
        );

      if (!area) return;


      area.innerHTML = "";


      const flowers = [
        "🌷",
        "🌸",
        "🌻",
        "🌼",
        "🌺",
        "🪷"
      ];


      const correctIndex =
        Math.floor(
          Math.random() * 6
        );


      for (
        let i = 0;
        i < 6;
        i++
      ) {

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "flower-btn";

        button.textContent =
          flowers[i];


        button.style.left =
          `${
            8 +
            (i % 3) * 30 +
            Math.random() * 8
          }%`;

        button.style.top =
          `${
            15 +
            Math.floor(i / 3) * 42 +
            Math.random() * 8
          }%`;


        button.addEventListener(
          "click",
          () => {

            if (
              i === correctIndex
            ) {

              button.classList.add(
                "bloom"
              );

              button.textContent =
                "🌼✨";


              const rect =
                button.getBoundingClientRect();


              spawnSparkBurst(
                rect.left +
                rect.width / 2,

                rect.top +
                rect.height / 2,

                10
              );


              fireConfetti();


              setTimeout(
                () => goToStep(4),
                800
              );

            } else {

              button.style.transform =
                "scale(.8) rotate(-8deg)";

              setTimeout(
                () => {
                  button.style.transform =
                    "";
                },
                250
              );

            }

          }
        );


        area.appendChild(
          button
        );
      }

    };


  /* ==========================================================
     GAME 3 — GIFT
     ========================================================== */

  initializers[5] =
    function initGame3() {

      const boxes =
        Array.from(
          document.querySelectorAll(
            "#game3-area .gift-box"
          )
        );

      const feedback =
        document.getElementById(
          "game3-feedback"
        );

      if (!boxes.length)
        return;


      feedback.textContent =
        "\u00A0";


      boxes.forEach(
        box => {

          box.classList.remove(
            "opened",
            "shake"
          );

          box.disabled = false;

          box.textContent =
            "🎁";

        }
      );


      const correct =
        Math.floor(
          Math.random() *
          boxes.length
        );


      boxes.forEach(
        (box, index) => {

          box.onclick =
            () => {

              if (
                index === correct
              ) {

                boxes.forEach(
                  item => {
                    item.disabled =
                      true;
                  }
                );


                box.classList.add(
                  "opened"
                );


                box.textContent =
                  "💌";


                feedback.textContent =
                  "You found it! 🎉";


                const rect =
                  box.getBoundingClientRect();


                spawnSparkBurst(
                  rect.left +
                  rect.width / 2,

                  rect.top +
                  rect.height / 2,

                  10
                );


                fireConfetti();


                setTimeout(
                  () => goToStep(6),
                  900
                );


              } else {

                box.classList.remove(
                  "shake"
                );

                void box.offsetWidth;

                box.classList.add(
                  "shake"
                );

                feedback.textContent =
                  "Nopeee 😭 Try another one!";

              }

            };

        }
      );

    };


  /* ==========================================================
     GAME 4 — BUTTERFLY
     ========================================================== */

  initializers[7] =
    function initGame4() {

      const butterfly =
        document.getElementById(
          "butterfly"
        );

      const area =
        document.getElementById(
          "game4-area"
        );

      if (
        !butterfly ||
        !area
      ) return;


      butterfly.classList.remove(
        "landed"
      );


      let moveTimer =
        null;


      function moveButterfly() {

        const maxLeft =
          area.clientWidth -
          50;

        const maxTop =
          area.clientHeight -
          50;


        const left =
          Math.max(
            0,
            Math.random() *
            maxLeft
          );

        const top =
          Math.max(
            0,
            Math.random() *
            maxTop
          );


        butterfly.style.left =
          `${left}px`;

        butterfly.style.top =
          `${top}px`;
      }


      moveButterfly();


      moveTimer =
        setInterval(
          moveButterfly,
          1500
        );


      butterfly.onclick =
        () => {

          clearInterval(
            moveTimer
          );


          butterfly.classList.add(
            "landed"
          );


          const rect =
            butterfly.getBoundingClientRect();


          spawnSparkBurst(
            rect.left +
            rect.width / 2,

            rect.top +
            rect.height / 2,

            10
          );


          fireConfetti();


          setTimeout(
            () => goToStep(8),
            900
          );

        };

    };


  /* ==========================================================
     STEP 9 — LETTER
     ========================================================== */

  initializers[9] =
    function initLetter() {

      const envelope =
        document.getElementById(
          "envelope"
        );

      const paper =
        document.getElementById(
          "letter-paper"
        );

      const afterButton =
        document.getElementById(
          "after-letter-btn"
        );


      if (
        !envelope ||
        !paper ||
        !afterButton
      ) return;


      const lines =
        Array.from(
          paper.querySelectorAll(
            ".letter-line, .letter-signoff"
          )
        );


      envelope.classList.remove(
        "opened"
      );

      paper.classList.add(
        "hidden"
      );

      afterButton.classList.add(
        "hidden"
      );


      lines.forEach(
        line => {

          line.classList.remove(
            "show"
          );

        }
      );


      envelope.onclick =
        () => {

          if (
            envelope.classList.contains(
              "opened"
            )
          ) return;


          envelope.classList.add(
            "opened"
          );


          setTimeout(
            () => {

              paper.classList.remove(
                "hidden"
              );


              lines.forEach(
                line => {

                  const delay =
                    Number(
                      line.dataset.delay
                    ) * 450;


                  setTimeout(
                    () => {

                      line.classList.add(
                        "show"
                      );

                    },
                    delay
                  );

                }
              );


              const totalDelay =
                lines.length *
                450 +
                500;


              setTimeout(
                () => {

                  afterButton.classList.remove(
                    "hidden"
                  );

                },
                totalDelay
              );

            },
            500
          );

        };

    };


  /* ==========================================================
     GAME 6 — SHOOTING STAR
     ========================================================== */

  initializers[11] =
    function initGame6() {

      const star =
        document.getElementById(
          "shooting-star"
        );

      if (!star) return;


      star.classList.remove(
        "flying",
        "caught"
      );


      let caught =
        false;

      let flightTimer =
        null;


      function launch() {

        if (caught) return;


        star.classList.remove(
          "flying"
        );


        void star.offsetWidth;


        star.classList.add(
          "flying"
        );


        flightTimer =
          setTimeout(
            () => {

              if (!caught)
                launch();

            },
            3300
          );
      }


      setTimeout(
        launch,
        900
      );


      star.onclick =
        () => {

          if (caught) return;


          caught = true;


          clearTimeout(
            flightTimer
          );


          star.classList.remove(
            "flying"
          );

          star.classList.add(
            "caught"
          );


          const rect =
            star.getBoundingClientRect();


          spawnSparkBurst(
            rect.left +
            rect.width / 2,

            rect.top +
            rect.height / 2,

            14
          );


          fireConfetti({

            particleCount: 140,

            spread: 100

          });


          setTimeout(
            () => goToStep(12),
            1100
          );

        };

    };


  /* ==========================================================
     FINAL
     ========================================================== */

  initializers[12] =
    function initFinal() {

      fireConfetti({

        particleCount: 160,

        spread: 120,

        origin: {
          y: .5
        }

      });


      setTimeout(
        () => {

          fireConfetti({

            particleCount: 100,

            spread: 90,

            origin: {
              y: .4
            }

          });

        },
        400
      );

    };


  /* ==========================================================
     STEP INITIALIZER
     ========================================================== */

  function initStepContent(
    number
  ) {

    if (
      initializers[number]
    ) {

      initializers[number]();

    }

  }


  /* ==========================================================
     HERO
     ========================================================== */

  function initHero() {

    const candles =
      Array.from(
        document.querySelectorAll(
          ".candle"
        )
      );

    const hint =
      document.getElementById(
        "cake-hint"
      );

    const openButton =
      document.getElementById(
        "open-surprise-btn"
      );


    if (
      !candles.length ||
      !hint ||
      !openButton
    ) return;


    let blownCount =
      0;

    let revealed =
      false;


    function revealOpenButton() {

      if (revealed)
        return;


      revealed = true;


      hint.textContent =
        "Make a wish, sweetheart… 🌟";


      openButton.classList.remove(
        "hidden"
      );


      openButton.style.animation =
        "step-in .6s ease";
    }


    candles.forEach(
      candle => {

        candle.addEventListener(
          "click",
          () => {

            if (
              candle.classList.contains(
                "blown"
              )
            ) return;


            candle.classList.add(
              "blown"
            );


            const rect =
              candle.getBoundingClientRect();


            spawnSparkBurst(
              rect.left +
              rect.width / 2,

              rect.top,

              6
            );


            blownCount++;


            if (
              blownCount >=
              candles.length
            ) {

              revealOpenButton();

            }

          }
        );

      }
    );


    /*
      Safety:
      reveal button after 9 seconds
      even if candles aren't tapped.
    */

    setTimeout(
      revealOpenButton,
      9000
    );


    openButton.onclick =
      () => {

        fireConfetti({

          particleCount: 130,

          spread: 100

        });


        spawnSparkBurst(
          window.innerWidth / 2,

          window.innerHeight / 2,

          16
        );


        setTimeout(
          () => goToStep(1),
          500
        );

      };

  }


  /* ==========================================================
     MUSIC
     ========================================================== */

  function initMusic() {

    const toggle =
      document.getElementById(
        "music-toggle"
      );

    const panel =
      document.getElementById(
        "music-panel"
      );

    const audio =
      document.getElementById(
        "bg-audio"
      );

    const playButton =
      document.getElementById(
        "music-play"
      );

    const pauseButton =
      document.getElementById(
        "music-pause"
      );

    const muteButton =
      document.getElementById(
        "music-mute"
      );

    const volume =
      document.getElementById(
        "music-volume"
      );


    if (
      !toggle ||
      !panel ||
      !audio
    ) return;


    audio.volume =
      Number(
        volume.value
      );


    toggle.onclick =
      () => {

        panel.classList.toggle(
          "hidden"
        );

      };


    playButton.onclick =
      () => {

        audio
          .play()
          .catch(
            () => {}
          );

      };


    pauseButton.onclick =
      () => {

        audio.pause();

      };


    muteButton.onclick =
      () => {

        audio.muted =
          !audio.muted;


        muteButton.textContent =
          audio.muted
            ? "🔈"
            : "🔇";

      };


    volume.addEventListener(
      "input",
      () => {

        audio.volume =
          Number(
            volume.value
          );

      }
    );

  }


  /* ==========================================================
     NEXT BUTTONS
     ========================================================== */

  function initNextButtons() {

    document
      .querySelectorAll(
        ".next-btn"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const step =
                button.closest(
                  ".step"
                );

              if (!step)
                return;


              const current =
                Number(
                  step.dataset.step
                );


              goToStep(
                current + 1
              );

            }
          );

        }
      );

  }


  /* ==========================================================
     REPLAY
     ========================================================== */

  function initReplay() {

    const button =
      document.getElementById(
        "replay-btn"
      );


    if (!button)
      return;


    button.onclick =
      () => {

        showStep(0);

      };

  }


  /* ==========================================================
     THREE.JS BACKGROUND
     ========================================================== */

  function initBackground3D() {

    const canvas =
      document.getElementById(
        "bg-canvas"
      );


    if (
      typeof THREE ===
      "undefined"
    ) {

      initFallback2D();

      return;
    }


    let renderer;


    try {

      renderer =
        new THREE.WebGLRenderer({

          canvas,

          alpha: true,

          antialias:
            !lowPower

        });

    } catch (error) {

      initFallback2D();

      return;
    }


    const scene =
      new THREE.Scene();


    const camera =
      new THREE.PerspectiveCamera(

        55,

        window.innerWidth /
        window.innerHeight,

        .1,

        100

      );


    camera.position.z =
      12;


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        lowPower ? 1.3 : 2
      )
    );


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    const colors = [

      0xffb8d1,
      0xd8c5ff,
      0xffd98e,
      0xffffff,
      0xffcfa3

    ];


    const objectCount =
      lowPower
        ? 14
        : 26;


    const objects = [];


    const geometries = [

      new THREE.SphereGeometry(
        .35,
        12,
        12
      ),

      new THREE.OctahedronGeometry(
        .4,
        0
      ),

      new THREE.TorusGeometry(
        .3,
        .12,
        8,
        16
      ),

      new THREE.IcosahedronGeometry(
        .35,
        0
      )

    ];


    for (
      let i = 0;
      i < objectCount;
      i++
    ) {

      const geometry =
        geometries[
          i % geometries.length
        ];


      const material =
        new THREE.MeshStandardMaterial({

          color:
            colors[
              i % colors.length
            ],

          transparent: true,

          opacity: .65,

          roughness: .4,

          metalness: .1

        });


      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );


      mesh.position.set(

        (
          Math.random() -
          .5
        ) * 16,

        (
          Math.random() -
          .5
        ) * 10,

        (
          Math.random() -
          .5
        ) * 8 - 2

      );


      mesh.userData.speed =
        .15 +
        Math.random() * .3;


      mesh.userData.offset =
        Math.random() *
        Math.PI *
        2;


      mesh.userData.rotSpeed =
        (
          Math.random() -
          .5
        ) * .01;


      scene.add(mesh);

      objects.push(mesh);

    }


    const light =
      new THREE.DirectionalLight(
        0xffffff,
        .9
      );

    light.position.set(
      2,
      4,
      6
    );

    scene.add(light);


    scene.add(
      new THREE.AmbientLight(
        0xffe3ec,
        .8
      )
    );


    let pointerX = 0;
    let pointerY = 0;


    window.addEventListener(
      "pointermove",
      event => {

        pointerX =
          (
            event.clientX /
            window.innerWidth -
            .5
          ) * 2;


        pointerY =
          (
            event.clientY /
            window.innerHeight -
            .5
          ) * 2;

      },
      {
        passive: true
      }
    );


    window.addEventListener(
      "deviceorientation",
      event => {

        if (
          event.gamma == null ||
          event.beta == null
        ) return;


        pointerX =
          Math.max(
            -1,
            Math.min(
              1,
              event.gamma / 30
            )
          );


        pointerY =
          Math.max(
            -1,
            Math.min(
              1,
              (event.beta - 40) / 30
            )
          );

      },
      {
        passive: true
      }
    );


    let paused = false;


    document.addEventListener(
      "visibilitychange",
      () => {

        paused =
          document.hidden;

      }
    );


    const clock =
      new THREE.Clock();


    function animate() {

      requestAnimationFrame(
        animate
      );


      if (paused)
        return;


      const time =
        clock.getElapsedTime();


      objects.forEach(
        object => {

          if (
            !prefersReducedMotion
          ) {

            object.position.y +=

              Math.sin(
                time *
                object.userData.speed +
                object.userData.offset
              ) * .002;


            object.rotation.x +=
              object.userData.rotSpeed;


            object.rotation.y +=
              object.userData.rotSpeed *
              1.4;

          }

        }
      );


      camera.position.x +=
        (
          pointerX * 1.2 -
          camera.position.x
        ) * .03;


      camera.position.y +=
        (
          -pointerY * .8 -
          camera.position.y
        ) * .03;


      camera.lookAt(
        0,
        0,
        0
      );


      renderer.render(
        scene,
        camera
      );

    }


    animate();


    window.addEventListener(
      "resize",
      () => {

        camera.aspect =
          window.innerWidth /
          window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
          window.innerWidth,
          window.innerHeight
        );

      }
    );

  }


  /* ==========================================================
     FALLBACK BACKGROUND
     ========================================================== */

  function initFallback2D() {

    const container =
      document.createElement(
        "div"
      );


    container.setAttribute(
      "aria-hidden",
      "true"
    );


    container.style.position =
      "fixed";

    container.style.inset =
      "0";

    container.style.zIndex =
      "1";

    container.style.pointerEvents =
      "none";

    container.style.overflow =
      "hidden";


    const emojis = [
      "🌸",
      "☁️",
      "✨",
      "💗",
      "⭐"
    ];


    const count =
      lowPower
        ? 8
        : 14;


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const span =
        document.createElement(
          "span"
        );


      span.textContent =
        emojis[
          i % emojis.length
        ];


      span.style.position =
        "absolute";


      span.style.left =
        `${Math.random() * 100}%`;


      span.style.top =
        `${Math.random() * 100}%`;


      span.style.fontSize =
        `${
          16 +
          Math.random() * 20
        }px`;


      span.style.opacity =
        ".55";


      if (
        !prefersReducedMotion
      ) {

        span.style.animation =
          `float-gentle ${
            3 +
            Math.random() * 3
          }s ease-in-out infinite`;


        span.style.animationDelay =
          `${
            Math.random() * 2
          }s`;

      }


      container.appendChild(
        span
      );

    }


    document.body.appendChild(
      container
    );

  }


  /* ==========================================================
     BOOT
     ========================================================== */

  function boot() {

    initHero();

    initNextButtons();

    initMusic();

    initReplay();

    initBackground3D();

    startBalloons();

    showStep(0);

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot
    );

  } else {

    boot();

  }

})();
