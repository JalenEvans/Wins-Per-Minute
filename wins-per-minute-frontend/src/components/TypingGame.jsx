import { useState, useEffect } from 'react';

const TypingGame = () => {
    const [words, setWords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const sampleWords = "This is a sample text for the typing game".split(" ");
        setWords(sampleWords);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (!startTime && value.length === 1) {
            setStartTime(Date.now());
        }

        setUserInput(value);

        if (value.length >= words.join(" ").length) {
            setIsFinished(true);
            setEndTime(Date.now());
        }
    };

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
                <p className="mb-4 text-lg">
                    {words.join(" ")}
                </p>
                <textarea
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Start typing..."
                    className="w-full border rounded p-2"
                    rows={5}
                    disabled={isFinished}
                />
            </>
        ) : (
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Results</h2>
                <p>WPM: {getResults().wpm}</p>
                <p>Accuracy: {getResults().accuracy}</p>
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