import { db } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc } from "firebase/firestore";


export const mealsOfTheDay = async (date) => {
    try {
        // Query the foodDiary collection to find the document with the given date
        const foodDiaryQuery = query(
            collection(db, "users", "eleazysoares.08", "foodDiary"),
            where("date", "==", date)
        );
        const foodDiarySnapshot = await getDocs(foodDiaryQuery);
        
        if (foodDiarySnapshot.empty) {
            console.log("No matching documents.");
            return [];
        }

        let meals = [];

        // Assuming there's only one document with the given date, we fetch the first one
        foodDiarySnapshot.forEach(async (foodDiaryDoc) => {
            // Get the document ID
            const docId = foodDiaryDoc.id;
            
            // Fetch the meals subcollection for the document
            const mealsCollectionRef = collection(db, "users", "eleazysoares.08", "foodDiary", docId, "meals");
            const mealsSnapshot = await getDocs(mealsCollectionRef);

            // Extract data from meals
            mealsSnapshot.forEach((mealDoc) => {
                meals.push(mealDoc.data());
            });
        });

        return meals;

    } catch (error) {
        console.error("Error fetching meals:", error);
        return [];
    }
};