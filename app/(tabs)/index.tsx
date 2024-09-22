import React, { useEffect, useState, useRef } from "react";
import { Image, StyleSheet, View, ScrollView, Pressable, Text } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import { Colors } from "@/constants/Colors";
import { getMealsOfDay, addNewBlankMeal, deleteAllMealsButOne } from "@/firebase/dataHandling";
import { Food, Meal, mealMacroTotals } from "@/types/general";
import { saveFoodDiary } from "@/firebase/dataHandling";
import { getTodayString, fixN } from "@/utils/helperFunctions";

export default function HomeScreen() {
  
  const colorScheme = useColorScheme() ?? 'dark';
  const [ meals, setMeals ] = useState<Meal[]>([]);
  const [ foodDiaryDay, setFoodDiaryDay ] = useState<string>(getTodayString());
  const [ macroTotals, setMacroTotals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});
  // console.log('index loaded');

  useEffect(() => {    
    getMealsOfDay(foodDiaryDay)
      .then( async (meals) => { 
        setMeals(meals);
      })
      .catch((error) => { console.error(error); });
  }, [foodDiaryDay]);

  useEffect(() => {
    // Update totals in state when a MealCard sets meals
    let newTotals = {calories: 0, carbs: 0, fats: 0, protein: 0};
    meals.forEach((meal) => {        
      newTotals.calories += meal.totals.calories;
      newTotals.carbs += meal.totals.carbs;
      newTotals.fats += meal.totals.fats;
      newTotals.protein += meal.totals.protein;      
    });
    (['calories', 'carbs', 'fats', 'protein'] as (keyof typeof newTotals)[]).forEach((key) => {
      newTotals[key] = fixN(newTotals[key]);
    });
    
    setMacroTotals(newTotals);
  }, [meals]);

  const saveAll = () => {
    saveFoodDiary(foodDiaryDay, meals);
  };
  
  return (
    // Página inicial do aplicativo
    // Card de cada refeição

    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Macro Totals */}
      <View style={styles.titleContainer}>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals.calories} kcal
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals.carbs} C
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals.fats} F
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals.protein} P
        </Text>
      </View>

      {meals.map((meal, i) => (
        <MealCard key={i} meal={meal} mealIndex={i} meals={meals} setMeals={setMeals} macroTotals={macroTotals} setMacroTotals={setMacroTotals} />
      ))}

      {/* Add More Meals icon */}
      <Pressable style={styles.titleContainer} onPress={ async () => {
        await addNewBlankMeal(foodDiaryDay);
        const updatedMeals = await getMealsOfDay(foodDiaryDay);
        setMeals(updatedMeals);
      }}>
        <svg height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle> </g></svg>        
      </Pressable>

      <Pressable style={styles.saveBtn} onPress={() => saveAll()}>
        <Text style={[{ color: Colors[colorScheme].text }, styles.saveText]}>Save</Text>
      </Pressable>
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
  saveText: {
    color: 'lightblue',
    fontSize: 16,
    padding: 7,
    fontWeight: 'bold',
  },
  saveBtn: {
    width: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',    
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginLeft: 20,
    display: 'flex',
  },
});