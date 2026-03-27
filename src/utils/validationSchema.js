export const VALIDATION_REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    NAME: /^[a-zA-Z\s]{2,50}$/,
};

export const isValidPassword = (password) => VALIDATION_REGEX.PASSWORD.test(password);


export const isValidEmail = (email) => VALIDATION_REGEX.EMAIL.test(email);

export const isValidName = (name) => VALIDATION_REGEX.NAME.test(name);
