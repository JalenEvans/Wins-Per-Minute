// To run jest as a ESM module, use this command: node --experimental-vm-modules node_modules/jest/bin/jest.js

import { getStats, fetchWords } from "../utils/typing";
import { describe, expect, it, jest } from "@jest/globals";

jest.mock("../constants.js", () => ({
    WORD_COUNT: 10
}));

globalThis.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve(
            "This is the correct output".split(" "),
        )
    })
);

describe("Typing Utils", () => {
    describe("getStats", () => {
        it("should calculate WPM, accuracy, and time correctly", () => {
            const startTime = 0;
            const endTime = 60000; // 1 minute
            const totalMistakes = {current: 6};
            const totalChars = 60;

            const { wpm, accuracy, time } = getStats(startTime, endTime, totalMistakes.current, totalChars);

            expect(wpm).toBe(Math.round(54 / 5)); // 60 chars - 6 mistakes = 54 chars, 54/5 = 10.8 WPM
            expect(accuracy).toBe(90); // (54/60) * 100 = 90%
            expect(time).toBe(60); // 1 minute in seconds
        });

        it("should handle zero characters typed", () => {
            const { accuracy } = getStats(0, 1000, 0, 0);
            expect(accuracy).toBe(100); // No characters typed, edge case
        });
    });

    describe("fetchWords", () => {
        it("should return an array of words with the correct count", async () => {
            const words = await fetchWords();
            expect(words).toEqual(("This is the correct output".split(" ")));
            expect(fetch).toHaveBeenCalled()
        });

        it("should handle fetch errors gracefully", async () => {
            globalThis.fetch.mockImplementationOnce(() => Promise.reject(new Error("Failed to fetch")));
            const words = await fetchWords();
            expect(words).toEqual(["Failed", "to", "fetch"]);
        });
    });
});