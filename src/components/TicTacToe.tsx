import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type Player = "X" | "O";
type BoardState = (Player | null)[];
type Difficulty = "easy" | "medium" | "hard";
type Theme = "classic" | "emoji" | "shapes" | "animals";
type GameMode = "classic" | "ultimate" | "five-in-row";
type GameResult = "X" | "O" | "draw";

interface GameRecord {
    boardStates: BoardState[];
    moves: number[];
    result: GameResult;
    date: string;
    difficulty: Difficulty;
}

interface GameStats {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    currentStreak: number;
    maxStreak: number;
    lastPlayed?: string;
}

interface ThemeConfig {
    X: string;
    O: string;
}

interface PlayerProfile {
    name: string;
    avatar: string;
    wins: number;
    losses: number;
}

interface TournamentScores {
    playerWins: number;
    computerWins: number;
    draws: number;
}

const TicTacToe = ({ onBack }: { onBack: () => void }) => {
    const { width, height } = useWindowSize();
    const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
    const [winner, setWinner] = useState<Player | "draw" | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [theme, setTheme] = useState<Theme>("emoji");
    const [gameMode, setGameMode] = useState<GameMode>("classic");
    const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
    const [stats, setStats] = useState<GameStats>({
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentStreak: 0,
        maxStreak: 0,
    });
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile>({
        name: "Player",
        avatar: "👤",
        wins: 0,
        losses: 0,
    });
    const [showHistory, setShowHistory] = useState(false);
    const [isReplaying, setIsReplaying] = useState(false);
    const [tournamentMode, setTournamentMode] = useState(false);
    const [rounds] = useState(5);
    const [currentRound, setCurrentRound] = useState(1);
    const [tournamentScores, setTournamentScores] = useState<TournamentScores>({
        playerWins: 0,
        computerWins: 0,
        draws: 0,
    });
    const [showTournamentResult, setShowTournamentResult] = useState(false);

    // Sound effects
    const [playMove] = useSound("/sounds/move.mp3");
    const [playWin] = useSound("/sounds/win.mp3");
    const [playDraw] = useSound("/sounds/draw.mp3");
    const [playClick] = useSound("/sounds/click.mp3");

    // Theme configurations
    const themeConfigs: Record<Theme, ThemeConfig> = {
        classic: { X: "X", O: "O" },
        emoji: { X: "❌", O: "⭕" },
        shapes: { X: "△", O: "◯" },
        animals: { X: "🐯", O: "🐻" },
    };

    // Load saved data from localStorage
    useEffect(() => {
        const savedStats = localStorage.getItem("tictactoe_stats");
        const savedHistory = localStorage.getItem("tictactoe_history");
        const savedProfile = localStorage.getItem("tictactoe_profile");

        if (savedStats) setStats(JSON.parse(savedStats));
        if (savedHistory) setGameHistory(JSON.parse(savedHistory));
        if (savedProfile) setPlayerProfile(JSON.parse(savedProfile));
    }, []);

    // Save data to localStorage when it changes
    useEffect(() => {
        localStorage.setItem("tictactoe_stats", JSON.stringify(stats));
        localStorage.setItem("tictactoe_history", JSON.stringify(gameHistory));
        localStorage.setItem("tictactoe_profile", JSON.stringify(playerProfile));
    }, [stats, gameHistory, playerProfile]);

    // Check for the winner
    const checkWinner = (board: BoardState): Player | "draw" | null => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6], // diagonals
        ];

        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a] as Player;
            }
        }
        return board.every((cell) => cell) ? "draw" : null;
    };

    // Minimax algorithm
    const minimax = (
        board: BoardState,
        depth: number,
        isMaximizing: boolean
    ): number => {
        const result = checkWinner(board);
        if (result !== null) {
            if (result === "X") return -10 + depth;
            if (result === "O") return 10 - depth;
            return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = "O";
                    const score = minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = "X";
                    const score = minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const getBestMove = (board: BoardState): number => {
        if (difficulty === "easy") {
            return getRandomMove(board);
        } else if (difficulty === "medium") {
            // 70% chance to make optimal move in medium difficulty
            return Math.random() > 0.3 ? getOptimalMove(board) : getRandomMove(board);
        } else {
            return getOptimalMove(board);
        }
    };

    const getOptimalMove = (board: BoardState): number => {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = "O";
                const score = minimax(board, 0, false);
                board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };

    const getRandomMove = (board: BoardState): number => {
        const emptyIndices = board
            .map((cell, index) => (cell === null ? index : null))
            .filter((val) => val !== null) as number[];
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    };

    const makeComputerMove = () => {
        if (winner || currentPlayer !== "O") return;

        const move = getBestMove(board);
        setTimeout(() => {
            handleMove(move);
        }, 500);
    };

    const handleMove = (index: number) => {
        if (board[index] || winner || isReplaying) return;

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);

        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
            const result = gameWinner === "draw" ? "draw" : gameWinner;
            const newRecord: GameRecord = {
                boardStates: [
                    ...(gameHistory[gameHistory.length - 1]?.boardStates || []),
                    newBoard,
                ],
                moves: [...(gameHistory[gameHistory.length - 1]?.moves || []), index],
                result,
                date: new Date().toISOString(),
                difficulty,
            };

            setGameHistory((prev) => [...prev, newRecord]);
            updateStats(result);

            if (result !== "draw") playWin();
            else playDraw();

            setWinner(gameWinner);
        } else {
            setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
            playMove();
        }
    };

    const updateStats = (result: GameResult) => {
        setStats((prev) => {
            const isWin = result === "X";
            const isDraw = result === "draw";
            const newStreak = isWin ? prev.currentStreak + 1 : 0;

            return {
                totalGames: prev.totalGames + 1,
                wins: isWin ? prev.wins + 1 : prev.wins,
                losses: !isWin && !isDraw ? prev.losses + 1 : prev.losses,
                draws: isDraw ? prev.draws + 1 : prev.draws,
                currentStreak: newStreak,
                maxStreak: Math.max(newStreak, prev.maxStreak),
                lastPlayed: new Date().toISOString(),
            };
        });

        if (result === "X") {
            setPlayerProfile((prev) => ({ ...prev, wins: prev.wins + 1 }));
        } else if (result === "O") {
            setPlayerProfile((prev) => ({ ...prev, losses: prev.losses + 1 }));
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
    };
    const replayGame = (game: GameRecord) => {
        setIsReplaying(true);
        resetGame();

        game.moves.forEach((move, i) => {
            setTimeout(() => {
                const newBoard = [...board];
                newBoard[move] = i % 2 === 0 ? "X" : "O";
                setBoard(newBoard);

                if (i === game.moves.length - 1) {
                    setTimeout(() => {
                        setIsReplaying(false);
                    }, 500);
                }
            }, i * 500);
        });
    };

    const handleTournamentToggle = () => {
        playClick();
        if (!tournamentMode) {
            // Starting a new tournament
            setTournamentMode(true);
            setCurrentRound(1);
            setTournamentScores({ playerWins: 0, computerWins: 0, draws: 0 });
            resetGame();
        } else {
            // Ending tournament early
            setTournamentMode(false);
        }
    };

    // Handle tournament progression
    useEffect(() => {
        if (tournamentMode && winner) {
            // Update tournament scores based on a game result
            if (winner === "X") {
                setTournamentScores((prev) => ({
                    ...prev,
                    playerWins: prev.playerWins + 1,
                }));
            } else if (winner === "O") {
                setTournamentScores((prev) => ({
                    ...prev,
                    computerWins: prev.computerWins + 1,
                }));
            } else if (winner === "draw") {
                setTournamentScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
            }

            // Check if the tournament is over
            if (currentRound >= rounds) {
                setTimeout(() => {
                    setShowTournamentResult(true);
                }, 1000);
            } else {
                // Proceed to the next round
                setTimeout(() => {
                    setCurrentRound((prev) => prev + 1);
                    resetGame();
                }, 1500);
            }
        }
    }, [winner, tournamentMode, currentRound, rounds]);

    // Computer move logic
    useEffect(() => {
        if (currentPlayer === "O" && !winner && !isReplaying) {
            makeComputerMove();
        }
    }, [currentPlayer, winner, isReplaying]);

    return (
        <motion.div
            className="tictactoe-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {winner === "X" && <Confetti width={width} height={height} recycle={false} />}

            <div className="game-header">
                <motion.button
                    className="back-button"
                    onClick={onBack}
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => playClick()}
                >
                    ← Back
                </motion.button>

                <motion.h1
                    className="game-title"
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring" }}
                >
                    Tic Tac Toe
                </motion.h1>
            </div>

            <div className="player-profile-card">
                <div className="player-avatar">{playerProfile.avatar}</div>
                <div className="player-info">
                    <div className="player-name">{playerProfile.name}</div>
                    <div className="player-stats">
                        <span>W: {playerProfile.wins}</span>
                        <span>L: {playerProfile.losses}</span>
                    </div>
                </div>
            </div>

            <div className="game-controls">
                <div className="difficulty-selector">
                    <label>Difficulty:</label>
                    <select
                        value={difficulty}
                        onChange={(e) => {
                            setDifficulty(e.target.value as Difficulty);
                            playClick();
                        }}
                        disabled={!!winner || currentPlayer === "O"}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className="theme-selector">
                    <label>Theme:</label>
                    <select
                        value={theme}
                        onChange={(e) => {
                            setTheme(e.target.value as Theme);
                            playClick();
                        }}
                    >
                        {Object.keys(themeConfigs).map((t) => (
                            <option key={t} value={t}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="game-mode-selector">
                    <label>Mode:</label>
                    <select
                        value={gameMode}
                        onChange={(e) => {
                            setGameMode(e.target.value as GameMode);
                            playClick();
                            resetGame();
                        }}
                        disabled={!!winner || currentPlayer === "O"}
                    >
                        <option value="classic">Classic (3x3)</option>
                    </select>
                </div>
            </div>

            {tournamentMode && (
                <div className="tournament-info">
                    <div className="tournament-round">
                        Round {currentRound} of {rounds}
                    </div>
                    <div className="tournament-scores">
                        <span>You: {tournamentScores.playerWins}</span>
                        <span>Computer: {tournamentScores.computerWins}</span>
                        <span>Draws: {tournamentScores.draws}</span>
                    </div>
                    <div className="tournament-progress">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${((currentRound - 1 + (winner ? 1 : 0)) / rounds * 100)}%`,
                            }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="game-info">
                <div className="current-turn">
                    {winner
                        ? winner === "draw"
                            ? "Game ended in a draw!"
                            : `Winner: ${winner === "X" ? "You! 🎉" : "Computer 🤖"}`
                        : `Current turn: ${currentPlayer === "X" ? "Your turn" : "Computer thinking..."}`}
                </div>

                <div className="score-display">
                    <span className="score-you">You: {stats.wins}</span>
                    <span className="score-draw">Draws: {stats.draws}</span>
                    <span className="score-computer">Computer: {stats.losses}</span>
                </div>
            </div>

            <div className="extended-stats">
                <div className="stat-item">
                    <span className="stat-label">Current Streak:</span>
                    <span className="stat-value">{stats.currentStreak}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Max Streak:</span>
                    <span className="stat-value">{stats.maxStreak}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Win Rate:</span>
                    <span className="stat-value">
            {stats.totalGames > 0
                ? Math.round((stats.wins / stats.totalGames) * 100)
                : 0}
                        %
          </span>
                </div>
            </div>

            <motion.div
                className="board"
                layout
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    delay: 0.2,
                    staggerChildren: 0.05,
                }}
            >
                {board.map((cell, index) => (
                    <motion.div key={index} layout transition={{ type: "spring" }}>
                        <motion.button
                            className={`square ${cell ? `filled-${cell.toLowerCase()}` : ""}`}
                            onClick={() => handleMove(index)}
                            disabled={
                                !!cell || !!winner || currentPlayer !== "X" || isReplaying
                            }
                            whileHover={{
                                scale: cell || winner || currentPlayer !== "X" ? 1 : 1.1,
                            }}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: index * 0.05 }}
                        >
                            {cell ? (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" }}
                                >
                                    {themeConfigs[theme][cell]}
                                </motion.span>
                            ) : null}
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>

            <div className="game-actions">
                <motion.button
                    className="action-button reset-button"
                    onClick={resetGame}
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => playClick()}
                    disabled={isReplaying}
                >
                    Reset Game
                </motion.button>

                <motion.button
                    className="action-button stats-button"
                    onClick={() => setShowHistory(!showHistory)}
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => playClick()}
                >
                    {showHistory ? "Hide History" : "Show History"}
                </motion.button>

                <motion.button
                    className="action-button tournament-button"
                    onClick={handleTournamentToggle}
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => playClick()}
                >
                    {tournamentMode ? "Exit Tournament" : "Start Tournament (Best of 5)"}
                </motion.button>
            </div>

            {showHistory && (
                <motion.div
                    className="history-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <h3>Game History</h3>
                    {gameHistory.length === 0 ? (
                        <p>No games played yet</p>
                    ) : (
                        <div className="history-list">
                            {gameHistory
                                .slice()
                                .reverse()
                                .map((game, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="history-item"
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
                                    >
                                        <div className="history-info">
                                            <span>Game {gameHistory.length - idx}</span>
                                            <span>{new Date(game.date).toLocaleString()}</span>
                                            <span className={`result-${game.result}`}>
                        {game.result === "draw" ? "Draw" : `Winner: ${game.result}`}
                      </span>
                                            <span>Difficulty: {game.difficulty}</span>
                                            <div className="mini-board-preview">
                                                {game.boardStates[game.boardStates.length - 1].map(
                                                    (cell, i) => (
                                                        <div
                                                            key={i}
                                                            className={`mini-cell ${
                                                                cell ? `filled-${cell.toLowerCase()}` : ""
                                                            }`}
                                                        >
                                                            {cell ? themeConfigs[theme][cell] : ""}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="replay-button"
                                            onClick={() => replayGame(game)}
                                            disabled={isReplaying}
                                        >
                                            Replay
                                        </button>
                                    </motion.div>
                                ))}
                        </div>
                    )}
                </motion.div>
            )}

            {showTournamentResult && (
                <motion.div
                    className="tournament-result-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="tournament-result-content">
                        <h2>Tournament Results</h2>
                        <div className="result-stats">
                            <div className="result-stat">
                                <span className="stat-label">Your Wins:</span>
                                <span className="stat-value">{tournamentScores.playerWins}</span>
                            </div>
                            <div className="result-stat">
                                <span className="stat-label">Computer Wins:</span>
                                <span className="stat-value">
                  {tournamentScores.computerWins}
                </span>
                            </div>
                            <div className="result-stat">
                                <span className="stat-label">Draws:</span>
                                <span className="stat-value">{tournamentScores.draws}</span>
                            </div>
                        </div>
                        <div className="tournament-final-result">
                            {tournamentScores.playerWins > tournamentScores.computerWins ? (
                                <>
                                    <h3 className="win-text">You Won the Tournament! 🎉</h3>
                                    <Confetti width={width} height={height} recycle={false} />
                                </>
                            ) : tournamentScores.playerWins < tournamentScores.computerWins ? (
                                <h3 className="lose-text">Computer Won the Tournament 🤖</h3>
                            ) : (
                                <h3 className="draw-text">Tournament Ended in a Draw!</h3>
                            )}
                        </div>
                        <button
                            className="close-result-button"
                            onClick={() => {
                                setShowTournamentResult(false);
                                setTournamentMode(false);
                            }}
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default TicTacToe;
