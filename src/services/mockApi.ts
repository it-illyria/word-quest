import { Question } from './type';

const questions: Question[] = require('../data/questions.json');

export const fetchQuestions = async (category?: string): Promise<Question[]> => {
    return new Promise(resolve => {
        let filteredQuestions = questions;
        if (category) {
            filteredQuestions = filteredQuestions.filter(q => q.category === category);
        }
        const shuffledQuestions = filteredQuestions.sort(() => 0.5 - Math.random());
        setTimeout(() => {
            resolve(shuffledQuestions.slice(0, 10));
        }, 500);
    });
};
