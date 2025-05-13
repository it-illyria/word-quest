import { Question } from './type';
import { getQuestions } from './question-loader';

export const fetchQuestions = (): Promise<Question[]> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(getQuestions());
		}, 800);
	});
};
