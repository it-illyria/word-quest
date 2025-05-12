import React from 'react';

const MistakeAnalysis: React.FC<{ weakCategories: string[] }> = ({ weakCategories }) => {
    if (weakCategories.length === 0) return null;

    const getResources = (category: string) => {
        const resources: Record<string, string[]> = {
            vocabulary: ["Flashcards", "Word games", "Reading exercises"],
            grammar: ["Grammar drills", "Sentence construction", "Tutorial videos"],
            pronunciation: ["Audio exercises", "Tongue twisters", "Speech practice"]
        };
        return resources[category.toLowerCase()] || ["Practice quizzes", "Study guides"];
    };

    return (
        <div className="mistake-analysis">
            <h3 className="analysis-title">📊 Your Learning Insights</h3>

            <div className="analysis-section">
                <h4 className="section-heading">Areas to improve:</h4>
                <ul className="category-list">
                    {weakCategories.map((category, i) => (
                        <li key={i} className="category-item">
                            <span className="category-name">{category}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="analysis-section">
                <h4 className="section-heading">Recommended resources:</h4>
                <div className="resource-grid">
                    {getResources(weakCategories[0]).map((resource, i) => (
                        <div key={i} className="resource-card">
                            {resource}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pro-tip">
                <p>Pro tip: Focus on one category at a time for better results!</p>
            </div>
        </div>
    );
};

export default MistakeAnalysis;
