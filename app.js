/**
 * My Tic-Tac-Toe Experiments!
 * 
 * I built this project to play around with JavaScript, custom audio, and AI.
 * It has standard modes, but I also added a "Gravity Mode" where pieces fall 
 * down to the bottom of the column (kind of like Connect Four) just to see 
 * how it would work!
 * 
 * - Shyam Sunder Reddy Polu
 */

// ==========================================================================
// Custom Audio Synthesizer
// ==========================================================================
// Instead of downloading external sound files, I was curious if I could use 
// the browser's Web Audio API to create retro bleeps and chimes using code.
class CustomAudioSynth {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    // Initialize the audio context (browsers require a user interaction to start this)
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

    // Helper to play a short sound wave at a specific pitch
    playTone(freq, waveType, duration, delay = 0) {
        if (this.muted) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = waveType; // 'sine', 'triangle', etc.
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        
        // Decay the volume over time so it sounds like a real instrument
        gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    // Quick click sound when placing a piece
    playClick() {
        this.playTone(550, 'sine', 0.08);
    }

    // Rising chime when resetting the board
    playReset() {
        this.playTone(280, 'sine', 0.08);
        this.playTone(420, 'sine', 0.12, 0.04);
    }

    // A happy C-major chord arpeggio when someone wins!
    playWinChime() {
        const chord = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C notes
        chord.forEach((freq, idx) => {
            this.playTone(freq, 'triangle', 0.25, idx * 0.08);
        });
    }

    // A sad descending tone when it's a draw
    playDrawChime() {
        const drawNotes = [220.00, 196.00, 174.61]; // A, G, F
        drawNotes.forEach((freq, idx) => {
            this.playTone(freq, 'sine', 0.25, idx * 0.1);
        });
    }
}

const synth = new CustomAudioSynth();

// ==========================================================================
// Tic-Tac-Toe Game Engine
// ==========================================================================
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null); // Simple 9-element array to track grid
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'ai'; // 'ai' or 'local'
        this.difficulty = 'hard'; // 'easy', 'medium', 'hard'
        this.gravityMode = false; // Turn on/off falling pieces!
        
        // Track overall session scores
        this.scores = { X: 0, O: 0, draws: 0 };

        // Select the HTML items we need to update
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
        this.gravityToggle = document.getElementById('gravity-toggle'); // Gravity checkbox

        // The 8 possible ways to match 3 in a row
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Across
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Down
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        this.setupEvents();
    }

    setupEvents() {
        // Load saved scores & theme from browser memory
        this.loadSavedSettings();

        // Listen for player clicks on the grid
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleGridClick(e.target));
            cell.addEventListener('keydown', (e) => this.handleKeyboardMove(e));
        });

        // Interface button bindings
        this.btnReset.addEventListener('click', () => this.resetGame(true));
        this.btnClearScores.addEventListener('click', () => this.clearScores());
        this.modeSelect.addEventListener('change', (e) => this.changeGameMode(e.target.value));
        this.diffSelect.addEventListener('change', (e) => this.changeAIDifficulty(e.target.value));
        this.soundToggle.addEventListener('click', () => this.toggleAudioMute());
        this.themeToggle.addEventListener('click', () => this.toggleThemeColor());
        
        // Listen to our new Gravity checkbox
        this.gravityToggle.addEventListener('change', (e) => {
            this.gravityMode = e.target.checked;
            localStorage.setItem('ttt_gravity', this.gravityMode);
            this.log(this.gravityMode ? "Gravity mode turned ON!" : "Gravity mode turned OFF.", 'sys');
            this.resetGame(true);
        });

        this.resetGame(false);
        this.log('Interactive board loaded. Have fun!', 'sys');
    }

    loadSavedSettings() {
        // Theme color
        const savedTheme = localStorage.getItem('ttt_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeTogglerUI(savedTheme);

        // Sound Mute
        const savedMute = localStorage.getItem('ttt_muted') === 'true';
        synth.muted = savedMute;
        this.updateSoundTogglerUI(savedMute);

        // Game Mode
        const savedMode = localStorage.getItem('ttt_mode') || 'ai';
        this.gameMode = savedMode;
        this.modeSelect.value = savedMode;
        this.updateDifficultyDisplay();

        // Gravity Mode
        const savedGravity = localStorage.getItem('ttt_gravity') === 'true';
        this.gravityMode = savedGravity;
        this.gravityToggle.checked = savedGravity;

        // Difficulty
        const savedDiff = localStorage.getItem('ttt_diff') || 'hard';
        this.difficulty = savedDiff;
        this.diffSelect.value = savedDiff;

        // Scores
        const savedScores = localStorage.getItem('ttt_scores');
        if (savedScores) {
            try {
                this.scores = JSON.parse(savedScores);
            } catch (e) {
                console.error("Score loading error, resetting count", e);
            }
        }
        this.updateScoreboardLabels();
        this.updateScoreboardValues();
    }

    // Prints a nice friendly message in the sidebar log
    log(msg, type = 'sys') {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const item = document.createElement('div');
        item.className = `log-entry ${type}-action`;
        
        let prefix = '';
        if (type === 'x') prefix = 'Player X: ';
        if (type === 'o') prefix = this.gameMode === 'ai' ? 'AI O: ' : 'Player O: ';
        
        item.innerHTML = `
            <span><strong>${prefix}</strong>${msg}</span>
            <span class="log-time">${time}</span>
        `;
        
        const placeholder = this.logContainer.querySelector('.log-empty-msg');
        if (placeholder) {
            placeholder.remove();
        }
        this.logContainer.prepend(item);
    }

    // Syncs our grid array (this.board) with the DOM buttons on screen
    updateCellStates() {
        this.cells.forEach((cell, idx) => {
            const playerSymbol = this.board[idx];
            cell.innerText = playerSymbol || '';
            
            // Set styles for matching colors
            if (playerSymbol) {
                cell.setAttribute('data-player', playerSymbol);
                cell.setAttribute('aria-label', `Cell ${idx}, marked ${playerSymbol}`);
            } else {
                cell.removeAttribute('data-player');
                cell.setAttribute('aria-label', `Cell ${idx}, empty`);
            }

            // Cell disabling rules:
            if (!this.gameActive) {
                cell.disabled = true; // Lock everything if game is over
            } else if (this.gravityMode) {
                // In Gravity Mode, we only disable columns that are completely full
                const col = idx % 3;
                cell.disabled = (this.getGravityTarget(col) === -1);
            } else {
                // In normal mode, we disable any cell that is already taken
                cell.disabled = (playerSymbol !== null);
            }
        });
    }

    // ==========================================================================
    // Gravity Physics Logic
    // ==========================================================================
    // Checks a column from bottom to top and returns the first empty cell index.
    // If the column is full, it returns -1.
    getGravityTarget(col, currentBoard = this.board) {
        // Rows on a 3x3 are: Row 2 (bottom), Row 1 (middle), Row 0 (top)
        for (let row = 2; row >= 0; row--) {
            const idx = row * 3 + col;
            if (currentBoard[idx] === null) {
                return idx;
            }
        }
        return -1;
    }

    // Returns a list of all valid indices a player is allowed to choose
    getAvailableMoves(currentBoard = this.board) {
        const moves = [];
        if (this.gravityMode) {
            // Under gravity, you can only select the lowest cell of columns (0, 1, 2)
            for (let col = 0; col < 3; col++) {
                const target = this.getGravityTarget(col, currentBoard);
                if (target !== -1) {
                    moves.push(target);
                }
            }
        } else {
            // Normal mode: any empty cell is fine
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    moves.push(i);
                }
            }
        }
        return moves;
    }

    // ==========================================================================
    // Core Game Flow
    // ==========================================================================
    handleGridClick(cell) {
        const cellIndex = parseInt(cell.getAttribute('data-index'));
        
        let targetIndex = cellIndex;
        if (this.gravityMode) {
            const col = cellIndex % 3;
            targetIndex = this.getGravityTarget(col);
            if (targetIndex === -1 || !this.gameActive) {
                return; // Column full or game finished, do nothing
            }
        } else {
            if (this.board[cellIndex] !== null || !this.gameActive) {
                return;
            }
        }

        // Lock user from making a move if the AI is currently calculating
        if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
            return;
        }

        synth.playClick();
        this.makeMove(targetIndex, this.currentPlayer);

        // Check if this move wins the match
        if (this.checkWin(this.board, this.currentPlayer)) {
            this.declareWin(this.currentPlayer);
            return;
        }

        // Check if there are no moves left (draw)
        if (this.checkDraw(this.board)) {
            this.declareDraw();
            return;
        }

        this.switchTurn();

        // If playing against the AI, queue its move
        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            this.disableBoardDuringAITurn(true);
            setTimeout(() => {
                this.makeAIMove();
                this.disableBoardDuringAITurn(false);
            }, 600); // 600ms pause so the AI feels like it is "thinking"
        }
    }

    makeMove(idx, player) {
        this.board[idx] = player;
        this.updateCellStates();
        
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        
        // Log column adjustments for gravity
        if (this.gravityMode) {
            this.log(`Dropped piece in col ${col} (landed at row ${row})`, player.toLowerCase());
        } else {
            this.log(`Placed piece at row ${row}, col ${col}`, player.toLowerCase());
        }
    }

    switchTurn() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatusDisplay();
        this.highlightActiveScorecard();
    }

    updateStatusDisplay() {
        this.statusText.className = 'game-status';
        if (!this.gameActive) return;

        this.statusText.classList.add(this.currentPlayer === 'X' ? 'turn-x' : 'turn-o');
        
        if (this.gameMode === 'ai') {
            this.statusText.innerText = this.currentPlayer === 'X' ? "Your turn (X)" : "AI thinking (O)...";
        } else {
            this.statusText.innerText = `Player ${this.currentPlayer}'s turn`;
        }
    }

    highlightActiveScorecard() {
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

    disableBoardDuringAITurn(lock) {
        if (lock) {
            // Disable all cells temporarily
            this.cells.forEach(cell => cell.disabled = true);
        } else {
            // Restore enabled state based on board availability
            this.updateCellStates();
        }
    }

    checkWin(currentBoard, player) {
        return this.winningConditions.some(condition => {
            return condition.every(idx => currentBoard[idx] === player);
        });
    }

    checkDraw(currentBoard) {
        return currentBoard.every(cell => cell !== null);
    }

    declareWin(winner) {
        this.gameActive = false;
        this.scores[winner]++;
        this.saveScoresToStorage();
        this.updateScoreboardValues();
        
        this.statusText.className = 'game-status';
        this.statusText.classList.add(winner === 'X' ? 'win-x' : 'win-o');
        
        if (this.gameMode === 'ai') {
            this.statusText.innerText = winner === 'X' ? 'Nice! You Win!' : 'AI won this one!';
        } else {
            this.statusText.innerText = `Player ${winner} wins!`;
        }

        // Highlight the matching winning line
        const winningCombo = this.winningConditions.find(condition => {
            return condition.every(idx => this.board[idx] === winner);
        });

        this.drawWinLine(winningCombo);
        this.spawnWinConfetti(winner);
        synth.playWinChime();
        this.log(`Matched 3 cells! Player ${winner} wins the round.`, 'sys');
        this.highlightActiveScorecard();
        this.updateCellStates(); // Refresh cell disabled states
    }

    declareDraw() {
        this.gameActive = false;
        this.scores.draws++;
        this.saveScoresToStorage();
        this.updateScoreboardValues();
        
        this.statusText.className = 'game-status draw';
        this.statusText.innerText = "It's a draw!";
        
        synth.playDrawChime();
        this.log("Round ended in a draw.", 'sys');
        this.highlightActiveScorecard();
        this.updateCellStates(); // Refresh cell disabled states
    }

    // Draws a line over the winning 3-in-a-row cells
    drawWinLine(combo) {
        if (!combo) return;
        
        const line = this.winningLine;
        
        // Pixel coordinates matching our SVG viewBox grid centers (300x300 canvas)
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
        
        // Draw animation using stroke-dash offsets
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
        
        line.getBoundingClientRect(); // Trigger DOM layout repaint
        
        line.style.transition = 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        line.style.strokeDashoffset = '0';
        
        const winnerColor = this.currentPlayer === 'X' ? 'var(--accent-x)' : 'var(--accent-o)';
        line.setAttribute('stroke', winnerColor);
    }

    resetGame(triggerSound = true) {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.updateCellStates();
        this.winningLine.style.strokeDashoffset = '1000'; // Hide line
        
        this.updateStatusDisplay();
        this.highlightActiveScorecard();

        if (triggerSound) {
            synth.playReset();
            this.log("Board cleared. New match started!", 'sys');
        }
    }

    clearScores() {
        this.scores = { X: 0, O: 0, draws: 0 };
        this.saveScoresToStorage();
        this.updateScoreboardValues();
        this.resetGame(true);
        this.log("Score counts reset.", 'sys');
    }

    saveScoresToStorage() {
        localStorage.setItem('ttt_scores', JSON.stringify(this.scores));
    }

    changeGameMode(mode) {
        this.gameMode = mode;
        localStorage.setItem('ttt_mode', mode);
        
        this.updateDifficultyDisplay();
        this.updateScoreboardLabels();
        this.clearScores(); // Clear count when switching rules
    }

    changeAIDifficulty(diff) {
        this.difficulty = diff;
        localStorage.setItem('ttt_diff', diff);
        this.resetGame(true);
        this.log(`AI set to ${diff.toUpperCase()} mode.`, 'sys');
    }

    updateDifficultyDisplay() {
        this.diffGroup.style.display = this.gameMode === 'ai' ? 'flex' : 'none';
    }

    updateScoreboardLabels() {
        this.labelO.innerText = this.gameMode === 'ai' ? 'AI O' : 'PLAYER O';
    }

    updateScoreboardValues() {
        this.valX.innerText = this.scores.X;
        this.valO.innerText = this.scores.O;
        this.valDraws.innerText = this.scores.draws;
    }

    // ==========================================================================
    // AI Calculations
    // ==========================================================================
    makeAIMove() {
        let bestMove;
        
        if (this.difficulty === 'easy') {
            // Easy AI: Pick at random
            bestMove = this.getRandomMove();
        } else if (this.difficulty === 'medium') {
            // Medium AI: 40% chance of random, otherwise plays smart blocks
            if (Math.random() < 0.40) {
                bestMove = this.getRandomMove();
            } else {
                bestMove = this.getSmartMove();
            }
        } else {
            // Hard AI: Unbeatable Minimax
            bestMove = this.getBestMinimaxMove();
        }

        if (bestMove !== undefined) {
            const cell = this.cells[bestMove];
            this.handleGridClick(cell);
        }
    }

    getRandomMove() {
        const available = this.getAvailableMoves(this.board);
        if (available.length === 0) return;
        return available[Math.floor(Math.random() * available.length)];
    }

    getSmartMove() {
        const availableMoves = this.getAvailableMoves(this.board);
        if (availableMoves.length === 0) return;

        // 1. Can AI Win right now?
        for (const idx of availableMoves) {
            const tempBoard = [...this.board];
            tempBoard[idx] = 'O';
            if (this.checkWin(tempBoard, 'O')) return idx;
        }

        // 2. Do we need to Block Player X?
        for (const idx of availableMoves) {
            const tempBoard = [...this.board];
            tempBoard[idx] = 'X';
            if (this.checkWin(tempBoard, 'X')) return idx;
        }

        // 3. Prefer center grid cell if open
        if (availableMoves.includes(4)) return 4;

        // 4. Drop back to random choice
        return this.getRandomMove();
    }

    // Minimax: Evaluates all future cells recursively to choose the best score.
    // Unbeatable in Hard mode because it checks every single move sequence to the end.
    getBestMinimaxMove() {
        let bestScore = -Infinity;
        let move;
        const availableMoves = this.getAvailableMoves(this.board);

        for (const idx of availableMoves) {
            this.board[idx] = 'O'; // Simulate move
            const score = this.minimax(this.board, 0, false);
            this.board[idx] = null; // Revert move
            
            if (score > bestScore) {
                bestScore = score;
                move = idx;
            }
        }
        return move;
    }

    minimax(tempBoard, depth, isMaximizing) {
        // Base terminal states
        if (this.checkWin(tempBoard, 'O')) return 10 - depth;
        if (this.checkWin(tempBoard, 'X')) return depth - 10;
        if (this.checkDraw(tempBoard)) return 0;

        const availableMoves = this.getAvailableMoves(tempBoard);

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (const idx of availableMoves) {
                tempBoard[idx] = 'O';
                const score = this.minimax(tempBoard, depth + 1, false);
                tempBoard[idx] = null;
                bestScore = Math.max(score, bestScore);
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (const idx of availableMoves) {
                tempBoard[idx] = 'X';
                const score = this.minimax(tempBoard, depth + 1, true);
                tempBoard[idx] = null;
                bestScore = Math.min(score, bestScore);
            }
            return bestScore;
        }
    }

    // ==========================================================================
    // Fun Confetti Particle Spawner
    // ==========================================================================
    // Simple custom DOM particle explosion when someone gets 3-in-a-row
    spawnWinConfetti(winner) {
        const colors = winner === 'X' 
            ? ['#38bdf8', '#0ea5e9', '#0284c7', '#ffffff'] // Cyan/Blue shades
            : ['#f43f5e', '#e11d48', '#be123c', '#ffffff']; // Red/Rose shades
        
        const bounds = this.statusText.getBoundingClientRect();
        const originX = bounds.left + bounds.width / 2;
        const originY = bounds.top + window.scrollY;

        for (let i = 0; i < 40; i++) {
            const dot = document.createElement('div');
            const size = Math.random() * 8 + 6;
            
            dot.style.position = 'absolute';
            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            dot.style.borderRadius = '50%';
            dot.style.left = `${originX}px`;
            dot.style.top = `${originY}px`;
            dot.style.pointerEvents = 'none';
            dot.style.zIndex = '99';
            
            document.body.appendChild(dot);
            
            // Random direction physics
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 110 + 80;
            const targetX = Math.cos(angle) * force;
            const targetY = -Math.abs(Math.sin(angle) * (force * 1.5)) + 40;

            // Animate using DOM element keyframes
            dot.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${targetX}px, ${targetY}px) scale(0.2)`, opacity: 0 }
            ], {
                duration: Math.random() * 700 + 750,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
                fill: 'forwards'
            });

            setTimeout(() => dot.remove(), 1500);
        }
    }

    // ==========================================================================
    // Accessibility (Keyboard Grid Traversal)
    // ==========================================================================
    // Allows keyboard arrow keys (Up, Down, Left, Right) to naturally focus cells
    handleKeyboardMove(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        let targetIndex = -1;

        switch (e.key) {
            case 'ArrowRight':
                targetIndex = index + 1;
                if (targetIndex % 3 === 0) targetIndex -= 3; // Wrap row boundary
                break;
            case 'ArrowLeft':
                targetIndex = index - 1;
                if ((targetIndex + 1) % 3 === 0 || targetIndex < 0) targetIndex += 3;
                break;
            case 'ArrowDown':
                targetIndex = index + 3;
                if (targetIndex > 8) targetIndex -= 9; // Wrap column boundary
                break;
            case 'ArrowUp':
                targetIndex = index - 3;
                if (targetIndex < 0) targetIndex += 9;
                break;
            default:
                return;
        }

        e.preventDefault();
        if (targetIndex >= 0 && targetIndex <= 8) {
            this.cells[targetIndex].focus();
        }
    }

    // ==========================================================================
    // Settings Toggles (Theme & Audio Icons)
    // ==========================================================================
    toggleAudioMute() {
        const isMuted = synth.toggleMute();
        localStorage.setItem('ttt_muted', isMuted);
        this.updateSoundTogglerUI(isMuted);
        this.log(isMuted ? "Audio muted." : "Audio enabled.", 'sys');
        synth.playClick();
    }

    updateSoundTogglerUI(isMuted) {
        const icon = document.getElementById('sound-icon');
        if (isMuted) {
            icon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
        } else {
            icon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
        }
    }

    toggleThemeColor() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('ttt_theme', nextTheme);
        this.updateThemeTogglerUI(nextTheme);
        this.log(`Theme shifted to ${nextTheme.toUpperCase()} style.`, 'sys');
    }

    updateThemeTogglerUI(theme) {
        const toggler = document.getElementById('theme-toggle');
        if (theme === 'light') {
            toggler.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon" id="moon-icon">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        } else {
            toggler.innerHTML = `
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

// Start game when page resources load
window.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});
