import { getQuestions } from './question-loader';
import { normalizeCategory } from '../utils/categories';

type CallbackMap = Record<string, ((data: any) => void)[]>;

class MockSocket {
    callbacks: CallbackMap = {};
    connected = false;
    battleData: Record<string, any> = {};

    connect() {
        this.connected = true;
        setTimeout(() => this.emitInternal('connect'), 100);
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(callback);
    }

    off(event: string) {
        delete this.callbacks[event];
    }

    emit(event: string, data?: any) {
        console.log(`MockSocket emit: ${event}`, data);

        switch (event) {
            case 'request-opponents':
                setTimeout(() => {
                    this.emitInternal('opponents-list', [
                        { id: 'bot1', username: 'AI Opponent', rating: 850 },
                        { id: 'bot2', username: 'Quiz Master', rating: 900 }
                    ]);
                }, 500);
                break;

            case 'quick-match': {
                const battleId = `mock-battle-${Date.now()}`;
                let questions = getQuestions();

                if (data.category) {
                    const normalizedCategory = normalizeCategory(data.category);
                    questions = questions.filter(q => q.category === normalizedCategory);
                    console.log(`Battle questions for ${normalizedCategory}:`, questions.length);
                }

                questions = questions.sort(() => 0.5 - Math.random()).slice(0, 5);

                this.battleData[battleId] = {
                    currentQuestion: 0,
                    totalQuestions: questions.length,
                    userScore: 0,
                    botScore: 0,
                    questions,
                };

                setTimeout(() => {
                    this.emitInternal('battle-start', {
                        battleId,
                        players: [
                            { id: data.userId, username: 'You', score: 0 },
                            { id: 'bot1', username: 'AI Opponent', score: 0 }
                        ],
                        questions,
                        status: 'in-progress'
                    });
                }, 1000);
                break;
            }

            case 'answer': {
                const battle = this.battleData[data.battleId];
                if (!battle) return;

                const { userScore, botScore, currentQuestion, totalQuestions } = battle;

                // Update scores
                const updatedUserScore = userScore + (data.isCorrect ? 1 : 0);
                const botCorrect = Math.random() > 0.3;
                const updatedBotScore = botScore + (botCorrect ? 1 : 0);

                const newQuestionIndex = currentQuestion + 1;
                const status = newQuestionIndex >= totalQuestions ? 'completed' : 'in-progress';

                this.battleData[data.battleId] = {
                    ...battle,
                    currentQuestion: newQuestionIndex,
                    userScore: updatedUserScore,
                    botScore: updatedBotScore,
                };

                setTimeout(() => {
                    this.emitInternal('battle-update', {
                        battleId: data.battleId,
                        players: [
                            { id: data.userId, username: 'You', score: updatedUserScore },
                            { id: 'bot1', username: 'AI Opponent', score: updatedBotScore }
                        ],
                        currentQuestion: newQuestionIndex,
                        status
                    });
                }, 500);
                break;
            }
        }
    }

    emitInternal(event: string, data?: any) {
        this.callbacks[event]?.forEach(callback => callback(data));
    }

    disconnect() {
        this.connected = false;
        this.callbacks = {};
    }
}

export const mockSocket = {
    connect: () => {
        const socket = new MockSocket();
        socket.connect();
        return socket;
    }
};
