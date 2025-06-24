const Overlay = ({ isVisible, text }) => {
    if (!isVisible) return null;

    return (
        <div
            className="absolute inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-10 transition-opacity duration-300"
            role='dialog'
            aria-modal="true"
            aria-label="Game paused"
        >
            <div className="text-gray-600 text-2xl font-bold">{text}</div>
        </div>
    )
}

export default Overlay;