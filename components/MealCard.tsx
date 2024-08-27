import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';

const MealCard = ( ) => {
  const colorScheme = useColorScheme() ?? 'dark';
  
  return (
    <View>
      <Text style={[{ color: Colors[colorScheme].text }]}>MealCard</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    
    });

export default MealCard
