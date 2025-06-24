const StatsPanel = ({ wpm, accuracy, time }) => {
    return (
        <div role="status" aria-live="polite" className="bg-gray-200 mt-4 text-sm text-gray-600">
            <p>WPM: {wpm}</p>
            <p>Accuracy: {accuracy}%</p>
            <p>Total Time: {time.toFixed(2)}s</p>
        </div>
    )
}

export default StatsPanel;