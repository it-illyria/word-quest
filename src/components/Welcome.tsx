import { motion } from "framer-motion";
import React from "react";
import "../index.css";
import useSound from "use-sound";

interface Props {
    onCategorySelect?: (category: string, difficulty?: string) => void;
}

const quizCategories = [
    { emoji: "🎨", name: "Art", description: "Test your art knowledge" },
    { emoji: "📜", name: "History", description: "Journey through time" },
    { emoji: "🔬", name: "Science", description: "Explore scientific wonders" },
    { emoji: "🗳️", name: "Politics", description: "Political systems and events" },
    { emoji: "⚽", name: "Sports", description: "Sports trivia challenge" },
    {
        emoji: "📚",
        name: "Vocabulary",
        description: "Expand your word power",
        special: true
    },
];

const WelcomeScreen: React.FC<Props> = ({ onCategorySelect }) => {
    const [playHover] = useSound('/sounds/hover.mp3');

    const handleCategorySelect = (category: string) => {
        if (onCategorySelect) {
            onCategorySelect(category); // Treat Vocabulary like other categories
        }
    };

    return (
        <motion.div
            className="welcome-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="welcome-content"
                initial={{ y: -40, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
                <motion.div
                    className="floating-brain"
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        y: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                        rotate: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                    }}
                >
                    🧠
                </motion.div>

                <motion.h1
                    className="welcome-title"
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={() => playHover()}
                >
                    Quiz Explorer
                </motion.h1>

                <motion.p className="welcome-subtitle">
                    Choose your challenge
                </motion.p>

                <motion.div
                    className="category-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {quizCategories.map((category, i) => (
                        <motion.div
                            key={category.name}
                            className={`category-card ${category.special ? 'special-card' : ''}`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            whileHover={{ scale: category.special ? 1 : 1.05 }}
                            onHoverStart={() => playHover()}
                            onClick={() => handleCategorySelect(category.name)}
                        >
                            <div className="category-emoji">{category.emoji}</div>
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <motion.div
                className="feature-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {["✨ Multiple Categories", "🏆 Earn Badges", "📊 Track Progress"].map(
                    (feature, i) => (
                        <motion.div
                            key={feature}
                            className="feature-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            whileHover={{ y: -5 }}
                            onHoverStart={() => playHover()}
                        >
                            {feature}
                        </motion.div>
                    )
                )}
            </motion.div>
        </motion.div>
    );
};

export default WelcomeScreen;
