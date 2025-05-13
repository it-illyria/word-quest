import React from "react";
import {motion} from "framer-motion";

interface Props {
    word?: string;
    question?: string;
    choices: string[];
    correctAnswer: string;
    selected: string | null;
    onSelect: (choice: string) => void;
}

const QuestionCard: React.FC<Props> = ({
                                           word,
                                           question,
                                           choices,
                                           correctAnswer,
                                           selected,
                                           onSelect,
                                       }) => {
    const prompt = word ? `What does "<span class="word-highlight">${word}</span>" mean?` : question;

    return (
        <motion.div
            className="question-card"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
            key={word || question}
        >
            <h2 className="question-title" dangerouslySetInnerHTML={{ __html: prompt || '' }} />

            <div className="choices-grid">
                {choices.map((choice, index) => {
                    const isCorrect = choice === correctAnswer;
                    const isSelected = selected === choice;
                    const isDisabled = !!selected;

                    let buttonClass = "choice-button";
                    if (selected) {
                        if (isCorrect) buttonClass += " correct-choice";
                        else if (isSelected) buttonClass += " incorrect-choice";
                        else buttonClass += " neutral-choice";
                    }

                    return (
                        <motion.button
                            key={`${choice}-${index}`}
                            onClick={() => onSelect(choice)}
                            disabled={isDisabled}
                            className={buttonClass}
                            whileTap={{scale: isDisabled ? 1 : 0.97}}
                            whileHover={!isDisabled ? {
                                scale: 1.02,
                                boxShadow: "0 2px 8px rgba(30, 64, 175, 0.2)"
                            } : {}}
                            transition={{type: "spring", stiffness: 400, damping: 10}}
                        >
                            <motion.span
                                initial={{x: -5, opacity: 0}}
                                animate={{x: 0, opacity: 1}}
                                transition={{delay: index * 0.05}}
                            >
                                {choice}
                            </motion.span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default QuestionCard;
