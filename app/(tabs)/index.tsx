import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import { Colors } from "@/constants/Colors";
import { DocumentReference, DocumentData, doc, onSnapshot } from 'firebase/firestore';
import { getMealsOfDay, addNewMeal } from "@/firebase/dataHandling";
import { db } from "@/firebase/firebaseConfig";
import { getTodayString } from "@/utils/helperFunctions";
import { Meal } from "@/types/general";

export default function HomeScreen() {

  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodDiaryDay, setFoodDiaryDay] = useState<string>(getTodayString());
  const [foodDiaryDoc, setFoodDiaryDoc] = useState<string>('');

  useEffect(() => {   
    // this gets the meals of the day
    // return object {mealsData: [], foodDiaryDoc: ''}
    getMealsOfDay('2024-08-28')
      .then(( data ) => {
        const mealsData = data.mealsData as DocumentData[];
        const mappedMeals: Meal[] = mealsData.map((meal: DocumentData) => ({
          foods: meal.foods || [], 
          mealPosition: meal.mealPosition || 0,
          title: meal.title || '',
          totals: meal.totals || {
            calories: 0,
            carbs: 0,
            fats: 0,
            protein: 0,
          },
        }));
        //console.log(mappedMeals);
        setMeals(mappedMeals);

        const foodDiaryDoc = data.foodDiaryDoc as string;
        setFoodDiaryDoc(foodDiaryDoc);
      })
      .catch((error) => {
        console.error(error);
      });      
  }, []);

  if (!foodDiaryDoc) {
    return (
      <View><Text>Loading...</Text></View>
    );
  }

  onSnapshot(doc(db, "users", "eleazysoares.08", "foodDiary", foodDiaryDoc), (doc) => {
      console.log("Food Diary changed ", doc.data().totals);      
  });

  return (
    // Página inicial do aplicativo
    // Card de cada refeição

    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      {meals.map((meal) => (
        <MealCard meal={meal} key={meal.title} />
      ))}

      {/* Add More Meals icon */}
      <TouchableOpacity style={styles.titleContainer} onPress={() => addNewMeal('2024-08-28')}>
        <svg height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>
        
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});