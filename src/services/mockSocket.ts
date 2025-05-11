import {Question} from './type';

const questions: Question[] = require('../data/questions.json');

class MockSocket {
    callbacks: Record<string, (data: any) => void> = {};
    connected = false;

    connect() {
        this.connected = true;
        setTimeout(() => {
            this.emit('connect');
        }, 100);
    }

    on(event: string, callback: (data: any) => void) {
        this.callbacks[event] = callback;
    }

    off(event: string) {
        delete this.callbacks[event];
    }

    emit(event: string, data?: any) {
        console.log(`MockSocket emit: ${event}`, data);

        // Handle specific events
        if (event === 'request-opponents') {
            setTimeout(() => {
                this.callbacks['opponents-list']?.([
                    {id: 'bot1', username: 'AI Opponent', rating: 850},
                    {id: 'bot2', username: 'Quiz Master', rating: 900}
                ]);
            }, 500);
        } else if (event === 'quick-match') {
            setTimeout(() => {
                this.callbacks['battle-start']?.({
                    battleId: 'mock-battle-' + Date.now(),
                    players: [
                        {id: data.userId, username: 'You', score: 0},
                        {id: 'bot1', username: 'AI Opponent', score: 0}
                    ],
                    questions: [...questions].sort(() => 0.5 - Math.random()).slice(0, 5),
                    status: 'in-progress'
                });
            }, 1000);
        } else if (event === 'answer') {
            setTimeout(() => {
                this.callbacks['battle-update']?.({
                    battleId: data.battleId,
                    players: [
                        {id: data.userId, username: 'You', score: data.isCorrect ? 1 : 0},
                        {id: 'bot1', username: 'AI Opponent', score: Math.random() > 0.3 ? 1 : 0}
                    ],
                    status: 'in-progress'
                });
            }, 500);
        }
    }

    disconnect() {
        this.connected = false;
    }
}

export const mockSocket = {
    connect: () => {
        const socket = new MockSocket();
        socket.connect();
        return socket;
    }
};