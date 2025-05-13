import React, { useState } from "react";
import WelcomeScreen from "./components/Welcome";
import Difficulty from "./components/Difficulty";
import Quiz from "./components/Quiz";
import './index.css';

function App() {
    const [currentView, setCurrentView] = useState('welcome');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('normal');

    return (
        <div className="font-sans">
            {currentView === 'welcome' && (
                <WelcomeScreen
                    onCategorySelect={(category) => {
                        setSelectedCategory(category);
                        setCurrentView('difficulty');
                    }}
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
        </div>
    );
}

export default App;
