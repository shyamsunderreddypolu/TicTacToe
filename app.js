/**
 * Tic-Tac-Toe App Engine
 * Implements game state, unbeatable Minimax AI, Web Audio API sound synthesis,
 * theme management, dynamic history logging, accessibility, and confetti particles.
 * 
 * @author Shyam Sunder Reddy Polu
 * @version 1.1
 */

// ==========================================================================
// Web Audio API Synthesizer (Zero asset dependency)
// ==========================================================================
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(freq, type, duration, delay = 0) {
        if (this.muted) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        
        gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime + delay);
        // Exponential decay for natural sound
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    playClick() {
        // High, short bleep
        this.playTone(600, 'sine', 0.08);
    }

    playReset() {
        // Double tone sweep
        this.playTone(300, 'sine', 0.1);
        this.playTone(450, 'sine', 0.15, 0.05);
    }

    playWin() {
        // Arpeggio C Major chord
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, index) => {
            this.playTone(freq, 'triangle', 0.3, index * 0.1);
        });
    }

    playDraw() {
        // Melancholic downward sound
        const notes = [220.00, 196.00, 174.61]; // A3, G3, F3
        notes.forEach((freq, index) => {
            this.playTone(freq, 'sine', 0.25, index * 0.12);
        });
    }
}

const synth = new SoundSynth();

