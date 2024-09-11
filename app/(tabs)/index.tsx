import React, { useEffect, useState, useRef } from "react";
import { Image, StyleSheet, View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import { Colors } from "@/constants/Colors";
import { DocumentReference, DocumentData, doc, onSnapshot } from 'firebase/firestore';
import { getMealsOfDay, addNewBlankMeal, deleteAllMealsButOne, getFoodDiaryTotals, getMealFoods } from "@/firebase/dataHandling";
import { db } from "@/firebase/firebaseConfig";
import { getTodayString, getLoggedUser } from "@/utils/helperFunctions";
import { Food, Meal, mealMacroTotals } from "@/types/general";

export default function HomeScreen() {
  const hasMounted = useRef(false);
  const colorScheme = useColorScheme() ?? 'dark';
  const [ meals, setMeals ] = useState<Meal[]>([]);
  // const [ foodDiaryDay, setFoodDiaryDay ] = useState<string>(getTodayString());
  const [ macroTotals, setMacroTotals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});
  
  useEffect(() => {   
    console.log('index useEffect');
    //deleteAllMealsButOne('2024-08-28');

    // this gets the meals of the day
    // return object {mealsData: [], foodDiaryDoc: ''}
    getMealsOfDay('2024-08-28')
      .then( async (data) => {
        const mealsData = data.mealsData as DocumentData[];
        const mappedMeals: Meal[] = await Promise.all(  
          mealsData.map(async (fbMeal: DocumentData) => {
            try {
              const foodsData = await getMealFoods(fbMeal.foods);
              
              const meal: Meal = {
                foods: foodsData as Food[],
                mealPosition: fbMeal.mealPosition,
                title: fbMeal.title,
                totals: fbMeal.totals,
              };
              return meal;
            } catch (error) {
              console.error(error);
              return {foods: [], mealPosition: 0, title: '', totals: {calories: 0, carbs: 0, fats: 0, protein: 0}};
            }
          })
        );
      
        setMeals(mappedMeals.filter(meal => meal !== null));      

        // This works better I think, and its cleaner, but not economic in terms of reads, and I am using free tier firebase
        // const user = getLoggedUser().split('@')[0];
        // onSnapshot(doc(db, "users", user, "foodDiary", data.foodDiaryDoc as string), (doc) => {
        //   // update totals values here
        //   // meals will change in MealCard, which will update the totals of this doc and therefore trigger this onSnapshot
        //   const totals = doc.data()?.totals;
        //   setMacroTotals([totals?.calories || 0, totals?.carbs || 0, totals?.fats || 0, totals?.protein || 0]);
        // });

      })
      .catch((error) => { console.error(error); }); 
      
    getFoodDiaryTotals('2024-08-28').then((totals) => { setMacroTotals(totals); }).catch((error) => { console.error(error); });      
  }, []);

  const saveFoodDiary = (date: string, meals: Meal[]) => {
    // update the food diary with the new state of meals
    // meals is an array of Meal objects
    
    
  }

  useEffect(() => {
    // It cannot run on first render, because meals is empty
    if (hasMounted.current) {
      // Update totals in state when a MealCard sets meals
      let newTotals = {calories: 0, carbs: 0, fats: 0, protein: 0};
      meals.forEach((meal) => {        
        newTotals.calories += meal.totals.calories;
        newTotals.carbs += meal.totals.carbs;
        newTotals.fats += meal.totals.fats;
        newTotals.protein += meal.totals.protein;
      });
      
      setMacroTotals(newTotals);
    } else {
      hasMounted.current = true;
    }
  }, [meals]);
  
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
          {macroTotals.carbs}C
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals.fats}F
        </Text>
        <Text style={{ color: Colors.light.tint, fontSize: 24 }}>
          {macroTotals.protein}P
        </Text>
      </View>

      {meals.map((meal, i) => (
        <MealCard key={i} meal={meal} mealIndex={i} meals={meals} setMeals={setMeals} macroTotals={macroTotals} setMacroTotals={setMacroTotals} />
      ))}

      {/* Add More Meals icon */}
      {/* <TouchableOpacity style={styles.titleContainer} onPress={() => addNewBlankMeal('2024-08-28')}>
        <svg height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>        
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.saveBtn} onPress={() => saveFoodDiary('2024-08-28', meals)}>
        <Text style={[{ color: Colors[colorScheme].text }, styles.saveText]}>Save</Text>
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
  saveText: {
    color: 'lightblue',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: 'rgba(0,0,0,0.1)',    
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginLeft: 20,
    display: 'flex',
  },
});