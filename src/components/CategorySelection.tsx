import React, { useState } from 'react';
import { getAvailableCategories, getDisplayCategory } from '../utils/categories';
import Quiz from './Quiz';
import { QuizResult } from '../services/type';

const CategorySelector: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('art');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
    const [quizStarted, setQuizStarted] = useState(false);

    const categories = getAvailableCategories();

    const handleStartQuiz = () => {
        setQuizStarted(true);
    };

    const handleExitQuiz = () => {
        setQuizStarted(false);
    };

    if (quizStarted) {
        return (
            <Quiz
                category={selectedCategory}
                difficulty={selectedDifficulty}
                onExit={handleExitQuiz} updateProgress={function (result: QuizResult): void {
                throw new Error('Function not implemented.');
            }}            />
        );
    }

    return (
        <div className="category-selector">
            <h2>Select a Category</h2>
            <div className="category-buttons">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-button ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {getDisplayCategory(cat)}
                    </button>
                ))}
            </div>

            <h3>Select Difficulty</h3>
            <div className="difficulty-buttons">
                {(['easy', 'normal', 'hard'] as const).map(diff => (
                    <button
                        key={diff}
                        className={`difficulty-button ${selectedDifficulty === diff ? 'active' : ''}`}
                        onClick={() => setSelectedDifficulty(diff)}
                    >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                ))}
            </div>

            <button
                className="start-quiz-button"
                onClick={handleStartQuiz}
            >
                Start Quiz
            </button>
        </div>
    );
};

export default CategorySelector;
