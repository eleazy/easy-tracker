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
  isCustom: boolean;
};

export interface detailedFood extends Food {
  microNutrients: {    
    saturatedFats: number;
    monounsaturatedFats: number;
    polyunsaturatedFats: number | string;
    dietaryFiber: number | string;
    ash: number | string;
    calcium: number | string;
    magnesium: number | string;
    manganese: number | string;
    phosphorus: number | string;
    iron: number | string;
    sodium: number | string;
    potassium: number | string;
    copper: number | string;
    zinc: number | string;
    thiamine: number | string;
    pyridoxine: number | string;
    niacin: number | string;
    riboflavin: number | string;
    vitaminC: number | string;
    RE: number | string;
    RAE: number | string;
    cholesterol: number | string;
    retinol: number | string;
  };
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

export interface FoodInfoProps {
  setShowFoodInfo: (showFoodInfo: boolean) => void;
  foodId: string;
};

interface NutrientMeasure {
  measure: MeasureUnit;
  dailyRecomended: number;
}

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

export const microsDisplay = {
  saturatedFats: 'Gorduras Saturadas',
  monounsaturatedFats: 'Gorduras Monoinsaturadas',
  polyunsaturatedFats: 'Gorduras Poliinsaturadas',
  dietaryFiber: 'Fibras Alimentares',
  cholesterol: 'Colesterol',
  sodium: 'Sódio',
  ash: 'Cinzas',
  calcium: 'Cálcio',
  magnesium: 'Magnésio',
  manganese: 'Manganês',
  phosphorus: 'Fósforo',
  iron: 'Ferro',
  potassium: 'Potássio',
  copper: 'Cobre',
  zinc: 'Zinco',
  thiamine: 'Tiamina',
  pyridoxine: 'Piridoxina',
  niacin: 'Niacina',
  riboflavin: 'Riboflavina',
  vitaminC: 'Vitamina C',
  RE: 'RE',
  RAE: 'RAE',
  retinol: 'Retinol',
};

// Types

export type MacroInputsObj = {
  [key in 'carbs' | 'fats' | 'protein']: MacroInput;
};

export type subFatsInputsObj = {
  [key in 'saturatedFats' | 'monounsaturatedFats' | 'polyunsaturatedFats']: MacroInput;
};

type MeasureUnit = 'g' | 'mg' | 'mcg';

export type Measure = {
  [key in keyof typeof microsDisplay]: NutrientMeasure;
};