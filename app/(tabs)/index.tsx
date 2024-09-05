import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import { Colors } from "@/constants/Colors";
import { DocumentReference, DocumentData, doc, onSnapshot } from 'firebase/firestore';
import { getMealsOfDay, addNewBlankMeal, deleteAllMealsButOne } from "@/firebase/dataHandling";
import { db } from "@/firebase/firebaseConfig";
import { getTodayString } from "@/utils/helperFunctions";
import { Meal } from "@/types/general";

export default function HomeScreen() {

  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodDiaryDay, setFoodDiaryDay] = useState<string>(getTodayString());
  const [foodDiaryDoc, setFoodDiaryDoc] = useState<string>('');
  const [macroTotals, setMacroTotals] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {   
    //deleteAllMealsButOne('2024-08-28');

    // this gets the meals of the day
    // return object {mealsData: [], foodDiaryDoc: ''}
    getMealsOfDay('2024-08-28')
      .then(( data ) => {
        const mealsData = data.mealsData as DocumentData[];
        const mappedMeals: Meal[] = mealsData.map((meal: DocumentData) => meal as Meal);
        // console.log(mappedMeals);
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
      // update totals values here
      // meals will be changed in MealCard, which will update the totals of this doc and trigger onSnapshot
      const totals = doc.data()?.totals;
      setMacroTotals([totals?.calories || 0, totals?.carbs || 0, totals?.fats || 0, totals?.protein || 0]);
  });

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
          {macroTotals[0]} kcal
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals[1]}g
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals[2]}g
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals[3]}g
        </Text>
      </View>

      {meals.map((meal, i) => (
        <MealCard meal={meal} key={i} />
      ))}

      {/* Add More Meals icon */}
      {/* <TouchableOpacity style={styles.titleContainer} onPress={() => addNewBlankMeal('2024-08-28')}>
        <svg height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>        
      </TouchableOpacity> */}
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