import React, { useState } from "react";
import HomePage from "./components/HomePage";
import WelcomeScreen from "./components/Welcome";
import Difficulty from "./components/Difficulty";
import Quiz from "./components/Quiz";
import TicTacToe from "./components/TicTacToe";
import './index.css';

function App() {
    const [currentView, setCurrentView] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('normal');

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
                    onCategorySelect={(category) => {
                        setSelectedCategory(category);
                        if (category === "Vocabulary") {
                            setSelectedDifficulty('normal');
                            setCurrentView('quiz');
                        } else {
                            setCurrentView('difficulty');
                        }
                    }}
                    onBack={() => setCurrentView('home')}
                />
            )}

            {currentView === 'difficulty' && (
                <Difficulty
                    category={selectedCategory}
                    onDifficultySelect={(difficulty) => {
                        setSelectedDifficulty(difficulty);
                        setCurrentView('quiz');
                    }}
                    onBack={() => setCurrentView('welcome')}
                />
            )}

            {currentView === 'quiz' && (
                <Quiz
                    category={selectedCategory}
                    difficulty={selectedDifficulty}
                    onExit={() => setCurrentView('welcome')}
                />
            )}

            {currentView === 'tictactoe' && (
                <TicTacToe onBack={() => setCurrentView('home')} />
            )}
        </div>
    );
}

export default App;
