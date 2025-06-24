import TypingBox from './TypingBox';
import InputField from './InputField';
import StatsPanel from './StatsPanel';
import Overlay from './Overlay';
import ResultsCard from './ResultsCard';
import ControlsHints from './ControlsHints';
import useTypingGame from '../hooks/useTypingGame';

const TypingGame = () => {
    const {
        words,
        userInput,
        setUserInput,
        isFinished,
        isPaused,
        liveWPM,
        liveAccuracy,
        elapsedTime,
        totalMistakes,
        countdown,
        inputRef,
        getResults
    } = useTypingGame();

    return (
        <div className="p-6 max-w-6xl mx-auto">
        {!isFinished ? (
            <>
                <div className="relative">
                    <Overlay isVisible={isPaused && countdown === null} text="Game Paused" />
                    <Overlay isVisible={countdown !== null} text={`Resuming in ${countdown}`} />
                    
                    <div onClick={() => inputRef.current?.focus()} className="relative size-fit">
                        <TypingBox words={words} userInput={userInput} />
                        <InputField
                            inputRef={inputRef}
                            value={userInput}
                            onChange={setUserInput}
                            disabled={isFinished || isPaused}
                        />
                    </div>
                </div>
                <StatsPanel wpm={liveWPM} accuracy={liveAccuracy} time={elapsedTime} />
                <ControlsHints />
            </>
        ) : (
            <ResultsCard
                wpm={getResults().wpm}
                accuracy={getResults().accuracy}
                time={elapsedTime}
                mistakes={totalMistakes.current}
            />
        )}
        </div>
    );
}

export default TypingGame;