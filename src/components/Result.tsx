import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";
import React from "react";

type Props = {
    score: number;
    total: number;
    passed: boolean;
    onRestart: () => void;
};

const Result: React.FC<Props> = ({ score, total, passed, onRestart }) => {
    const { width, height } = useWindowSize();
    const percentage = Math.round((score / total) * 100);

    return (
        <motion.div
            className={`result-container ${passed ? "result-passed" : "result-failed"}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {passed && <Confetti width={width} height={height} recycle={false} />}

            <motion.div
                className="result-content"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="result-title">
                    {passed ? "🎉 Congratulations!" : "😢 Try Again"}
                </h2>
                <p className="result-score">
                    Score: <span className="result-score-number">{score}</span>/{total}
                </p>
                <p className={`result-percentage ${passed ? "text-passed" : "text-failed"}`}>
                    {percentage}%
                </p>
                <p className="result-message">
                    {passed
                        ? "You passed the quiz!"
                        : "You need 70% to pass. Keep practicing!"}
                </p>
            </motion.div>

            <motion.button
                onClick={onRestart}
                className={`restart-button ${passed ? "button-passed" : "button-failed"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {passed ? "Try Another Quiz" : "Retry This Quiz"}
            </motion.button>
        </motion.div>
    );
};

export default Result;