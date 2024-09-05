import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Meal, Food } from '@/types/general';
import { getMealFoods, editMeal, getTacoTableFoods } from '@/firebase/dataHandling';

const MealCard = ( {meal}: { meal: Meal } ) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    // Fetch and set the foods data    
    const fetchFoods = async () => {
      const foodsData = await getMealFoods(meal.foods);
      setFoods(foodsData);
      //console.log(foodsData);
    };
    fetchFoods();
  }, []);

  const changeQuantity = (index:number, value: string) => {
    // change quantity of a food in a meal
    // update meal in firebase
    // update meal in state
    // update totals in state
    // update totals in firebase
    // trigger onSnapshot in parent component
    
    // const newFoods = [...foods];
    // const q = parseInt(value);
    // const oldQ = foods[index].quantity;
    // const fM = foods[index].macroNutrients;
    // newFoods[index].quantity = q;
    // newFoods[index].macroNutrients.carbs = fM.carbs / oldQ * q;
    // newFoods[index].macroNutrients.fats = fM.fats / oldQ * q;
    // newFoods[index].macroNutrients.protein = fM.protein / oldQ * q;
    // newFoods[index].calories = foods[index].calories / oldQ * q;       

    // const newMeal = {...meal};
    // //newMeal.foods = newFoods;
    // newMeal.totals.calories = newFoods.reduce((acc, food) => acc + food.calories, 0);
    // newMeal.totals.carbs = newFoods.reduce((acc, food) => acc + food.macroNutrients.carbs, 0);
    // newMeal.totals.fats = newFoods.reduce((acc, food) => acc + food.macroNutrients.fats, 0);
    // newMeal.totals.protein = newFoods.reduce((acc, food) => acc + food.macroNutrients.protein, 0);

    // editMeal('2024-08-28', newMeal);

    // CONTINUE FROM HERE, THIS FUNCTION IS NOT COMPLETE
  } 
    
  return (
    <View style={styles.container}>
      <Text style={[{ color: Colors[colorScheme].text }, styles.text]}>
        {meal.title} - {meal.totals.calories} kcal - {meal.totals.carbs}g C - {meal.totals.fats}g F - {meal.totals.protein}g P
      </Text>      
      
      {/* ontouch will be input for quantity */}
      {/* display each food of meal and its macros */}      

      {foods.map((food, i) => (
        <View key={i}>
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
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
  }
});

export default MealCard
