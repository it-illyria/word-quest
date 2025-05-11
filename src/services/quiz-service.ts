import { type Question, questions } from "../data/questions";

export const fetchQuestions = (): Promise<Question[]> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(questions);
		}, 800);
	});
};
