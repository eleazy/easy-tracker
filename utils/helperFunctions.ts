import { User } from "firebase/auth";

// Utility function to get today's date as a string
export const getTodayString = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
};

export const AddOrSubDay = (dateStr: string, offset: number): string => {
    // Split the date string into components and construct the date with no time zone ambiguity
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Create a new Date object using the UTC constructor to avoid time zone issues
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Adjust the date by the offset (forwards or backwards)
    date.setUTCDate(date.getUTCDate() + offset);
    
    // Format the result back to "YYYY-MM-DD"
    const newYear = date.getUTCFullYear();
    const newMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const newDay = String(date.getUTCDate()).padStart(2, '0');
    
    return `${newYear}-${newMonth}-${newDay}`;
};

export const getDaysOfMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (v, k) => k + 1);
    return daysArray;
}    

export const monthName = (month: number) => {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[month];
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