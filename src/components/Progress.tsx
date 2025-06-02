import React from 'react';

interface QuizResult {
    date: string;
    score: number;
    total: number;
    passed: boolean;
    category: string;
}

interface CategoryStat {
    name: string;
    attempts: number;
    correct: number;
}

interface ProgressProps {
    onBack: () => void;
    quizHistory: QuizResult[];
    weakCategories: string[];
    totalQuestionsAnswered: number;
    correctAnswers: number;
    longestStreak: number;
    categoryStats: CategoryStat[];
}

const Progress: React.FC<ProgressProps> = ({
                                               onBack,
                                               quizHistory = [],
                                               weakCategories = [],
                                               totalQuestionsAnswered = 0,
                                               correctAnswers = 0,
                                               longestStreak = 0,
                                               categoryStats = []
                                           }) => {
    const overallAccuracy = totalQuestionsAnswered > 0
        ? Math.round((correctAnswers / totalQuestionsAnswered) * 100)
        : 0;

    const getRecommendation = (category: string): string => {
        const recommendations: Record<string, string> = {
            'Vocabulary': 'Try our word flashcards daily.',
            'History': 'Watch two history documentaries this week.',
            'Science': 'Read one popular science article daily.',
            'Art': 'Visit a virtual museum tour.',
            'Sports': 'Watch classic match highlights.',
            'Politics': 'Read current news articles daily.'
        };
        return recommendations[category] || 'Try focused practice quizzes for this category.';
    };

    return (
        <div className="progress-container">
            <header className="badges-header-compact">
                <div className="header-content">
                    <button onClick={onBack} className="back-button">
                        ←
                    </button>
                    <h1 className="progress-heading">Your Learning Dashboard</h1>
                </div>
            </header>
            <br/>
            <div className="dashboard-grid">
                {/* Overall Performance */}
                <div className="dashboard-card">
                    <div className="card-title title-indigo">📊 Overall Performance</div>
                    <div className="performance-item"><span>Questions Answered:</span><span>{totalQuestionsAnswered}</span></div>
                    <div className="performance-item"><span>Correct Answers:</span><span>{correctAnswers}</span></div>
                    <div className="performance-item">
                        <span>Accuracy:</span>
                        <span className={overallAccuracy === 0 ? 'stat-red' : ''}>{overallAccuracy}%</span>
                    </div>
                    <div className="performance-item"><span>Longest Streak:</span><span>{longestStreak}</span></div>
                </div>

                {/* Category Mastery */}
                <div className="dashboard-card">
                    <div className="card-title title-purple">🧠 Category Mastery</div>
                    {categoryStats.length > 0 ? (
                        <ul>
                            {categoryStats.map((stat) => (
                                <li key={stat.name} className="performance-item">
                                    <span>{stat.name}:</span>
                                    <span>{stat.correct} / {stat.attempts} ({stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0}%)</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-text">No category data yet. Complete some quizzes!</p>
                    )}
                    {weakCategories.length > 0 && (
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#facc15' }}>
                            <strong>Areas to Focus:</strong>
                            <ul>
                                {weakCategories.map((category) => (
                                    <li key={category}>
                                        {category} - <span style={{ color: '#94a3b8' }}>{getRecommendation(category)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Recent Quiz History */}
                <div className="dashboard-card">
                    <div className="card-title title-cyan">⏱️ Recent Quiz History</div>
                    {quizHistory.length > 0 ? (
                        <ul>
                            {quizHistory.slice(0, 5).map((result) => (
                                <li key={result.date} className="performance-item">
                                    <span>{new Date(result.date).toLocaleDateString()} - {result.category}:</span>
                                    <span>{result.score} / {result.total} ({Math.round((result.score / result.total) * 100)}%)</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-text">You haven’t taken any quizzes yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Progress;
