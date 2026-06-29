import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.awt.GridLayout;

/**
 * A polished, modern Swing-based GUI for the Tic-Tac-Toe game.
 * Adheres to Clean Code principles, featuring a cohesive color palette,
 * responsive board interaction, clear score tracking, and status messages.
 *
 * @author Shyam Sunder Reddy Polu
 * @version 1.1
 */
public class TicTacToeGUI extends JFrame {

    private static final int BOARD_SIZE = 3;
    private static final char PLAYER_X = 'X';
    private static final char PLAYER_O = 'O';

    // Theme Color Palette (Modern Slate Theme)
    private static final Color COLOR_BG = new Color(15, 23, 42);         // Slate 900 (Deep Dark)
    private static final Color COLOR_CARD = new Color(30, 41, 59);       // Slate 800 (Card background)
    private static final Color COLOR_GRID = new Color(71, 85, 105);      // Slate 600 (Grid lines)
    private static final Color COLOR_TEXT_MUTED = new Color(148, 163, 184); // Slate 400
    private static final Color COLOR_TEXT_LIGHT = new Color(248, 250, 252); // Slate 50
    private static final Color COLOR_PLAYER_X = new Color(56, 189, 248);  // Sky 400 (Vibrant Cyan)
    private static final Color COLOR_PLAYER_O = new Color(244, 63, 94);   // Rose 500 (Vibrant Red)
    private static final Color COLOR_CELL_BG = new Color(15, 23, 42);     // Slate 900
    private static final Color COLOR_BTN_DEFAULT = new Color(30, 41, 59); // Slate 800
    private static final Color COLOR_BTN_HOVER = new Color(51, 65, 85);   // Slate 700

    private final JButton[][] cells = new JButton[BOARD_SIZE][BOARD_SIZE];
    private final JLabel statusLabel = new JLabel("Player X's turn", SwingConstants.CENTER);
    private final JLabel scoreLabel = new JLabel("X: 0   O: 0   Draws: 0", SwingConstants.CENTER);

    private char currentPlayer = PLAYER_X;
    private boolean gameOver = false;
    private int playerXWins = 0;
    private int playerOWins = 0;
    private int draws = 0;

    /**
     * Initializes and configures the Tic-Tac-Toe GUI.
     */
    public TicTacToeGUI() {
        setTitle("Tic-Tac-Toe Professional");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(480, 580);
        setLocationRelativeTo(null);
        setResizable(false);
        
        // Root Panel layout and spacing
        JPanel mainPanel = new JPanel(new BorderLayout(15, 15));
        mainPanel.setBackground(COLOR_BG);
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        mainPanel.add(createHeaderPanel(), BorderLayout.NORTH);
        mainPanel.add(createBoardPanel(), BorderLayout.CENTER);
        mainPanel.add(createFooterPanel(), BorderLayout.SOUTH);

        add(mainPanel);
    }

