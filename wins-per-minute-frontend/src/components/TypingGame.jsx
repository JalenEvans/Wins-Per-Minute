import { useState, useEffect, useRef } from 'react';

const TypingGame = () => {
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
        const wordCount = 10;
        fetch(`https://random-word-api.vercel.app/api?words=${wordCount}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(json => {
                setWords(json);
            })
            .catch(error => {
                setWords(error.message.split(" "));
                console.error('There was a problem with the fetch operation:', error);
            })
    }, []);

    // Focus the input field on component mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Update live WPM, accuracy, and elapsed time
    useEffect(() => {
        let interval;

        if (startTime && !isFinished && !isPaused) {
            interval = setInterval(() => {
                setElapsedTime((Date.now() - startTime) / 1000);
                
                const durationInMinutes = (Date.now() - startTime) / 60000;

                const totalChars = userInput.length;
                const correctChars = totalChars - totalMistakes.current;

                const wpm = Math.max(0, Math.round((correctChars / 5) / durationInMinutes));
                const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
                const accuracy = totalChars > 0 ? clamp(Math.round((correctChars / totalChars) * 100), 0, 100) : 100;

                setLiveWPM(wpm);
                setLiveAccuracy(accuracy);
            }, 100);
        }

        return () => clearInterval(interval);
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
                    setCountdown(3);
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

    // Integrate testing into this
    const getResults = () => {
        const durationInMinutes = (endTime - startTime) / 60000;

        const totalChars = userInput.length;
        const correctChars = words.join(" ").length - totalMistakes.current;

        const wpm = Math.round((correctChars / 5) / durationInMinutes);
        const accuracy = Math.round((correctChars / totalChars) * 100);

        return { wpm, accuracy };
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
        const wordCount = 10;
        fetch(`https://random-word-api.vercel.app/api?words=${wordCount}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(json => {
                setWords(json);
            })
            .catch(error => {
                setWords(error.message.split(" "));
                console.error('There was a problem with the fetch operation:', error);
            })
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
        {!isFinished ? (
            <>
                <div className="relative">
                    {isPaused && countdown === null && (
                        <div 
                            className="absolute inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-10 transition-opacity duration-300"
                            role='dialog'
                            aria-modal="true"
                            aria-label="Game paused"
                        >
                            <div className="text-gray-600 text-2xl font-bold">Paused</div>
                        </div>
                    )}
                    {countdown !== null && (
                        <div 
                            className="absolute inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-10 transition-opacity duration-300"
                            role='dialog'
                            aria-modal="true"
                            aria-label="Countdown till game resumes"
                        >
                            <div className="text-gray-600 text-2xl font-bold">{countdown}</div>
                        </div>
                    )}
                    <div onClick={() => inputRef.current?.focus()} className="relative size-fit">
                        <p className="mb-4 text-3xl font-mono flex flex-wrap leading-relaxed gap-x-1">
                            {words.map((word, wordIndex) => (
                                <span key={wordIndex} className="flex">
                                    {word.split("").map((char, charIndex) => {
                                        const charsBefore = words
                                            .slice(0, wordIndex)
                                            .reduce((accumulator, word) => accumulator + word.length + 1, 0);
                                        const globalIndex = charsBefore + charIndex;
                    
                                        let className = "";
                                        if (globalIndex < userInput.length) {
                                            className =
                                                userInput[globalIndex] === char ? "text-green-600" : "text-red-600";
                                        }
                                        else if (globalIndex === userInput.length) {
                                            className = "text-blue-600 underline";
                                        }
                                        else {
                                            className = "text-gray-400";
                                        }
                                        return (
                                            <span key={charIndex} className={`inline-block ${className}`}>
                                                {char}
                                            </span>
                                        )
                                    })}
                                    <span className="inline-block">&nbsp;</span>
                                </span>
                            ))}
                        </p>
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onPaste={(e) => e.preventDefault()}
                            autoFocus
                            className="absolute opacity-0 pointer-events-none"
                            disabled={isFinished || isPaused}
                            aria-label="Typing input field"
                        />
                    </div>
                </div>
                <div role="status" aria-live="polite" className="bg-gray-200 mt-4 text-sm text-gray-600">
                    <p>WPM: {liveWPM}</p>
                    <p>Accuracy: {liveAccuracy}%</p>
                    <p>Total Time: {elapsedTime.toFixed(2)}s</p>
                </div>
                <div className="relative bottom-0 right-0 p-1 text-sm text-gray-500 flex flex-col">
                    <span className="font-semibold">Press Escape to Pause,</span>
                    <span className="font-semibold">Ctrl + Enter to Restart</span>
                </div>
            </>
        ) : (
            <div className="bg-gray-200 p-4 mt-6">
                <h2 className="text-xl font-semibold mb-2">Results</h2>
                <p>Words Per Minute: {getResults().wpm}</p>
                <p>Accuracy: {getResults().accuracy}%</p>
                <p>Adjusted WPM: {Math.floor(getResults().wpm * (getResults().accuracy / 100))}</p>
                <p>Total Time: {elapsedTime.toFixed(2)}s</p>
                <p>Total Mistakes: {totalMistakes.current}</p>
                <button
                    onClick={() => {window.location.reload();}}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Play Again
                </button>
            </div>
        )}
        </div>
    );
}

export default TypingGame;