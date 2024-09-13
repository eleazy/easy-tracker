import { db, auth } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, updateDoc, DocumentReference, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import tabelaTaco from './tabelaTaco.json';
import { Food, Meal, MealsOfDayResult, mealMacroTotals } from "@/types/general";
import { getLoggedUser, fixN, getTodayString } from "@/utils/helperFunctions";

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

// Edit a meal food in the food diary
const editMealFood = async (date: string, idMealsFoods: string, quantity: number) => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
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

// PUBLIC FUNCTIONS

// Edit a meal in the food diary
export const saveFoodDiary = async (date: string, meals: Meal[]) => { 
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
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
        const mealsFoodsCollectionRef = collection(db, "users", user, "foodDiary", docId, "mealsFoods");
        
        // Update each meal in the food diary
        // In firebase the atribute foods of meal is a array of DocumentReference to the documents in mealsFoods collection
        // The mealsFoods collection has each food's data
        // in Meal type, foods is an array of type Food, not DocumentReference
        // So it's necessary to update the mealsFoods collection with the new values of the foods
        // And then update the meals collection with the new values of the meals, keeping the DocumentReferences to the foods documents

        const updatePromises = meals.map(async (meal) => {
            const mealRef = doc(mealsCollectionRef, meal.id);
            const mealDoc = await getDoc(mealRef);
            const mealData = mealDoc.data();
            const foodsRefs = mealData?.foods as DocumentReference[];
            
            const updateFoodsPromises = meal.foods.map(async (food, i) => {                
                const foodRef = doc(mealsFoodsCollectionRef, foodsRefs[i].id);
                await editMealFood(date, foodRef.id, food.quantity);
            });

            await Promise.all(updateFoodsPromises);
        });

        await Promise.all(updatePromises);

    } catch (error) {
        console.error("Error saving food diary:", error);
    }
};

// Save foods to meal
export const saveFoodsToMeal = async (date: string, mealId: string, foods: Food[]) => {
    // Creates the document in mealsFoods for each food added to the meal
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;

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
        const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
        const mealRef = doc(mealsCollectionRef, mealId);
        const mealDoc = await getDoc(mealRef);
        const mealData = mealDoc.data();
        const foodsRefs = mealData?.foods as DocumentReference[];

        const addFoodsPromises = foods.map(async (food, i) => {
            const newFoodRef = doc(mealsFoodsCollectionRef);
            await setDoc(newFoodRef, food);
            foodsRefs.push(newFoodRef);
        });

        await Promise.all(addFoodsPromises);

        await updateDoc(mealRef, { foods: foodsRefs });

    } catch (error) {
        console.error("Error saving foods to meal:", error);
    }
};

// Get and shape local json data for the taco foods table
export const getTacoTableFoods = (): Food[] => {
    return Object.values(tabelaTaco).map((food) => {
        return {
            id: String(food.id) ?? '',
            idMeal: '',
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

export const getCustomFoods = async (): Promise<Food[]> => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    try {
        const customFoodsCollectionRef = collection(db, "users", user, "customFoods");
        const customFoodsSnapshot = await getDocs(customFoodsCollectionRef);
        const customFoods = customFoodsSnapshot.docs.map(foodDoc => foodDoc.data());
        return customFoods as Food[];
    } catch (error) {
        console.error("Error fetching custom foods:", error);
        return [];
    }
};

export const getMealsOfDay = async (date: string): Promise<MealsOfDayResult> => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
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
export const addNewBlankMeal = async (date: string, mealTitle: string = '') => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
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
            title: mealTitle !== '' ? mealTitle : "Refeição",
            foods: [],            
        };
        await setDoc(newMealRef, newMeal);

    } catch (error) {
        console.error("Error adding new meal:", error);
    }
};

// INITIAL DATABASE LOAD
export const loadInitialData = async ( user: User ) => {
    // Create a new document in the users collection with the user's UID and email
    setDoc(doc(db, "users", user.uid), { uid: user.uid, email: user.email });

    // Create collection foodDiary for the user and add a document with today's date
    setDoc(doc(db, "users", user.uid, "foodDiary", getTodayString()), { date: getTodayString() });

    // Add four default blank meals to the food diary
    ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'].forEach(async (mealTitle, i) => {
        addNewBlankMeal(getTodayString(), mealTitle);
    });
};



// FOR DEVELOPMENT PURPOSES ONLY

// Delete all meals but leave one 
export const deleteAllMealsButOne = async (date: string) => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
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