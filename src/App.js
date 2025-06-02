import React, { useState, useCallback } from "react";
import HomePage from "./components/HomePage";
import WelcomeScreen from "./components/Welcome";
import Difficulty from "./components/Difficulty";
import Quiz from "./components/Quiz";
import TicTacToe from "./components/TicTacToe";
import './index.css';
import Badges from "./components/Badges";
import Progress from "./components/Progress";
import Dashboard from "./components/Dashboard"; // Import the Dashboard component

function App() {
    const [currentView, setCurrentView] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
    const [quizHistory, setQuizHistory] = useState([]);
    const [achievements, setAchievements] = useState([]);

    // Initialize progress data
    const [progressData, setProgressData] = useState({
        quizHistory: [],
        weakCategories: [],
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        longestStreak: 0,
        categoryStats: [
            { name: "Art", attempts: 0, correct: 0 },
            { name: "History", attempts: 0, correct: 0 },
            { name: "Science", attempts: 0, correct: 0 },
            { name: "Politics", attempts: 0, correct: 0 },
            { name: "Sports", attempts: 0, correct: 0 },
            { name: "Vocabulary", attempts: 0, correct: 0 }
        ]
    });

    const checkForAchievements = useCallback((latestResult, history) => {
        const hasPassedFirstQuiz = history.length === 1 && latestResult.passed && !achievements.includes('First Quiz Passed');
        if (hasPassedFirstQuiz) {
            setAchievements(prev => [...prev, 'First Quiz Passed']);
        }

        // Example: Check for a 5-quiz streak (simplified logic)
        if (history.slice(0, 5).every(res => res.passed) && history.length >= 5 && !achievements.includes('5 Quiz Streak')) {
            setAchievements(prev => [...prev, '5 Quiz Streak']);
        }

        // Add more achievement checks here based on your criteria
    }, [achievements, setAchievements]);

    const updateProgress = useCallback((result) => {
        setProgressData(prev => {
            const updatedHistory = [...prev.quizHistory, result];
            const updatedTotalQuestions = prev.totalQuestionsAnswered + result.total;
            const updatedCorrectAnswers = prev.correctAnswers + result.score;
            const categoryIndex = prev.categoryStats.findIndex(stat => stat.name === result.category);
            const updatedCategoryStats = [...prev.categoryStats];
            if (categoryIndex !== -1) {
                updatedCategoryStats[categoryIndex] = {
                    ...updatedCategoryStats[categoryIndex],
                    attempts: updatedCategoryStats[categoryIndex].attempts + 1,
                    correct: updatedCategoryStats[categoryIndex].correct + result.score,
                };
            }

            // Basic streak calculation (can be improved)
            const lastResultPassed = result.passed;
            const currentStreak = lastResultPassed
                ? (updatedHistory.slice(0, -1).every(r => r.passed) ? updatedHistory.filter(r => r.passed).length : 1)
                : 0;
            const updatedLongestStreak = Math.max(prev.longestStreak, currentStreak);

            return {
                ...prev,
                quizHistory: updatedHistory,
                totalQuestionsAnswered: updatedTotalQuestions,
                correctAnswers: updatedCorrectAnswers,
                categoryStats: updatedCategoryStats,
                longestStreak: updatedLongestStreak,
            };
        });
        setQuizHistory(prevHistory => [result, ...prevHistory]);
        checkForAchievements(result, [...quizHistory, result]);
    }, [quizHistory, checkForAchievements, setProgressData]);

    const handleQuizExit = useCallback(() => {
        setCurrentView('welcome');
    }, []);

    const handleNavigate = useCallback((view) => {
        setCurrentView(view);
    }, []);

    const handleStartQuiz = useCallback((category) => {
        setSelectedCategory(category);
        if (category === "Vocabulary") {
            setSelectedDifficulty('normal');
            setCurrentView('quiz');
        } else {
            setCurrentView('difficulty');
        }
    }, []);

    const handleDifficultySelect = useCallback((difficulty) => {
        setSelectedDifficulty(difficulty);
        setCurrentView('quiz');
    }, []);

    return (
        <div className="app-container">
            {currentView === 'home' && (
                <HomePage
                    onNavigateToQuiz={() => setCurrentView('welcome')}
                    onNavigateToTicTacToe={() => setCurrentView('tictactoe')}
                />
            )}

            {currentView === 'welcome' && (
                <WelcomeScreen
                    onCategorySelect={handleStartQuiz}
                    onBack={() => setCurrentView('home')}
                    onNavigateTo={handleNavigate}
                />
            )}

            {currentView === 'difficulty' && (
                <Difficulty
                    category={selectedCategory}
                    onDifficultySelect={handleDifficultySelect}
                    onBack={() => setCurrentView('welcome')}
                />
            )}

            {currentView === 'quiz' && (
                <Quiz
                    category={selectedCategory}
                    difficulty={selectedDifficulty}
                    onExit={handleQuizExit}
                    updateProgress={updateProgress}
                />
            )}

            {currentView === 'tictactoe' && (
                <TicTacToe onBack={() => setCurrentView('home')} />
            )}

            {currentView === 'badges' && (
                <Badges onBack={() => setCurrentView('welcome')} achievements={achievements} />
            )}

            {currentView === 'progress' && (
                <Progress
                    onBack={() => setCurrentView('welcome')}
                    quizHistory={progressData.quizHistory}
                    weakCategories={progressData.weakCategories}
                    totalQuestionsAnswered={progressData.totalQuestionsAnswered}
                    correctAnswers={progressData.correctAnswers}
                    longestStreak={progressData.longestStreak}
                    categoryStats={progressData.categoryStats}
                />
            )}

            {currentView === 'dashboard' && (
                <Dashboard
                    onBack={() => setCurrentView('welcome')}
                    quizHistory={progressData.quizHistory}
                    weakCategories={progressData.weakCategories}
                    totalQuestionsAnswered={progressData.totalQuestionsAnswered}
                    correctAnswers={progressData.correctAnswers}
                    longestStreak={progressData.longestStreak}
                    categoryStats={progressData.categoryStats}
                    achievements={achievements}
                />
            )}
        </div>
    );
}

export default App;