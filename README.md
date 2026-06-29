# Tic-Tac-Toe Evolution Suite 🎮

[![HTML5 Shield](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3 Shield](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript Shield](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Java Shield](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![A11y Compliant](https://img.shields.io/badge/Accessibility-WCAG%20AA-brightgreen?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

An interactive portfolio project displaying software engineering growth and versatility across three distinct application phases: a **Java Console CLI**, a **Java Swing GUI Desktop Client**, and a high-fidelity **Modern Web Application**. 

Features an **unbeatable AI powered by the Minimax search algorithm**, custom browser-synthesized audio effects, light/dark theme persistence, full accessibility compliance, and interactive match history logs.

🚀 **[Play the Live Web Demo here!](https://shyamsunderreddypolu.github.io/TicTacToe/)** *(Replace with your deployed GitHub Pages URL)*

---

## 📈 The Evolution Story

This repository showcases the transition of a beginner program into an industry-compliant production-style suite:
1. **Phase 1: CLI Console Application (Java)**: Focused on command line input parsing, array state management, coordinate verification, and exception safety.
2. **Phase 2: GUI Desktop Client (Java Swing)**: Focused on event-driven programming, grid layout designs, visual score keeping, and mouse interaction handling.
3. **Phase 3: Responsive Web Application (HTML5/CSS3/JavaScript)**: Rebuilt with modern UX design principles (glassmorphism, variables, dark mode), dynamic browser sound synthesis via the Web Audio API, dynamic animation queues, match log databases, and strict WCAG AA keyboard/screen-reader accessibility standards.

---

## 🌟 Key Technical Features

### 🧠 Unbeatable Minimax AI Engine
The Web App's "Hard Mode" uses a recursive backtracking **Minimax decision tree algorithm** to simulate all possible future game states.
* It guarantees a win or a draw by recursively scoring branches:
  * **Win** (AI O): $+10$ minus recursion depth (prioritizes immediate wins).
  * **Loss** (Player X): $-10$ plus recursion depth (prioritizes immediate defensive blocks).
  * **Tie**: $0$.
* Includes **Easy** (random heuristic) and **Medium** (tactical blocks and corner capture checks) difficulties for a balanced user experience.

### 🔊 Dynamic Web Audio API Synthesis
To bypass large media asset payloads and eliminate network latency, the web game utilizes a custom browser synthesizer. 
* Tones are mathematically generated as **sine and triangle waveforms** inside `app.js`.
* Employs exponential gain decays to produce natural retro-chic audio cues (clicks, wipes, wins, and draws).

### ♿ Accessibility (A11y) & Usability
* **Keyboard Grid Traversal**: Focusable button grid cells supporting arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) to jump between grid elements.
* **Screen Reader Friendly**: Utilizes `aria-live="polite"` tags to broadcast game events (wins, draws, turn-shifts) aloud, and updates dynamic `aria-label` definitions as moves occur.
* **High Contrast & Responsive**: Tested to WCAG AA color contrast ratios on light/dark modes. Re-adjusts layouts smoothly across mobile, tablet, and widescreen viewports.

---

## 🛠️ Technology Stack & Directory Structure

```text
TicTacToe/
│
├── index.html           # Main Single-Page Web Frontend (A11y marked)
├── styles.css           # Premium Slate stylesheet (CSS variables & animations)
├── app.js               # Game State Controller, Minimax AI, Audio Synth
├── README.md            # Recruiter-friendly Portfolio Documentation
│
└── src/                 # Java Backend Module
    ├── TicTacToe.java   # Refactored CLI Console version (Scanner & validation)
    └── TicTacToeGUI.java # Polished Swing GUI desktop client (Slate theme)
```

---

## 🚀 Installation & Running Guide

### 🌐 Running the Web Application
No build commands, compilers, or server side dependencies are required. 
* **Quick Play**: Simply double-click `index.html` to run it locally in any web browser.
* **Live Server (Optional)**: For local testing with hot-reload:
  ```bash
  npx live-server
  ```

---

### ☕ Running the Java Suite

Ensure you have the [Java Development Kit (JDK 17+)](https://openjdk.org/) installed and added to your system path.

#### 1. CLI Console Version
Open your command terminal at the repository root and compile:
```bash
# Compile
javac src/TicTacToe.java

# Run
java -cp src TicTacToe
```
**Gameplay Input**: When prompted, enter two space-separated digits `row col` (e.g., `1 1` for center cell, `0 2` for top-right).

#### 2. GUI Desktop Version
Open your command terminal at the repository root and compile:
```bash
# Compile
javac src/TicTacToeGUI.java

# Run
java -cp src TicTacToeGUI
```

---

## 📝 Design Patterns & Clean Code Architecture
* **Separation of Concerns (SoC)**: Separate representations of core states (game boards, wins, scores) from view rendering logic.
* **Event-Driven UI**: Event listeners bind game loops to UI nodes, freeing main threads for smooth browser layouts.
* **Synthesized Generators**: Keeps application dependencies lightweight, removing the need for external static media assets.
* **Defensive Input Validation**: Robust handling of scanner parsing overflows in Java CLI, preventing stacktrace crashes.

---

## 🤝 Contact & Showcasing
* **Developer**: Shyam Sunder Reddy Polu
* **LinkedIn**: [Your Profile](https://www.linkedin.com) *(Optional)*
* **GitHub**: [github.com/shyamsunderreddypolu](https://github.com/shyamsunderreddypolu)
