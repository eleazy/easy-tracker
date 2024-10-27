import React, { useEffect, useState } from "react";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Pressable, Text, Dimensions, useColorScheme } from "react-native";
import MealCard from "@/components/MealCard";
import CalendarView from "@/components/CalendarView";
import { Colors } from "@/constants/Colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import { getMealsOfDay, addNewBlankMeal, getDailyGoals } from "@/firebase/dataHandling";
import { Meal, mealMacroTotals, macrosDisplayShort } from "@/types/typesAndInterfaces";
import { saveFoodDiary } from "@/firebase/dataHandling";
import { getTodayString, fixN, AddOrSubDay, ydmDate, getPercentual } from "@/utils/helperFunctions";
import AntDesign from '@expo/vector-icons/AntDesign';
import Foundation from '@expo/vector-icons/Foundation';

const vh = Dimensions.get('window').height;

export default function HomeScreen() {
  
  const colorScheme = useColorScheme() ?? 'dark';
  const [ meals, setMeals ] = useState<Meal[]>([]);
  const [ foodDiaryDay, setFoodDiaryDay ] = useState<string>(getTodayString());
  const [ macroTotals, setMacroTotals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});
  const [ hasChanges, setHasChanges ] = useState<boolean>(false);
  const [ showCalendar, setShowCalendar ] = useState<boolean>(false);
  const [ showGoalProgress, setShowGoalProgress ] = useState<boolean>(false);
  const [ dailyGoals, setDailyGoals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});
  //console.log('index loaded');

  useEffect(() => {
    getMealsOfDay(foodDiaryDay)
      .then((meals) => {
        const sortedMeals = meals.sort((a, b) => a.mealPosition - b.mealPosition);
        setMeals(sortedMeals);
      })
      .catch((error) => console.error(error));

    getDailyGoals(foodDiaryDay)
      .then((goals) => {console.log(goals); setDailyGoals(goals)})
      .catch((error) => console.error(error));
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

    const sortedMeals = meals.sort((a, b) => a.mealPosition - b.mealPosition);
    setMeals(sortedMeals);
    
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

  const renderMealCard = ({ item, drag, isActive }: { item: Meal, drag: () => void, isActive: boolean }) => {
    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          style={{ opacity: 1 }}
        >
          <MealCard
            meal={item}
            mealIndex={meals.findIndex((m) => m.id === item.id)}
            meals={meals}
            setMeals={setMeals}
            setHasChanges={setHasChanges}
          />
        </Pressable>
      </ScaleDecorator>
    );
  };
  
  const calorieGoalPercentual = getPercentual(macroTotals.calories, 1, dailyGoals.calories);
  const calorieGoalTextColor = Number(calorieGoalPercentual) > 100 ? '#ff8080' : Colors.dark.mealTitleC;

  return (
    <GestureHandlerRootView>
      <View style={styles.outerView}>

        { showCalendar && <CalendarView setShowCalendar={setShowCalendar} foodDiaryDay={foodDiaryDay} setFoodDiaryDay={setFoodDiaryDay} /> }

        {/* One day back or forth */}
        <View style={styles.calendarOuter}>
          <View style={styles.datePickerOuter}>
            <Pressable onPress={() => changeDate(-1)}>
              <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
            </Pressable>

            <Text style={[{ color: Colors[colorScheme].text }, styles.diaryTitle]}>{ydmDate(foodDiaryDay)}</Text>

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
              <Foundation
                name="graph-pie"
                size={22}
                color={!showGoalProgress ? Colors[colorScheme].text : Colors.dark.mealTitleC}
                style={{ opacity: 0.8 }}
                onPress={() => setShowGoalProgress(!showGoalProgress)}
              />
              <Text style={[{ color: Colors[colorScheme].text, marginLeft: 4 }, styles.diaryCalories]}>{macroTotals.calories}</Text>
              <Text style={[{ color: Colors[colorScheme].text, marginLeft: 2 }, styles.diaryCaloriesKcal]}>kcal</Text>
              { showGoalProgress &&                
                <View style={styles.diaryTitleOuter}>
                  <Text style={[{ color: calorieGoalTextColor }, styles.calorieGoalPerc]}>{calorieGoalPercentual}</Text>
                  <Text style={[{ color: Colors[colorScheme].text, opacity: 0.7 }, styles.calorieGoalMiddle]}>% de</Text>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.calorieGoalValue]}>{dailyGoals.calories}</Text>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.calorieGoalKcal]}>kcal</Text>
                </View>
              }
            </View>
            
            <View style={styles.diaryTotalsOuter}>
              {['carbs', 'fats', 'protein'].map((macro, i) => (
                <View key={macro} style={styles.diaryMacros}>
                  <View style={styles.diaryMacrosGram}>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.diaryMacroValue]}>{macroTotals[macro as keyof typeof macroTotals]}</Text>            
                    <Text style={[{ color: Colors[colorScheme].text, opacity: 0.9 }, styles.diaryMacroType]}>g</Text>
                  </View>                                     

                  <Text style={[{ color: Colors[colorScheme].text }, styles.diaryMacroType]}>
                    {macrosDisplayShort[macro as keyof typeof macrosDisplayShort]}
                  </Text>            
                </View>
              ))}
            </View>

            { showGoalProgress && 
              <View style={styles.progressOuter}>
                {['carbs', 'fats', 'protein'].map((macro, i) => {
                  const percentual = getPercentual(macroTotals[macro as keyof typeof macroTotals], 1, dailyGoals[macro as keyof typeof dailyGoals]);
                  const percTextColor = Number(percentual) > 100 ? '#ff8080' : Colors.dark.mealTitleC;
                  return (
                    <View key={macro} style={styles.diaryMacros}>

                      <View style={styles.diaryMacrosGram}>
                        <Text style={[{ color: percTextColor }, styles.diaryGoalPerc]}>{percentual}</Text>
                        <Text style={[{ color: Colors[colorScheme].text, opacity: 0.9 }, styles.diaryGoalMiddle]}>% de</Text>
                        <Text style={[{ color: Colors.dark.mealTitleC }, styles.diaryGoalValue]}>{dailyGoals[macro as keyof typeof macroTotals]}</Text>            
                      </View>                                     
                      
                    </View>
                  )
                })}
              </View>
            }

          </View>

          <DraggableFlatList
            data={meals}
            keyExtractor={(item) => item.id.toString()}
            onDragEnd={({ data }) => {
              setMeals(data.map((meal, i) => ({ ...meal, mealPosition: i })));
              setHasChanges(true);
            }}
            renderItem={renderMealCard}
            contentContainerStyle={{ paddingBottom: vh * 0.3 }}
            ListFooterComponent={() => (
              <Pressable
                onPress={async () => {
                  await addNewBlankMeal(foodDiaryDay, "Refeição", meals.length);
                  const updatedMeals = await getMealsOfDay(foodDiaryDay);
                  setMeals(updatedMeals);
                }}
                style={styles.addMealBtn}
              >
                <Ionicons name="add-circle" size={30} color={Colors.dark.mealTitleC} />
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
    </GestureHandlerRootView>
  );
}

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
    gap: 4,
    alignItems: 'flex-end', 
  },  
  diaryTitle: {
    fontSize: vh * 0.022,
    fontWeight: 'bold',
    color: Colors.dark.mealTitleC,
  },
  diaryCalories: {
    fontSize: vh * 0.024,
    fontWeight: 'bold',
  },
  diaryCaloriesKcal: {
    fontSize: vh * 0.023,
    color: 'gray'
  },
  calorieGoalPerc: {
    fontSize: vh * 0.021,
    fontWeight: 'bold',
  },
  calorieGoalMiddle: {
    fontSize: vh * 0.018,
  },
  calorieGoalValue: {
    fontSize: vh * 0.021,
    fontWeight: 'bold',
  },
  calorieGoalKcal: {
    fontSize: vh * 0.018,
    color: 'gray'
  },  
  diaryTotalsOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,    
    backgroundColor: Colors.dark.diaryTotalsBG,
  },
  progressOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 6,    
    borderWidth: 2,
    borderColor: Colors.dark.diaryTotalsBG,
  },
  diaryMacrosGram: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,    
    alignItems: 'baseline',
  },
  diaryMacros: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,    
    alignItems: 'baseline',
  },
  diaryMacroValue: {
    fontSize: vh * 0.023,
    fontWeight: 'bold',
  },
  diaryMacroType: {
    fontSize: vh * 0.019,
  },
  diaryGoalPerc: {
    fontSize: vh * 0.021,
    fontWeight: 'bold',
  },
  diaryGoalMiddle: {
    fontSize: vh * 0.018,
  },
  diaryGoalValue: {
    fontSize: vh * 0.021,
    fontWeight: 'bold',
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