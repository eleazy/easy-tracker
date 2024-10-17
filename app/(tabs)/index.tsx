import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ScrollView, Pressable, Text, FlatList, Dimensions } from "react-native";
import { useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import CalendarView from "@/components/CalendarView";
import { Colors } from "@/constants/Colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import { getMealsOfDay, addNewBlankMeal } from "@/firebase/dataHandling";
import { Meal, mealMacroTotals, macrosDisplayShort } from "@/types/general";
import { saveFoodDiary } from "@/firebase/dataHandling";
import { getTodayString, fixN, AddOrSubDay } from "@/utils/helperFunctions";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function HomeScreen() {
  
  const colorScheme = useColorScheme() ?? 'dark';
  const [ meals, setMeals ] = useState<Meal[]>([]);
  const [ foodDiaryDay, setFoodDiaryDay ] = useState<string>(getTodayString());
  const [ macroTotals, setMacroTotals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});
  const [ hasChanges, setHasChanges ] = useState<boolean>(false);
  const [ showCalendar, setShowCalendar ] = useState<boolean>(false);
  //console.log('index loaded');

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
    setHasChanges(false);
  };

  const changeDate = (offset: number) => {
    const newStringDate = AddOrSubDay(foodDiaryDay, offset);
    setFoodDiaryDay(newStringDate);
  };
  
  return (
    <View style={styles.outerView}>

      { showCalendar && <CalendarView setShowCalendar={setShowCalendar} foodDiaryDay={foodDiaryDay} setFoodDiaryDay={setFoodDiaryDay} /> }

      {/* One day back or forth */}
      <View style={styles.calendarOuter}>
        <View style={styles.datePickerOuter}>
          <Pressable onPress={() => changeDate(-1)}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </Pressable>

          <Text style={[{ color: Colors[colorScheme].text }, styles.diaryTitle]}>{foodDiaryDay}</Text>

          <Pressable onPress={() => changeDate(1)}>
            <Ionicons name="arrow-forward" size={24} color={Colors[colorScheme].text} />
          </Pressable>
        </View>

        <AntDesign name="calendar" size={24} color="white" onPress={() => setShowCalendar(true)}/>
      </View>

      <View style={styles.indexOuter} >
        {/* Macro Totals */}
        <View style={styles.diaryHeader}>

          <View style={styles.diaryTitleOuter}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.diaryCalories]}>{macroTotals.calories} kcal </Text>
          </View>
          
          <View style={styles.diaryTotalsOuter}>
            {['carbs', 'fats', 'protein'].map((macro, i) => (
              <View key={macro} style={styles.diaryMacros}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.diaryMacroValue]}>
                  {macroTotals[macro as keyof typeof macroTotals]} g
                </Text>            

                <Text style={[{ color: Colors[colorScheme].text }, styles.diaryMacroType]}>
                  {macrosDisplayShort[macro as keyof typeof macrosDisplayShort]}
                </Text>            
              </View>
            ))}
          </View>

        </View>

        <FlatList
          data={meals}
          keyExtractor={(meal) => meal.id.toString()}
          contentContainerStyle={{ paddingBottom: 125 }}
          renderItem={({ item, index }) => (
            <MealCard key={item.id} meal={item} mealIndex={index} meals={meals} setMeals={setMeals} setHasChanges={setHasChanges} />
          )}

          ListFooterComponent={() => (            
            <Pressable 
              // Add More Meals icon 
              onPress={ async () => {
                await addNewBlankMeal(foodDiaryDay);
                const updatedMeals = await getMealsOfDay(foodDiaryDay);
                setMeals(updatedMeals);
              }}
              style={styles.addMealBtn}
            >
              <Ionicons name="add-circle" size={30} color={Colors.dark.mealTitleC}/>
            </Pressable>
          )}
        />

      </View>
      
      {hasChanges && (
        <Pressable style={styles.saveBtn} onPress={() => saveAll()}>
          <Text style={[{ color: Colors[colorScheme].text }, styles.saveText]}>Salvar</Text>
        </Pressable>
      )}
    </View>
  );
}

const vh = Dimensions.get('window').height;
const vw = Dimensions.get('window').width;

const styles = StyleSheet.create({
  outerView: {
    flex: 1,
    //position: 'relative',
    backgroundColor: Colors.dark.background,
    marginTop: 27,    
  },
  datePickerOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  calendarOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,    
    paddingBottom: 5,
    paddingHorizontal: 10,
  },
  indexOuter: {
    padding: 6,
    //display: 'flex',
  },
  diaryHeader: {    
    width: '100%',
    marginBottom: 10,
  },
  diaryTitleOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center', 
  },
  diaryTitle: {
    fontSize: vh * 0.023,
    fontWeight: 'bold',
    color: Colors.dark.mealTitleC,
  },
  diaryCalories: {
    fontSize: vh * 0.024,
    fontWeight: 'bold',
  },
  diaryTotalsOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,    
    backgroundColor: Colors.dark.diaryTotalsBG,
  },
  diaryMacros: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,    
    alignItems: 'baseline',
  },
  diaryMacroValue: {
    fontSize: vh * 0.022,
    fontWeight: 'bold',
  },
  diaryMacroType: {
    fontSize: vh * 0.019,
  },
  addMealBtn: {
    display: 'flex',
    alignItems: 'center',
    marginVertical: 10,
  },
  saveText: {
    color: 'white',
    fontSize: vh * 0.024,
    paddingVertical: vh * 0.016,
    fontWeight: 'bold',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: Colors.dark.saveBtnBG,
    display: 'flex',    
    alignItems: 'center',  
    position: 'absolute',
    bottom: 0,
  },
});