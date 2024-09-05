import { db, auth } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, updateDoc, DocumentReference, getDoc } from "firebase/firestore";
import tabelaTaco from './tabelaTaco.json';
import { Food, MealsOfDayResult } from "@/types/general";
import { getLoggedUser, fixN } from "@/utils/helperFunctions";

// PRIVATE FUNCTIONS

// Fetch single food document data
const fetchFoodData = async (docRef: DocumentReference): Promise<Food | null> => {
  try {
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      return docSnapshot.data() as Food;
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

// PUBLIC FUNCTIONS

// Get and shape local json data for the taco foods table
export const getTacoTableFoods = (): Food[] => {
    return Object.values(tabelaTaco).map((food) => {
        return {
            id: String(food.id) ?? '',
            calories: food.energia ?? 0,
            macroNutrients: {
              carbs: food.carboidratos ?? 0,
              fats: food.gorduras ?? 0,
              protein: food.proteinas ?? 0,
            },
            quantity: 100,
            title: food.alimento ?? '',
        };
    });
}

export const getMealsOfDay = async (date: String): Promise<MealsOfDayResult> => {
    const user = getLoggedUser().split('@')[0];
    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
        if (foodDiarySnapshot.empty) {
            console.log("No matching documents.");
            return { mealsData: [], foodDiaryDoc: '' };
        }

        const foodDiaryDoc = foodDiarySnapshot.docs[0];
        const docId = foodDiaryDoc.id;
        const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
        const mealsSnapshot = await getDocs(mealsCollectionRef);
        const meals = mealsSnapshot.docs.map(mealDoc => mealDoc.data());
        return { mealsData: meals, foodDiaryDoc: docId };

    } catch (error) {
        console.error("Error fetching meals:", error);
        return { mealsData: [], foodDiaryDoc: '' };
    }
};

// Fetch data for multiple food document references
export const getMealFoods = async (docRefs: DocumentReference[]): Promise<Food[]> => {
  try {
    const dataPromises = docRefs.map(docRef => fetchFoodData(docRef));
    const documentsData = await Promise.all(dataPromises);    
    return documentsData.filter((data): data is Food => data !== null);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Add a new meal to the food diary in a given day
export const addNewBlankMeal = async (date: string) => {
    const user = getLoggedUser().split('@')[0];
    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
        if (foodDiarySnapshot.empty) {
            console.log("No matching documents.");
            return;
        }
        
        const foodDiaryDoc = foodDiarySnapshot.docs[0];
        const docId = foodDiaryDoc.id;
        const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
        const newMealRef = doc(mealsCollectionRef);

        const newMeal = {
            id: newMealRef.id,
            mealPosition: 0,
            title: "Refeição",
            foods: [],
            totals: {
                calories: 0,
                carbs: 0,
                fats: 0,
                protein: 0,
            },
        };
        await setDoc(newMealRef, newMeal);

    } catch (error) {
        console.error("Error adding new meal:", error);
    }
};

// Edit a meal in the food diary
export const editMealFood = async (date: string, idMealsFoods: string, quantity: number) => {
    const user = getLoggedUser().split('@')[0];
    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
        if (foodDiarySnapshot.empty) {
            console.log("No matching documents.");
            return;
        }

        const foodDiaryDoc = foodDiarySnapshot.docs[0];
        const docId = foodDiaryDoc.id;
        const mealsFoodsCollectionRef = collection(db, "users", user, "foodDiary", docId, "mealsFoods");
        const mealFoodRef = doc(mealsFoodsCollectionRef, idMealsFoods);

        // Calculate new macros with the new quantity
        const foodData = await fetchFoodData(mealFoodRef);
        if (!foodData) return;
        const fM = foodData.macroNutrients;
        const newCarbs = fM.carbs * quantity / foodData.quantity;
        const newFats = fM.fats * quantity / foodData.quantity;
        const newProtein = fM.protein * quantity / foodData.quantity;
        const newCalories = (newCarbs + newProtein) * 4 + newFats * 9;

        const newFoodData = {
            ...foodData,
            quantity: quantity,
            macroNutrients: {
                ...fM,
                carbs: fixN(newCarbs),
                fats: fixN(newFats),
                protein: fixN(newProtein),
            },
            calories: fixN(newCalories),
        };

        await setDoc(mealFoodRef, newFoodData);

    } catch (error) {
        console.error("Error editing meal:", error);
    }
};



// FOR DEVELOPMENT PURPOSES ONLY

// Delete all meals but leave one 
export const deleteAllMealsButOne = async (date: string) => {
    const user = getLoggedUser().split('@')[0];
    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);

        if (foodDiarySnapshot.empty) {
            console.log("No matching documents.");
            return;
        }

        const foodDiaryDoc = foodDiarySnapshot.docs[0];
        const docId = foodDiaryDoc.id;
        const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
        const mealsSnapshot = await getDocs(mealsCollectionRef);

        // Filter out the meal to keep and delete the rest
        const deletePromises = mealsSnapshot.docs
            .filter(mealDoc => mealDoc.id !== '4pCnqG8IhwHzER16WzQy')
            .map(mealDoc => deleteDoc(doc(mealsCollectionRef, mealDoc.id)));

        await Promise.all(deletePromises);
        console.log("All meals deleted except the one");
        
    } catch (error) {
        console.error("Error deleting meals:", error);
    }
};


