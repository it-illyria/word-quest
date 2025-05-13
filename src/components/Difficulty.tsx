import { motion } from "framer-motion";
import React from "react";
import "../index.css";
import useSound from "use-sound";

interface DifficultyOption {
    level: string;
    emoji: string;
    description: string;
}

interface Props {
    onDifficultySelect: (difficulty: string) => void;
    onBack: () => void;
    category: string;
}

const Difficulty: React.FC<Props> = ({ onDifficultySelect, onBack, category }) => {
    const [playHover] = useSound('/sounds/hover.mp3');
    const difficulties: DifficultyOption[] = [
        { level: "Easy", emoji: "😊", description: "Basic questions, more time to think." },
        { level: "Normal", emoji: "😐", description: "Standard difficulty with balanced timing." },
        { level: "Hard", emoji: "😰", description: "Challenging questions, less time to answer." }
    ];

    return (
        <motion.div
            className="difficulty-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="difficulty-content"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <motion.h1
                    className="difficulty-title"
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={() => playHover()}
                >
                    Choose your Difficulty
                </motion.h1>

                <motion.h2
                    className="difficulty-category"
                >
                    for {category} Quiz
                </motion.h2>

                <motion.div
                    className="difficulty-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {difficulties.map((difficulty, i) => (
                        <motion.div
                            key={difficulty.level}
                            className="difficulty-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            onHoverStart={() => playHover()}
                            onClick={() => onDifficultySelect(difficulty.level.toLowerCase())}
                        >
                            <div className="difficulty-emoji">{difficulty.emoji}</div>
                            <h3>{difficulty.level}</h3>
                            <p className="difficulty-description">{difficulty.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.button
                    className="back-button"
                    onClick={onBack}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ← Back to Categories
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default Difficulty;
