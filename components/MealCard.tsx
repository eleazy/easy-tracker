import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Meal, Food } from '@/types/general';
import { getMealFoods } from '@/firebase/dataHandling';

const MealCard = ( {meal}: { meal: Meal } ) => {
  const colorScheme = useColorScheme() ?? 'dark';

  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    // Fetch and set the foods data
    const fetchFoods = async () => {
      const foodsData = await getMealFoods(meal.foods);
      setFoods(foodsData);
      console.log(foodsData);
    };
    fetchFoods();
  }, [meal.foods]);
    
  return (
    <View>
      <Text style={[{ color: Colors[colorScheme].text }]}>{meal.title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    
    });

export default MealCard
