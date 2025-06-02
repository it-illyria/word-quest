import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { Question } from "../services/type"; // Assuming Question type is in this path

type Props = {
    score: number;
    total: number;
    passed: boolean;
    onRestart: () => void;
    onNewQuestions?: () => void;
    incorrectQuestions?: Question[];
};

const Result: React.FC<Props> = ({
                                     score,
                                     total,
                                     passed,
                                     onRestart,
                                     onNewQuestions,
                                     incorrectQuestions = [],
                                 }) => {
    const { width, height } = useWindowSize();
    const percentage = Math.round((score / total) * 100);
    const [reviewMode, setReviewMode] = useState(false);

    const handleReviewClick = () => {
        setReviewMode(true);
    };

    const handleBackToSummary = () => {
        setReviewMode(false);
    };

    console.log("Result: incorrectQuestions prop received", incorrectQuestions); // For debugging

    return (
        <motion.div
            className={`result-container ${passed ? "result-passed" : "result-failed"}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {passed && <Confetti width={width} height={height} recycle={false} />}

            {!reviewMode ? (
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
            ) : (
                <motion.div
                    className="incorrect-review"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="review-title">Incorrect Answers</h3>
                    {incorrectQuestions.length > 0 ? (
                        <ul className="review-list">
                            {incorrectQuestions.map((question) => (
                                <li key={question.id} className="review-item">
                                    <p className="review-question">
                                        <strong>Question:</strong> {question.question || question.word || question.definition}
                                    </p>
                                    <p className="review-correct-answer">
                                        <strong>Correct Answer:</strong> {question.correctAnswer}
                                    </p>
                                    {question.explanation && (
                                        <p className="review-explanation">
                                            <strong>Explanation:</strong> {question.explanation}
                                        </p>
                                    )}
                                    <hr className="review-divider" />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="review-message">You didn't have any incorrect answers!</p>
                    )}
                    <motion.button
                        onClick={handleBackToSummary}
                        className="back-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Back to Summary
                    </motion.button>
                </motion.div>
            )}

            <div className="result-buttons">
                <motion.button
                    onClick={onRestart}
                    className={`action-button primary-button ${passed ? "success-button" : "retry-button"}`}
                    whileHover={{
                        scale: 1.05,
                        boxShadow: passed ? "0 4px 12px rgba(74, 222, 128, 0.3)" : "0 4px 12px rgba(239, 68, 68, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    aria-label={passed ? "Try another quiz" : "Retry this quiz"}
                >
                    <span className="button-icon">
                        {passed ? "🔄" : "🔁"}
                    </span>
                    <span className="button-text">
                        {passed ? "Try Another Quiz" : "Retry This Quiz"}
                    </span>
                </motion.button>

                {onNewQuestions && !reviewMode && (
                    <motion.button
                        onClick={onNewQuestions}
                        className="action-button secondary-button"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 4px 12px rgba(96, 165, 250, 0.3)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        aria-label="Get new questions"
                    >
                        <span className="button-icon">✨</span>
                        <span className="button-text">Get New Questions</span>
                    </motion.button>
                )}

                {incorrectQuestions.length > 0 && !reviewMode && (
                    <motion.button
                        onClick={handleReviewClick}
                        className="action-button warning-button"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 4px 12px rgba(251, 146, 60, 0.3)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        aria-label="Review Incorrect Answers"
                    >
                        <span className="button-icon">📘</span>
                        <span className="button-text">Review Incorrect Answers</span>
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default Result;
