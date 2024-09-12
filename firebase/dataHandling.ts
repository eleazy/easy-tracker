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

// // Update the totals of the food diary. Called upon meal's totals being updated
// const updateFoodDiaryTotals = async (date: string, previousTotals: mealMacroTotals, newTotals: mealMacroTotals ) => {
//     const user = getLoggedUser().split('@')[0];
//     try {
//         const foodDiaryQuery = query(
//             collection(db, "users", user, "foodDiary"),
//             where("date", "==", date)
//         );
//         const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
//         if (foodDiarySnapshot.empty) {
//             console.log("No matching documents.");
//             return;
//         }

//         const foodDiaryDoc = foodDiarySnapshot.docs[0];
//         const foodDiaryData = foodDiaryDoc.data();
        
//         const differences = {
//             calories: newTotals.calories - previousTotals.calories,
//             carbs: newTotals.carbs - previousTotals.carbs,
//             fats: newTotals.fats - previousTotals.fats,
//             protein: newTotals.protein - previousTotals.protein,
//         };

//         const newTotalsData = {
//             calories: fixN(foodDiaryData?.totals.calories + differences.calories),
//             carbs: fixN(foodDiaryData?.totals.carbs + differences.carbs),
//             fats: fixN(foodDiaryData?.totals.fats + differences.fats),
//             protein: fixN(foodDiaryData?.totals.protein + differences.protein),
//         };

//         await updateDoc(foodDiaryDoc.ref, {totals: newTotalsData});

//     } catch (error) {
//         console.error("Error updating meal totals:", error);
//     }
// }

// // Update the totals of a meal in the food diary. Called upon editing a meal's food
// const updateMealTotals = async (date: string, idMeal: string, previousFoodData: mealMacroTotals, newValues: mealMacroTotals ) => {
//     const user = getLoggedUser().split('@')[0];
//     try {
//         const foodDiaryQuery = query(
//             collection(db, "users", user, "foodDiary"),
//             where("date", "==", date)
//         );
//         const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
//         if (foodDiarySnapshot.empty) {
//             console.log("No matching documents.");
//             return;
//         }

//         const foodDiaryDoc = foodDiarySnapshot.docs[0];
//         const docId = foodDiaryDoc.id;
//         const mealsCollectionRef = collection(db, "users", user, "foodDiary", docId, "meals");
//         const mealRef = doc(mealsCollectionRef, idMeal);
//         // const mealFoodsCollectionRef = collection(db, "users", user, "foodDiary", docId, "mealsFoods");
//         // const mealFoodsQuery = query(mealFoodsCollectionRef, where("idMeal", "==", idMeal));
//         // const mealFoodsSnapshot = await getDocs(mealFoodsQuery);
        
//         // let newTotals = {calories: 0, carbs: 0, fats: 0, protein: 0};
//         // mealFoodsSnapshot.forEach((foodDoc) => {
//         //     const foodData = foodDoc.data() as Food;
//         //     newTotals.calories += foodData.calories;
//         //     newTotals.carbs += foodData.macroNutrients.carbs;
//         //     newTotals.fats += foodData.macroNutrients.fats;
//         //     newTotals.protein += foodData.macroNutrients.protein;
//         // });

//         const mealDoc = await getDoc(mealRef);
//         const mealData = mealDoc.data();
        
//         const differences = {
//             calories: newValues.calories - previousFoodData.calories,
//             carbs: newValues.carbs - previousFoodData.carbs,
//             fats: newValues.fats - previousFoodData.fats,
//             protein: newValues.protein - previousFoodData.protein,
//         };
        
//         const newTotals = {
//             calories: fixN(mealData?.totals.calories + differences.calories),
//             carbs: fixN(mealData?.totals.carbs + differences.carbs),
//             fats: fixN(mealData?.totals.fats + differences.fats),
//             protein: fixN(mealData?.totals.protein + differences.protein),
//         };
//         console.log(newTotals);
//         updateFoodDiaryTotals(date, mealData?.totals, newTotals);
//         await updateDoc(mealRef, {totals: newTotals});

//     } catch (error) {
//         console.error("Error updating meal totals:", error);
//     }
// }

// Edit a meal food in the food diary
const editMealFood = async (date: string, idMealsFoods: string, quantity: number) => {
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

        const previousFoodData = { calories: foodData.calories, carbs: fM.carbs, fats: fM.fats, protein: fM.protein };
        const newValues = { calories: newCalories, carbs: newCarbs, fats: newFats, protein: newProtein };

        await setDoc(mealFoodRef, newFoodData);

        //updateMealTotals(date, foodData.idMeal, previousFoodData, newValues);
    } catch (error) {
        console.error("Error editing meal:", error);
    }
};

// PUBLIC FUNCTIONS

// Edit a meal in the food diary
export const saveFoodDiary = async (date: string, meals: Meal[]) => {    
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
        const mealsFoodsCollectionRef = collection(db, "users", user, "foodDiary", docId, "mealsFoods");
        
        // Update each meal in the food diary
        // In firebase the atribute foods of meal is a reference to a document of mealsFoods collection
        // The mealsFoods collection has the food data
        // in Meal type, foods is an array of Food type, not DocumentReference
        // So we need to update the mealsFoods collection with the new values of the foods
        // And then update the meals collection with the new values of the meals, keeping the references to the foods documents

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

// export const getFoodDiaryTotals = async (date: string): Promise<mealMacroTotals> => {
//     const user = getLoggedUser().split('@')[0];
//     try {
//         const foodDiaryQuery = query(
//             collection(db, "users", user, "foodDiary"),
//             where("date", "==", date)
//         );
//         const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
//         if (foodDiarySnapshot.empty) {
//             console.log("No matching documents.");
//             return { calories: 0, carbs: 0, fats: 0, protein: 0 };
//         }

//         const foodDiaryDoc = foodDiarySnapshot.docs[0];
//         const foodDiaryData = foodDiaryDoc.data();
        
//         return {
//             calories: foodDiaryData?.totals.calories ?? 0,
//             carbs: foodDiaryData?.totals.carbs ?? 0,
//             fats: foodDiaryData?.totals.fats ?? 0,
//             protein: foodDiaryData?.totals.protein ?? 0,
//         };

//     } catch (error) {
//         console.error("Error fetching meals:", error);
//         return { calories: 0, carbs: 0, fats: 0, protein: 0};
//     }
// };

export const getMealsOfDay = async (date: string): Promise<MealsOfDayResult> => {
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
export const addNewBlankMeal = async (date: string, mealTitle: string = '') => {
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