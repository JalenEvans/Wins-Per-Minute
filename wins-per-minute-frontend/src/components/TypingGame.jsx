import { useState, useEffect, useRef } from 'react';

const TypingGame = () => {
    const [words, setWords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

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

    // Update the elapsed time
    useEffect(() => {
        let interval;

        if (startTime && !isFinished) {
            interval = setInterval(() => {
                setElapsedTime((Date.now() - startTime) / 1000);
            }, 100);
        }

        return () => clearInterval(interval);
    }, [startTime, isFinished]);

    // Focus the input field on component mount
    const inputRef = useRef();

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        const target = words.join(" ");

        if (!startTime && value.length === 1) {
            setStartTime(Date.now());
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
        const correctChars = userInput.split("").filter((char, index) => {
            const target = words.join(" ");
            return char === target[index];
        }).length;

        const wpm = Math.round((correctChars / 5) / durationInMinutes);
        const accuracy = Math.round((correctChars / totalChars) * 100);

        return { wpm, accuracy };
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
        {!isFinished ? (
            <>
                <div onClick={() => inputRef.current?.focus()} className="relative min-h-screen">
                    <p className="mb-4 text-lg font-mono flex flex-wrap">
                        {words.join(" ").split("").map((char, index) => {
                            let className = "";
                            
                            if (index < userInput.length) {
                                className =
                                    userInput[index] === char
                                        ? "text-green-600"
                                        : "text-red-600";
                            }
                            else if (index === userInput.length) {
                                className = "bg-blue-300 underline";
                            }
                            else {
                                className = "text-gray-400";
                            }

                            return (
                                <span key={index} className={`${className}`}>
                                    {char === " " ? "\u00A0" : char}
                                </span>
                            );
                        })}
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
                    <span className="text-sm text-gray-600">
                        Time: {elapsedTime.toFixed(2)}s
                    </span>
                </div>
            </>
        ) : (
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Results</h2>
                <p>WPM: {getResults().wpm}</p>
                <p>Accuracy: {getResults().accuracy}</p>
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