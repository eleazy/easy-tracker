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

export interface MealCardProps {
  meal: Meal;
  mealIndex: number;
  meals: Meal[];
  setMeals: (meals: Meal[]) => void;
  macroTotals: mealMacroTotals;
  setMacroTotals: (totals: mealMacroTotals) => void;
};

export interface FoodSelectionProps {
  addFoodToMeal: (food: Food) => void;
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