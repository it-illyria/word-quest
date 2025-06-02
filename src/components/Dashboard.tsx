import React, { useState, useCallback } from 'react';
import Quiz from './Quiz';
import Progress from './Progress';
import Badges from './Badges';

interface QuizResult {
    date: string;
    score: number;
    total: number;
    passed: boolean;
    category: string;
}

interface DashboardProps {
    onBack: () => void; // Assuming a back navigation is needed
    updateProgress: (result: QuizResult) => void; // To update progress from Quiz
    achievements: string[]; // To pass achievements to Badges
}

const Dashboard: React.FC<DashboardProps> = ({ onBack, updateProgress, achievements }) => {
    const [currentView, setCurrentView] = useState<'quiz' | 'progress' | 'badges'>('quiz');
    const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'normal' | 'hard' | null>('normal'); // Default

    const handleQuizExit = useCallback(() => {
        setCurrentView('quiz'); // Or maybe a menu
    }, []);

    const handleUpdateProgressInternal = useCallback((result: QuizResult) => {
        setQuizHistory(prevHistory => [result, ...prevHistory]);
        updateProgress(result); // Call the prop function to update in the parent
    }, [updateProgress]);

    const handleNavigate = useCallback((view: 'quiz' | 'progress' | 'badges') => {
        setCurrentView(view);
    }, []);

    const handleStartQuiz = useCallback((category: string, difficulty: 'easy' | 'normal' | 'hard') => {
        setCurrentCategory(category);
        setCurrentDifficulty(difficulty);
        setCurrentView('quiz');
    }, []);

    // Example rendering based on the currentView
    if (currentView === 'quiz') {
        return (
            <Quiz
                category={currentCategory}
                difficulty={currentDifficulty}
                onExit={handleQuizExit}
                updateProgress={handleUpdateProgressInternal}
            />
        );
    } else if (currentView === 'progress') {
        // Calculate derived progress data here if needed
        const totalQuestionsAnswered = quizHistory.reduce((sum, result) => sum + result.total, 0);
        const correctAnswers = quizHistory.reduce((sum, result) => sum + (result.passed ? result.total : 0), 0); // Simplified
        // You'll need more sophisticated logic for weak categories and streaks
        const weakCategories: string[] = []; // Implement logic to determine this
        const longestStreak = 0; // Implement logic to determine this
        const categoryStats: { name: string; attempts: number; correct: number }[] = []; // Implement logic

        return (
            <Progress
                onBack={onBack} // Use the prop for back navigation
                quizHistory={quizHistory}
                weakCategories={weakCategories}
                totalQuestionsAnswered={totalQuestionsAnswered}
                correctAnswers={correctAnswers}
                longestStreak={longestStreak}
                categoryStats={categoryStats}
            />
        );
    } else if (currentView === 'badges') {
        return (
            <Badges
                onBack={onBack} // Use the prop for back navigation
                achievements={achievements} // Pass the achievements prop
            />
        );
    } else {
        // Initial view or a menu to select Quiz, Progress, Badges
        return (
            <div>
                <h1>Learning Dashboard</h1>
                <button onClick={() => handleStartQuiz('Science', 'normal')}>Start Science Quiz</button>
                <button onClick={() => handleNavigate('progress')}>View Progress</button>
                <button onClick={() => handleNavigate('badges')}>View Badges</button>
                {onBack && <button onClick={onBack}>Back</button>} {/* Conditionally render back button */}
            </div>
        );
    }
};

export default Dashboard;
