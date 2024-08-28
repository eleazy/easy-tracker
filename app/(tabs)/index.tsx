import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ScrollView } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import { Colors } from "@/constants/Colors";
import { mealsOfTheDay } from "@/firebase/dataHandling";
import { Timestamp } from "firebase/firestore";

interface foodProp {  
    caloreis: number;
    macroNutrients: {
      protein: number;
      carbs: number;
      fat: number;
    };
    quantity: number;
    title: string;
};

interface mealProps {
  foods: foodProp;
  mealPosition: number;
  title: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function HomeScreen() {

  const [meals, setMeals] = useState<mealProps[]>([]);

  useEffect(() => {
    mealsOfTheDay(new Date())
      .then((meals) => {
        console.log(meals);
        setMeals(meals);
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
        <MealCard />
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
