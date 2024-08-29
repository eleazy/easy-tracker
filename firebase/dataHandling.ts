import { db } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, DocumentReference, getDoc } from "firebase/firestore";
import { Food } from "@/types/general";

export const getMealsOfDay = async (date: String) => {
    try {
        const foodDiaryQuery = query(
            collection(db, "users", "eleazysoares.08", "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
        if (foodDiarySnapshot.empty) {
            console.log("No matching documents.");
            return [];
        }
        
        const mealsPromises = foodDiarySnapshot.docs.map(async (foodDiaryDoc) => {
            const docId = foodDiaryDoc.id;
            const mealsCollectionRef = collection(db, "users", "eleazysoares.08", "foodDiary", docId, "meals");
            const mealsSnapshot = await getDocs(mealsCollectionRef);

            return mealsSnapshot.docs.map(mealDoc => mealDoc.data());
        });

        const mealsArrays = await Promise.all(mealsPromises);
        return mealsArrays.flat(); 

    } catch (error) {
        console.error("Error fetching meals:", error);
        return [];
    }
};

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