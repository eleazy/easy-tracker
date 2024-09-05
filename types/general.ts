import { DocumentReference, DocumentData } from 'firebase/firestore';

// INTERFACES
export interface Meal {
  foods: DocumentReference[];
  mealPosition: number;
  title: string;
  totals: {
    calories: number;
    carbs: number;
    fats: number;
    protein: number;
  };
}

export interface Food {
  id: string;
  calories: number;
  macroNutrients: {
    carbs: number;
    fats: number;
    protein: number;
  };
  quantity: number;
  title: string;
};

export interface mealMacroTotals {  
  calories: number;  
  carbs: number;
  fats: number;
  protein: number;
};

// TYPES

export type MealsOfDayResult = {
  mealsData: DocumentData[];
  foodDiaryDoc: string;
};