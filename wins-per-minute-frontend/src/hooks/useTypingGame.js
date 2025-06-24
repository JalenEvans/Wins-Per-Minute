import { useState, useRef, useEffect } from 'react';
import { fetchWords, getStats, updateLiveStats } from '../utils/typing';

const useTypingGame = () => {
    const [words, setWords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [liveWPM, setLiveWPM] = useState(0);
    const [liveAccuracy, setLiveAccuracy] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const inputRef = useRef();
    const totalMistakes = useRef(0);

    // Fetch random words from the API
    useEffect(() => {
        const getWords = async () => {
            const words = await fetchWords();
            setWords(words);
        };
        getWords();
    }, []);

    // Focus the input field on component mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Update live WPM, accuracy, and elapsed time
    useEffect(() => {
        const { wpm, accuracy, time } = updateLiveStats(startTime, userInput, totalMistakes, isFinished, isPaused);
        setLiveWPM(wpm);
        setLiveAccuracy(accuracy);
        setElapsedTime(time);
    }, [userInput, startTime, isFinished, isPaused, words])

    // Reset the game state when Ctrl + Enter is pressed
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                resetGame();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [])

    // Pause the game
    useEffect(() => {
        const handlePause = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();

                if (isPaused) {
                    setCountdown(3); // Countdown of 3 seconds
                }
                else {
                    setIsPaused(true);
                }
                console.log(`Game is now ${!isPaused ? 'paused' : 'resumed'}.`);
            }
        }

        if (!isPaused && inputRef.current) {
            inputRef.current.focus();
        }

        window.addEventListener('keydown', handlePause);
        return () => window.removeEventListener('keydown', handlePause);
    }, [isPaused])

    // Countdown before resuming the game
    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        setCountdown(null);
        setIsPaused(false);
    }, [countdown])

    // Handle user input changes
    const handleInputChange = (e) => {
        if (isPaused) return;

        const value = e.target.value;
        const target = words.join(" ");

        if (!startTime && value.length === 1) {
            setStartTime(Date.now());
        }

        const newChar = value[value.length - 1];
        const currIndex = value.length - 1;

        if (target[currIndex] && newChar !== target[currIndex]) {
            totalMistakes.current += 1;
        }

        setUserInput(value);

        if (value.length >= target.length) {
            setIsFinished(true);
            setEndTime(Date.now());
        }
    };


    // Reset the game state
    const resetGame = () => {
        setCountdown(3);
        const confirmReset = window.confirm("Are you sure you want to reset the game? Your current progress will be lost.");
        if (!confirmReset) return;

        setUserInput("");
        setStartTime(null);
        setEndTime(null);
        setLiveWPM(0);
        setLiveAccuracy(0);
        setIsFinished(false);
        setElapsedTime(0);
        setIsPaused(false);
        setCountdown(null);
        totalMistakes.current = 0;

        // Refocus the input field
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Refetch words
        const getWords = async () => {
            const words = await fetchWords();
            setWords(words);
        };
        getWords();
    }

    // Get final results
    const getResults = () => {
        const { wpm, accuracy, time } = getStats(endTime, totalMistakes.current, words.join(" ").length);
        return ({ wpm, accuracy, time });
    }
    return {
        words,
        userInput,
        setUserInput: handleInputChange,
        isFinished,
        isPaused,
        liveWPM,
        liveAccuracy,
        elapsedTime,
        totalMistakes,
        countdown,
        inputRef,
        getResults
    }
}

export default useTypingGame;