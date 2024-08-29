import { DocumentReference } from 'firebase/firestore';

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
  calories: number;
  macroNutrients: {
    carbs: number;
    fats: number;
    protein: number;
  };
  quantity: number;
  title: string;
};
