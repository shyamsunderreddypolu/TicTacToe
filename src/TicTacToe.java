import java.util.Scanner;

/**
 * A professional, console-based Tic-Tac-Toe game.
 * Features input validation, dynamic board drawing, score tracking,
 * and robust replay functionality.
 *
 * @author Shyam Sunder Reddy Polu
 * @version 1.1
 */
public class TicTacToe {

    private static final int BOARD_SIZE = 3;
    private static final int MIN_COORDINATE = 0;
    private static final int MAX_COORDINATE = 2;
    
    public static final char PLAYER_X = 'X';
    public static final char PLAYER_O = 'O';
    public static final char EMPTY_CELL = ' ';

    private final Scanner scanner;
    private final char[][] board;
    private char currentPlayer;
    private int playerXWins;
    private int playerOWins;
    private int draws;

    /**
     * Initializes a new TicTacToe game instance.
     *
     * @param scanner The Scanner instance to read user inputs.
     */
    public TicTacToe(Scanner scanner) {
        this.scanner = scanner;
        this.board = new char[BOARD_SIZE][BOARD_SIZE];
        this.currentPlayer = PLAYER_X;
        initializeBoard();
    }

    /**
     * Entry point for the console-based Tic-Tac-Toe application.
     *
     * @param args Command-line arguments (unused).
     */
    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            TicTacToe game = new TicTacToe(scanner);

            System.out.println("========================================");
            System.out.println("      WELCOME TO TIC-TAC-TOE GAME       ");
            System.out.println("========================================");

            boolean playAgain = true;
            while (playAgain) {
                game.startGame();
                game.displayScoreboard();
                playAgain = game.askPlayAgain();
            }

