import React from 'react';

interface BadgesProps {
    onBack: () => void;
    achievements: string[]; // Prop to receive unlocked achievements
}

const Badges: React.FC<BadgesProps> = ({onBack, achievements = []}) => { // Added default empty array for achievements
    // Define all possible badges with their names, icons, and descriptions
    const allBadges: { name: string; icon: string; description: string }[] = [
        {name: 'First Quiz Passed', icon: '🌟', description: 'Pass your very first quiz!'},
        {name: '5 Quiz Streak', icon: '🔥', description: 'Achieve a streak of 5 passed quizzes.'},
        {name: 'History Buff', icon: '🏛️', description: 'Pass 5 history quizzes.'},
        {name: 'Science Whiz', icon: '🔬', description: 'Pass 5 science quizzes.'},
        {name: 'Perfect Score', icon: '💯', description: 'Get a perfect score on any quiz.'},
        {name: '10 Quizzes Done', icon: '✅', description: 'Complete 10 quizzes.'},
        {name: 'Geography Guru', icon: '�', description: 'Pass 5 geography quizzes.'},
        {name: 'Math Master', icon: '➕', description: 'Pass 5 math quizzes.'},
        // Add more badges here as you implement their unlocking logic in Dashboard/App
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
            <header className="badges-header-compact">
                <div className="header-content">
                    <button onClick={onBack} className="back-button">
                        ←
                    </button>
                    <h1 className="badges-title">🏆 Achievements</h1>
                </div>
            </header>

            <div className="badges-wrapper">

                <div className="badges-grid">
                    {allBadges.map((badge, index) => {
                        const isUnlocked = achievements.includes(badge.name); // Check if the badge name is in the achievements array
                        return (
                            <div
                                key={index} // Using index as key, consider a unique ID for badges if available
                                className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                                title={`${badge.name} (${isUnlocked ? 'Unlocked' : 'Locked'})`}
                            >
                                <div className="badge-icon">
                                    {isUnlocked ? badge.icon : '🔒'}
                                </div>
                                <p className="badge-name">{badge.name}</p>
                                <p className="badge-status">
                                    {isUnlocked ? 'UNLOCKED!' : 'LOCKED'}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <p className="badges-footer">
                    More challenges and badges are on the way!
                </p>
            </div>
        </div>
    );
};

export default Badges;
