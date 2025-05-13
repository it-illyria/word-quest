export type Question =
    | {
    id: string;
    word: string;
    definition: string;
    choices: string[];
    correctAnswer: string;
    category: string;
    question?: undefined;
}
    | {
    id: string;
    question: string;
    choices: string[];
    correctAnswer: string;
    category: string;
    word?: undefined;
    definition?: undefined;
};


export interface DisplayQuestion {
    id: string;
    prompt: string;
    choices: string[];
    correctAnswer: string;
    category: string;
}

export interface QuizResult {
    date: string;
    score: number;
    total: number;
    passed: boolean;
}

export interface BattleState {
    battleId: string;
    players: Array<{
        id: string;
        username: string;
        score: number;
    }>;
    questions: Question[];
    status: 'waiting' | 'in-progress' | 'completed';
}

export interface Player {
    id: string;
    username: string;
    rating?: number;
}
