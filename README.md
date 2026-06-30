# Tic-Tac-Toe Experiments 🎮

I wanted to build something fun to help me practice my coding skills. I started with a simple Java version in my console, then tried to make a GUI, and finally wanted to see if I could bring it to the web with some cool custom audio.

This repository is my playground where I compared how the game behaves when written in standard Java versus running in a modern web browser, and where I experimented with different coding concepts.

👉 **[Try out the live Web version here!](https://tic-tac-toe-sigma-three-54.vercel.app/)**

---

## 🚀 How This Project Grew

1. **Console Game (Java)**: I started by printing a basic grid onto the terminal screen. I learned how to validate board inputs and structure coordinates cleanly in Java.
2. **Desktop Client (Java Swing)**: I wanted to try out desktop visual layouts, so I built a clean, event-driven Swing interface using mouse click triggers and a scoreboard.
3. **Web Application (HTML/CSS/JS)**: I rebuilt the board using a responsive CSS grid, added color themes, integrated customized sound waves, built a match logger, and finally added support for keyboard arrow navigation.

---

## 🧠 What I learned in this project

### Building a smart AI with the Minimax algorithm
I was curious about how computer players "think" in logic games, so I researched and built a **Minimax decision tree search**:
* The AI looks at all empty cells on the grid, plays ahead to simulate every single outcome of the match, and scores them.
* If a sequence leads to a win, it rates it $+10$ (minus depth to win as fast as possible). If a sequence leads to a loss, it rates it $-10$ (plus depth).
* It chooses the highest score when it's the AI's turn and assumes the player will choose the lowest score (closest block) on their turn. It's completely unbeatable on Hard mode!

### Synthesis via the Web Audio API
Instead of searching for, downloading, and storing heavy static MP3 sound effect files, I wanted to see if I could write a lightweight synthesizer that creates sound waves programmatically.
* Using `OscillatorNode` objects in JavaScript, I synthesized pure sine and triangle waveforms directly in the browser's audio buffer.
* I added exponential gain declines so the notes decay naturally, producing clean, classic retro bleeps for moves and an arpeggiated chime chord when a player wins.

---

## 🌌 Experimental: Gravity Mode!

As a fun extra experiment, I created **Gravity Mode** (kind of like Connect Four on a 3x3 board).
* When you click on any grid button, the piece doesn't just stay where you clicked—it slides down to the lowest empty row in that column!
* I adapted the AI engine to respect this gravity when making its decisions. Under gravity rules, the search space for the Minimax algorithm reduces from 9 possible choices down to only 3 choices (one target for each column), making AI paths compute even faster!

---

## 🛠️ Run the Code Locally

### Web App
Just double-click the `index.html` file at the root directory to open it in your browser.

### Java Versions
Make sure you have a Java JDK installed. Open a command prompt at the folder root and compile:

```bash
# To run the console version
javac src/TicTacToe.java
java -cp src TicTacToe

# To run the Swing GUI version
javac src/TicTacToeGUI.java
java -cp src TicTacToeGUI
```
