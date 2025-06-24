const ResultsCard = ({ wpm, accuracy, time, mistakes }) => {
    return (
        <div className="bg-gray-200 p-4 mt-6">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            <p>Words Per Minute: {wpm}</p>
            <p>Accuracy: {accuracy}%</p>
            <p>Adjusted WPM: {Math.floor(wpm * (accuracy / 100))}</p>
            <p>Total Time: {time.toFixed(2)}s</p>
            <p>Total Mistakes: {mistakes}</p>
            <button
                onClick={() => { window.location.reload(); }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
                Play Again
            </button>
        </div>
    )
}

export default ResultsCard;