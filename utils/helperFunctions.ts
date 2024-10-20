import { detailedFood, Measure } from "@/types/typesAndInterfaces";
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

// Date to day/month/year
export const ydmDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day} de ${monthName(Number(month) - 1)} de ${year}`;
};

export const getPercentual = (value: number | string | undefined, factor: number, dailyValue: number) => {
    if (Number.isNaN(value) || value === undefined) return '**';
    return fixN(((Number(value) * factor) / dailyValue) * 100);
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

export const emptyDetailedFood: detailedFood = {
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

export const microsMeasure: Measure = {
    saturatedFats: {
      measure: "g",
      dailyRecomended: 20,
    },
    monounsaturatedFats: {
      measure: "g",
      dailyRecomended: 44,
    },
    polyunsaturatedFats: {
      measure: "g",
      dailyRecomended: 11,
    },
    dietaryFiber: {
      measure: "g",
      dailyRecomended: 25,
    },
    cholesterol: {
      measure: "mg",
      dailyRecomended: 300,
    },
    sodium: {
      measure: "mg",
      dailyRecomended: 2300,
    }, // from here above, the daily values are relative
    ash: {
      measure: "g",
      dailyRecomended: 100,
    },
    calcium: {
      measure: "mg",
      dailyRecomended: 1000,
    },
    magnesium: {
      measure: "mg",
      dailyRecomended: 400,
    },
    manganese: {
      measure: "mg",
      dailyRecomended: 2.3,
    },
    phosphorus: {
      measure: "mg",
      dailyRecomended: 700,
    },
    iron: {
      measure: "mg",
      dailyRecomended: 18,
    },
    potassium: {
      measure: "mg",
      dailyRecomended: 4700,
    },
    copper: {
      measure: "mg",
      dailyRecomended: 0.9,
    },
    zinc: {
      measure: "mg",
      dailyRecomended: 11,
    },
    thiamine: {
      measure: "mg",
      dailyRecomended: 1.2,
    },
    pyridoxine: {
      measure: "mg",
      dailyRecomended: 1.3,
    },
    niacin: {
      measure: "mg",
      dailyRecomended: 16,
    },
    riboflavin: {
      measure: "mg",
      dailyRecomended: 1.3,
    },
    vitaminC: {
      measure: "mg",
      dailyRecomended: 90,
    },
    RE: {
      measure: "mcg",
      dailyRecomended: 600,
    },
    RAE: {
      measure: "mcg",
      dailyRecomended: 600,
    },
    retinol: {
      measure: "mcg",
      dailyRecomended: 600,
    },
  };