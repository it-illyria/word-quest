import React from 'react';
import { motion } from 'framer-motion';

const FireIcon = () => (
    <motion.svg
        whileHover={{ scale: 1.2 }}
        className="fire-icon"
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path
            fillRule="evenodd"
            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
            clipRule="evenodd"
        />
    </motion.svg>
);

const StreakCounter: React.FC<{ currentStreak: number }> = ({ currentStreak }) => {
    return (
        <div className="streak-counter">
            <div className="streak-badge">
                {Array.from({ length: Math.min(currentStreak, 5) }).map((_, i) => (
                    <FireIcon key={i} />
                ))}
                {currentStreak > 5 && <span className="streak-extra">+{currentStreak - 5}</span>}
                <span className="streak-text">{currentStreak} day streak!</span>
            </div>
            {currentStreak >= 3 && (
                <p className="streak-reminder">
                    Come back tomorrow to keep your streak alive!
                </p>
            )}
        </div>
    );
};

export default StreakCounter;
