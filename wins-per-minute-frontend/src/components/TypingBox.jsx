const TypingBox = ({words, userInput}) => {

    return (
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
    )
} 

export default TypingBox;