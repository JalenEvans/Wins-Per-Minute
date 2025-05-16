export function isPasswordValid(password) {
    // Minimum 8 characters, Maximum 20 characters
    // At least one lowercase letter, one uppercase letter, one digit 0-9, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    return passwordRegex.test(password);
}