import React, { useEffect, useState, useRef } from "react";
import { Image, StyleSheet, View, ScrollView, Pressable, Text } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import { Colors } from "@/constants/Colors";
import { DocumentReference, DocumentData, doc, onSnapshot } from 'firebase/firestore';
import { getMealsOfDay, addNewBlankMeal, deleteAllMealsButOne, getMealFoods } from "@/firebase/dataHandling";
import { Food, Meal, mealMacroTotals } from "@/types/general";
import { saveFoodDiary, saveFoodsToMeal } from "@/firebase/dataHandling";
import { getTodayString } from "@/utils/helperFunctions";

export default function HomeScreen() {
  
  const colorScheme = useColorScheme() ?? 'dark';
  const [ meals, setMeals ] = useState<Meal[]>([]);
  const [ foodDiaryDay, setFoodDiaryDay ] = useState<string>(getTodayString());
  const [ macroTotals, setMacroTotals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});
  
  useEffect(() => {   
    //deleteAllMealsButOne(foodDiaryDay);

    // this gets the meals of the day
    // return object {mealsData: [], foodDiaryDoc: ''}
    getMealsOfDay(foodDiaryDay)
      .then( async (data) => {
        const mealsData = data.mealsData as DocumentData[];
        const mappedMeals: Meal[] = await Promise.all(  
          mealsData.map(async (fbMeal: DocumentData) => {
            try {
              const foodsData = await getMealFoods(fbMeal.foods);
              let totalsOfMeal = {calories: 0, carbs: 0, fats: 0, protein: 0};
              foodsData.forEach((food) => {
                totalsOfMeal.calories += food.calories;
                totalsOfMeal.carbs += food.macroNutrients.carbs;
                totalsOfMeal.fats += food.macroNutrients.fats;
                totalsOfMeal.protein += food.macroNutrients.protein;
              });
              
              const meal: Meal = {
                foods: foodsData as Food[],
                id: fbMeal.id,
                mealPosition: fbMeal.mealPosition,
                title: fbMeal.title,
                totals: totalsOfMeal,
              };
              return meal;
            } catch (error) {
              console.error(error);
              return {foods: [], id: '', mealPosition: 0, title: '', totals: {calories: 0, carbs: 0, fats: 0, protein: 0}};
            }
          })
        );
      
        setMeals(mappedMeals.filter(meal => meal !== null));      
      })
      .catch((error) => { console.error(error); });
  }, []);

  useEffect(() => {
    // Update totals in state when a MealCard sets meals
    let newTotals = {calories: 0, carbs: 0, fats: 0, protein: 0};
    meals.forEach((meal) => {        
      newTotals.calories += meal.totals.calories;
      newTotals.carbs += meal.totals.carbs;
      newTotals.fats += meal.totals.fats;
      newTotals.protein += meal.totals.protein;
    });
    
    setMacroTotals(newTotals);
  }, [meals]);

  const saveAll = () => {

    // Continue here
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
      <Pressable style={styles.titleContainer} onPress={() => addNewBlankMeal(foodDiaryDay)}>
        <svg height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle> </g></svg>        
      </Pressable>

      <Pressable style={styles.saveBtn} onPress={() => saveAll}>
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