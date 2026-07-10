# Mind Reader — Guess My Number 🔮

[![GH Pages Deploy](https://img.shields.io/github/deployments/cid-moosa/html-number-guessing-game/github-pages?label=Live%20Demo&style=for-the-badge)](https://cid-moosa.github.io/html-number-guessing-game/)
[![License: MIT](https://img.shields.io/github/license/cid-moosa/number-guessing-?style=for-the-badge)](LICENSE)
[![HTML/CSS/JS](https://img.shields.io/badge/Language-HTML%20%7C%20CSS%20%7C%20JS-06b6d4?style=for-the-badge)](#)

A premium, interactive mathematical mind-reading game built with vanilla web technologies. It uses a binary-search logic matrix to decode and guess whatever integer you are thinking of in real time. 

---

## ✨ Immersive UI Features

- **Holographic 3D Card Transitions** — Pages rotate on a horizontal 3D axis with a fluid out-ease curve on transitions.
- **Continuous EEG Brainwave Telemetry** — A live SVG signal graph that transforms from erratic noise (chaotic) to a stable harmonic sine wave (synced) as the mind reader narrows down your choice.
- **Interactive Click Particle Bursts** — Colorful physics-based micro-particles shoot out from cursor click targets on Yes/No inputs.
- **Laser Scanning Grid** — Neon-glowing laser beams sweep across question cards to simulate diagnostic scans.
- **Dial Counter Reveal** — A suspenseful reveal sequence that rapidly cycles slot-machine style through random numbers before locking onto the target with a screen-shake and full-canvas confetti burst.
- **Multiple Curated Themes** — Switch instantly between six glowing themes: *Cyber*, *Inferno*, *Forest*, *Royal*, *Rose*, and *Ocean* (saved in LocalStorage).
- **Reduced Motion Support** — Seamlessly honors `prefers-reduced-motion` settings, scaling back intensive 3D rotations and particle loops to clean fades.

---

## 🔮 How the Math Works

1. **Pick a number:** Select any integer within your custom limit (e.g. 1 to 31).
2. **Answer the cards:** Answer Yes or No to whether your secret number appears in the presented lists.
3. **Binary Place Sums:** Behind the scenes, each list corresponds to a binary place value ($2^0, 2^1, 2^2, 2^3, 2^4\dots$). The game automatically sums the base values of the cards containing your number and predicts the result using binary place-value math!

---

## 🚀 Quickstart & Usage

No compilation, local servers, or installation required.

### 1. Run it instantly in one click
👉 **[Play the Live Demo Here!](https://cid-moosa.github.io/html-number-guessing-game/)**

### 2. Run locally in 3 steps
Clone, navigate to the directory, and double-click `index.html` to open it in your browser:
```bash
git clone https://github.com/cid-moosa/number-guessing-.git
cd number-guessing-
# Open in browser:
# Windows:
start index.html
# Mac:
open index.html
# Linux:
xdg-open index.html
```

---

## 📂 Repository Structure

- `index.html` — Deployed unified single-page bundle containing all HTML structure, embedded styles, and scripts.
- `bundle.py` — Python helper script to compile assets from the development `split/` directory into the main file.
- `split/` — Development folder containing modular code for maintainability:
  - `split/index.html` — HTML skeleton.
  - `split/style.css` — Custom animations, themes, and layouts.
  - `split/script.js` — Core binary calculations, brainwave state updates, and particle bursts.

---

## 🛠️ Technology Stack
- **HTML5** for semantic markup.
- **CSS3** for layout (Flexbox/Grid), variables, media queries, and GPU-driven 3D keyframe transitions.
- **JavaScript (Vanilla ES6+)** for calculating binary place values, canvas-free particle simulation, and SVG wave generation.

---

## 📜 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author
Developed and designed by [CIDMOOSA](https://github.com/cid-moosa).
