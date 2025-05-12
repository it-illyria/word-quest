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
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [learnMode, setLearnMode] = useState(false);
    const [passed, setPassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3);
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
    const currentQuestion = useMemo(() => currentQuestions[currentIndex], [currentQuestions, currentIndex]);

    // Helper function to shuffle array (Fisher-Yates algorithm)
    const shuffleArray = useCallback((array: any[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    // Initialize socket connection
    useEffect(() => {
        const useMockSocket = process.env.REACT_APP_USE_MOCK_SOCKET === 'true';

        const setupSocket = (newSocket: Socket) => {
            newSocket.on('battle-update', (data: BattleState) => {
                setBattleState(data);
            });

            newSocket.on('battle-start', (data: BattleState) => {
                setBattleState(data);
                setAllQuestions(data.questions);
                setCurrentQuestions(shuffleArray(data.questions).slice(0, 10)); // Get a random set for the battle
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
    }, [playBattleStart, shuffleArray]);

    // Load all questions on component mount
    useEffect(() => {
        const loadQuestions = async () => {
            const fetchedQuestions = await fetchQuestions();
            setAllQuestions(fetchedQuestions);
            // Initialize with a random subset for the first solo quiz
            setCurrentQuestions(shuffleArray(fetchedQuestions).slice(0, 10));
        };

        loadQuestions();

        const savedHistory = localStorage.getItem('quizScoreHistory');
        if (savedHistory) setScoreHistory(JSON.parse(savedHistory));

        const streak = localStorage.getItem('quizStreak');
        if (streak) setCurrentStreak(parseInt(streak));

        localStorage.setItem('userId', userId);
    }, [userId, shuffleArray]);

    // Reset timer function
    const resetTimer = useCallback(() => setTimeLeft(3), []);

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
        const questionId = currentQuestions[currentIndex].id;
        const isCorrect = choice === currentQuestions[currentIndex].correctAnswer;

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
            if (currentIndex + 1 < currentQuestions.length) {
                setCurrentIndex(currentIndex + 1);
                setSelected(null);
                resetTimer();
            } else {
                const didPass = (score + (isCorrect ? 1 : 0)) / currentQuestions.length >= 0.7;
                setPassed(didPass);
                setShowResult(true);

                if (mode === 'solo') {
                    updateStreak();
                    analyzePerformance(currentQuestions, [...incorrectAnswers, ...(isCorrect ? [] : [questionId])]);
                    saveResultToHistory({
                        date: new Date().toLocaleString(),
                        score: score + (isCorrect ? 1 : 0),
                        total: currentQuestions.length,
                        passed: didPass
                    });
                }

                didPass ? playCompleted() : playFailed();
            }
        }, 1000);
    }, [
        mode,
        battleState,
        currentQuestions,
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
        // Get a new random set of questions for the next quiz
        setCurrentQuestions(shuffleArray(allQuestions).slice(0, 10));
        resetTimer();
    }, [allQuestions, shuffleArray, resetTimer]);

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

    if (currentQuestions.length === 0) {
        return <div className="text-center mt-10 text-lg">Loading...</div>;
    }

    return (
        <div className="quiz-container">
            {/* Header with mode toggle and streak */}
            <div className="quiz-header">
                <StreakCounter currentStreak={mode === 'solo' ? currentStreak : 0} />
                {!showResult && (
                    <button
                        onClick={() => mode === 'solo' ? setMode('battle') : quitBattle()}
                        className={`mode-toggle ${mode === 'solo' ? 'solo' : 'battle'}`}
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
                        <p className="quiz-timer">⏱️ {timeLeft}s</p>
                    )}

                    {/* Question counter */}
                    {!showResult && (
                        <p className="question-counter">
                            Question {currentIndex + 1} of {currentQuestions.length}
                        </p>
                    )}

                    {/* Learn mode */}
                    {learnMode ? (
                        <div className="learn-mode-container">
                            <p className="learn-mode-title">
                                Definition of "{currentQuestion.word}":
                            </p>
                            <p className="learn-mode-definition">{currentQuestion.definition}</p>
                            <button
                                className="learn-mode-button"
                                onClick={() => setLearnMode(false)}
                            >
                                Start Quiz for "{currentQuestion.word}"
                            </button>
                        </div>
                    ) : showResult ? (
                        <div>
                            <Result
                                score={score}
                                total={currentQuestions.length}
                                passed={passed}
                                onRestart={handleRestart}
                            />
                            <MistakeAnalysis weakCategories={weakCategories} />

                            {scoreHistory.length > 0 && (
                                <div className="results-container">
                                    <h3 className="results-title">Recent Results:</h3>
                                    <ul className="results-list">
                                        {scoreHistory.map((result, i) => (
                                            <li key={i} className="results-item">
                                                <div className="results-item-content">
                                                    <span>{result.date}</span>
                                                    <span className={`results-score ${
                                                        result.passed ? 'passed' : 'failed'
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
                                choices={shuffleArray(currentQuestion.choices)}
                                correctAnswer={currentQuestion.correctAnswer}
                                selected={selected}
                                onSelect={handleAnswer}
                            />
                            <button
                                className="definition-button"
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
