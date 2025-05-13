import questions from '../data/questions.json';
import { Question } from './type';

export const getQuestions = (): Question[] => {
    return questions.map(q => ({
        ...q,
        category: q.category.toLowerCase()
    }));
};