import { useState, useEffect, useRef } from 'react';

const TypingGame = () => {
    const [words, setWords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [liveWPM, setLiveWPM] = useState(0);
    const [liveAccuracy, setLiveAccuracy] = useState(0);
    const [endTime, setEndTime] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

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

        if (startTime && !isFinished) {
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
    }, [userInput, startTime, isFinished, words])

    const handleInputChange = (e) => {
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

    return (
        <div className="p-6 max-w-xl mx-auto">
        {!isFinished ? (
            <>
                <div onClick={() => inputRef.current?.focus()} className="relative min-h-screen">
                    <p className="mb-4 text-lg font-mono flex flex-wrap leading-relaxed gap-x-1">
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
                        autoFocus
                        className="absolute opacity-0 pointer-events-none"
                        disabled={isFinished}
                    />
                    <div className="mt-4 text-sm text-gray-600">
                        <p>WPM: {liveWPM}</p>
                        <p>Accuracy: {liveAccuracy}%</p>
                        <p>Total Time: {elapsedTime.toFixed(2)}s</p>
                    </div>
                </div>
            </>
        ) : (
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Results</h2>
                <p>WPM: {getResults().wpm}</p>
                <p>Accuracy: {getResults().accuracy}%</p>
                <p>Total Time: {elapsedTime.toFixed(2)}s</p>
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