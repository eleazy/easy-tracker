import { User } from "firebase/auth";

// Utility function to get today's date as a string
export const getTodayString = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
};

// Utility function to fix number precision
export const fixN = (n: Number) => parseFloat(n.toFixed(2));

// Logged user
let loggedUser: User;
export const setLoggedUser = (value: User) => loggedUser = value;
export const getLoggedUser = (): User => loggedUser;

// Utility function to remove accents/diacritics from strings
export const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Utility function for plural/singular matching
export const singularPluralMatch = (str: string) => {
    if (str.endsWith('s')) {
        return [str, str.slice(0, -1)]; // Remove 's' for singular
    }
    return [str, `${str}s`]; // Add 's' for plural
};