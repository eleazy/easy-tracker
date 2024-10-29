import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Keyboard } from "react-native";
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const vh = Dimensions.get('window').height;

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);
  
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,     
        tabBarStyle: { display: isKeyboardVisible ? 'none' : 'flex' },           
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Diário',          
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
          title: 'Conta',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} size={vh * 0.026} />
          ),
        }}
      />
    </Tabs>
  );
}
