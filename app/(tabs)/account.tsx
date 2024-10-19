import { View, Text, Pressable, StyleSheet, useColorScheme, Dimensions, TextInput } from 'react-native';
import React, { useEffect, useState } from "react";
import { Colors } from '@/constants/Colors';
import { macrosDisplay, FoodInfoProps, dailyGoals, MacroInputsObj } from "@/types/typesAndInterfaces";
import { setDailyGoals, getDailyGoals } from '@/firebase/dataHandling';
import { microsMeasure, getPercentual, fixN } from '@/utils/helperFunctions';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { navigate } from '@/components/navigation/RootNavigation';

export default function Account() {
  const colorScheme = useColorScheme() ?? 'dark';

  const [ dailyGoals, setDailyGoals ] = useState<dailyGoals>();
  const [ dailyGoalsInput, setDailyGoalsInput ] = useState<dailyGoals>({calories: 0, carbs: 0, fats: 0, protein: 0});

  const [ useGramsSetting, setUseGramsSetting ] = useState<boolean>(true);

  useEffect(() => {
    // get daily goals from the database
    getDailyGoals().then((data: [dailyGoals, boolean]) => { 
      setDailyGoals(data[0]); 
      setUseGramsSetting(data[1]);
    });        
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('login');      
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  // There will be two options for the user to change the daily goals:
  // they can chose to set grams of macronutrients, that will be converted to total calories
  // they can chose to set the percentage of macronutrients in a chosen total calorie goal
  const changeDailyGoals = (value: string) => {
    // modify the daily goals and save it to the database
  };

  const handleBlur = () => {
    // Restore the old value if the input is left empty
    
  };

  const handleInputFocus = () => {
    // Clear the input field when it's focused
    //setDailyGoalsInput();
  };

  return (
    <View style={styles.accountOuter}>

      <View style={styles.configSession}> 
        <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>Definir Metas diárias</Text>

        <View style={styles.goalsOptions}>
          <Pressable style={[styles.goalBtn, useGramsSetting && styles.activeGoalBtn]}>
            <Text style={[styles.goalBtnText, !useGramsSetting && { color: Colors[colorScheme].text }]}>Gramas</Text>
          </Pressable>
          <Pressable style={[styles.goalBtn, !useGramsSetting && styles.activeGoalBtn]}>
            <Text style={[styles.goalBtnText, useGramsSetting && { color: Colors[colorScheme].text }]}>Percentual</Text>
          </Pressable>
        </View>

        <View style={styles.innerSession}>         
          <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>Calorias:</Text>
          <TextInput 
            style={[{ color: Colors[colorScheme].text }, styles.goalInput]}
            inputMode="numeric"
            value={dailyGoalsInput['calories'].toString() ?? ''}
            onChangeText={(text) => changeDailyGoals(text)}
            onFocus={() => handleInputFocus()}
            onBlur={() => handleBlur()}
            editable={!useGramsSetting}
          />
        </View>

        <View style={styles.macrosInnerSession}>
          {['carbs', 'fats', 'protein'].map((goal) => {            
            const goalKey = goal as keyof dailyGoals;
            return (
              <View key={goalKey} style={styles.innerSession}>         
                <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>{macrosDisplay[goal as keyof MacroInputsObj]}</Text>
                <TextInput 
                  style={[{ color: Colors[colorScheme].text }, styles.goalInput]}
                  inputMode="numeric"
                  value={dailyGoalsInput[goalKey].toString() ?? ''}
                  onChangeText={(text) => changeDailyGoals(text)}
                  onFocus={() => handleInputFocus()}
                  onBlur={() => handleBlur()}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.configSession}> 
        <Pressable style={styles.logOutBtn} onPress={handleLogout}>
          <Text style={styles.logOutText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
  accountOuter: {
    flex: 1,
    justifyContent: 'space-between',    
    paddingBottom: 10,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },  
  configSession: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '40%',
    width: '95%',
  },
  labelText: {
    fontSize: vh * 0.022,
  },
  goalsOptions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  goalBtn: {
    paddingVertical: 5,
    //paddingHorizontal: 16,
    width: '25%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 99,
    borderColor: Colors.dark.saveBtnBG,
    borderWidth: 1,
  },
  goalBtnText: {       
    fontSize: vh * 0.018,
  },
  activeGoalBtn: {
    backgroundColor: Colors.dark.saveBtnBG,    
  },
  goalInput: {
    width: 50,
    fontSize: vh * 0.018,
    textAlign: 'center',
    color: Colors.dark.mealTitleC,
  },
  innerSession: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',    
  },
  macrosInnerSession: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    //justifyContent: 'space-around',
    //width: '100%',
  },
  logOutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 30,
    backgroundColor: Colors.dark.saveBtnBG,
    borderRadius: 99,
  },
  logOutText: {
    color: 'white',
    fontSize: vh * 0.020,
  },
});