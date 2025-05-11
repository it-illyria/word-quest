import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import QuestionCard from './QuestionCard';
import Result from './Result';
import StreakCounter from './StreakCounter';
import MistakeAnalysis from './MistakeAnalysis';
import BattleLobby from './BattleLobby';
import useSound from 'use-sound';
import { Question, QuizResult, BattleState } from '../services/type';
import { mockSocket } from '../services/mockSocket';
import { fetchQuestions } from '../services/mockApi';
import Socket = SocketIOClient.Socket;

type QuizMode = 'solo' | 'battle';

const Quiz: React.FC = () => {
    // Core quiz states
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [learnMode, setLearnMode] = useState(false);
    const [passed, setPassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);

    // New feature states
    const [mode, setMode] = useState<QuizMode>('solo');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [battleState, setBattleState] = useState<BattleState | null>(null);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [weakCategories, setWeakCategories] = useState<string[]>([]);
    const [scoreHistory, setScoreHistory] = useState<QuizResult[]>([]);

    // Sound effects
    const [playCorrect] = useSound('/sounds/correct.mp3');
    const [playWrong] = useSound('/sounds/wrong.mp3');
    const [playCompleted] = useSound('/sounds/complete.mp3');
    const [playFailed] = useSound('/sounds/fail.mp3');
    const [playBattleStart] = useSound('/sounds/battle-start.mp3');

    // Memoized values
    const userId = useMemo(() => localStorage.getItem('userId') || uuidv4(), []);
    const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

    // Initialize socket connection
    useEffect(() => {
        const useMockSocket = process.env.REACT_APP_USE_MOCK_SOCKET === 'true';

        const setupSocket = (newSocket: Socket) => {
            newSocket.on('battle-update', (data: BattleState) => {
                setBattleState(data);
            });

            newSocket.on('battle-start', (data: BattleState) => {
                setBattleState(data);
                setQuestions(data.questions);
                playBattleStart();
            });

            return () => {
                newSocket.disconnect();
            };
        };

        if (useMockSocket) {
            const newSocket = mockSocket.connect() as unknown as Socket;
            setSocket(newSocket);
            return setupSocket(newSocket);
        } else {
            const io = require('socket.io-client');
            const newSocket: Socket = io('https://your-socket-server.com');
            setSocket(newSocket);
            return setupSocket(newSocket);
        }
    }, [playBattleStart]);

    // Load saved data
    useEffect(() => {
        const loadData = async () => {
            const questions = await fetchQuestions();
            setQuestions(questions);

            const savedHistory = localStorage.getItem('quizScoreHistory');
            if (savedHistory) setScoreHistory(JSON.parse(savedHistory));

            const streak = localStorage.getItem('quizStreak');
            if (streak) setCurrentStreak(parseInt(streak));

            localStorage.setItem('userId', userId);
        };

        loadData();
    }, [userId]);

    // Reset timer function
    const resetTimer = useCallback(() => setTimeLeft(10), []);

    // Streak management
    const updateStreak = useCallback(() => {
        const lastPlayed = localStorage.getItem('lastPlayedDate');
        const today = new Date().toDateString();
        let newStreak = currentStreak;

        if (lastPlayed !== today) {
            newStreak = lastPlayed === new Date(Date.now() - 86400000).toDateString()
                ? currentStreak + 1
                : 1;
            localStorage.setItem('lastPlayedDate', today);
            localStorage.setItem('quizStreak', newStreak.toString());
            setCurrentStreak(newStreak);
        }
    }, [currentStreak]);

    // Performance analysis
    const analyzePerformance = useCallback((questions: Question[], incorrectIds: string[]) => {
        const weak = questions
            .filter(q => incorrectIds.includes(q.id))
            .map(q => q.category);

        const categoryFrequency = weak.reduce((acc: Record<string, number>, category) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        setWeakCategories(
            Object.entries(categoryFrequency)
                .sort((a, b) => b[1] - a[1])
                .map(([category]) => category)
                .slice(0, 3)
        );
    }, []);

    // Save results
    const saveResultToHistory = useCallback((result: QuizResult) => {
        const newHistory = [result, ...scoreHistory].slice(0, 10);
        setScoreHistory(newHistory);
        localStorage.setItem('quizScoreHistory', JSON.stringify(newHistory));
    }, [scoreHistory]);

    // Answer handling
    const handleAnswer = useCallback((choice: string) => {
        if (mode === 'battle' && battleState?.status !== 'in-progress') return;

        setSelected(choice);
        const questionId = questions[currentIndex].id;
        const isCorrect = choice === questions[currentIndex].correctAnswer;

        if (isCorrect) {
            setScore(prev => prev + 1);
            playCorrect();
        } else {
            setIncorrectAnswers(prev => [...prev, questionId]);
            playWrong();
        }

        // Battle mode updates
        if (mode === 'battle' && socket) {
            socket.emit('answer', {
                battleId: battleState?.battleId,
                userId,
                isCorrect,
                questionId
            });
        }

        setTimeout(() => {
            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(currentIndex + 1);
                setSelected(null);
                resetTimer();
            } else {
                const didPass = (score + (isCorrect ? 1 : 0)) / questions.length >= 0.7;
                setPassed(didPass);
                setShowResult(true);

                if (mode === 'solo') {
                    updateStreak();
                    analyzePerformance(questions, [...incorrectAnswers, ...(isCorrect ? [] : [questionId])]);
                    saveResultToHistory({
                        date: new Date().toLocaleString(),
                        score: score + (isCorrect ? 1 : 0),
                        total: questions.length,
                        passed: didPass
                    });
                }

                didPass ? playCompleted() : playFailed();
            }
        }, 1000);
    }, [
        mode,
        battleState,
        questions,
        currentIndex,
        playCorrect,
        playWrong,
        playCompleted,
        playFailed,
        socket,
        userId,
        score,
        updateStreak,
        analyzePerformance,
        saveResultToHistory,
        incorrectAnswers,
        resetTimer
    ]);

    // Timer logic
    useEffect(() => {
        if (mode === 'battle' || learnMode || showResult) return;

        if (timeLeft === 0 && !selected) {
            handleAnswer('timeout');
            return;
        }

        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, selected, mode, learnMode, showResult, handleAnswer]);

    // Restart quiz
    const handleRestart = useCallback(() => {
        setScore(0);
        setCurrentIndex(0);
        setSelected(null);
        setShowResult(false);
        setLearnMode(false);
        setPassed(false);
        setIncorrectAnswers([]);
        resetTimer();

        if (mode === 'solo') {
            fetchQuestions().then(setQuestions);
        }
    }, [mode, resetTimer]);

    // Battle mode functions
    const startBattle = useCallback((opponentId: string) => {
        socket?.emit('start-battle', {
            userId,
            opponentId,
            category: 'vocabulary'
        });
    }, [socket, userId]);

    const quitBattle = useCallback(() => {
        socket?.emit('quit-battle', { battleId: battleState?.battleId });
        setBattleState(null);
        setMode('solo');
        handleRestart();
    }, [socket, battleState, handleRestart]);

    if (questions.length === 0) {
        return <div className="text-center mt-10 text-lg">Loading...</div>;
    }

    return (
        <div className="p-4 max-w-xl mx-auto">
            {/* Header with mode toggle and streak */}
            <div className="flex justify-between items-center mb-4">
                <StreakCounter currentStreak={mode === 'solo' ? currentStreak : 0} />
                {!showResult && (
                    <button
                        onClick={() => mode === 'solo' ? setMode('battle') : quitBattle()}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                            mode === 'solo'
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                    >
                        {mode === 'solo' ? '⚔️ Battle Mode' : '❌ Leave Battle'}
                    </button>
                )}
            </div>

            {mode === 'battle' ? (
                <BattleLobby
                    socket={socket}
                    battleState={battleState}
                    onStartBattle={startBattle}
                    onAnswer={handleAnswer}
                    currentQuestion={currentQuestion}
                    selected={selected}
                    timeLeft={timeLeft}
                />
            ) : (
                <>
                    {/* Timer */}
                    {!learnMode && !showResult && (
                        <p className="text-right text-red-500 font-bold mb-2">⏱️ {timeLeft}s</p>
                    )}

                    {/* Question counter */}
                    {!showResult && (
                        <p className="text-sm text-gray-600 mb-2 text-right">
                            Question {currentIndex + 1} of {questions.length}
                        </p>
                    )}

                    {/* Learn mode */}
                    {learnMode ? (
                        <div className="text-center">
                            <p className="text-xl font-semibold mb-4">
                                Definition of "{currentQuestion.word}":
                            </p>
                            <p className="text-lg mb-6">{currentQuestion.definition}</p>
                            <button
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition"
                                onClick={() => setLearnMode(false)}
                            >
                                Start Quiz for "{currentQuestion.word}"
                            </button>
                        </div>
                    ) : showResult ? (
                        <div>
                            <Result
                                score={score}
                                total={questions.length}
                                passed={passed}
                                onRestart={handleRestart}
                            />
                            <MistakeAnalysis weakCategories={weakCategories} />

                            {scoreHistory.length > 0 && (
                                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                    <h3 className="font-bold mb-2">Recent Results:</h3>
                                    <ul className="divide-y divide-gray-200">
                                        {scoreHistory.map((result, i) => (
                                            <li key={i} className="py-2">
                                                <div className="flex justify-between">
                                                    <span>{result.date}</span>
                                                    <span className={`font-semibold ${
                                                        result.passed ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {result.score}/{result.total} ({Math.round((result.score/result.total)*100)}%)
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <QuestionCard
                                word={currentQuestion.word}
                                choices={currentQuestion.choices}
                                correctAnswer={currentQuestion.correctAnswer}
                                selected={selected}
                                onSelect={handleAnswer}
                            />
                            <button
                                className="mt-4 text-blue-600 text-sm hover:text-blue-800"
                                onClick={() => setLearnMode(true)}
                            >
                                Learn Mode: Show Definition
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Quiz;