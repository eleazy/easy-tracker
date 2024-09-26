import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Food, MealCardProps, macrosDisplay, macrosDisplayShort } from '@/types/general';
import { fixN } from '@/utils/helperFunctions';
import FoodSelection from "@/components/FoodSelection";

const MealCard = ({ meal, mealIndex, meals, setMeals, setHasChanges }: MealCardProps) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [showAddFood, setShowAddFood] = useState<boolean>(false);
  const [foods, setFoods] = useState<Food[]>(meal.foods);

  const changeQuantity = (i:number, value: string) => {
    // change quantity of a food in a meal    
    const newQuantity = parseInt(value);
    // Set food quantity to 0 to remove it from meal
    // Foods with quantity 0 are not displayed
    // And they will be deleted in next save, both their DocumentReference in meal.foods and their Document in mealsFoods
    if (isNaN(newQuantity) || newQuantity < 0) return;
    
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
      setHasChanges(true);
      console.log(newFoods);
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
      setHasChanges(true);
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
      {foods.map(( food, i ) => {
        if (food.quantity == 0) return;

        return (
          <View key={food.id} style={styles.foodOuter}>
  
            <View style={styles.foodTitleOuter}>
              {showAddFood && 
                <Ionicons name="remove-circle-outline" size={24} color={Colors.dark.mealTitleC}  onPress={() => changeQuantity(i, "0")}></Ionicons>
              }
              <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitle]}> {food.title} </Text>
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
  
              <View style={styles.foodKcalOuter}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.foodKcalValue]}> {food.calories}</Text>
                <Text style={[{ color: Colors[colorScheme].text }, styles.foodKcal]}> kcal </Text>
                <TextInput
                  style={[{ color: Colors[colorScheme].text }, styles.quantityInput]}
                  value={food.quantity.toString()}
                  onChangeText={(text) => changeQuantity(i, text)}
                  inputMode="numeric"
                  />
              </View>
            </View>
            
          </View>
        )
      })}  

      <Pressable onPress={() => setShowAddFood(!showAddFood)}>
        <Ionicons name="add-circle-outline" size={32} color="white"></Ionicons>
      </Pressable>

      {showAddFood && <FoodSelection addFoodToMeal={addFoodToMeal} />}
    </View>
  )
}

const vw = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mealCardOuter: {    
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'white',
    borderWidth: 1,
    display: 'flex',
    alignItems: 'center',
  },
  mealHeader: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    paddingBottom: 5,
    width: '100%',
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
    color: Colors.dark.mealTitleC,    
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
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    gap: 8,
    paddingHorizontal: 3,
    marginVertical: 3,
    width: '100%',
  },
  foodTitleOuter: {    
    display: 'flex',
    flexDirection: 'row',    
    alignItems: 'center',
    maxWidth: vw * 0.9,        
    overflow: 'hidden',
  },
  foodTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  quantityInput: {
    width: 50,
    fontSize: 15,
    textAlign: 'center',
    color: Colors.dark.mealTitleC,
  },
  foodKcalOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'space-evenly',
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
