import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Meal, Food, mealMacroTotals } from '@/types/general';
import { fixN } from '@/utils/helperFunctions';
import { getMealFoods, editMealFood, getTacoTableFoods } from '@/firebase/dataHandling';

const MealCard = ( {meal}: { meal: Meal } ) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [foods, setFoods] = useState<Food[]>([]);
  const [mealTotals, setMealTotals] = useState<mealMacroTotals>(meal.totals);

  useEffect(() => {
    // Fetch and set the foods data
    getMealFoods(meal.foods)
      .then((foodsData) => {
        setFoods(foodsData);        
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const changeQuantity = (i:number, value: string) => {
    // change quantity of a food in a meal
    // update meal in firebase    
    // update totals in firebase
    // trigger onSnapshot in parent component    
    // editMealFood('2024-08-28', foods[i].id, parseInt(value));
    
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity) || newQuantity <= 0) return;
    
    // Update meal in state
    setFoods((prevFoods) => {
      const newFoods = [...prevFoods];
      const oldQuantity = newFoods[i].quantity;
      const fM = newFoods[i].macroNutrients;

      newFoods[i].quantity = newQuantity;

      newFoods[i].macroNutrients.carbs = fixN((fM.carbs / oldQuantity) * newQuantity);
      newFoods[i].macroNutrients.fats = fixN((fM.fats / oldQuantity) * newQuantity);
      newFoods[i].macroNutrients.protein = fixN((fM.protein / oldQuantity) * newQuantity);

      // (carbs and protein = 4 kcal per gram, fats = 9 kcal per gram)
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
      setMealTotals(newTotals);

      return newFoods;
    });

  } 
    
  return (
    <View style={styles.container}>
      <Text style={[{ color: Colors[colorScheme].text }, styles.text, styles.mealHeader]}>
        {meal.title} - {mealTotals.calories} kcal - {mealTotals.carbs}g C - {mealTotals.fats}g F - {mealTotals.protein}g P
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
    color: 'red',
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  foodDiv: {  
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
});

export default MealCard
