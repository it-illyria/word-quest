import {motion} from "framer-motion";
import React from "react";
import "../index.css";
import useSound from "use-sound";



interface Props {
    onStart: () => void;
}

const WelcomeScreen: React.FC<Props> = ({onStart}) => {
    const [playHover] = useSound('/sounds/hover.mp3');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleStart = () => {
        setIsLoading(true);
        onStart();
    };

    return (
        <motion.div
            className="welcome-container"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.8}}
        >
            <motion.div
                className="welcome-content"
                initial={{y: -40, scale: 0.95}}
                animate={{y: 0, scale: 1}}
                transition={{type: "spring", stiffness: 100, damping: 10}}
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
                    whileHover={{scale: 1.02}}
                    onHoverStart={() => playHover()}
                >
                    Word Quest
                </motion.h1>

                <motion.p className="welcome-subtitle">
                    Test your vocabulary skills
                </motion.p>

                <motion.button
                    className="start-button"
                    whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
                    }}
                    whileTap={{scale: 0.98}}
                    onClick={handleStart}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <motion.span
                            animate={{rotate: 360}}
                            transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                        >
                            ⏳
                        </motion.span>
                    ) : (
                        <motion.span
                            animate={{x: [0, 5, 0]}}
                            transition={{duration: 2, repeat: Infinity}}
                        >
                            🚀 Start Learning Journey →
                        </motion.span>
                    )}
                </motion.button>
            </motion.div>

            <motion.div
                className="feature-grid"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.5}}
            >
                {["✨ Learn New Words", "🏆 Earn Badges", "📊 Track Progress"].map(
                    (feature, i) => (
                        <motion.div
                            key={feature}
                            className="feature-card"
                            initial={{y: 20, opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            transition={{delay: 0.6 + i * 0.1}}
                            whileHover={{y: -5}}
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