// ==========================================================================
// Game State Manager
// ==========================================================================
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'ai'; // 'ai' or 'local'
        this.difficulty = 'hard'; // 'easy', 'medium', 'hard'
        
        this.scores = {
            X: 0,
            O: 0,
            draws: 0
        };

        // UI Selectors
        this.cells = document.querySelectorAll('.cell');
        this.statusText = document.getElementById('game-status');
        this.valX = document.getElementById('val-x');
        this.valO = document.getElementById('val-o');
        this.valDraws = document.getElementById('val-draws');
        this.labelO = document.getElementById('label-o');
        
        this.btnReset = document.getElementById('btn-reset');
        this.btnClearScores = document.getElementById('btn-clear-scores');
        this.modeSelect = document.getElementById('mode-select');
        this.diffSelect = document.getElementById('difficulty-select');
        this.diffGroup = document.getElementById('ai-difficulty-group');
        this.soundToggle = document.getElementById('sound-toggle');
        this.themeToggle = document.getElementById('theme-toggle');
        this.logContainer = document.getElementById('log-container');
        this.winningLine = document.getElementById('winning-line');
        this.scoreCardX = document.getElementById('score-card-x');
        this.scoreCardO = document.getElementById('score-card-o');

        // Winning layouts index list
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        this.init();
    }

    init() {
        // Load stored settings/scores
        this.loadSettings();

        // Event Listeners
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e.target));
            cell.addEventListener('keydown', (e) => this.handleCellKeyDown(e));
        });

        this.btnReset.addEventListener('click', () => this.resetGame(true));
        this.btnClearScores.addEventListener('click', () => this.clearScores());
        this.modeSelect.addEventListener('change', (e) => this.changeMode(e.target.value));
        this.diffSelect.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.resetGame(false);
        this.log('Game initialized. Welcome!', 'sys');
    }

    loadSettings() {
        // Theme
        const storedTheme = localStorage.getItem('ttt_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', storedTheme);
        this.updateThemeIcon(storedTheme);

        // Sound Mute Status
        const storedMute = localStorage.getItem('ttt_muted') === 'true';
        synth.muted = storedMute;
        this.updateSoundIcon(storedMute);

        // Mode
        const storedMode = localStorage.getItem('ttt_mode') || 'ai';
        this.gameMode = storedMode;
        this.modeSelect.value = storedMode;
        this.toggleDifficultyVisibility();

        // Difficulty
        const storedDiff = localStorage.getItem('ttt_diff') || 'hard';
        this.difficulty = storedDiff;
        this.diffSelect.value = storedDiff;

        // Scores
        const storedScores = localStorage.getItem('ttt_scores');
        if (storedScores) {
            try {
                this.scores = JSON.parse(storedScores);
            } catch (e) {
                console.error("Failed to parse scores, resetting", e);
            }
        }
        this.updateScoreboardUI();
    }

    saveScores() {
        localStorage.setItem('ttt_scores', JSON.stringify(this.scores));
    }

    log(message, type = 'sys') {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}-action`;
        
        let label = '';
        if (type === 'x') label = 'Player X: ';
        if (type === 'o') label = this.gameMode === 'ai' ? 'AI O: ' : 'Player O: ';
        
        entry.innerHTML = `
            <span><strong>${label}</strong>${message}</span>
            <span class="log-time">${time}</span>
        `;
        
        // Remove empty state message
        const emptyMsg = this.logContainer.querySelector('.log-empty-msg');
        if (emptyMsg) {
            emptyMsg.remove();
        }

        this.logContainer.prepend(entry);
    }

    // ==========================================================================
    // Core Game Logic
    // ==========================================================================
    handleCellClick(cell) {
        const cellIndex = parseInt(cell.getAttribute('data-index'));
        
        if (this.board[cellIndex] !== null || !this.gameActive) {
            return;
        }

        synth.playClick();
        this.makeMove(cellIndex, this.currentPlayer);

        if (this.checkWin(this.board, this.currentPlayer)) {
            this.handleWin(this.currentPlayer);
            return;
        }

        if (this.checkDraw(this.board)) {
            this.handleDraw();
            return;
        }

        // Switch Turn
        this.switchTurn();

        // If AI Turn
        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            this.disableBoardTemp(true);
            // Slight artificial delay for recruiter feel (makes AI feel like it's thinking)
            setTimeout(() => {
                this.makeAIMove();
                this.disableBoardTemp(false);
            }, 600);
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.cells[index];
        cell.setAttribute('data-player', player);
        cell.innerText = player;
        cell.disabled = true;
        cell.setAttribute('aria-label', `Cell ${index}, marked ${player}`);
        
        // Dynamic coordinates translation for logs e.g. index 5 -> Row 1, Col 2
        const row = Math.floor(index / 3);
        const col = index % 3;
        this.log(`Placed at (${row}, ${col})`, player.toLowerCase());
    }

    switchTurn() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatusText();
        this.updateScoreActiveHighlight();
    }

    updateStatusText() {
        this.statusText.className = 'game-status';
        
        if (!this.gameActive) return;

        this.statusText.classList.add(this.currentPlayer === 'X' ? 'turn-x' : 'turn-o');
        
        if (this.gameMode === 'ai') {
            this.statusText.innerText = this.currentPlayer === 'X' ? "Your turn (X)" : "AI thinking (O)...";
        } else {
            this.statusText.innerText = `Player ${this.currentPlayer}'s turn`;
        }
    }

    updateScoreActiveHighlight() {
        this.scoreCardX.classList.remove('score-active');
        this.scoreCardO.classList.remove('score-active');
        
        if (this.gameActive) {
            if (this.currentPlayer === 'X') {
                this.scoreCardX.classList.add('score-active');
            } else {
                this.scoreCardO.classList.add('score-active');
            }
        }
    }

    disableBoardTemp(disabled) {
        this.cells.forEach((cell, index) => {
            if (this.board[index] === null) {
                cell.disabled = disabled;
            }
        });
    }

    checkWin(board, player) {
        return this.winningConditions.some(condition => {
            return condition.every(index => board[index] === player);
        });
    }

    checkDraw(board) {
        return board.every(cell => cell !== null);
    }

    handleWin(winner) {
        this.gameActive = false;
        this.scores[winner]++;
        this.saveScores();
        this.updateScoreboardUI();
        
        this.statusText.className = 'game-status';
        this.statusText.classList.add(winner === 'X' ? 'win-x' : 'win-o');
        
        if (this.gameMode === 'ai') {
            this.statusText.innerText = winner === 'X' ? 'Victory! You Win!' : 'Defeat! AI Wins!';
        } else {
            this.statusText.innerText = `Player ${winner} Wins!`;
        }

        const winningCombo = this.winningConditions.find(condition => {
            return condition.every(index => this.board[index] === winner);
        });

        this.drawWinningLine(winningCombo);
        this.triggerConfetti(winner);
        synth.playWin();
        this.log(`Matches 3 in a row! Player ${winner} wins.`, 'sys');
        this.updateScoreActiveHighlight();
    }

    handleDraw() {
        this.gameActive = false;
        this.scores.draws++;
        this.saveScores();
        this.updateScoreboardUI();
        
        this.statusText.className = 'game-status draw';
        this.statusText.innerText = "It's a Draw!";
        
        synth.playDraw();
        this.log("Game ended in a draw.", 'sys');
        this.updateScoreActiveHighlight();
    }

    // Draw SVG Strike line
    drawWinningLine(combo) {
        if (!combo) return;
        
        const line = this.winningLine;
        
        // Define coordinates mapping for board cell centers (based on 300x300 viewBox grid)
        // Cell layout:
        // C0 (50, 50)   C1 (150, 50)   C2 (250, 50)
        // C3 (50, 150)  C4 (150, 150)  C5 (250, 150)
        // C6 (50, 250)  C7 (150, 250)  C8 (250, 250)
        const cellCenters = [
            { x: 50,  y: 50 },  { x: 150, y: 50 },  { x: 250, y: 50 },
            { x: 50,  y: 150 }, { x: 150, y: 150 }, { x: 250, y: 150 },
            { x: 50,  y: 250 }, { x: 150, y: 250 }, { x: 250, y: 250 }
        ];

        const start = cellCenters[combo[0]];
        const end = cellCenters[combo[2]];

        line.setAttribute('x1', start.x);
        line.setAttribute('y1', start.y);
        line.setAttribute('x2', end.x);
        line.setAttribute('y2', end.y);
        
        // CSS stroke-dasharray animation reset
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
        
        // Force Reflow
        line.getBoundingClientRect();
        
        line.style.transition = 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        line.style.strokeDashoffset = '0';
        
        // Dynamic color for strike-through line
        const winnerColor = this.currentPlayer === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
        line.setAttribute('stroke', winnerColor);
    }

    resetGame(triggerSound = true) {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear cells
        this.cells.forEach((cell, index) => {
            cell.removeAttribute('data-player');
            cell.innerText = '';
            cell.disabled = false;
            cell.setAttribute('aria-label', `Cell ${index}, empty`);
        });

        // Hide winning line
        this.winningLine.style.strokeDashoffset = '1000';
        
        this.updateStatusText();
        this.updateScoreActiveHighlight();

        if (triggerSound) {
            synth.playReset();
            this.log("New game match started.", 'sys');
        }
    }

    clearScores() {
        this.scores = { X: 0, O: 0, draws: 0 };
        this.saveScores();
        this.updateScoreboardUI();
        this.resetGame(true);
        this.log("Scoreboard reset.", 'sys');
    }

    changeMode(mode) {
        this.gameMode = mode;
        localStorage.setItem('ttt_mode', mode);
        
        this.toggleDifficultyVisibility();
        this.updateScoreboardLabels();
        this.clearScores(); // Clear scores when mode changes for fairness
    }

    changeDifficulty(diff) {
        this.difficulty = diff;
        localStorage.setItem('ttt_diff', diff);
        this.resetGame(true);
        this.log(`Difficulty changed to ${diff.toUpperCase()}.`, 'sys');
    }

    toggleDifficultyVisibility() {
        if (this.gameMode === 'ai') {
            this.diffGroup.style.display = 'flex';
        } else {
            this.diffGroup.style.display = 'none';
        }
    }

    updateScoreboardLabels() {
        if (this.gameMode === 'ai') {
            this.labelO.innerText = 'AI O';
        } else {
            this.labelO.innerText = 'PLAYER O';
        }
    }

    updateScoreboardUI() {
        this.valX.innerText = this.scores.X;
        this.valO.innerText = this.scores.O;
        this.valDraws.innerText = this.scores.draws;
    }

    // ==========================================================================
    // Smart AI Module (Unbeatable Minimax Engine)
    // ==========================================================================
    makeAIMove() {
        let bestMove;
        
        if (this.difficulty === 'easy') {
            bestMove = this.getRandomMove();
        } else if (this.difficulty === 'medium') {
            // Medium AI: 40% chance of random move, otherwise smart tactical moves
            if (Math.random() < 0.40) {
                bestMove = this.getRandomMove();
            } else {
                bestMove = this.getSmartMove();
            }
        } else {
            // Hard: Minimax unbeatable
            bestMove = this.getBestMinimaxMove();
        }

        if (bestMove !== undefined) {
            const cell = this.cells[bestMove];
            this.handleCellClick(cell);
        }
    }

    getRandomMove() {
        const available = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (available.length === 0) return;
        return available[Math.floor(Math.random() * available.length)];
    }

    getSmartMove() {
        // Immediate Win check
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                const tempBoard = [...this.board];
                tempBoard[i] = 'O';
                if (this.checkWin(tempBoard, 'O')) return i;
            }
        }

        // Immediate Block check
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                const tempBoard = [...this.board];
                tempBoard[i] = 'X';
                if (this.checkWin(tempBoard, 'X')) return i;
            }
        }

        // Corner priority if centers empty
        if (this.board[4] === null) return 4;

        return this.getRandomMove();
    }

    getBestMinimaxMove() {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    minimax(tempBoard, depth, isMaximizing) {
        // Base Terminal States
        if (this.checkWin(tempBoard, 'O')) return 10 - depth;
        if (this.checkWin(tempBoard, 'X')) return depth - 10;
        if (this.checkDraw(tempBoard)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i] === null) {
                    tempBoard[i] = 'O';
                    const score = this.minimax(tempBoard, depth + 1, false);
                    tempBoard[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i] === null) {
                    tempBoard[i] = 'X';
                    const score = this.minimax(tempBoard, depth + 1, true);
                    tempBoard[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    // ==========================================================================
    // Visual Confetti Particle Engine
    // ==========================================================================
    triggerConfetti(winner) {
        const colors = winner === 'X' 
            ? ['#38bdf8', '#0ea5e9', '#0284c7', '#ffffff'] // Sky tones
            : ['#f43f5e', '#e11d48', '#be123c', '#ffffff']; // Rose tones
        
        const rect = this.statusText.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + window.scrollY;

        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            
            // Random styling
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 6;
            
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.borderRadius = '50%';
            particle.style.left = `${originX}px`;
            particle.style.top = `${originY}px`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '99';
            
            document.body.appendChild(particle);
            
            // Physics math
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 120 + 80;
            const targetX = Math.cos(angle) * velocity;
            const targetY = -Math.abs(Math.sin(angle) * (velocity * 1.5)) + 40; // upward bias

            // Simple DOM keyframe animation
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${targetX}px, ${targetY}px) scale(0.2)`, opacity: 0 }
            ], {
                duration: Math.random() * 800 + 700,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
                fill: 'forwards'
            });

            // Cleanup
            setTimeout(() => particle.remove(), 1600);
        }
    }

    // ==========================================================================
    // Accessibility Keyboard Controls (3x3 grid arrow keys navigation)
    // ==========================================================================
    handleCellKeyDown(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        let targetIndex = -1;

        switch (e.key) {
            case 'ArrowRight':
                targetIndex = index + 1;
                if (targetIndex % 3 === 0) targetIndex -= 3; // wrap row
                break;
            case 'ArrowLeft':
                targetIndex = index - 1;
                if ((targetIndex + 1) % 3 === 0 || targetIndex < 0) targetIndex += 3; // wrap row
                break;
            case 'ArrowDown':
                targetIndex = index + 3;
                if (targetIndex > 8) targetIndex -= 9; // wrap col
                break;
            case 'ArrowUp':
                targetIndex = index - 3;
                if (targetIndex < 0) targetIndex += 9; // wrap col
                break;
            default:
                return; // Let other keys behave normally
        }

        e.preventDefault();
        if (targetIndex >= 0 && targetIndex <= 8) {
            this.cells[targetIndex].focus();
        }
    }

    // ==========================================================================
    // Settings Toggles (Audio & Theme)
    // ==========================================================================
    toggleSound() {
        const isMuted = synth.toggleMute();
        localStorage.setItem('ttt_muted', isMuted);
        this.updateSoundIcon(isMuted);
        this.log(isMuted ? "Sound muted." : "Sound enabled.", 'sys');
        synth.playClick();
    }

    updateSoundIcon(isMuted) {
        const icon = document.getElementById('sound-icon');
        if (isMuted) {
            // Muted Speaker SVG layout
            icon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
        } else {
            // Active Speaker SVG layout
            icon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('ttt_theme', targetTheme);
        this.updateThemeIcon(targetTheme);
        this.log(`Theme toggled to ${targetTheme.toUpperCase()} mode.`, 'sys');
    }

    updateThemeIcon(theme) {
        const icon = document.getElementById('theme-toggle');
        if (theme === 'light') {
            // Moon SVG
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon" id="moon-icon">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        } else {
            // Sun SVG
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun" id="sun-icon">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
        }
    }
}

// Start application when DOM loads
window.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});
