import { RefObject } from 'react';
import { TextInput } from 'react-native';

// INTERFACES

export interface Food {
  id: string;
  idMeal: string; // id of the meal it belongs to
  calories: number;
  macroNutrients: {
    carbs: number;
    fats: number;
    protein: number;    
  };
  quantity: number;
  title: string;
};

export interface Meal {
  foods: Food[];
  id: string;
  mealPosition: number;
  title: string;
  totals: {
    calories: number;
    carbs: number;
    fats: number;
    protein: number;
  };
};

export interface mealMacroTotals {  
  calories: number;  
  carbs: number;
  fats: number;
  protein: number;
};

export interface MacroInput {
  value: string;
  setValue: (value: string) => void;
  ref: RefObject<TextInput>;
}

export interface MealCardProps {
  meal: Meal;
  mealIndex: number;
  meals: Meal[];
  setMeals: (meals: Meal[]) => void;
  setHasChanges: (hasChanges: boolean) => void;
};

export interface FoodSelectionProps {
  addFoodToMeal: (food: Food) => void;
};

export interface CalendarViewProps {
  setShowCalendar: (showCalendar: boolean) => void;
  foodDiaryDay: string;
  setFoodDiaryDay: (foodDiaryDay: string) => void;
};

export interface CreateFoodProps {
  setShowCreateFood: (showCreateFood: boolean) => void;
  customFoods: Food[];  
  setCustomFoods: (customFoods: Food[]) => void;
};

// REPLACES

export const macrosDisplay = {
  carbs: 'Carboidratos',
  fats: 'Gorduras',
  protein: 'Proteínas',
};

export const macrosDisplayShort = {
  carbs: 'C',
  fats: 'G',
  protein: 'P',
};

// Types

export type MacroInputsObj = {
  [key in 'carbs' | 'fats' | 'protein']: MacroInput;
};

// [
//   "id",
//   "alimento",
//   "energia",
//   "proteinas",
//   "carboidratos",
//   "gorduras",
//   "gordurasSaturadas",
//   "gordurasMonoinsaturadas",
//   "gordurasPoliinsaturadas",
//   "fibrasAlimentares",
//   "cinzas",
//   "calcio",
//   "magnesio",
//   "manganes",
//   "fosforo",
//   "ferro",
//   "sodio",
//   "potassio",
//   "cobre",
//   "zinco",
//   "tiamina",
//   "piridoxina",
//   "niacina",
//   "riboflavina",
//   "vitaminaC",
//   "RE",
//   "RAE ",
//   "colesterol",
//   "Retinol",
//   "Colesterol"
// ]