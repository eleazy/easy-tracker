import { db, auth } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, updateDoc, DocumentReference, getDoc } from "firebase/firestore";
import { Food, MealsOfDayResult } from "@/types/general";
import { getLoggedUser } from "@/utils/helperFunctions";

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
    return documentsData.filter((data): data is Food => data !== null); // Type guard to filter null values
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Add a new meal to the food diary in a given day
export const addNewMeal = async (date: string) => {
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
        const newMeal = {
            title: "Refeição",
            foods: [],
            totals: {
                calories: 0,
                carbs: 0,
                fats: 0,
                protein: 0,
            },
        };
        await setDoc(doc(mealsCollectionRef), newMeal);

        // Fetch current totals from the foodDiary document
        const currentTotals = foodDiaryDoc.data().totals;

        const updatedTotals = {
            calories: currentTotals.calories + 0,
            carbs: currentTotals.carbs + 0,
            fats: currentTotals.fats + 0,
            protein: currentTotals.protein + 0,
        };

        await updateDoc(doc(db, "users", user, "foodDiary", docId), {
            totals: updatedTotals,
        });

    } catch (error) {
        console.error("Error adding new meal:", error);
    }
};

