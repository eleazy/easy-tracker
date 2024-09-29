import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Food, MealCardProps, macrosDisplayShort } from '@/types/general';
import { fixN } from '@/utils/helperFunctions';
import FoodSelection from "@/components/FoodSelection";

const MealCard = ({ meal, mealIndex, meals, setMeals, setHasChanges }: MealCardProps) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [ showAddFood, setShowAddFood ] = useState<boolean>(false);
  const [ foods, setFoods ] = useState<Food[]>(meal.foods);
  const [ quantityInputValue, setQuantityInputValue ] = useState<string[]>([]);
  
  useEffect(() => {
    setQuantityInputValue(foods.map(food => food.quantity.toString()));
  }, [foods]);
 
  const changeQuantity = (i:number, value: string) => {
    // change quantity of a food in a meal

    // If user delete the quantity, same behavior of pressing the input
    if (value === '') { inputPress(i); }
    
    const newQuantity = parseInt(value);
    // Set food quantity to 0 to remove it from meal
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

      (['calories', 'carbs', 'fats', 'protein'] as (keyof typeof newTotals)[]).forEach((key) => {
        newTotals[key] = fixN(newTotals[key]);
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

  const addFoodToMeal = (food: Food) => {
    // add a food to a meal
    setFoods((prevFoods) => {
      const newFoods = [...prevFoods, { ...food, id: `${food.id}-${Date.now()}`}];

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

  const inputPress = (i: number) => {
    // When the input is focused, clear the current value in the input field
    setQuantityInputValue((prevValues) => {
      const newValues = [...prevValues];
      newValues[i] = '';
      return newValues;
    });
  };

  const handleBlur = (i: number) => {
    // Restore the old quantity if the input is left empty
    if (quantityInputValue[i] === '') {
      setQuantityInputValue((prevValues) => {
        const newValues = [...prevValues];
        newValues[i] = foods[i].quantity.toString();
        return newValues;
      });
    }
  };
  
  return (
    <View style={styles.mealCardOuter}>

      <View style={styles.mealHeader}>

        <View style={styles.mealTitleOuter}>
          <Text style={[{ color: Colors[colorScheme].text }, styles.mealTitle]}> {meal.title} </Text>
          <Text style={[{ color: Colors[colorScheme].text }, styles.mealCalories]}> {meal.totals.calories} kcal  </Text>
        </View>

        <View style={styles.mealMacrosOuter}>
          {['carbs', 'fats', 'protein'].map((macro, i) => (
            <View key={macro} style={styles.mealMacros}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroValue]}>
                {meal.totals[macro as keyof typeof meal.totals]} g
              </Text>            

              <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroType]}>
                {macrosDisplayShort[macro as keyof typeof macrosDisplayShort]}
              </Text>            
            </View>
          ))}
        </View>

      </View>
      
      {/* display each food of meal and its macros */}
      {foods.map(( food, i ) => {
        if (food.quantity === 0) return;
        // Foods with quantity 0 are not displayed

        return (
          <View key={i} style={styles.foodOuter}>
  
            <View style={styles.foodTitleOuter}>
              {showAddFood && 
                <Ionicons name="remove-circle-outline" size={24} color={Colors.dark.mealTitleC}  onPress={() => changeQuantity(i, "0")}></Ionicons>
              }
              <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitle]}> {food.title} </Text>
            </View> 
  
            <View style={styles.foodMacrosOuter}>
              {['carbs', 'fats', 'protein'].map((macro) => (
                <View key={macro} style={styles.foodMacros}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroValue]}>
                    {food.macroNutrients[macro as keyof typeof food.macroNutrients]} g
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
                  inputMode="numeric"
                  value={quantityInputValue[i]}
                  onChangeText={(text) => changeQuantity(i, text)}
                  onFocus={() => inputPress(i)}
                  onBlur={() => handleBlur(i)}
                />
              </View>
            </View>
            
          </View>
        )
      })} 

      <Pressable style={{ marginTop: 10 }} onPress={() => setShowAddFood(!showAddFood)}>
        <Ionicons name="add-circle-outline" size={24} color={Colors.dark.mealTitleC}></Ionicons>
      </Pressable>

      {showAddFood && <FoodSelection addFoodToMeal={addFoodToMeal} />}
    </View>
  )
}

const vw = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mealCardOuter: {    
    padding: 10,
    marginBottom: 10,
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
    fontSize: 15,
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
