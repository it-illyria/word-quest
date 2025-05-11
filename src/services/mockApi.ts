import {Question} from './type';

const questions: Question[] = require('../data/questions.json');

export const fetchQuestions = async (): Promise<Question[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...questions].sort(() => 0.5 - Math.random()).slice(0, 10));
        }, 500);
    });
};