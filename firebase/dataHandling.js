import { db } from "./firebaseConfig";
import { collection, getDocs, query, where, setDoc, doc, deleteDoc } from "firebase/firestore";


export const mealsOfTheDay = async ( date ) => {
    const q = query(
        collection(db, "users", "eleazysoares.08", "foodDiary"),
        where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    let meals = [];
    querySnapshot.forEach((doc) => {
        meals.push(doc.data());
    });
    return meals;
};