            System.out.println("\n========================================");
            System.out.println("     Thanks for playing! Goodbye!       ");
            System.out.println("========================================");
        }
    }

    /**
     * Initializes the game board by setting all cells to empty.
     */
    private void initializeBoard() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                board[row][col] = EMPTY_CELL;
            }
        }
    }

    /**
     * Resets the board and sets Player X as the starting player.
     */
    private void resetBoard() {
        initializeBoard();
        currentPlayer = PLAYER_X;
    }

    /**
     * Starts and controls the loop of a single game.
     */
    public void startGame() {
        resetBoard();

        System.out.println("\n----------------------------------------");
        System.out.println("            NEW GAME STARTED            ");
        System.out.println("----------------------------------------");

        while (true) {
            displayBoard();
            int[] move = getPlayerMove();
            board[move[0]][move[1]] = currentPlayer;

            if (isGameOver()) {
                displayBoard();
                announceResult();
                break;
            }

            switchPlayer();
        }
    }

    /**
     * Prints the current state of the board in a user-friendly CLI format.
     */
    private void displayBoard() {
        System.out.println("\n       Column");
        System.out.println("     0   1   2");
        System.out.println("   +---+---+---+");

        for (int row = 0; row < BOARD_SIZE; row++) {
            System.out.print(row + " | ");
            for (int col = 0; col < BOARD_SIZE; col++) {
                char cell = board[row][col];
                if (cell == EMPTY_CELL) {
                    // Display the raw cell number (0-8) as a guide
                    int cellNumber = row * BOARD_SIZE + col;
                    System.out.print(" " + cellNumber + " | ");
                } else {
                    System.out.print(" " + cell + " | ");
                }
            }
            System.out.println();
            if (row < BOARD_SIZE - 1) {
                System.out.println("   +---+---+---+");
            }
        }
        System.out.println("   +---+---+---+");
    }

    /**
     * Prompts the current player to input their move coordinates (row and col).
     * Validates input type, range, and cell availability.
     *
     * @return An integer array containing [row, col].
     */
    private int[] getPlayerMove() {
        while (true) {
            try {
                System.out.printf("\nPlayer %c, enter your move (row and col: 0-2): ", currentPlayer);

                if (!scanner.hasNextInt()) {
                    System.out.println("ERROR: Please enter numeric values only!");
                    scanner.nextLine(); // Clear invalid token
                    continue;
                }
                int row = scanner.nextInt();

                if (!scanner.hasNextInt()) {
                    System.out.println("ERROR: Please enter both row and column values!");
                    scanner.nextLine(); // Clear invalid token
                    continue;
                }
                int col = scanner.nextInt();
                scanner.nextLine(); // Consume newline

                if (!isValidCoordinate(row) || !isValidCoordinate(col)) {
                    System.out.println("ERROR: Row and column must be between 0 and 2!");
                    continue;
                }

                if (board[row][col] != EMPTY_CELL) {
                    System.out.printf("ERROR: Cell (%d, %d) is already occupied! Choose another cell.\n", row, col);
                    continue;
                }

                return new int[] { row, col };
            } catch (Exception e) {
                System.out.println("ERROR: Invalid input format. Please try again.");
                scanner.nextLine();
            }
        }
    }

    private boolean isValidCoordinate(int coordinate) {
        return coordinate >= MIN_COORDINATE && coordinate <= MAX_COORDINATE;
    }

    private boolean isGameOver() {
        return hasWon(currentPlayer) || isBoardFull();
    }

    /**
     * Checks if the specified player has won the game.
     *
     * @param player The character symbol of the player (X or O).
     * @return true if the player has won, false otherwise.
     */
    public boolean hasWon(char player) {
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (isRowWin(i, player) || isColWin(i, player)) {
                return true;
            }
        }
        return isDiag1Win(player) || isDiag2Win(player);
    }

    private boolean isRowWin(int row, char player) {
        return board[row][0] == player && board[row][1] == player && board[row][2] == player;
    }

    private boolean isColWin(int col, char player) {
        return board[0][col] == player && board[1][col] == player && board[2][col] == player;
    }

    private boolean isDiag1Win(char player) {
        return board[0][0] == player && board[1][1] == player && board[2][2] == player;
    }

    private boolean isDiag2Win(char player) {
        return board[0][2] == player && board[1][1] == player && board[2][0] == player;
    }

    private boolean isBoardFull() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] == EMPTY_CELL) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Handles the display and stats logging of the game results.
     */
    private void announceResult() {
        System.out.println("\n----------------------------------------");

        if (hasWon(PLAYER_X)) {
            System.out.println("            PLAYER X WINS!             ");
            playerXWins++;
        } else if (hasWon(PLAYER_O)) {
            System.out.println("            PLAYER O WINS!             ");
            playerOWins++;
        } else {
            System.out.println("             IT'S A DRAW!              ");
            draws++;
        }

        System.out.println("----------------------------------------");
    }

    private void switchPlayer() {
        currentPlayer = (currentPlayer == PLAYER_X) ? PLAYER_O : PLAYER_X;
    }

    /**
     * Prints the current scoreboard to the console.
     */
    private void displayScoreboard() {
        System.out.println("\n+----------------------------------------+");
        System.out.println("|          SCOREBOARD (All-Time)         |");
        System.out.println("+----------------------------------------+");
        System.out.printf("|  Player X Wins: %-22d |\n", playerXWins);
        System.out.printf("|  Player O Wins: %-22d |\n", playerOWins);
        System.out.printf("|  Draws:         %-22d |\n", draws);
        System.out.println("+----------------------------------------+");
    }

    /**
     * Prompts players to decide if they want to play another match.
     *
     * @return true if yes, false if no.
     */
    private boolean askPlayAgain() {
        while (true) {
            System.out.print("\nDo you want to play again? (yes/no): ");
            String response = scanner.nextLine().trim().toLowerCase();

            if (response.equals("yes") || response.equals("y")) {
                return true;
            }
            if (response.equals("no") || response.equals("n")) {
                return false;
            }
            System.out.println("ERROR: Please enter 'yes' or 'no'.");
        }
    }
}
