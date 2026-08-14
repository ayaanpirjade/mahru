/* ============================================================
   Mahru's Birthday Adventure — script.js
   ============================================================ */
(() => {
  "use strict";

  const STORAGE_KEY = "mahru-birthday-progress-v1";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmallScreen = window.innerWidth < 700;
  const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || isSmallScreen;

  const GAME_STEPS = [1, 3, 5, 7, 9, 12]; // steps that count toward the 6 surprises
  const TOTAL_STEPS = 14; // 0..13

  const stage = document.getElementById("stage");
  const steps = Array.from(document.querySelectorAll(".step"));
  const fxLayer = document.getElementById("fx-layer");
  const progressWidget = document.getElementById("progress-widget");
  const progressCountNum = document.getElementById("progress-count-num");
  const progressListItems = Array.from(document.querySelectorAll("#progress-list li"));
  const restartBtn = document.getElementById("restart-adventure-btn");
  const restartConfirm = document.getElementById("restart-confirm");

  /* ------------------------------------------------------------
     State
  ------------------------------------------------------------ */
  let state = {
    step: 0,
    gamesDone: [], // list of GAME_STEPS completed
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.step === "number" && Array.isArray(parsed.gamesDone)) {
          state = parsed;
        }
      }
    } catch (e) {
      /* ignore corrupted storage */
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable — continue without persistence */
    }
  }

  function resetState() {
    state = { step: 0, gamesDone: [] };
    saveState();
  }

  /* ------------------------------------------------------------
     Tiny FX: heart bursts, sparks, confetti
  ------------------------------------------------------------ */
  function spawnHeart(x, y, size) {
    const el = document.createElement("div");
    el.className = "fx-heart";
    el.textContent = ["💗", "💕", "💖", "✨"][Math.floor(Math.random() * 4)];
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.fontSize = (size || 20) + "px";
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function spawnSparkBurst(x, y, count) {
    const n = prefersReducedMotion ? 0 : count || 8;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "fx-spark";
      const angle = (Math.PI * 2 * i) / n;
      const dist = 30 + Math.random() * 30;
      el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      el.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      el.style.left = x + "px";
      el.style.top = y + "px";
      fxLayer.appendChild(el);
      setTimeout(() => el.remove(), 750);
    }
  }

  function fireConfetti(opts) {
    if (typeof confetti !== "function") return;
    if (prefersReducedMotion) return;
    confetti(Object.assign({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#ff8fab", "#ffd98e", "#e9dfff", "#ffe3cc", "#ffffff"],
    }, opts || {}));
  }

  // Global tap-to-burst-hearts on empty background areas
  document.addEventListener("pointerdown", (e) => {
    const isInteractive = e.target.closest("button, a, input, .polaroid, .letter-paper");
    if (isInteractive) return;
    spawnHeart(e.clientX, e.clientY, 18 + Math.random() * 10);
    if (Math.random() < 0.5) spawnSparkBurst(e.clientX, e.clientY, 4);
  });

  /* ------------------------------------------------------------
     Balloons (ambient bonus interaction)
  ------------------------------------------------------------ */
  const balloonEmoji = ["🎈"];
  const balloonMessages = [
    "You're so loved, Mahru! 💗",
    "Pop! Another reason you're amazing 🥹",
    "Happy Birthday energy incoming ✨",
    "Yay! 🎉",
  ];

  function spawnBalloon() {
    if (document.hidden) return;
    const el = document.createElement("button");
    el.className = "balloon";
    el.setAttribute("aria-label", "Pop the balloon");
    el.textContent = balloonEmoji[0];
    const left = 5 + Math.random() * 85;
    el.style.left = left + "vw";
    const duration = 9 + Math.random() * 6;
    el.style.animationDuration = duration + "s";
    document.body.appendChild(el);

    const remove = () => el.remove();
    el.addEventListener("animationend", () => {
      if (!el.classList.contains("popped")) remove();
    });

    el.addEventListener("click", () => {
      if (el.classList.contains("popped")) return;
      const rect = el.getBoundingClientRect();
      el.classList.add("popped");
      spawnSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
      fireConfetti({ particleCount: 24, spread: 50, origin: { x: rect.left / window.innerWidth, y: rect.top / window.innerHeight } });
      const msg = document.createElement("div");
      msg.className = "fx-heart";
      msg.style.left = rect.left + rect.width / 2 + "px";
      msg.style.top = rect.top + "px";
      msg.style.fontSize = "13px";
      msg.style.fontWeight = "700";
      msg.style.whiteSpace = "nowrap";
      msg.textContent = balloonMessages[Math.floor(Math.random() * balloonMessages.length)];
      fxLayer.appendChild(msg);
      setTimeout(() => msg.remove(), 1300);
      setTimeout(remove, 400);
    });
  }

  let balloonInterval = null;
  function startBalloons() {
    if (prefersReducedMotion || balloonInterval) return;
    balloonInterval = setInterval(() => {
      if (Math.random() < 0.7) spawnBalloon();
    }, 4200);
  }

  /* ------------------------------------------------------------
     Step navigation
  ------------------------------------------------------------ */
  function showStep(n) {
    steps.forEach((s) => s.classList.toggle("active", Number(s.dataset.step) === n));
    state.step = n;
    saveState();
    updateProgressWidget();
    window.scrollTo({ top: 0, behavior: "auto" });

    if (n >= 1) {
      progressWidget.classList.remove("hidden");
      restartBtn.classList.remove("hidden");
    } else {
      progressWidget.classList.add("hidden");
      restartBtn.classList.add("hidden");
    }

    initStepContent(n);
  }

  function goToStep(n) {
    showStep(n);
  }

  function completeGame(gameStep) {
    if (!state.gamesDone.includes(gameStep)) {
      state.gamesDone.push(gameStep);
      saveState();
    }
    updateProgressWidget();
  }

  function updateProgressWidget() {
    progressCountNum.textContent = state.gamesDone.length;
    progressListItems.forEach((li) => {
      const step = Number(li.dataset.step);
      const done = state.gamesDone.includes(step);
      const current = step === state.step;
      li.classList.toggle("done", done);
      li.classList.toggle("current", current && !done);
      const icon = li.querySelector(".lock-icon");
      icon.textContent = done ? "✅" : current ? "🔓" : "🔒";
    });
  }

  /* ------------------------------------------------------------
     STEP CONTENT INITIALIZERS
  ------------------------------------------------------------ */
  const initializers = {};

  /* ---- Step 1: Catch The Hearts ---- */
  initializers[1] = function initGame1() {
    const area = document.getElementById("game1-area");
    const counterEl = document.getElementById("game1-count");
    area.innerHTML = "";
    let caught = 0;
    counterEl.textContent = "0";
    const NEEDED = 5;
    const HEART_COUNT = 8;

    for (let i = 0; i < HEART_COUNT; i++) {
      const btn = document.createElement("button");
      btn.className = "float-heart-btn";
      btn.textContent = "💗";
      btn.setAttribute("aria-label", "Catch heart");
      const left = 6 + Math.random() * 82;
      const top = 6 + Math.random() * 78;
      btn.style.left = left + "%";
      btn.style.top = top + "%";
      btn.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
      btn.addEventListener("click", () => {
        if (btn.classList.contains("popped")) return;
        btn.classList.add("popped");
        const rect = btn.getBoundingClientRect();
        spawnSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
        caught++;
        counterEl.textContent = String(Math.min(caught, NEEDED));
        if (caught >= NEEDED) {
          completeGame(1);
          fireConfetti({});
          setTimeout(() => goToStep(2), 700);
        }
      });
      area.appendChild(btn);
    }
  };

  /* ---- Step 3: Find The Hidden Flower ---- */
  initializers[3] = function initGame2() {
    const area = document.getElementById("game2-area");
    area.innerHTML = "";
    const flowers = ["🌷", "🌸", "🌻", "🌼", "🌺", "🪷"];
    const correctIndex = Math.floor(Math.random() * 6);

    for (let i = 0; i < 6; i++) {
      const btn = document.createElement("button");
      btn.className = "flower-btn";
      btn.textContent = flowers[i];
      const left = 8 + (i % 3) * 30 + Math.random() * 8;
      const top = 15 + Math.floor(i / 3) * 42 + Math.random() * 8;
      btn.style.left = left + "%";
      btn.style.top = top + "%";
      btn.addEventListener("click", () => {
        if (i === correctIndex) {
          btn.classList.add("bloom");
          btn.textContent = "🌼✨";
          const rect = btn.getBoundingClientRect();
          spawnSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
          completeGame(3);
          fireConfetti({});
          setTimeout(() => goToStep(4), 800);
        } else {
          btn.style.transform = "scale(0.8) rotate(-8deg)";
          setTimeout(() => (btn.style.transform = ""), 250);
        }
      });
      area.appendChild(btn);
    }
  };

  /* ---- Step 5: Choose The Right Gift ---- */
  initializers[5] = function initGame3() {
    const boxes = Array.from(document.querySelectorAll("#game3-area .gift-box"));
    const feedback = document.getElementById("game3-feedback");
    feedback.textContent = "\u00A0";
    boxes.forEach((b) => {
      b.classList.remove("opened", "shake");
      b.disabled = false;
    });
    const correct = Math.floor(Math.random() * boxes.length);

    boxes.forEach((box, idx) => {
      const handler = () => {
        if (idx === correct) {
          boxes.forEach((b) => (b.disabled = true));
          box.classList.add("opened");
          box.querySelector(".gift-body").textContent = "💌";
          feedback.textContent = "You found it! 🎉";
          const rect = box.getBoundingClientRect();
          spawnSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
          completeGame(5);
          fireConfetti({});
          setTimeout(() => goToStep(6), 900);
        } else {
          box.classList.remove("shake");
          void box.offsetWidth;
          box.classList.add("shake");
          feedback.textContent = "Nopeee 😭 Try another one!";
        }
      };
      box.onclick = handler;
    });
  };

  /* ---- Step 7: Catch The Butterfly ---- */
  initializers[7] = function initGame4() {
    const butterfly = document.getElementById("butterfly");
    const area = document.getElementById("game4-area");
    butterfly.classList.remove("landed");
    let moveTimer = null;

    function moveButterfly() {
      const maxLeft = area.clientWidth - 50;
      const maxTop = area.clientHeight - 50;
      const left = Math.max(0, Math.random() * maxLeft);
      const top = Math.max(0, Math.random() * maxTop);
      butterfly.style.left = left + "px";
      butterfly.style.top = top + "px";
    }
    moveButterfly();
    moveTimer = setInterval(moveButterfly, 1500);

    butterfly.onclick = () => {
      clearInterval(moveTimer);
      butterfly.classList.add("landed");
      const rect = butterfly.getBoundingClientRect();
      spawnSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
      completeGame(7);
      fireConfetti({});
      setTimeout(() => goToStep(8), 900);
    };
  };

 /* =========================================
   STEP 9 — GAME 5
   MAHRU 8-PIECE JIGSAW PUZZLE
   ========================================= */

