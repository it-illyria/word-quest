import {motion} from "framer-motion";
import React from "react";
import "../index.css";
import useSound from "use-sound";

interface Props {
    onCategorySelect: (category: string) => void;
    onBack: () => void;
    onNavigateTo: (view: string) => void;
}

const quizCategories = [
    {emoji: "🎨", name: "Art", description: "Test your art knowledge"},
    {emoji: "📜", name: "History", description: "Journey through time"},
    {emoji: "🔬", name: "Science", description: "Explore scientific wonders"},
    {emoji: "🗳️", name: "Politics", description: "Political systems and events"},
    {emoji: "⚽", name: "Sports", description: "Sports trivia challenge"},
    {emoji: "📚", name: "Vocabulary", description: "Expand your word power", special: true}
];

const WelcomeScreen: React.FC<Props> = ({onCategorySelect, onBack, onNavigateTo}) => {
    const [playHover] = useSound('/sounds/hover.mp3');
    const [playSelect] = useSound('/sounds/select.mp3');

    const handleCategorySelect = (category: string) => {
        playSelect();
        onCategorySelect(category);
    };

    return (
        <motion.div
            className="welcome-container"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.8}}
        >
            <button onClick={onBack} className="back-button">
                ← Home
            </button>
            <motion.div
                className="welcome-content"
                initial={{y: -40, scale: 0.95}}
                animate={{y: 0, scale: 1}}
                transition={{type: "spring", stiffness: 100, damping: 10}}
            >
                <motion.div className="floating-brain">
                    🧠
                </motion.div>

                <motion.h1 className="welcome-title">
                    Quiz Explorer
                </motion.h1>

                <motion.p className="welcome-subtitle">
                    Choose your challenge
                </motion.p>

                <motion.div className="category-grid">
                    {quizCategories.map((category, i) => (
                        <motion.div
                            key={category.name}
                            className={`category-card ${category.special ? 'special-card' : ''}`}
                            onClick={() => handleCategorySelect(category.name)}
                        >
                            <div className="category-emoji">{category.emoji}</div>
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <motion.div className="feature-grid">
                {[
                    {label: "🏆 Earn Badges", action: () => onNavigateTo('badges')},
                    {label: "📊 Track Progress", action: () => onNavigateTo('progress')}
                ].map((feature) => (
                    <motion.div
                        key={feature.label}
                        className="feature-card"
                        onClick={feature.action}
                    >
                        {feature.label}
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default WelcomeScreen;
