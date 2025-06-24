const InputField = ({ inputRef, value, onChange, disabled}) => {
    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={onChange}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            autoFocus
            className="absolute opacity-0 pointer-events-none"
            disabled={disabled}
            aria-label="Typing input field"
        />
    )
}

export default InputField;