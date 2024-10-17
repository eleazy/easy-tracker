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

export const getPercentual = (value: number, factor: number, dailyValue: number) => {
    return fixN(((value * factor) / dailyValue) * 100);
};

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

export const emptyDetailedFood = {
    id: '',
    idMeal: '',
    calories: 0,
    macroNutrients: {
        carbs: 0,
        fats: 0,
        protein: 0,
    },
    microNutrients: {
        saturatedFats: 0,
        monounsaturatedFats: 0,
        polyunsaturatedFats: 0,
        dietaryFiber: 0,
        ash: 0,
        calcium: 0,
        magnesium: 0,
        manganese: 0,
        phosphorus: 0,
        iron: 0,
        sodium: 0,
        potassium: 0,
        copper: 0,
        zinc: 0,
        thiamine: 0,
        pyridoxine: 0,
        niacin: 0,
        riboflavin: 0,
        vitaminC: 0,
        RE: 0,
        RAE: 0,
        cholesterol: 0,
        retinol: 0,
    },
    quantity: 100,
    title: '',
    isCustom: true,    
};