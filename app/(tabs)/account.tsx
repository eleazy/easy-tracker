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
      setDailyGoalsInput(data[0]);
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
  const changeDailyGoals = ( goal: string, value: string ) => {
    // modify the daily goals and save it to the database

    if (value === '') return;    

    setDailyGoalsInput((prev) => {
      const newGoals = {...prev};
      newGoals[goal as keyof dailyGoals] = Number(value);
      
      if (useGramsSetting) {
        let totalCalories = (newGoals['carbs'] + newGoals['protein']) * 4 + newGoals['fats'] * 9;
        newGoals['calories'] = totalCalories;
      } else {
        let totalCalories = newGoals['calories'];
        newGoals['carbs'] = Number(getPercentual(newGoals['carbs'], 4, totalCalories));
      }

      return newGoals;
    });
  };

  const changeGoalSetting = (useGrams: boolean) => {
    // change the goal setting to grams or percentage
    setUseGramsSetting(useGrams);    

    // convert the carbs, fats and protein daily goals to the new setting
    setDailyGoalsInput((prev) => {
      const newGoals = {...prev};
      const totalCalories = newGoals['calories'];
      if (useGrams) {
        // converts the percentage of the macronutrients to grams
        newGoals['carbs'] = Math.round((newGoals['carbs'] / 100) * totalCalories / 4);
        newGoals['fats'] = Math.round((newGoals['fats'] / 100) * totalCalories / 9);
        newGoals['protein'] = Math.round((newGoals['protein'] / 100) * totalCalories / 4);        
      } else {
        // gets the percentage of the macronutrients in the total calories
        newGoals['carbs'] = fixN((newGoals['carbs'] * 4 / totalCalories) * 100);
        newGoals['fats'] = fixN((newGoals['fats'] * 9 / totalCalories) * 100);
        newGoals['protein'] = fixN((newGoals['protein'] * 4 / totalCalories) * 100);
      }
      return newGoals;
    });
  };

  const saveGoalsValuesAndSetting = () => {
    // save the daily goals and setting to firebase
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
          <Pressable style={[styles.goalBtn, useGramsSetting && styles.activeGoalBtn]} onPress={(() => changeGoalSetting(true))}>
            <Text style={[styles.goalBtnText, { color: Colors[colorScheme].text }]}>Gramas</Text>
          </Pressable>
          <Pressable style={[styles.goalBtn, !useGramsSetting && styles.activeGoalBtn]} onPress={(() => changeGoalSetting(false))}>
            <Text style={[styles.goalBtnText, { color: Colors[colorScheme].text }]}>Percentual</Text>
          </Pressable>
        </View>

        <View style={styles.innerSession}>         
          <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>Calorias:</Text>
          <TextInput 
            style={[{ color: Colors[colorScheme].text }, styles.goalInput]}
            inputMode="numeric"
            value={dailyGoalsInput['calories'].toString() ?? ''}
            onChangeText={(text) => changeDailyGoals('calories', text)}
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
                  onChangeText={(text) => changeDailyGoals(goal, text)}
                  onFocus={() => handleInputFocus()}
                  onBlur={() => handleBlur()}
                />
                { useGramsSetting ? 
                  <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>g</Text>
                  :
                  <Text style={[{ color: Colors[colorScheme].text }, styles.labelText]}>%</Text> }
              </View>
            );
          })}
        </View>
        
        <Pressable style={styles.saveBtn} onPress={saveGoalsValuesAndSetting}>
          <Text style={styles.saveText}>Salvar</Text>
        </Pressable>        
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
const vw = Dimensions.get('window').width;

const styles = StyleSheet.create({
  accountOuter: {
    flex: 1,
    justifyContent: 'space-between',    
    paddingBottom: 10,
    paddingTop: 40,
    alignItems: 'center',
    //backgroundColor: Colors.dark.background,
  },  
  configSession: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '40%',
    width: '95%',
    borderBottomColor: Colors.dark.saveBtnBG,
    borderBottomWidth: 1,
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
  saveText: {
    color: 'white',
    fontSize: vh * 0.022,
    paddingVertical: vh * 0.010,
    fontWeight: 'bold',
  },
  saveBtn: {    
    width: '100%',
    backgroundColor: Colors.dark.saveBtnBG,
    display: 'flex',    
    alignItems: 'center',          
  },
  innerSession: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',    
    justifyContent: 'space-between',
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