import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Food, mealMacroTotals, MealCardProps } from '@/types/general';
import { fixN } from '@/utils/helperFunctions';
import { getTacoTableFoods, getCustomFoods } from '@/firebase/dataHandling';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const MealCard = ({ meal, mealIndex, meals, setMeals, macroTotals, setMacroTotals }: MealCardProps) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [showAddFood, setShowAddFood] = useState<boolean>(false);
  const [foods, setFoods] = useState<Food[]>(meal.foods);

  const tacoTableFoods: Food[] = getTacoTableFoods();
  const [customFoods, setCustomFoods] = useState<Food[]>([]);

  useEffect(() => {
    getCustomFoods().then((data: Food[]) => { setCustomFoods(data); });
  }, []);

  const changeQuantity = (i:number, value: string) => {
    // change quantity of a food in a meal    
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity) || newQuantity <= 0) return;
    
    // Update meal in state
    // Here, we update the quantity of the food and with the new quantity recalculate the macros
    setFoods((prevFoods) => {
      const newFoods = [...prevFoods];
      const oldQuantity = newFoods[i].quantity;
      const fM = newFoods[i].macroNutrients;

      newFoods[i].quantity = newQuantity;

      newFoods[i].macroNutrients.carbs = fixN((fM.carbs / oldQuantity) * newQuantity);
      newFoods[i].macroNutrients.fats = fixN((fM.fats / oldQuantity) * newQuantity);
      newFoods[i].macroNutrients.protein = fixN((fM.protein / oldQuantity) * newQuantity);

      // carbs and protein = 4 kcal per gram, fats = 9 kcal per gram
      newFoods[i].calories = fixN(
        newFoods[i].macroNutrients.carbs * 4 +
        newFoods[i].macroNutrients.protein * 4 +
        newFoods[i].macroNutrients.fats * 9
      );        

      // Update totals in state
      let newTotals = {calories: 0, carbs: 0, fats: 0, protein: 0};
      newFoods.forEach((food) => {        
        newTotals.calories += food.calories;
        newTotals.carbs += food.macroNutrients.carbs;
        newTotals.fats += food.macroNutrients.fats;
        newTotals.protein += food.macroNutrients.protein;
      });
      
      // Update meals state in parent component
      const newMeals = [...meals];
      newMeals[mealIndex].foods = newFoods;
      newMeals[mealIndex].totals = newTotals;
      setMeals(newMeals);

      return newFoods;
    });
  }; 

  const addFoodToMeal = (food: Food) => {
    // add a food to a meal
    setFoods((prevFoods) => {
      const newFoods = [...prevFoods];
      newFoods.push(food);

      let newTotals = {calories: 0, carbs: 0, fats: 0, protein: 0};
      newFoods.forEach((food) => {        
        newTotals.calories += food.calories;
        newTotals.carbs += food.macroNutrients.carbs;
        newTotals.fats += food.macroNutrients.fats;
        newTotals.protein += food.macroNutrients.protein;
      });

      // Update meals state in parent component
      const newMeals = [...meals];
      newMeals[mealIndex].foods = newFoods;
      newMeals[mealIndex].totals = newTotals;
      setMeals(newMeals);

      return newFoods;
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={[{ color: Colors[colorScheme].text }, styles.text, styles.mealHeader]}>
        {meal.title} - {meal.totals.calories} kcal - {meal.totals.carbs}g C - {meal.totals.fats}g F - {meal.totals.protein}g P
      </Text>      
      
      {/* ontouch will be input for quantity */}
      {/* display each food of meal and its macros */}

      {foods.map((food, i) => (
        <View key={i} style={styles.foodDiv}>
          <View style={[styles.flex, {marginVertical: 10, marginRight: 10}]}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.text]}>
              {food.title} - 
            </Text>
            <TextInput
              style={[{ color: Colors[colorScheme].text }, styles.text, {width: 50}]}
              value={food.quantity.toString()}
              onChangeText={(text) => changeQuantity(i, text)}
              keyboardType="numeric"
            />               
          </View>             
          <Text style={[{ color: Colors[colorScheme].text }, styles.text, {marginVertical: 10, marginRight: 10}]}>
            {food.calories} kcal - {food.macroNutrients.carbs}g C - {food.macroNutrients.fats}g F - {food.macroNutrients.protein}g P
          </Text>
        </View>
      ))}  

      <Pressable onPress={() => setShowAddFood(!showAddFood)}>
        <svg height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle> </g></svg>        
      </Pressable>

      {showAddFood && (
        <View style={styles.foodList}>
          {tacoTableFoods.map((food, i) => (
            <Pressable key={i} onPress={() => addFoodToMeal(food)}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.text]}>
                {food.title} - {food.calories} kcal - {food.macroNutrients.carbs}g C - {food.macroNutrients.fats}g F - {food.macroNutrients.protein}g P
              </Text>
            </Pressable>
          ))}
          {customFoods.map((food, i) => (
            <Pressable key={i} onPress={() => addFoodToMeal(food)}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.text]}>
                {food.title} - {food.calories} kcal - {food.macroNutrients.carbs}g C - {food.macroNutrients.fats}g F - {food.macroNutrients.protein}g P
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'white',
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  mealHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  foodDiv: {  
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  foodList: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'white',
    borderWidth: 1,
  },  
});

export default MealCard
