import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions, BackHandler, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Food, MealCardProps, macrosDisplayShort, macrosDisplayShorter } from '@/types/typesAndInterfaces';
import { fixN } from '@/utils/helperFunctions';
import FoodSelection from "@/components/FoodSelection";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const MealCard = ({ meal, mealIndex, meals, setMeals, setHasChanges }: MealCardProps) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [ showAddFood, setShowAddFood ] = useState<boolean>(false);
  const [ isMealToggled, setIsMealToggled ] = useState<boolean>(false);
  const [ foods, setFoods ] = useState<Food[]>(meal.foods);
  const [ quantityInputValue, setQuantityInputValue ] = useState<string[]>([]);
  
  useEffect(() => {
    setQuantityInputValue(foods.map(food => food.quantity.toString()));

    // Override the back button to close add food
    const backAction = () => {
      setShowAddFood(false);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
    );
    return () => backHandler.remove();
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
      newFoods[i].calories = Math.round(newFoods[i].calories);

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

  const removeMeal = () => {    
    Alert.alert(
      "Remover Refeição",
      "Tem certeza que deseja remover esta refeição?",
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel"
        },
        { text: "Remover", onPress: () => {          
            const newMeals = [...meals];
            newMeals.splice(mealIndex, 1);
            setHasChanges(true);
            setMeals(newMeals);
          }
        }
      ]
    );
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
          <View style={[styles.mealTitleOuter, {gap: 4}]}>
            <TextInput
              style={[{ color: Colors[colorScheme].text }, styles.mealTitle]}
              value={meal.title}
              placeholder="Refeição"              
              editable={showAddFood}
              onChangeText={(text) => {
                const newMeals = [...meals];
                newMeals[mealIndex].title = text;
                setMeals(newMeals);
                setHasChanges(true);
              }}              
            />
            { showAddFood && <AntDesign name="edit" size={20} color="gray" /> }            
            { !showAddFood && (
                isMealToggled ? 
                  <AntDesign name="downcircleo" size={16} color="gray" onPress={() => setIsMealToggled(!isMealToggled)} /> 
                  : 
                  <AntDesign name="upcircleo" size={16} color="gray" onPress={() => setIsMealToggled(!isMealToggled)} /> 
              ) 
            }

          </View>

          <View style={[styles.mealTitleOuter, {gap: 4}]}>
            <Text style={[{ color: meal.totals.calories == 0 ? 'gray' : Colors[colorScheme].text }, styles.mealCalories]}>{meal.totals.calories}</Text>
            <Text style={[{ color: 'gray'} , styles.mealMacroValue]}>kcal</Text>
          </View>
        </View>

        <View style={styles.mealMacrosOuter}>
          {['carbs', 'fats', 'protein'].map((macro, i) => (
            <View key={macro} style={styles.mealMacros}>
              <Text style={[{ color: meal.totals.calories == 0 ? 'gray' : Colors[colorScheme].text }, styles.mealMacroValue]}>
                {meal.totals[macro as keyof typeof meal.totals]} g
              </Text>            

              <Text style={[{ color: 'gray' }, styles.mealMacroType]}>
                {macrosDisplayShort[macro as keyof typeof macrosDisplayShort]}
              </Text>            
            </View>
          ))}
        </View>

      </View>
      
      {/* display each food of meal and its macros */}
      {!isMealToggled && foods.map(( food, i ) => {
        if (food.quantity === 0) return;
        // Foods with quantity 0 are not displayed

        return (
          <View key={i} style={styles.foodOuter}>
  
            <View style={styles.foodTitleOuter}>
              {showAddFood && <MaterialIcons name="playlist-remove" size={26} color={Colors.dark.mealTitleC} onPress={() => changeQuantity(i, "0")}/> }
              <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitle]}>{food.title}</Text>
            </View> 
  
            <View style={styles.foodMacrosOuter}>
              {['carbs', 'fats', 'protein'].map((macro) => (
                <View key={macro} style={styles.foodMacros}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.mealMacroValue]}>
                    {food.macroNutrients[macro as keyof typeof food.macroNutrients]}
                  </Text>
  
                  <Text style={[{ color: Colors.dark.mealTitleC }, styles.mealMacroType]}>
                    {macrosDisplayShorter[macro as keyof typeof macrosDisplayShorter]}
                  </Text>            
                </View>
              ))}

              <View style={styles.foodKcalOuter}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.foodKcalValue]}>{food.calories} </Text>
                <Text style={[{ color: Colors[colorScheme].text }, styles.foodKcal]}>kcal</Text>

                <View style={[{gap: 4}, styles.foodKcalOuter]}>
                  <TextInput
                    style={[{ color: Colors[colorScheme].text }, styles.quantityInput]}
                    inputMode="numeric"
                    value={quantityInputValue[i] ?? ''}
                    onChangeText={(text) => changeQuantity(i, text)}
                    onFocus={() => inputPress(i)}
                    onBlur={() => handleBlur(i)}
                  />
                  <Text style={[{ color: Colors[colorScheme].text }, styles.foodKcal]}>g</Text>
                </View>
              </View>
            </View>
            
          </View>
        )
      })} 

      <Pressable style={{ marginTop: 5 }} onPress={() => { setShowAddFood(!showAddFood); setIsMealToggled(false) } }>
        <Ionicons name={showAddFood ? "arrow-up-circle" :  "add-circle-outline"} size={24} color={Colors.dark.mealTitleC}/>
      </Pressable>

      { showAddFood && <FoodSelection addFoodToMeal={addFoodToMeal} /> }

      { showAddFood &&
        <Pressable style={styles.removeMealBtn} onPress={() => removeMeal()}>
          <Text style={styles.removeMealText}>Remover Refeição</Text>
          <Ionicons name="trash-outline" size={20} color={Colors[colorScheme].text} />
        </Pressable>        
      }

    </View>
  )
}

const vw = Dimensions.get('window').width;
const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mealCardOuter: {    
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: '#d6d6d6',
    borderWidth: 1,
    display: 'flex',    
    alignItems: 'center',
  },
  removeMealBtn: {
    width: '100%',    
    paddingVertical: 7,
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMealText: {
    color: Colors.dark.mealTitleC,
    fontSize: vh * 0.018,    
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
    fontSize: vh * 0.020,
    fontWeight: 'bold',
    color: Colors.dark.mealTitleC,    
  },
  mealCalories: {
    fontSize: vh * 0.020,
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
    fontSize: vh * 0.018,
    fontWeight: 'bold',
  },
  mealMacroType: {
    fontSize: vh * 0.015,    
    fontWeight: 'bold',
  },
  foodOuter: {  
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginVertical: 1,    
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
    fontSize: vh * 0.019,        
  },
  quantityInput: {
    width: 30,
    fontSize: vh * 0.018,
    textAlign: 'right',
    color: Colors.dark.mealTitleC,
  },
  foodKcalOuter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodKcalValue: {
    fontSize: vh * 0.018,
    fontWeight: 'bold',
  },
  foodKcal: {
    fontSize: vh * 0.015,
    color: 'gray',
  },
  foodMacrosOuter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',        
    alignItems: 'center',
  },
  foodMacros: {
    display: 'flex',
    alignItems: 'baseline',
    flexDirection: 'row',    
    gap: 5,    
  },
 
});

export default MealCard
