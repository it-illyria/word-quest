import { motion } from "framer-motion";
import React from "react";
import useSound from "use-sound";

interface HomePageProps {
    onNavigateToQuiz: () => void;
    onNavigateToTicTacToe: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToQuiz, onNavigateToTicTacToe }) => {
    const [playHover] = useSound('/sounds/hover.mp3');
    const [playSelect] = useSound('/sounds/select.mp3');

    return (
        <motion.div
            className="home-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="home-content"
                initial={{ y: -40, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
                <motion.h1
                    className="home-title"
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={() => playHover()}
                >
                    Game Hub
                </motion.h1>

                <motion.p className="home-subtitle">
                    Choose your game
                </motion.p>

                <motion.div className="game-grid">
                    {/* Quiz App Card */}
                    <motion.div
                        className="game-card quiz-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        onHoverStart={() => playHover()}
                        onClick={() => {
                            playSelect();
                            onNavigateToQuiz();
                        }}
                    >
                        <div className="game-emoji">🧠</div>
                        <h3>Trivia Quiz</h3>
                        <p>Test your knowledge across various categories</p>
                    </motion.div>

                    {/* TicTacToe Card */}
                    <motion.div
                        className="game-card tictactoe-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        onHoverStart={() => playHover()}
                        onClick={() => {
                            playSelect();
                            onNavigateToTicTacToe();
                        }}
                    >
                        <div className="game-emoji">❌⭕</div>
                        <h3>Tic Tac Toe</h3>
                        <p>Classic X and O strategy game</p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default HomePage;
