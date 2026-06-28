import java.util.Scanner;

/**
 * Tic-Tac-Toe Game
 *
 * Console-based two-player Tic-Tac-Toe with input validation,
 * score tracking, and replay support.
 */
public class TicTacToe {

    private static final int BOARD_SIZE = 3;
    private static final int MIN_COORDINATE = 0;
    private static final int MAX_COORDINATE = 2;
    private static final char PLAYER_X = 'X';
    private static final char PLAYER_O = 'O';
    private static final char EMPTY_CELL = ' ';

    private final Scanner scanner;
    private final char[][] board;
    private char currentPlayer;
    private int playerXWins;
    private int playerOWins;
    private int draws;

    public TicTacToe(Scanner scanner) {
        this.scanner = scanner;
        this.board = new char[BOARD_SIZE][BOARD_SIZE];
        this.currentPlayer = PLAYER_X;
        initializeBoard();
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        TicTacToe game = new TicTacToe(scanner);

        System.out.println("+--------------------------------------+");
        System.out.println("|      WELCOME TO TIC-TAC-TOE GAME     |");
        System.out.println("+--------------------------------------+\n");

        boolean playAgain = true;
        while (playAgain) {
            game.startGame();
            game.displayScoreboard();
            playAgain = game.askPlayAgain();
        }

        System.out.println("\n+--------------------------------------+");
        System.out.println("|     Thanks for playing! Goodbye!     |");
        System.out.println("+--------------------------------------+");
        scanner.close();
    }

    private void initializeBoard() {
        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                board[row][col] = EMPTY_CELL;
            }
        }
    }

    private void resetBoard() {
        initializeBoard();
        currentPlayer = PLAYER_X;
    }

    private void startGame() {
        resetBoard();

        System.out.println("\n---------------------------------------");
        System.out.println("         NEW GAME STARTED");
        System.out.println("---------------------------------------\n");

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

    private void displayBoard() {
        System.out.println("\n       Column");
        System.out.println("     0   1   2");
        System.out.println("   +---+---+---+");

        for (int row = 0; row < BOARD_SIZE; row++) {
            System.out.print(row + " | ");
            for (int col = 0; col < BOARD_SIZE; col++) {
                char cell = board[row][col];
                if (cell == EMPTY_CELL) {
                    System.out.print(" " + (row * 3 + col) + " | ");
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

    private int[] getPlayerMove() {
        while (true) {
            try {
                System.out.print("\nPlayer " + currentPlayer + ", enter your move (row and column): ");

                if (!scanner.hasNextInt()) {
                    System.out.println("ERROR: Please enter numeric values only!");
                    scanner.nextLine();
                    continue;
                }

                int row = scanner.nextInt();

                if (!scanner.hasNextInt()) {
                    System.out.println("ERROR: Please enter two numeric values (row and column)!");
                    scanner.nextLine();
                    continue;
                }

                int col = scanner.nextInt();
                scanner.nextLine();

                if (!isValidCoordinate(row) || !isValidCoordinate(col)) {
                    System.out.println("ERROR: Row and column must be between 0 and 2!");
                    continue;
                }

                if (board[row][col] != EMPTY_CELL) {
                    System.out.println("ERROR: Cell (" + row + ", " + col + ") is already occupied! Choose an empty cell.");
                    continue;
                }

                return new int[] { row, col };
            } catch (Exception e) {
                System.out.println("ERROR: Invalid input. Please try again.");
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

    private boolean hasWon(char player) {
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

    private void announceResult() {
        System.out.println("\n---------------------------------------");

        if (hasWon(PLAYER_X)) {
            System.out.println("         PLAYER X WINS!");
            playerXWins++;
        } else if (hasWon(PLAYER_O)) {
            System.out.println("         PLAYER O WINS!");
            playerOWins++;
        } else {
            System.out.println("            IT'S A DRAW!");
            draws++;
        }

        System.out.println("---------------------------------------");
    }

    private void switchPlayer() {
        currentPlayer = (currentPlayer == PLAYER_X) ? PLAYER_O : PLAYER_X;
    }

    private void displayScoreboard() {
        System.out.println("\n+--------------------------------------+");
        System.out.println("|          SCOREBOARD (Current)       |");
        System.out.println("+--------------------------------------+");
        System.out.println("|  Player X Wins: " + String.format("%-21d", playerXWins) + "|");
        System.out.println("|  Player O Wins: " + String.format("%-21d", playerOWins) + "|");
        System.out.println("|  Draws:         " + String.format("%-21d", draws) + "|");
        System.out.println("+--------------------------------------+");
    }

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