initializers[9] = function initGame5() {

  const game = document.getElementById("jigsaw-game");
  const progress = document.getElementById("jigsaw-progress");
  const status = document.getElementById("jigsaw-status");

  if (!game || !progress || !status) return;

  game.innerHTML = "";

  /*
    8 PIECES
    4 columns × 2 rows

    0 1 2 3
    4 5 6 7
  */

  const COLS = 4;
  const ROWS = 2;
  const TOTAL = COLS * ROWS;

  const board = document.createElement("div");
  board.className = "jigsaw-board";

  game.appendChild(board);

  /*
    Create a jigsaw SVG path for every piece.

    The paths are generated from the piece's
    row/column position so neighboring pieces
    have matching tabs/gaps.
  */

  function createPiecePath(col, row) {

    const W = 100;
    const H = 100;

    let path = `M 0 0`;

    /* TOP EDGE */

    if (row === 0) {

      path += ` L ${W} 0`;

    } else {

      const direction = ((col + row) % 2 === 0) ? 1 : -1;

      path += `
        L 25 0
        C 35 0 35 ${direction * 18} 50 ${direction * 18}
        C 65 ${direction * 18} 65 0 75 0
        L ${W} 0
      `;
    }

    /* RIGHT EDGE */

    if (col === COLS - 1) {

      path += ` L ${W} ${H}`;

    } else {

      const direction = ((col + row) % 2 === 0) ? 1 : -1;

      path += `
        L ${W} 25
        C ${W} 35 ${W + direction * 18} 35 ${W + direction * 18} 50
        C ${W + direction * 18} 65 ${W} 65 ${W} 75
        L ${W} ${H}
      `;
    }

    /* BOTTOM EDGE */

    if (row === ROWS - 1) {

      path += ` L 0 ${H}`;

    } else {

      const direction = ((col + row) % 2 === 0) ? -1 : 1;

      path += `
        L 75 ${H}
        C 65 ${H} 65 ${H + direction * 18} 50 ${H + direction * 18}
        C 35 ${H + direction * 18} 35 ${H} 25 ${H}
        L 0 ${H}
      `;
    }

    /* LEFT EDGE */

    if (col === 0) {

      path += ` L 0 0`;

    } else {

      const direction = ((col + row) % 2 === 0) ? -1 : 1;

      path += `
        L 0 75
        C ${direction * 18} 65 ${direction * 18} 65 ${direction * 18} 50
        C ${direction * 18} 35 0 35 0 25
        L 0 0
      `;
    }

    return path + " Z";
  }


  /*
    Create SVG piece
  */

  function createPiece(index) {

    const col = index % COLS;
    const row = Math.floor(index / COLS);

    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");

    svg.setAttribute("viewBox", "-20 -20 140 140");

    svg.classList.add("jigsaw-piece");

    svg.dataset.correct = index;

    /*
      Position of the correct location
    */

    const boardRect = board.getBoundingClientRect();

    const pieceWidth = boardRect.width / COLS;
    const pieceHeight = boardRect.height / ROWS;

    const correctX = col * pieceWidth;
    const correctY = row * pieceHeight;

    svg.dataset.correctX = correctX;
    svg.dataset.correctY = correctY;

    /*
      Create clipping path
    */

    const defs = document.createElementNS(svgNS, "defs");

    const clip = document.createElementNS(svgNS, "clipPath");

    const clipId =
      `jigsaw-clip-${Date.now()}-${index}`;

    clip.setAttribute("id", clipId);

    const path = document.createElementNS(svgNS, "path");

    path.setAttribute(
      "d",
      createPiecePath(col, row)
    );

    clip.appendChild(path);

    defs.appendChild(clip);

    svg.appendChild(defs);

    /*
      Image
    */

    const image =
      document.createElementNS(svgNS, "image");

    image.setAttribute(
      "href",
      "assets/photos/mahru6.jpg"
    );

    image.setAttribute(
      "x",
      -(col * 100)
    );

    image.setAttribute(
      "y",
      -(row * 100)
    );

    image.setAttribute(
      "width",
      COLS * 100
    );

    image.setAttribute(
      "height",
      ROWS * 100
    );

    image.setAttribute(
      "preserveAspectRatio",
      "xMidYMid slice"
    );

    image.setAttribute(
      "clip-path",
      `url(#${clipId})`
    );

    svg.appendChild(image);

    /*
      Add white outline
    */

    const outline =
      document.createElementNS(svgNS, "path");

    outline.setAttribute(
      "d",
      createPiecePath(col, row)
    );

    outline.setAttribute(
      "fill",
      "none"
    );

    outline.setAttribute(
      "stroke",
      "rgba(255,255,255,.8)"
    );

    outline.setAttribute(
      "stroke-width",
      "2"
    );

    svg.appendChild(outline);

    return svg;
  }


  /*
    Shuffle array
  */

  function shuffle(array) {

    const copy = [...array];

    for (
      let i = copy.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(Math.random() * (i + 1));

      [copy[i], copy[j]] =
        [copy[j], copy[i]];
    }

    return copy;
  }


  /*
    Create pieces
  */

  const pieces = [];

  for (let i = 0; i < TOTAL; i++) {

    const piece = createPiece(i);

    pieces.push(piece);

    game.appendChild(piece);
  }


  /*
    Position pieces randomly around board
  */

  const gameRect = game.getBoundingClientRect();

  const boardRect = board.getBoundingClientRect();

  const pieceWidth =
    boardRect.width / COLS;

  const pieceHeight =
    boardRect.height / ROWS;

  const positions = shuffle(
    Array.from(
      { length: TOTAL },
      (_, i) => i
    )
  );


  pieces.forEach((piece, i) => {

    const randomIndex = positions[i];

    const randomCol =
      randomIndex % COLS;

    const randomRow =
      Math.floor(randomIndex / COLS);

    /*
      Put pieces around the board.
    */

    const x =
      board.offsetLeft +
      randomCol * pieceWidth;

    const y =
      board.offsetTop +
      randomRow * pieceHeight;

    /*
      Slight random offset.
    */

    const offsetX =
      (Math.random() - .5) *
      Math.min(80, pieceWidth * .35);

    const offsetY =
      (Math.random() - .5) *
      Math.min(80, pieceHeight * .35);

    piece.style.width =
      `${pieceWidth}px`;

    piece.style.height =
      `${pieceHeight}px`;

    piece.style.left =
      `${x + offsetX}px`;

    piece.style.top =
      `${y + offsetY}px`;

    piece.style.transform =
      `rotate(${(Math.random() - .5) * 12}deg)`;

  });


  /*
    DRAG SYSTEM
  */

  let activePiece = null;

  let pointerOffsetX = 0;
  let pointerOffsetY = 0;

  let solvedCount = 0;


  pieces.forEach(piece => {

    piece.addEventListener(
      "pointerdown",
      startDrag
    );

  });


  function startDrag(event) {

    if (
      this.classList.contains("locked")
    ) return;

    activePiece = this;

    activePiece.classList.add("dragging");

    activePiece.setPointerCapture(
      event.pointerId
    );

    const rect =
      activePiece.getBoundingClientRect();

    pointerOffsetX =
      event.clientX - rect.left;

    pointerOffsetY =
      event.clientY - rect.top;

    activePiece.addEventListener(
      "pointermove",
      dragPiece
    );

    activePiece.addEventListener(
      "pointerup",
      stopDrag
    );

    activePiece.addEventListener(
      "pointercancel",
      stopDrag
    );

  }


  function dragPiece(event) {

    if (!activePiece) return;

    const gameRect =
      game.getBoundingClientRect();

    const newX =
      event.clientX -
      gameRect.left -
      pointerOffsetX;

    const newY =
      event.clientY -
      gameRect.top -
      pointerOffsetY;

    activePiece.style.left =
      `${newX}px`;

    activePiece.style.top =
      `${newY}px`;

    activePiece.style.transform =
      "rotate(0deg) scale(1.04)";
  }


  function stopDrag(event) {

    if (!activePiece) return;

    const piece =
      activePiece;

    piece.classList.remove("dragging");

    piece.removeEventListener(
      "pointermove",
      dragPiece
    );

    piece.removeEventListener(
      "pointerup",
      stopDrag
    );

    piece.removeEventListener(
      "pointercancel",
      stopDrag
    );

    /*
      Calculate correct position
    */

    const correctIndex =
      Number(piece.dataset.correct);

    const correctCol =
      correctIndex % COLS;

    const correctRow =
      Math.floor(correctIndex / COLS);

    const targetX =
      board.offsetLeft +
      correctCol * pieceWidth;

    const targetY =
      board.offsetTop +
      correctRow * pieceHeight;

    const currentX =
      parseFloat(piece.style.left);

    const currentY =
      parseFloat(piece.style.top);

    const distance =
      Math.hypot(
        currentX - targetX,
        currentY - targetY
      );

    /*
      Snap if close enough
    */

    const snapDistance =
      Math.min(
        70,
        pieceWidth * .45
      );

    if (
      distance <= snapDistance
    ) {

      piece.style.left =
        `${targetX}px`;

      piece.style.top =
        `${targetY}px`;

      piece.style.transform =
        "rotate(0deg) scale(1)";

      piece.classList.add("locked");
      piece.classList.add("correct");

      solvedCount++;

      updateProgress();

      /*
        Tiny sparkle effect
      */

      const rect =
        piece.getBoundingClientRect();

      if (
        typeof spawnSparkBurst ===
        "function"
      ) {

        spawnSparkBurst(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          8
        );

      }

      /*
        Check completion
      */

      if (
        solvedCount === TOTAL
      ) {

        finishPuzzle();

      }

    }

    activePiece = null;

  }


  /*
    Progress
  */

  function updateProgress() {

    progress.textContent =
      `${solvedCount} / ${TOTAL} pieces 💗`;

    if (solvedCount < TOTAL) {

      status.textContent =
        solvedCount === 0
          ? "Drag the pieces into their matching spots 🥹"
          : `So cute! ${TOTAL - solvedCount} pieces left 💗`;

    }

  }


  /*
    FINISH
  */

  function finishPuzzle() {

    status.classList.add("success");

    status.innerHTML =
      "YOU DID IT! 🥹💗 You found my beautiful Mahru! 🎀✨";

    progress.textContent =
      "8 / 8 pieces — COMPLETE! 🎉";

    /*
      Complete existing adventure system
    */

    if (
      typeof completeGame ===
      "function"
    ) {

      completeGame(9);

    }

    /*
      Confetti
    */

    if (
      typeof fireConfetti ===
      "function"
    ) {

      fireConfetti({
        particleCount: 160,
        spread: 100
      });

    }

    /*
      Extra sparkle
    */

    const boardRect =
      board.getBoundingClientRect();

    if (
      typeof spawnSparkBurst ===
      "function"
    ) {

      spawnSparkBurst(
        boardRect.left +
        boardRect.width / 2,

        boardRect.top +
        boardRect.height / 2,

        25
      );

    }

    /*
      Move to existing Step 10
    */

    setTimeout(() => {

      if (
        typeof goToStep ===
        "function"
      ) {

        goToStep(10);

      }

    }, 1300);

  }


  /*
    Initial progress
  */

  updateProgress();

};

  /* ---- Step 10: Letter (envelope) ---- */
  initializers[10] = function initReveal5() {
    const envelope = document.getElementById("envelope");
    const paper = document.getElementById("letter-paper");
    const afterBtn = document.getElementById("after-letter-btn");
    const lines = Array.from(paper.querySelectorAll(".letter-line, .letter-signoff"));
    envelope.classList.remove("opened");
    paper.classList.add("hidden");
    afterBtn.classList.add("hidden");
    lines.forEach((l) => l.classList.remove("show"));

    envelope.onclick = () => {
      if (envelope.classList.contains("opened")) return;
      envelope.classList.add("opened");
      setTimeout(() => {
        paper.classList.remove("hidden");
        lines.forEach((line) => {
          const delay = Number(line.dataset.delay) * 450;
          setTimeout(() => line.classList.add("show"), delay);
        });
        const totalDelay = lines.length * 450 + 400;
        setTimeout(() => afterBtn.classList.remove("hidden"), totalDelay);
      }, 500);
    };
  };

  /* ---- Step 12: Make A Wish (shooting star) ---- */
  initializers[12] = function initGame6() {
    const star = document.getElementById("shooting-star");
    star.classList.remove("flying", "caught");
    let caught = false;
    let flightTimer = null;

    function launch() {
      if (caught) return;
      star.classList.remove("flying");
      void star.offsetWidth;
      star.classList.add("flying");
      flightTimer = setTimeout(() => {
        if (!caught) launch(); // keep trying until caught
      }, 3300);
    }
    setTimeout(launch, 900);

    star.onclick = () => {
      if (caught) return;
      caught = true;
      clearTimeout(flightTimer);
      star.classList.remove("flying");
      star.classList.add("caught");
      const rect = star.getBoundingClientRect();
      spawnSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
      completeGame(12);
      fireConfetti({ particleCount: 140, spread: 100 });
      setTimeout(() => goToStep(13), 1100);
    };
  };

  /* ---- Step 13: Final ---- */
  initializers[13] = function initFinal() {
    fireConfetti({ particleCount: 160, spread: 120, origin: { y: 0.5 } });
    setTimeout(() => fireConfetti({ particleCount: 100, spread: 90, origin: { y: 0.4 } }), 400);
  };

  function initStepContent(n) {
    if (initializers[n]) initializers[n]();
  }

  /* ------------------------------------------------------------
     Hero: candle tapping + open surprise
  ------------------------------------------------------------ */
  function initHero() {
    const candles = Array.from(document.querySelectorAll(".candle"));
    const hint = document.getElementById("cake-hint");
    const openBtn = document.getElementById("open-surprise-btn");
    let blownCount = 0;
    let revealed = false;

    function revealOpenButton() {
      if (revealed) return;
      revealed = true;
      hint.textContent = "Make a wish, sweetheart… 🌟";
      openBtn.classList.remove("hidden");
      openBtn.style.animation = "step-in 0.6s ease";
    }

    candles.forEach((c) => {
      c.addEventListener("click", () => {
        if (c.classList.contains("blown")) return;
        c.classList.add("blown");
        const rect = c.getBoundingClientRect();
        spawnSparkBurst(rect.left + rect.width / 2, rect.top, 6);
        blownCount++;
        if (blownCount >= candles.length) revealOpenButton();
      });
    });

    // accessibility / safety net: reveal the button after a while regardless
    setTimeout(revealOpenButton, 9000);

    openBtn.addEventListener("click", () => {
      fireConfetti({ particleCount: 130, spread: 100 });
      spawnSparkBurst(window.innerWidth / 2, window.innerHeight / 2, 16);
      setTimeout(() => goToStep(1), 500);
    });
  }

  /* ------------------------------------------------------------
     Music widget
  ------------------------------------------------------------ */
  function initMusic() {
    const toggle = document.getElementById("music-toggle");
    const panel = document.getElementById("music-panel");
    const audio = document.getElementById("bg-audio");
    const playBtn = document.getElementById("music-play");
    const pauseBtn = document.getElementById("music-pause");
    const muteBtn = document.getElementById("music-mute");
    const volume = document.getElementById("music-volume");
    const icon = document.getElementById("music-icon");

    audio.volume = Number(volume.value);

    toggle.addEventListener("click", () => panel.classList.toggle("hidden"));

    playBtn.addEventListener("click", () => {
      audio.play().catch(() => {
        /* autoplay / missing file — silently ignore, user can retry */
      });
      icon.textContent = "🎵";
    });
    pauseBtn.addEventListener("click", () => audio.pause());
    muteBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
      muteBtn.textContent = audio.muted ? "🔈" : "🔇";
    });
    volume.addEventListener("input", () => {
      audio.volume = Number(volume.value);
    });
    audio.addEventListener("error", () => {
      icon.textContent = "🎵";
    });
  }

  /* ------------------------------------------------------------
     Generic "Continue My Adventure →" buttons (reveal panels, night scene)
  ------------------------------------------------------------ */
  function initNextButtons() {
    document.querySelectorAll(".next-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const stepEl = btn.closest(".step");
        if (!stepEl) return;
        const current = Number(stepEl.dataset.step);
        goToStep(current + 1);
      });
    });
  }

  /* ------------------------------------------------------------
     Restart adventure
  ------------------------------------------------------------ */
  function initRestart() {
    restartBtn.addEventListener("click", () => restartConfirm.classList.remove("hidden"));
    document.getElementById("restart-no").addEventListener("click", () => restartConfirm.classList.add("hidden"));
    document.getElementById("restart-yes").addEventListener("click", () => {
      restartConfirm.classList.add("hidden");
      resetState();
      showStep(0);
    });
  }

  /* ------------------------------------------------------------
     Replay (final step)
  ------------------------------------------------------------ */
  function initReplay() {
    document.getElementById("replay-btn").addEventListener("click", () => {
      resetState();
      showStep(0);
    });
  }

  /* ------------------------------------------------------------
     Lightweight Three.js ambient background
  ------------------------------------------------------------ */
  function initBackground3D() {
    const canvas = document.getElementById("bg-canvas");

    if (typeof THREE === "undefined") {
      initFallback2D();
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lowPower });
    } catch (e) {
      initFallback2D();
      return;
    }
    if (!renderer) {
      initFallback2D();
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 12;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.3 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const colors = [0xffb8d1, 0xd8c5ff, 0xffd98e, 0xffffff, 0xffcfa3];
    const objectCount = lowPower ? 14 : 26;
    const objects = [];

    const geometries = [
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.TorusGeometry(0.3, 0.12, 8, 16),
      new THREE.IcosahedronGeometry(0.35, 0),
    ];

    for (let i = 0; i < objectCount; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.75,
        roughness: 0.4,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8 - 2
      );
      mesh.userData.speed = 0.15 + Math.random() * 0.3;
      mesh.userData.offset = Math.random() * Math.PI * 2;
      mesh.userData.rotSpeed = (Math.random() - 0.5) * 0.01;
      scene.add(mesh);
      objects.push(mesh);
    }

    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(2, 4, 6);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffe3ec, 0.8));

    let pointerX = 0;
    let pointerY = 0;
    window.addEventListener("pointermove", (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // gentle gyroscope parallax on supported mobile devices
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null || e.beta == null) return;
      pointerX = Math.max(-1, Math.min(1, e.gamma / 30));
      pointerY = Math.max(-1, Math.min(1, (e.beta - 40) / 30));
    }, { passive: true });

    let paused = false;
    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;
      const t = clock.getElapsedTime();

      objects.forEach((m) => {
        if (!prefersReducedMotion) {
          m.position.y += Math.sin(t * m.userData.speed + m.userData.offset) * 0.002;
          m.rotation.x += m.userData.rotSpeed;
          m.rotation.y += m.userData.rotSpeed * 1.4;
        }
      });

      camera.position.x += (pointerX * 1.2 - camera.position.x) * 0.03;
      camera.position.y += (-pointerY * 0.8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function initFallback2D() {
    // Graceful degrade: soft floating emoji layer instead of WebGL scene
    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.zIndex = "1";
    container.style.pointerEvents = "none";
    container.style.overflow = "hidden";
    const emojis = ["🌸", "☁️", "✨", "💗", "⭐"];
    const count = lowPower ? 8 : 14;
    for (let i = 0; i < count; i++) {
      const span = document.createElement("span");
      span.textContent = emojis[i % emojis.length];
      span.style.position = "absolute";
      span.style.left = Math.random() * 100 + "%";
      span.style.top = Math.random() * 100 + "%";
      span.style.fontSize = 16 + Math.random() * 20 + "px";
      span.style.opacity = "0.55";
      if (!prefersReducedMotion) {
        span.style.animation = `float-gentle ${3 + Math.random() * 3}s ease-in-out infinite`;
        span.style.animationDelay = Math.random() * 2 + "s";
      }
      container.appendChild(span);
    }
    document.body.appendChild(container);
  }

  /* ------------------------------------------------------------
     Boot
  ------------------------------------------------------------ */
  function boot() {
    loadState();
    initHero();
    initNextButtons();
    initMusic();
    initRestart();
    initReplay();
    initBackground3D();
    startBalloons();

    // Resume where the user left off
    showStep(state.step || 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
