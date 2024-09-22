import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Food, MealCardProps, macrosDisplay, macrosDisplayShort } from '@/types/general';
import { fixN } from '@/utils/helperFunctions';
import FoodSelection from "@/components/FoodSelection";

const MealCard = ({ meal, mealIndex, meals, setMeals, macroTotals, setMacroTotals }: MealCardProps) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [showAddFood, setShowAddFood] = useState<boolean>(false);
  const [foods, setFoods] = useState<Food[]>(meal.foods);

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
    <View style={styles.mealCardOuter}>

      <View style={styles.mealHeader}>

        <View style={styles.mealTitleOuter}>
          <Text style={[{ color: Colors[colorScheme].text }, styles.mealTitle]}> {meal.title} </Text>
          <Text style={[{ color: Colors[colorScheme].text }, styles.mealCalories]}> {meal.totals.calories} kcal  </Text>
        </View>

        <View style={styles.mealMacrosOuter}>
          {Object.keys(meal.totals).slice(1).map((macro, i) => (
            <View key={macro} style={styles.mealMacros}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroValue]}>
                {meal.totals[macro as keyof typeof meal.totals]}g
              </Text>            

              <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroType]}>
                {macrosDisplay[macro as keyof typeof macrosDisplay]}
              </Text>            
            </View>
          ))}
        </View>

      </View>
      
      {/* display each food of meal and its macros */}

      {foods.map((food, i) => (
        <View key={i} style={styles.foodOuter}>

          <View style={styles.foodTitleOuter}>

            <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitle]}> {food.title} </Text>

            <View style={styles.foodKcalOuter}>

              <TextInput
                style={[{ color: Colors[colorScheme].text }, styles.quantityInput]}
                value={food.quantity.toString()}
                onChangeText={(text) => changeQuantity(i, text)}
                inputMode="numeric"
              />  

              <Text style={[{ color: Colors[colorScheme].text }, styles.foodKcalValue]}> {food.calories}</Text>
              <Text style={[{ color: Colors[colorScheme].text }, styles.foodKcal]}> kcal </Text>
            </View>

          </View> 


          <View style={styles.foodMacrosOuter}>
            {Object.keys(food.macroNutrients).map((macro) => (
              <View key={macro} style={styles.foodMacros}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroValue]}>
                  {food.macroNutrients[macro as keyof typeof food.macroNutrients]}g
                </Text>

                <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroType]}>
                  {macrosDisplayShort[macro as keyof typeof macrosDisplayShort]}
                </Text>            
              </View>
            ))}
          </View>
          
        </View>
      ))}  

      <Pressable onPress={() => setShowAddFood(!showAddFood)}>
        <svg height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 12L12 12M12 12L17 12M12 12V7M12 12L12 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle> </g></svg>        
      </Pressable>

      {showAddFood && <FoodSelection addFoodToMeal={addFoodToMeal} />}
    </View>
  )
}

const styles = StyleSheet.create({
  mealCardOuter: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'white',
    borderWidth: 1,
  },
  mealHeader: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  mealTitleOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'orange',    
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealMacrosOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  mealMacros: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,    
    alignItems: 'baseline',
  },
  mealMacroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealMacroType: {
    fontSize: 13,
  },
  foodOuter: {  
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    gap: 5,
    paddingHorizontal: 3,
    marginVertical: 3,
  },
  foodTitleOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 50,
    fontSize: 15,
    textAlign: 'center',
  },
  foodKcalOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  foodKcalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodKcal: {
    fontSize: 13,
    color: 'gray',
  },
  foodMacrosOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  foodMacros: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },


  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
  },
 
});

export default MealCard
