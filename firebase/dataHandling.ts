import { db } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, updateDoc, arrayUnion, DocumentReference, getDoc, DocumentData } from "firebase/firestore";
import { User } from "firebase/auth";
import tabelaTaco from './tabelaTaco.json';
import { Food, Meal, mealMacroTotals } from "@/types/general";
import { getLoggedUser, fixN, getTodayString } from "@/utils/helperFunctions";

// PRIVATE FUNCTIONS

// Fetch single food document data
const fetchFoodData = async (docRef: DocumentReference): Promise<Food | null> => {
  try {
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      return docSnapshot.data() as Food;
    } else {
      console.log('No such document! Deleted food?');      
      return null;
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
};

// Edit a food in the mealFood collection
const editMealFood = async (date: string, idMealsFoods: string, quantity: number) => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
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

    } catch (error) { console.error("Error editing meal:", error); }
};

// Load initial data for the food diary
const setFoodDiaryInitialData = async (date: string) => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;

    setDoc(doc(db, "users", user, "foodDiary", date), { date });

    ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'].forEach(async (mealTitle, i) => {
        addNewBlankMeal(date, mealTitle, i);
    });
};

// Takes Meal and fetch data for the food document references, 
// calculates totals and returns a Meal object with Food[] instead of DocumentReference[]
const getAndSetMealFoods = async (meal: DocumentData): Promise<Meal> => {
    try {
        const docRefs = meal.foods;
        const dataPromises = docRefs.map((docRef: DocumentReference) => fetchFoodData(docRef) );
        const foodsData = await Promise.all(dataPromises);

        let totalsOfMeal = {calories: 0, carbs: 0, fats: 0, protein: 0};

        foodsData.forEach((food) => {
            totalsOfMeal.calories += food.calories;
            totalsOfMeal.carbs += food.macroNutrients.carbs;
            totalsOfMeal.fats += food.macroNutrients.fats;
            totalsOfMeal.protein += food.macroNutrients.protein;
        });

        (['calories', 'carbs', 'fats', 'protein'] as (keyof typeof totalsOfMeal)[]).forEach((key) => {
            totalsOfMeal[key] = fixN(totalsOfMeal[key]);
        });
        
        const mealObj: Meal = {
            foods: foodsData as Food[],
            id: meal.id,
            mealPosition: meal.mealPosition,
            title: meal.title,
            totals: totalsOfMeal,
        };
        return mealObj;
  
    } catch (error) {
      console.error('getAndSetMealFoods - Error fetching documents:', error);
      return {foods: [], id: '', mealPosition: 0, title: '', totals: {calories: 0, carbs: 0, fats: 0, protein: 0}};
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

        const updateMealPromises = meals.map(async (meal) => {
            const mealRef = doc(mealsCollectionRef, meal.id);
            const mealDoc = await getDoc(mealRef);
            const mealData = mealDoc.data();
            const foodsRefs = mealData?.foods as DocumentReference[];
           
            const updateFoodsPromises = meal.foods.map(async (food, i) => {
                if (foodsRefs[i]) {
                    // If the food exists in the meal, update it
                    const foodRef = doc(mealsFoodsCollectionRef, foodsRefs[i].id);
    
                    if (food.quantity ===  0) {
                        // If the quantity is 0, the food was removed from the meal
                        await deleteDoc(foodRef);
                        await updateDoc(mealRef, { foods: foodsRefs.filter((f) => f.id !== foodRef.id) });
                        return;
                    }              
                    await editMealFood(date, foodRef.id, food.quantity);

                } else {
                    // If the food doesn't exist in the meal, add it
                    if (food.quantity === 0) return;

                    const newFoodRef = doc(mealsFoodsCollectionRef);
                    food = {...food, idMeal: meal.id}; // add the meal id to the food here                    
                    await setDoc(newFoodRef, food);                    
                    await updateDoc(mealRef, {
                        foods: arrayUnion(newFoodRef) // add the new food reference to the meals.foods in firebase
                      });
                }
            });    
            await Promise.all(updateFoodsPromises);
        });

        await Promise.all(updateMealPromises);

    } catch (error) { console.error("Error saving food diary:", error); }
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
};

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

export const getMealsOfDay = async (date: string): Promise<Meal[]> => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
        if (foodDiarySnapshot.empty) {
            console.log("getMealsOfDay - No matching documents, creating food diary.");
           
            // in this case here, a new food diary for the day is created
            // and add the default meals to it
            await setFoodDiaryInitialData(date);

            const newFoodDiarySnapshot = await getDocs(foodDiaryQuery);
            const newFoodDiaryDoc = newFoodDiarySnapshot.docs[0];
            const docId = newFoodDiaryDoc.id;
            const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
            const newMealsSnapshot = await getDocs(mealsCollectionRef);
            const newMealsPromises = newMealsSnapshot.docs.map(async (mealDoc) => {
                const mealData = mealDoc.data();
                // will replace the DocumentReferences in foods with the actual Food[] data                        
                return await getAndSetMealFoods(mealData);
            });
            const newMeals = await Promise.all(newMealsPromises);
            return newMeals;
        }

        const foodDiaryDoc = foodDiarySnapshot.docs[0];
        const docId = foodDiaryDoc.id;
        const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
        const mealsSnapshot = await getDocs(mealsCollectionRef);
        const mealsPromises = mealsSnapshot.docs.map(async (mealDoc) => {

        const mealData = mealDoc.data();
            return await getAndSetMealFoods(mealData);
        });
    
        const meals = await Promise.all(mealsPromises);
        return meals;

    } catch (error) {
        console.error("Error fetching meals:", error);
        return [];
    }
};

// Add a new meal to the food diary in a given day
export const addNewBlankMeal = async (date: string, mealTitle: string = '', mealPosition: number = 0) => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
               
        const foodDiaryDoc = foodDiarySnapshot.docs[0];
        const docId = foodDiaryDoc.id;
        const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
        const newMealRef = doc(mealsCollectionRef);

        const newMeal = {
            id: newMealRef.id,
            mealPosition,
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