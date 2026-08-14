# Mahru's Birthday Adventure 💗

A tiny, cute, interactive 3D birthday website made for Mahru (birthday: **19 August**).

## How to run it

No build step needed — it's a plain HTML/CSS/JS site.

1. Unzip/open the `mahru-birthday` folder.
2. Double-click `index.html` to open it in a browser, **or** (recommended, so photos/music load reliably) serve it locally:
   ```bash
   cd mahru-birthday
   python3 -m http.server 8080
   ```
   then visit `http://localhost:8080` in your browser.
3. That's it — everything else (fonts, Three.js, GSAP, confetti) loads from CDNs automatically.

## 📸 Where to put Mahru's photos

Drop her photos into:

```
assets/photos/
```

using these exact filenames:

```
mahru1.jpg
mahru2.jpg
mahru3.jpg
mahru4.jpg
mahru5.jpg
mahru6.jpg   ← used as the image for the sliding Heart Puzzle mini-game
```

Until photos are added, the site shows soft pastel placeholder cards instead of broken images, so it always looks intentional.

Her face/photos are displayed exactly as supplied — nothing is altered or generated.

## 🎵 Where to put the birthday song

Drop an MP3 into:

```
assets/music/birthday.mp3
```

Tap the floating 🎵 button (top-right) to open the player — it never autoplays.

## 🎮 How the experience works

It's a small "adventure": Mahru plays 6 short, easy mini-games, and each one unlocks a new surprise (a message, a photo, a photo gallery, a letter, etc.), finishing with a full birthday celebration screen.

1. **Hero** — tap the candles, then "Open Your Surprise 🎁"
2. **Catch The Hearts** → unlocks a sweet message
3. **Find The Hidden Flower** → unlocks a photo
4. **Choose The Right Gift** → unlocks a hidden message
5. **Catch The Butterfly** → unlocks a mini photo gallery
6. **Heart Puzzle** → unlocks an animated love letter
7. **Dreamy night sky → Make A Wish** (shooting star) → the full birthday celebration

Progress (which games are done) is saved automatically to the browser's `localStorage`, so a refresh won't lose Mahru's place. A discreet **"Restart Adventure"** link at the bottom lets you reset everything (it asks for confirmation first).

## 🛠️ Tech used (all via CDN, no install required)

- **Three.js** (r128) — the soft floating 3D background scene (bubbles/crystals/rings drifting in pastel colors), with automatic graceful fallback to a lightweight 2D floating-emoji version if WebGL isn't available.
- **GSAP** — available for any extra motion polish you want to add.
- **canvas-confetti** — confetti bursts on unlocks and celebrations.
- **Google Fonts** — Playfair Display, Quicksand, Great Vibes.

Everything respects `prefers-reduced-motion`, scales particle/object counts down on lower-power devices, and is fully touch-friendly with large tap targets — built mobile-first.

## 🗂️ Project structure

```
mahru-birthday/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── photos/
    │   ├── mahru1.jpg … mahru6.jpg   (add these)
    │   └── PUT_PHOTOS_HERE.txt
    └── music/
        ├── birthday.mp3               (add this)
        └── PUT_MUSIC_HERE.txt
```

Happy birthday, Mahru. 💗🎂✨
