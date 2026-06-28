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
 * Swing-based Tic-Tac-Toe game.
 */
public class TicTacToeGUI extends JFrame {

    private static final int BOARD_SIZE = 3;
    private static final char PLAYER_X = 'X';
    private static final char PLAYER_O = 'O';

    private final JButton[][] cells = new JButton[BOARD_SIZE][BOARD_SIZE];
    private final JLabel statusLabel = new JLabel("Player X's turn", SwingConstants.CENTER);
    private final JLabel scoreLabel = new JLabel("X: 0   O: 0   Draws: 0", SwingConstants.CENTER);

    private char currentPlayer = PLAYER_X;
    private boolean gameOver = false;
    private int playerXWins = 0;
    private int playerOWins = 0;
    private int draws = 0;

    public TicTacToeGUI() {
        setTitle("Tic-Tac-Toe");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(460, 560);
        setLocationRelativeTo(null);
        setResizable(false);
        setLayout(new BorderLayout(10, 10));

        add(createHeaderPanel(), BorderLayout.NORTH);
        add(createBoardPanel(), BorderLayout.CENTER);
        add(createFooterPanel(), BorderLayout.SOUTH);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            TicTacToeGUI frame = new TicTacToeGUI();
            frame.setVisible(true);
        });
    }

    private JPanel createHeaderPanel() {
        JPanel panel = new JPanel(new GridLayout(3, 1, 5, 5));
        panel.setBackground(new Color(245, 247, 250));

        JLabel titleLabel = new JLabel("Tic-Tac-Toe", SwingConstants.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 28));
        titleLabel.setForeground(new Color(30, 41, 59));

        statusLabel.setFont(new Font("Arial", Font.PLAIN, 16));
        statusLabel.setForeground(new Color(51, 65, 85));

        scoreLabel.setFont(new Font("Arial", Font.BOLD, 15));
        scoreLabel.setForeground(new Color(15, 23, 42));

        panel.add(titleLabel);
        panel.add(statusLabel);
        panel.add(scoreLabel);
        return panel;
    }

    private JPanel createBoardPanel() {
        JPanel boardPanel = new JPanel(new GridLayout(BOARD_SIZE + 1, BOARD_SIZE + 1, 2, 2));
        boardPanel.setBackground(new Color(100, 116, 139));

        boardPanel.add(createLabelCell(""));
        boardPanel.add(createLabelCell("0"));
        boardPanel.add(createLabelCell("1"));
        boardPanel.add(createLabelCell("2"));

        for (int row = 0; row < BOARD_SIZE; row++) {
            boardPanel.add(createLabelCell(String.valueOf(row)));
            for (int col = 0; col < BOARD_SIZE; col++) {
                JButton button = new JButton("");
                button.setFont(new Font("Arial", Font.BOLD, 42));
                button.setFocusPainted(false);
                button.setBackground(Color.WHITE);
                button.setOpaque(true);
                button.setBorderPainted(false);

                final int buttonRow = row;
                final int buttonCol = col;
                button.addActionListener(e -> handleCellClick(buttonRow, buttonCol));

                cells[row][col] = button;
                boardPanel.add(button);
            }
        }

        return boardPanel;
    }

    private JPanel createFooterPanel() {
        JPanel panel = new JPanel();
        panel.setBackground(new Color(245, 247, 250));

        JButton newGameButton = new JButton("New Game");
        newGameButton.addActionListener(e -> resetBoard());

        JButton resetScoreButton = new JButton("Reset Scoreboard");
        resetScoreButton.addActionListener(e -> resetScores());

        panel.add(newGameButton);
        panel.add(resetScoreButton);
        return panel;
    }

    private JLabel createLabelCell(String text) {
        JLabel label = new JLabel(text, SwingConstants.CENTER);
        label.setFont(new Font("Arial", Font.BOLD, 18));
        label.setOpaque(true);
        label.setBackground(new Color(226, 232, 240));
        label.setForeground(new Color(15, 23, 42));
        return label;
    }

    private void handleCellClick(int row, int col) {
        if (gameOver || !cells[row][col].getText().isEmpty()) {
            return;
        }

        cells[row][col].setText(String.valueOf(currentPlayer));
        cells[row][col].setForeground(currentPlayer == PLAYER_X ? new Color(220, 38, 38) : new Color(37, 99, 235));

        if (hasWon(currentPlayer)) {
            gameOver = true;
            if (currentPlayer == PLAYER_X) {
                playerXWins++;
            } else {
                playerOWins++;
            }
            updateScoreLabel();
            statusLabel.setText("Player " + currentPlayer + " wins!");
            JOptionPane.showMessageDialog(this, "Player " + currentPlayer + " wins!", "Game Over", JOptionPane.INFORMATION_MESSAGE);
            disableBoard();
            return;
        }

        if (isBoardFull()) {
            gameOver = true;
            draws++;
            updateScoreLabel();
            statusLabel.setText("It's a draw!");
            JOptionPane.showMessageDialog(this, "It's a draw!", "Game Over", JOptionPane.INFORMATION_MESSAGE);
            disableBoard();
            return;
        }

        currentPlayer = (currentPlayer == PLAYER_X) ? PLAYER_O : PLAYER_X;
        statusLabel.setText("Player " + currentPlayer + "'s turn");
    }

    private boolean hasWon(char player) {
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (cells[i][0].getText().equals(String.valueOf(player))
                    && cells[i][1].getText().equals(String.valueOf(player))
                    && cells[i][2].getText().equals(String.valueOf(player))) {
                return true;
            }
        }

        for (int i = 0; i < BOARD_SIZE; i++) {
            if (cells[0][i].getText().equals(String.valueOf(player))
                    && cells[1][i].getText().equals(String.valueOf(player))
                    && cells[2][i].getText().equals(String.valueOf(player))) {
                return true;
            }
        }

        if (cells[0][0].getText().equals(String.valueOf(player))
                && cells[1][1].getText().equals(String.valueOf(player))
                && cells[2][2].getText().equals(String.valueOf(player))) {
            return true;
        }

        return cells[0][2].getText().equals(String.valueOf(player))
                && cells[1][1].getText().equals(String.valueOf(player))
                && cells[2][0].getText().equals(String.valueOf(player));
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
                cells[row][col].setBackground(Color.WHITE);
            }
        }
        currentPlayer = PLAYER_X;
        gameOver = false;
        statusLabel.setText("Player X's turn");
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