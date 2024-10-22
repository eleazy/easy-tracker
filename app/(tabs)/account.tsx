import { View, Text, Pressable, StyleSheet, useColorScheme, Dimensions, TextInput } from 'react-native';
import React, { useEffect, useState } from "react";
import { Colors } from '@/constants/Colors';
import { macrosDisplay, FoodInfoProps, mealMacroTotals, MacroInputsObj } from "@/types/typesAndInterfaces";
import { saveDailyGoals, getDailyGoals } from '@/firebase/dataHandling';
import { microsMeasure, getPercentual, fixN, getLoggedUser } from '@/utils/helperFunctions';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { navigate } from '@/components/navigation/RootNavigation';

export default function Account() {
  const colorScheme = useColorScheme() ?? 'dark';
  const loggedUser = getLoggedUser();
  const userEmail = loggedUser.email;

  const [ dailyGoals, setDailyGoals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});
  const [ dailyGoalsInput, setDailyGoalsInput ] = useState<{[key: string]: string;}>({calories: "0", carbs: "0", fats: "0", protein: "0"});

  useEffect(() => {
    // get daily goals from the database
    getDailyGoals().then((data: mealMacroTotals) => { 
      setDailyGoals(data); 
      setDailyGoalsInput({
        calories: data.calories.toString(),
        carbs: data.carbs.toString(),
        fats: data.fats.toString(),
        protein: data.protein.toString(),
      });
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
  const changeDailyGoals = ( goal: string, value: string ) => {
    // modify the daily goals and save it to the database
    if (value === '') return;    

    setDailyGoalsInput((prev) => {
      let updated = { ...prev, [goal]: value };
      let newCalories = (Number(updated.carbs) + Number(updated.protein)) * 4 + Number(updated.fats) * 9;
      updated.calories = newCalories.toString();
      return updated;
    });

    const updatedGoals = { ...dailyGoals, [goal]: Number(value) };
    updatedGoals.calories = (updatedGoals.carbs + updatedGoals.protein) * 4 + updatedGoals.fats * 9;

    setDailyGoals(updatedGoals);
  };

  const saveGoalsValuesAndSetting = () => {
    // save the daily goals and setting to firebase
    saveDailyGoals(dailyGoals);
  };

  const handleBlur = (goal: string) => {
    // Restore the old value if the input is left empty
    if (dailyGoalsInput[goal] === "") {
      setDailyGoalsInput((prev) => ({ ...prev, [goal]: dailyGoals[goal as keyof mealMacroTotals].toString() }));
    }
  };

  // Clear the input field when it's focused
  const handleInputFocus = (goal: string) => setDailyGoalsInput((prev) => ({ ...prev, [goal]: ""}));

  return (
    <View style={styles.accountOuter}>

      <View style={styles.configSession}> 
        <Text style={[{ color: Colors[colorScheme].text }, styles.labelTextWeak]}>Definir Metas diárias</Text>

        <View style={styles.goalsTitle}>
          <View style={styles.innerSession}>         
            <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>Calorias</Text>
            <Text style={[{ color: Colors[colorScheme].text }, styles.calorieTotal]}>{dailyGoalsInput['calories']}</Text>         
          </View>

          <View style={styles.macrosInnerSession}>
            {['carbs', 'fats', 'protein'].map((goal, i) => {            
              const goalKey = goal as keyof mealMacroTotals;
              const mult = i == 1 ? 9 : 4;
              return (
                <View key={goalKey} style={styles.innerSession}>         
                  <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>{macrosDisplay[goal as keyof MacroInputsObj]}</Text>
                  <View style={styles.valueGram}>
                    <TextInput 
                      style={[{ color: Colors[colorScheme].text }, styles.goalInput]}
                      inputMode="numeric"
                      value={dailyGoalsInput[goalKey].toString() ?? ''}
                      onChangeText={(text) => changeDailyGoals(goal, text)}
                      onFocus={() => handleInputFocus(goal)}
                      onBlur={() => handleBlur(goal)}
                    />
                    <Text style={[{ color: Colors[colorScheme].text }, styles.labelTextWeak]}> g</Text>
                  </View>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.labelTextWeak]}>{`( ${fixN((dailyGoals[goalKey] * mult / dailyGoals['calories']) * 100)}% )`}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.logOutBtn} onPress={saveGoalsValuesAndSetting}>
          <Text style={styles.logOutText}>Salvar</Text>
        </Pressable>        
      </View>

      <View style={styles.divLine}></View>

      <View style={styles.configSession}>         
        <View style={styles.myAccTitle}>
          <Text style={[{ color: Colors[colorScheme].text }, styles.labelTextWeak]}>Minha Conta</Text>
          <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>{userEmail}</Text>
        </View>
        
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
    justifyContent: 'space-around',    
    paddingBottom: 10,
    paddingTop: 40,
    alignItems: 'center',
    //backgroundColor: Colors.dark.background,
  },  
  configSession: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: '40%',
    width: '95%',
  },
  goalsTitle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  divLine: {
    width: '65%',
    borderBottomColor: 'gray',
    borderBottomWidth: 2,
  },
  labelText: {
    fontSize: vh * 0.022,
  },
  labelTextWeak: {
    fontSize: vh * 0.020,
    color: 'gray',
  },
  goalInput: {
    fontSize: vh * 0.018,
    textAlign: 'center',
    color: Colors.dark.mealTitleC,    
  },
  calorieTotal: {
    fontSize: vh * 0.022,
    fontWeight: 'bold',
    color: Colors.dark.mealTitleC,
  },
  innerSession: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',    
    justifyContent: 'space-between',
    gap: 10,
  },
  valueGram: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',    
  },
  macrosInnerSession: {
    display: 'flex',
    flexDirection: 'column',        
    gap: 10,
  },
  myAccTitle: {
    display: 'flex',
    flexDirection: 'column',    
    alignItems: 'center',
  },
  logOutBtn: {
    paddingVertical: 6,
    width: '25%',
    backgroundColor: Colors.dark.saveBtnBG,
    borderRadius: 99,    
  },
  logOutText: {
    color: 'white',
    fontSize: vh * 0.020,
    textAlign: 'center',
  },
});