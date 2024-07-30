import React from 'react';
import { Image, StyleSheet, View, ScrollView } from 'react-native';
import MealCard from '@/components/MealCard';

export default function HomeScreen() {

  const meals = [
    {
      id: 1,
      title: 'Breakfast',
    },
    {
      id: 2,
      title: 'Lunch',
    },
    {
      id: 3,
      title: 'Dinner',
    },
    {
      id: 4,
      title: 'Snack',
    },
];

  return (
    // Página inicial do aplicativo
    // Card de cada refeição

    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      {meals.map((meal) => (
        <MealCard/>
      ))}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
