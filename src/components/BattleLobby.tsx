import React, {useState, useEffect} from 'react';
import {v4 as uuidv4} from 'uuid';
import {Question, Player} from '../services/type';
import QuestionCard from './QuestionCard';
import Socket = SocketIOClient.Socket;

interface BattleLobbyProps {
    socket: Socket | null;
    battleState: any;
    onStartBattle: (opponentId: string) => void;
    onAnswer?: (choice: string) => void;
    currentQuestion?: Question;
    selected?: string | null;
    timeLeft?: number;
}

const BattleLobby: React.FC<BattleLobbyProps> = ({
                                                     socket,
                                                     battleState,
                                                     onStartBattle,
                                                     onAnswer,
                                                     currentQuestion,
                                                     selected,
                                                     timeLeft
                                                 }) => {
    const [opponents, setOpponents] = useState<Player[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleOpponentsList = (data: Player[]) => {
            setOpponents(data);
        };

        socket.on('opponents-list', handleOpponentsList);
        socket.emit('request-opponents');

        return () => {
            socket.off('opponents-list', handleOpponentsList);
        };
    }, [socket]);

    const handleQuickMatch = () => {
        setSearching(true);
        socket?.emit('quick-match', {
            userId: localStorage.getItem('userId') || uuidv4(),
            category: 'general'
        });
    };

    if (battleState?.status === 'in-progress' && currentQuestion) {
        return (
            <div className="battle-game">
                <div className="flex justify-between items-center mb-6">
                    {battleState.players.map((player: any) => (
                        <PlayerDisplay
                            key={player.id}
                            user={player}
                            isCurrent={player.id === localStorage.getItem('userId')}
                        />
                    ))}
                </div>

                <div className="text-right mb-2">
          <span className="bg-red-500 text-white px-2 py-1 rounded">
            ⏱️ {timeLeft}s
          </span>
                </div>

                {currentQuestion.word && currentQuestion.choices && currentQuestion.correctAnswer && (
                    <QuestionCard
                        word={currentQuestion.word}
                        choices={currentQuestion.choices}
                        correctAnswer={currentQuestion.correctAnswer}
                        selected={selected || null}
                        onSelect={onAnswer || (() => {})}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="battle-lobby p-4 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">⚔️ Battle Arena</h2>

            <button
                onClick={handleQuickMatch}
                disabled={searching}
                className={`w-full py-3 rounded-lg mb-4 font-bold ${
                    searching ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
            >
                {searching ? 'Searching for opponent...' : '⚡ Quick Match'}
            </button>

            <div className="opponents-list">
                <h3 className="font-semibold mb-2">Or challenge directly:</h3>
                <div className="space-y-2">
                    {opponents.map((opponent) => (
                        <div
                            key={opponent.id}
                            className="flex justify-between items-center p-2 bg-white rounded shadow-sm"
                        >
                            <span>{opponent.username}</span>
                            <button
                                onClick={() => onStartBattle(opponent.id)}
                                className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm"
                            >
                                Challenge
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PlayerDisplay: React.FC<{ user: Player, isCurrent?: boolean }> = ({user, isCurrent}) => (
    <div className={`text-center p-2 ${isCurrent ? 'bg-blue-50 rounded' : ''}`}>
        <div className="w-12 h-12 bg-purple-200 rounded-full mx-auto mb-1 flex items-center justify-center">
            {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="font-medium">{user.username}</div>
        <div className="text-xs">Rating: {user.rating || '???'}</div>
    </div>
);

export default BattleLobby;