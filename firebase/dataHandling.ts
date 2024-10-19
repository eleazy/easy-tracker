import { db } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, updateDoc, arrayUnion, DocumentReference, getDoc, DocumentData } from "firebase/firestore";
import { User } from "firebase/auth";
import tabelaTaco from './tabelaTaco.json';
import { Food, Meal, detailedFood, dailyGoals } from "@/types/typesAndInterfaces";
import { getLoggedUser, fixN, getTodayString, emptyDetailedFood } from "@/utils/helperFunctions";

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
            isCustom: false,
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

// get food with all atributtes on the database or taco table
export const getDetailedFood = async (foodId: string): Promise<detailedFood> => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;

    try {
        const customFoodsCollectionRef = collection(db, "users", user, "customFoods");
        const customFoodDoc = doc(customFoodsCollectionRef, foodId);
        const customFoodData = await fetchFoodData(customFoodDoc);

        if (customFoodData) {
            const customFoodShaped: detailedFood = {
                id: foodId,
                idMeal: '',
                calories: customFoodData.calories,
                macroNutrients: customFoodData.macroNutrients,
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
                title: customFoodData.title,
                isCustom: true,
            };
            return customFoodShaped;
        }

        const tacoFood = Object.values(tabelaTaco).find((food) => food.id === Number(foodId));
        if (tacoFood) {
            const tacoFoodShaped: detailedFood = {
                id: foodId,
                idMeal: '',
                calories: tacoFood.energia ?? 0,
                macroNutrients: {
                    carbs: tacoFood.carboidratos ?? 0,
                    fats: tacoFood.gorduras ?? 0,
                    protein: tacoFood.proteinas ?? 0,
                },
                microNutrients: {
                    saturatedFats: tacoFood.gordurasSaturadas ?? 0,
                    monounsaturatedFats: tacoFood.gordurasMonoinsaturadas ?? 0,
                    polyunsaturatedFats: tacoFood.gordurasPoliinsaturadas ?? 0,
                    dietaryFiber: tacoFood.fibrasAlimentares ?? 0,
                    ash: tacoFood.cinzas ?? 0,
                    calcium: tacoFood.calcio ?? 0,
                    magnesium: tacoFood.magnesio ?? 0,
                    manganese: tacoFood.manganes ?? 0,
                    phosphorus: tacoFood.fosforo ?? 0,
                    iron: tacoFood.ferro ?? 0,
                    sodium: tacoFood.sodio ?? 0,
                    potassium: tacoFood.potassio ?? 0,
                    copper: tacoFood.cobre ?? 0,
                    zinc: tacoFood.zinco ?? 0,
                    thiamine: tacoFood.tiamina ?? 0,
                    pyridoxine: tacoFood.piridoxina ?? 0,
                    niacin: tacoFood.niacina ?? 0,
                    riboflavin: tacoFood.riboflavina ?? 0,
                    vitaminC: tacoFood.vitaminaC ?? 0,
                    RE: tacoFood.RE ?? 0,
                    RAE: tacoFood.RAE ?? 0,
                    cholesterol: tacoFood.colesterol ?? 0,
                    retinol: tacoFood.retinol ?? 0,
                },
                quantity: 100,
                title: tacoFood.alimento ?? '',
                isCustom: false,
            }
            return tacoFoodShaped;
        }
    } catch (error) { console.error("Error fetching detailed food:", error); }
    
    return emptyDetailedFood;
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

export const getTotalCaloriesOfMonth = async (year: number, month: number): Promise<{ [key: string]: string }> => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    const monthString = month < 10 ? `0${month}` : `${month}`;
    const yearMonthString = `${year}-${monthString}`;
    const daysInMonth = new Date(year, month, 0).getDate();

    const totalCalories: { [key: string]: string } = {};

    try {
        const foodDiaryQuery = query(
            collection(db, "users", user, "foodDiary"),
            where("date", ">=", `${yearMonthString}-01`),
            where("date", "<=", `${yearMonthString}-${daysInMonth}`)
        );
        
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);

        // Loop through food diary entries
        for (const doc of foodDiarySnapshot.docs) {
            const foodDiaryId = doc.id;
            const foodDiaryData = doc.data();
            const date = foodDiaryData.date;

            // Fetch meals for the food diary entry
            const mealsFoodColletion = collection(db, "users", user, "foodDiary", foodDiaryId, "mealsFoods");
            const mealsFoodSnapshot = await getDocs(mealsFoodColletion);  // Await here
            
            // Initialize the total for the day if not already
            if (!totalCalories[date]) {
                totalCalories[date] = '0';
            }

            // Sum up the calories for each meal
            mealsFoodSnapshot.forEach((mealFoodDoc) => {
                const mealFoodData = mealFoodDoc.data();
                const mealFoodCalories = mealFoodData.calories || 0;  // Default to 0 if no calories field
                
                totalCalories[date] = String(fixN(Number(totalCalories[date]) + mealFoodCalories));
            });
        }

        return totalCalories;

    } catch (error) {
        console.error("Error fetching total calories of the month:", error);
        return {};
    }
};

export const getDailyGoals = async (): Promise<[dailyGoals, boolean]> => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    try {
        const userDoc = doc(db, "users", user);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();
        return [ userData?.dailyGoals, userData?.gramsGoalSetting ];
    } catch (error) {
        console.error("Error fetching daily goals:", error);
        return [{ calories: 0, carbs: 0, fats: 0, protein: 0 }, true];
    }
};

export const setDailyGoals = async (dailyGoals: dailyGoals): Promise<void> => {
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    try {
        const userDoc = doc(db, "users", user);
        await updateDoc(userDoc, { dailyGoals });
    } catch (error) {
        console.error("Error setting daily goals:", error);
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

export const addCustomFood = async (food: Food): Promise<void> => {
    // Add a new custom food to the user's customFoods collection
    const loggedUser = getLoggedUser();
    const user = loggedUser.uid;
    try {
        const customFoodsCollectionRef = collection(db, "users", user, "customFoods");
        const newFoodRef = doc(customFoodsCollectionRef);
        let foodFB = { ...food, id: newFoodRef.id };
        await setDoc(newFoodRef, foodFB);
    } catch (error) {
        console.error("Error adding custom food:", error);
    }
};

// INITIAL DATABASE LOAD
export const loadInitialData = async ( user: User ) => {
    const defaultGoals: dailyGoals = {
        calories: 2000,
        carbs: 250,
        fats: 60,
        protein: 100,
    };

    // Create a new document in the users collection with the user's UID and email
    // Set the default daily goals for the user
     await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        dailyGoals: defaultGoals,
    });

    // Create collection foodDiary for the user and add a document with today's date
    setDoc(doc(db, "users", user.uid, "foodDiary", getTodayString()), { date: getTodayString() });

    // Add four default blank meals to the food diary
    ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'].forEach(async (mealTitle, i) => {
        addNewBlankMeal(getTodayString(), mealTitle);
    });

 
};