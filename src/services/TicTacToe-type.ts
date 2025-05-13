export type Player = "X" | "O";
export type BoardState = (Player | null)[];
export type Difficulty = "easy" | "medium" | "hard";
export type Theme = "classic" | "emoji" | "shapes" | "animals";
export type GameMode = "classic" | "ultimate" | "five-in-row";
export type GameResult = "X" | "O" | "draw";

export interface GameRecord {
    boardStates: BoardState[];
    moves: number[];
    result: GameResult;
    date: string;
    difficulty: Difficulty;
}

export interface GameStats {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    currentStreak: number;
    maxStreak: number;
    lastPlayed?: string;
}

export interface ThemeConfig {
    X: string;
    O: string;
}

export interface PlayerProfile {
    name: string;
    avatar: string;
    wins: number;
    losses: number;
}