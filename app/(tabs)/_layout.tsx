import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions } from "react-native";
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const vh = Dimensions.get('window').height;
  
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,        
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Diary',          
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'book' : 'book-outline'} color={color} size={vh * 0.026} />
          ),
        }}
      />    
      <Tabs.Screen
        name="foodbank"
        options={{
          title: 'Alimentos',          
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'albums' : 'albums-outline'} color={color} size={vh * 0.026} />
          ),
        }}
      />
       <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} size={vh * 0.026} />
          ),
        }}
      />
    </Tabs>
  );
}