    /**
     * Main method to start the Swing GUI game.
     *
     * @param args Command-line arguments.
     */
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            TicTacToeGUI frame = new TicTacToeGUI();
            frame.setVisible(true);
        });
    }

    /**
     * Creates the top header panel containing the game title, turn indicator, and scoreboard.
     */
    private JPanel createHeaderPanel() {
        JPanel panel = new JPanel(new GridLayout(3, 1, 5, 5));
        panel.setBackground(COLOR_CARD);
        panel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        JLabel titleLabel = new JLabel("TIC - TAC - TOE", SwingConstants.CENTER);
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 24));
        titleLabel.setForeground(COLOR_TEXT_LIGHT);

        statusLabel.setFont(new Font("SansSerif", Font.PLAIN, 16));
        statusLabel.setForeground(COLOR_PLAYER_X); // Start with Player X's indicator color

        scoreLabel.setFont(new Font("SansSerif", Font.BOLD, 15));
        scoreLabel.setForeground(COLOR_TEXT_MUTED);

        panel.add(titleLabel);
        panel.add(statusLabel);
        panel.add(scoreLabel);
        return panel;
    }

    /**
     * Creates the grid panel representing the game board.
     */
    private JPanel createBoardPanel() {
        // Create grid with BOARD_SIZE+1 to display the coordinates (0, 1, 2)
        JPanel boardPanel = new JPanel(new GridLayout(BOARD_SIZE + 1, BOARD_SIZE + 1, 4, 4));
        boardPanel.setBackground(COLOR_GRID);
        boardPanel.setBorder(BorderFactory.createLineBorder(COLOR_GRID, 2));

        // Row 0: Labels for headers (" ", "0", "1", "2")
        boardPanel.add(createLabelCell(""));
        boardPanel.add(createLabelCell("0"));
        boardPanel.add(createLabelCell("1"));
        boardPanel.add(createLabelCell("2"));

        for (int row = 0; row < BOARD_SIZE; row++) {
            // Add column header (row coordinate label "0", "1", "2")
            boardPanel.add(createLabelCell(String.valueOf(row)));
            for (int col = 0; col < BOARD_SIZE; col++) {
                JButton button = new JButton("");
                button.setFont(new Font("SansSerif", Font.BOLD, 48));
                button.setFocusPainted(false);
                button.setBackground(COLOR_CELL_BG);
                button.setOpaque(true);
                button.setBorderPainted(false);
                button.setForeground(COLOR_TEXT_LIGHT);

                final int buttonRow = row;
                final int buttonCol = col;
                button.addActionListener(e -> handleCellClick(buttonRow, buttonCol));

                // Add simple hover effect
                button.addMouseListener(new java.awt.event.MouseAdapter() {
                    public void mouseEntered(java.awt.event.MouseEvent evt) {
                        if (!gameOver && cells[buttonRow][buttonCol].getText().isEmpty()) {
                            cells[buttonRow][buttonCol].setBackground(COLOR_BTN_HOVER);
                        }
                    }

                    public void mouseExited(java.awt.event.MouseEvent evt) {
                        if (!gameOver && cells[buttonRow][buttonCol].getText().isEmpty()) {
                            cells[buttonRow][buttonCol].setBackground(COLOR_CELL_BG);
                        }
                    }
                });

                cells[row][col] = button;
                boardPanel.add(button);
            }
        }

        return boardPanel;
    }

    /**
     * Creates the footer control panel (New Game, Reset Score).
     */
    private JPanel createFooterPanel() {
        JPanel panel = new JPanel(new GridLayout(1, 2, 10, 0));
        panel.setBackground(COLOR_BG);

        JButton newGameButton = new JButton("New Match");
        styleControlButton(newGameButton);
        newGameButton.addActionListener(e -> resetBoard());

        JButton resetScoreButton = new JButton("Reset Scores");
        styleControlButton(resetScoreButton);
        resetScoreButton.addActionListener(e -> resetScores());

        panel.add(newGameButton);
        panel.add(resetScoreButton);
        return panel;
    }

    private void styleControlButton(JButton button) {
        button.setFont(new Font("SansSerif", Font.BOLD, 14));
        button.setBackground(COLOR_BTN_DEFAULT);
        button.setForeground(COLOR_TEXT_LIGHT);
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createEmptyBorder(10, 15, 10, 15));
        
        button.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                button.setBackground(COLOR_BTN_HOVER);
            }

            public void mouseExited(java.awt.event.MouseEvent evt) {
                button.setBackground(COLOR_BTN_DEFAULT);
            }
        });
    }

    private JLabel createLabelCell(String text) {
        JLabel label = new JLabel(text, SwingConstants.CENTER);
        label.setFont(new Font("SansSerif", Font.BOLD, 16));
        label.setOpaque(true);
        label.setBackground(COLOR_CARD);
        label.setForeground(COLOR_TEXT_MUTED);
        return label;
    }

    /**
     * Handles the click event for cells on the board.
     */
    private void handleCellClick(int row, int col) {
        if (gameOver || !cells[row][col].getText().isEmpty()) {
            return;
        }

        cells[row][col].setText(String.valueOf(currentPlayer));
        cells[row][col].setForeground(currentPlayer == PLAYER_X ? COLOR_PLAYER_X : COLOR_PLAYER_O);

        if (hasWon(currentPlayer)) {
            gameOver = true;
            if (currentPlayer == PLAYER_X) {
                playerXWins++;
            } else {
                playerOWins++;
            }
            updateScoreLabel();
            statusLabel.setText("Player " + currentPlayer + " Wins!");
            statusLabel.setForeground(currentPlayer == PLAYER_X ? COLOR_PLAYER_X : COLOR_PLAYER_O);
            highlightWinningCombination();
            JOptionPane.showMessageDialog(this, "Congratulations! Player " + currentPlayer + " wins!", "Game Over", JOptionPane.INFORMATION_MESSAGE);
            disableBoard();
            return;
        }

        if (isBoardFull()) {
            gameOver = true;
            draws++;
            updateScoreLabel();
            statusLabel.setText("It's a draw!");
            statusLabel.setForeground(COLOR_TEXT_MUTED);
            JOptionPane.showMessageDialog(this, "Good game! It's a draw.", "Game Over", JOptionPane.INFORMATION_MESSAGE);
            disableBoard();
            return;
        }

        // Switch turns
        currentPlayer = (currentPlayer == PLAYER_X) ? PLAYER_O : PLAYER_X;
        statusLabel.setText("Player " + currentPlayer + "'s turn");
        statusLabel.setForeground(currentPlayer == PLAYER_X ? COLOR_PLAYER_X : COLOR_PLAYER_O);
    }

    /**
     * Highlights the winning row, column, or diagonal cells.
     */
    private void highlightWinningCombination() {
        Color highlightColor = new Color(51, 65, 85); // Slate 700 to indicate win area

        // Check rows
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (cells[i][0].getText().equals(String.valueOf(currentPlayer))
                    && cells[i][1].getText().equals(String.valueOf(currentPlayer))
                    && cells[i][2].getText().equals(String.valueOf(currentPlayer))) {
                cells[i][0].setBackground(highlightColor);
                cells[i][1].setBackground(highlightColor);
                cells[i][2].setBackground(highlightColor);
                return;
            }
        }

        // Check columns
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (cells[0][i].getText().equals(String.valueOf(currentPlayer))
                    && cells[1][i].getText().equals(String.valueOf(currentPlayer))
                    && cells[2][i].getText().equals(String.valueOf(currentPlayer))) {
                cells[0][i].setBackground(highlightColor);
                cells[1][i].setBackground(highlightColor);
                cells[2][i].setBackground(highlightColor);
                return;
            }
        }

        // Diagonal 1
        if (cells[0][0].getText().equals(String.valueOf(currentPlayer))
                && cells[1][1].getText().equals(String.valueOf(currentPlayer))
                && cells[2][2].getText().equals(String.valueOf(currentPlayer))) {
            cells[0][0].setBackground(highlightColor);
            cells[1][1].setBackground(highlightColor);
            cells[2][2].setBackground(highlightColor);
            return;
        }

        // Diagonal 2
        if (cells[0][2].getText().equals(String.valueOf(currentPlayer))
                && cells[1][1].getText().equals(String.valueOf(currentPlayer))
                && cells[2][0].getText().equals(String.valueOf(currentPlayer))) {
            cells[0][2].setBackground(highlightColor);
            cells[1][1].setBackground(highlightColor);
            cells[2][0].setBackground(highlightColor);
        }
    }

    private boolean hasWon(char player) {
        String pStr = String.valueOf(player);
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (cells[i][0].getText().equals(pStr) && cells[i][1].getText().equals(pStr) && cells[i][2].getText().equals(pStr)) {
                return true;
            }
            if (cells[0][i].getText().equals(pStr) && cells[1][i].getText().equals(pStr) && cells[2][i].getText().equals(pStr)) {
                return true;
            }
        }
        if (cells[0][0].getText().equals(pStr) && cells[1][1].getText().equals(pStr) && cells[2][2].getText().equals(pStr)) {
            return true;
        }
        return cells[0][2].getText().equals(pStr) && cells[1][1].getText().equals(pStr) && cells[2][0].getText().equals(pStr);
    }

    private boolean isBoardFull() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                if (cells[row][col].getText().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private void disableBoard() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                cells[row][col].setEnabled(false);
            }
        }
    }

    private void resetBoard() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                cells[row][col].setText("");
                cells[row][col].setEnabled(true);
                cells[row][col].setBackground(COLOR_CELL_BG);
            }
        }
        currentPlayer = PLAYER_X;
        gameOver = false;
        statusLabel.setText("Player X's turn");
        statusLabel.setForeground(COLOR_PLAYER_X);
    }

    private void resetScores() {
        playerXWins = 0;
        playerOWins = 0;
        draws = 0;
        updateScoreLabel();
        resetBoard();
    }

    private void updateScoreLabel() {
        scoreLabel.setText("X: " + playerXWins + "   O: " + playerOWins + "   Draws: " + draws);
    }
}