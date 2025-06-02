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
import { normalizeCategory } from '../utils/categories';

type QuizMode = 'solo' | 'battle';

interface QuizProps {
    category: string | null;
    difficulty: 'easy' | 'normal' | 'hard' | null;
    onExit: () => void;
    updateProgress: (result: QuizResult) => void;
}

const Quiz: React.FC<QuizProps> = ({
                                       category,
                                       difficulty,
                                       onExit,
                                       updateProgress
                                   }) => {
    // Quiz state
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [learnMode, setLearnMode] = useState(false);
    const [passed, setPassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mode, setMode] = useState<QuizMode>('solo');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [battleState, setBattleState] = useState<BattleState | null>(null);

    // Progress tracking state
    const [currentStreak, setCurrentStreak] = useState(0);
    const [weakCategories, setWeakCategories] = useState<string[]>([]);
    const [scoreHistory, setScoreHistory] = useState<QuizResult[]>([]);

    // Sound effects
    const [playCorrect] = useSound('/sounds/correct.mp3');
    const [playWrong] = useSound('/sounds/wrong.mp3');
    const [playCompleted] = useSound('/sounds/complete.mp3');
    const [playFailed] = useSound('/sounds/fail.mp3');
    const [playBattleStart] = useSound('/sounds/battle-start.mp3');
    const [playCancel] = useSound('/sounds/cancel.mp3'); // Sound for cancel

    const userId = useMemo(() => localStorage.getItem('userId') || uuidv4(), []);
    const currentQuestion = useMemo(() => currentQuestions[currentIndex], [currentQuestions, currentIndex]);

    // Prepare questions with randomized choices
    const prepareQuestionsWithRandomizedChoices = useCallback((questions: Question[]): Question[] => {
        return questions.map(q => {
            const incorrect = q.choices.filter(c => c !== q.correctAnswer);
            const insertIndex = Math.floor(Math.random() * (incorrect.length + 1));
            const randomizedChoices = [...incorrect];
            randomizedChoices.splice(insertIndex, 0, q.correctAnswer);
            return { ...q, choices: randomizedChoices };
        });
    }, []);

    const getInitialQuestions = useCallback((questions: Question[], count: number = 10): Question[] => {
        return prepareQuestionsWithRandomizedChoices(questions.slice(0, count));
    }, [prepareQuestionsWithRandomizedChoices]);

    const resetTimer = useCallback(() => {
        switch (difficulty) {
            case 'easy': setTimeLeft(15); break;
            case 'normal': setTimeLeft(10); break;
            case 'hard': setTimeLeft(7); break;
            default: setTimeLeft(10);
        }
    }, [difficulty]);

    // Socket setup
    useEffect(() => {
        const useMockSocket = process.env.REACT_APP_USE_MOCK_SOCKET === 'true';

        const setupSocket = (newSocket: Socket) => {
            newSocket.on('battle-update', (data: BattleState) => {
                setBattleState(data);
            });

            newSocket.on('battle-start', (data: BattleState) => {
                setBattleState(data);
                const battleQuestions = category
                    ? data.questions.filter(q => q.category === category)
                    : data.questions;
                setAllQuestions(battleQuestions);
                setCurrentQuestions(getInitialQuestions(battleQuestions));
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
    }, [playBattleStart, getInitialQuestions, category]);

    // Load questions and user data
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                setIsLoading(true);
                const normalizedCategory = category ? normalizeCategory(category) : undefined;
                const fetchedQuestions = await fetchQuestions(normalizedCategory);
                const preparedQuestions = prepareQuestionsWithRandomizedChoices(fetchedQuestions);

                setAllQuestions(preparedQuestions);
                setCurrentQuestions(getInitialQuestions(preparedQuestions));
                resetQuizState();
                resetTimer();
            } catch (error) {
                console.error('Error loading questions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const loadUserData = () => {
            const savedHistory = localStorage.getItem('quizScoreHistory');
            if (savedHistory) {
                try {
                    setScoreHistory(JSON.parse(savedHistory));
                } catch (e) {
                    console.error('Error parsing score history:', e);
                }
            }
            const streak = localStorage.getItem('quizStreak');
            if (streak) {
                setCurrentStreak(parseInt(streak));
            }
            if (!localStorage.getItem('userId')) {
                localStorage.setItem('userId', userId);
            }
        };

        const resetQuizState = () => {
            setCurrentIndex(0);
            setScore(0);
            setSelected(null);
            setShowResult(false);
            setLearnMode(false);
            setPassed(false);
            setIncorrectAnswers([]);
            setIncorrectQuestions([]);
        };

        loadQuestions();
        loadUserData();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [userId, category, difficulty, prepareQuestionsWithRandomizedChoices, getInitialQuestions, resetTimer, socket]);

    // Timer effect
    useEffect(() => {
        if (mode === 'battle' || learnMode || showResult) return;

        if (timeLeft === 0 && !selected) {
            handleAnswer('timeout');
            return;
        }

        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, selected, mode, learnMode, showResult]);

    // Streak tracking
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

    // Handle answer selection
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
                const finalScore = score + (isCorrect ? 1 : 0);
                const didPass = finalScore / currentQuestions.length >= 0.7;
                setPassed(didPass);
                const incorrectQ = allQuestions.filter(q => incorrectAnswers.includes(q.id));
                setIncorrectQuestions(incorrectQ);
                setShowResult(true);

                if (mode === 'solo') {
                    updateStreak();
                    analyzePerformance(currentQuestions, incorrectAnswers);

                    const result: QuizResult = {
                        date: new Date().toLocaleString(),
                        score: finalScore,
                        total: currentQuestions.length,
                        passed: didPass,
                        category: category || '',
                    };

                    // Update progress in parent component
                    updateProgress(result);

                    // Save to local history
                    const newHistory = [result, ...scoreHistory].slice(0, 10);
                    setScoreHistory(newHistory);
                    localStorage.setItem('quizScoreHistory', JSON.stringify(newHistory));
                }

                didPass ? playCompleted() : playFailed();
            }
        }, 1000);
    }, [
        mode, battleState, currentQuestions, currentIndex, score,
        incorrectAnswers, socket, userId, resetTimer, playCorrect,
        playWrong, playCompleted, playFailed, updateStreak,
        analyzePerformance, category, difficulty, scoreHistory,
        updateProgress, allQuestions
    ]);

    // Restart quiz with same questions
    const handleRestart = useCallback(() => {
        setScore(0);
        setCurrentIndex(0);
        setSelected(null);
        setShowResult(false);
        setLearnMode(false);
        setPassed(false);
        setIncorrectAnswers([]);
        setIncorrectQuestions([]);
        setCurrentQuestions(prepareQuestionsWithRandomizedChoices(currentQuestions));
        resetTimer();
    }, [currentQuestions, prepareQuestionsWithRandomizedChoices, resetTimer]);

    // Get a new set of questions
    const getNewQuestions = useCallback(() => {
        if (allQuestions.length === 0) return;

        const nextIndex = currentQuestions.length;
        const newQuestions = allQuestions.slice(nextIndex, nextIndex + 10);

        if (newQuestions.length > 0) {
            setCurrentQuestions(prepareQuestionsWithRandomizedChoices(newQuestions));
        } else {
            setCurrentQuestions(prepareQuestionsWithRandomizedChoices(allQuestions.slice(0, 10)));
        }

        // Reset quiz state
        setScore(0);
        setCurrentIndex(0);
        setSelected(null);
        setShowResult(false);
        setLearnMode(false);
        setPassed(false);
        setIncorrectAnswers([]);
        setIncorrectQuestions([]);
        resetTimer();
    }, [allQuestions, currentQuestions.length, prepareQuestionsWithRandomizedChoices, resetTimer]);

    // Battle mode functions
    const startBattle = useCallback((opponentId: string) => {
        socket?.emit('start-battle', {
            userId,
            opponentId,
            category: category || 'general',
            difficulty
        });
    }, [socket, userId, category, difficulty]);

    const quitBattle = useCallback(() => {
        socket?.emit('quit-battle', { battleId: battleState?.battleId });
        setBattleState(null);
        setMode('solo');
        handleRestart();
    }, [socket, battleState, handleRestart]);

    // Handle cancel button click
    const handleCancel = useCallback(() => {
        playCancel();
        onExit(); // Call the onExit prop passed from the parent (WelcomeScreen/Category screen)
    }, [onExit, playCancel]);

    // Loading and error states
    if (isLoading) {
        return <div className="text-center mt-10 text-lg">Loading questions...</div>;
    }

    if (currentQuestions.length === 0) {
        return (
            <div className="text-center mt-10">
                <p className="text-lg">No questions available for the selected category.</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={onExit}
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Main render
    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="cancel-button" onClick={handleCancel}>
                    ❌ Cancel
                </button>
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
                    {!learnMode && !showResult && (
                        <p className="quiz-timer">⏱️ {timeLeft}s</p>
                    )}
                    {!showResult && (
                        <p className="question-counter">
                            Question {currentIndex + 1} of {currentQuestions.length}
                        </p>
                    )}

                    {learnMode ? (
                        <div className="learn-mode-container">
                            <p className="learn-mode-title">
                                {currentQuestion.word ? `Definition of "${currentQuestion.word}":` : 'Question Details:'}
                            </p>
                            <p className="learn-mode-definition">
                                {currentQuestion.definition || currentQuestion.correctAnswer}
                            </p>
                            <button
                                className="learn-mode-button"
                                onClick={() => setLearnMode(false)}
                            >
                                {currentQuestion.word ? `Start Quiz for "${currentQuestion.word}"` : 'Continue Quiz'}
                            </button>
                        </div>
                    ) : showResult ? (
                        <div>
                            <Result
                                score={score}
                                total={currentQuestions.length}
                                passed={passed}
                                onRestart={handleRestart}
                                onNewQuestions={getNewQuestions}
                                incorrectQuestions={incorrectQuestions}
                            />
                            <MistakeAnalysis weakCategories={weakCategories} />

                            <button className="exit-button" onClick={onExit}>
                                Exit Quiz
                            </button>
                        </div>
                    ) : (
                        <>
                            <QuestionCard
                                word={currentQuestion?.word || ''}
                                question={currentQuestion?.question || ''}
                                choices={currentQuestion?.choices || []}
                                correctAnswer={currentQuestion?.correctAnswer || ''}
                                selected={selected}
                                onSelect={handleAnswer}
                            />
                            {(currentQuestion?.word && currentQuestion?.definition) && (
                                <button
                                    className="definition-button"
                                    onClick={() => setLearnMode(true)}
                                >
                                    Learn Mode: Show Definition
                                </button>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Quiz;
