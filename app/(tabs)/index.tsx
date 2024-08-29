import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ScrollView } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import { Colors } from "@/constants/Colors";
import { DocumentReference, DocumentData,  } from 'firebase/firestore';
import { getMealsOfDay } from "@/firebase/dataHandling";
import { getTodayString } from "@/utils/helperFunctions";
import { Meal } from "@/types/general";

export default function HomeScreen() {

  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {   
    getMealsOfDay(getTodayString())
    .then((mealsData: DocumentData[]) => {      
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
    })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
