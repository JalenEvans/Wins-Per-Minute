import { WORD_COUNT } from '../constants.js';

export const fetchWords = async () => {
    try {
        const response = await fetch(`https://random-word-api.vercel.app/api?words=${WORD_COUNT}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const json = await response.json();
        return json;
    }
    catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return (error.message.split(" "));
    }
}

export const updateLiveStats = (startTime, userInput, totalMistakes, isFinished, isPaused) => {
    if (!startTime || isFinished || isPaused) return { wpm: 0, accuracy: 100, time: 0 };

    const endTime = Date.now();
    const totalChars = userInput.length;

    return getStats(startTime, endTime, totalMistakes, totalChars);
}

export const getStats = (startTime, endTime, totalMistakes, totalChars) => {
    const time = ((endTime - startTime) / 1000);

    const durationInMinutes = time / 60;

    const correctChars = totalChars - totalMistakes;

    const wpm = Math.max(0, Math.round((correctChars / 5) / durationInMinutes));
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    const accuracy = totalChars > 0 ? clamp(Math.round((correctChars / totalChars) * 100), 0, 100) : 100;

    return { wpm, accuracy, time };
};