import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { getLoggedUser, setLoggedUser } from '@/utils/helperFunctions';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const navigation = useNavigation() as any;
  const [isLogged, setIsLogged] = useState<boolean>(false);

  useEffect(() => { 
    onAuthStateChanged(auth, (user) => {
      if (user) {        
        setLoggedUser(user);
        setIsLogged(true);
      } else {
        navigation.navigate('login');
      }
    });
  }, [])
  
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !isLogged) {
    return null;
  }
  
  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
            {/* Login screen in not included in (tabs) navigation */}
            <Stack.Screen name="login" options={{ headerShown: false }} /> 
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
  );
}
