export interface Question {
	id: number;
	word: string;
	choices: string[];
	correctAnswer: string;
	definition: string;
}

export const questions: Question[] = [
	{
		id: 1,
		word: "elated",
		choices: ["sad", "angry", "joyful", "confused"],
		correctAnswer: "joyful",
		definition: "A feeling of intense happiness and excitement."
	},
	{
		id: 2,
		word: "benevolent",
		choices: ["mean", "kind", "hostile", "greedy"],
		correctAnswer: "kind",
		definition: "Well-meaning and kindly."
	},
	{
		id: 3,
		word: "obscure",
		choices: ["clear", "vague", "bright", "known"],
		correctAnswer: "vague",
		definition: "Not clearly expressed or easily understood."
	},
];
