import { Question } from './type';
import { getQuestions } from './question-loader';

export const fetchQuestions = async (category?: string): Promise<Question[]> => {
    return new Promise((resolve) => {
        let questions = getQuestions();

        if (category) {
            const normalizedCategory = category.toLowerCase().trim();
            questions = questions.filter(q => q.category === normalizedCategory);

            console.log(`Found ${questions.length} questions for category: ${normalizedCategory}`);
            if (questions.length === 0) {
                console.log('Available categories:',
                    [...new Set(getQuestions().map(q => q.category))]);
            }
        }

        resolve(questions);
    });
};