import React, { useEffect, useState, useRef, RefObject } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, useColorScheme, Dimensions, BackHandler } from 'react-native';
import { Colors } from '@/constants/Colors';
import { microsDisplay, MacroInputsObj, subFatsInputsObj, detailedFood, mealMacroTotals, CreateFoodProps } from "@/types/typesAndInterfaces";
import { getDetailedFood, getDailyGoals } from '@/firebase/dataHandling';
import { microsMeasure, getPercentual, fixN } from '@/utils/helperFunctions';

const CreateFood = ({ setShowCreateFood, customFoods, setCustomFoods }: CreateFoodProps) => {
    const colorScheme = useColorScheme() ?? 'dark';
        
    const [ dailyGoals, setDailyGoals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});

    const [ titleInput, setTitleInput ] = useState<string>('');
    const [ portionInput, setPortionInput ] = useState<string>('0');
    const [ carbInput, setCarbInput ] = useState<string>('0');
    const [ fatInput, setFatInput ] = useState<string>('0');
    const [ protInput, setProtInput ] = useState<string>('0');
    const [ calories, setCalories ] = useState<number>(0);

    const [ saturatedFats, setSaturatedFats ] = useState<string>('');
    const [ monounsaturatedFats, setMonounsaturatedFats ] = useState<string>('');
    const [ polyunsaturatedFats, setPolyunsaturatedFats ] = useState<string>('');
    const [ dietaryFiber, setDietaryFiber ] = useState<string>('');

    const [ micros, setMicros ] = useState<detailedFood['microNutrients']>(
      { saturatedFats: 0, monounsaturatedFats: 0, polyunsaturatedFats: 0, dietaryFiber: 0, ash: 0, calcium: 0, magnesium: 0, manganese: 0, phosphorus: 0, iron: 0, sodium: 0, potassium: 0, copper: 0, zinc: 0, thiamine: 0, pyridoxine: 0, niacin: 0, riboflavin: 0, vitaminC: 0, RE: 0, RAE: 0, cholesterol: 0, retinol: 0 }
    );

    const titleRef = useRef<TextInput>(null);
    const portionRef = useRef<TextInput>(null);
    const carbRef = useRef<TextInput>(null);
    const fatRef = useRef<TextInput>(null);
    const protRef = useRef<TextInput>(null);
    const saturatedFatsRef = useRef<TextInput>(null);
    const monounsaturatedFatsRef = useRef<TextInput>(null);
    const polyunsaturatedFatsRef = useRef<TextInput>(null);
    const dietaryFiberRef = useRef<TextInput>(null);
    const cholestRef = useRef<TextInput>(null);
    const sodiumRef = useRef<TextInput>(null);

    const subFatsInputsObj: subFatsInputsObj = {
      saturatedFats: { value: saturatedFats, setValue: setSaturatedFats, ref: saturatedFatsRef },
      monounsaturatedFats: { value: monounsaturatedFats, setValue: setMonounsaturatedFats, ref: monounsaturatedFatsRef },
      polyunsaturatedFats: { value: polyunsaturatedFats, setValue: setPolyunsaturatedFats, ref: polyunsaturatedFatsRef },
  };

    useEffect(() => {        
        getDailyGoals().then((data) => { setDailyGoals(data); });
        
        // Override the back button to close the food info
        const backAction = () => {
          setShowCreateFood(false);
          return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
      // Calculate calories
      const cals = fixN(
        (parseInt(carbInput) * 4) +
        (parseInt(protInput) * 4) +
        (parseInt(fatInput) * 9)
      );
      setCalories(cals);
    }, [carbInput, protInput, fatInput]);

    // const changeQuantity = (value: string) => {
    //   // modify the Food object quantity and recalculate the macros
    //   // very similar to the changeQuantity function in MealCard.tsx      
    //   if (value === '') { setPortionInputValue(''); }
      
    //   const newQuantity = parseInt(value);      
    //   if (isNaN(newQuantity) || newQuantity < 0) return;
      
    //   // Update food in state      
    //   setFood((prevFood) => {
    //     if (!prevFood) return prevFood;

    //     const newFood = { ...prevFood };
    //     const oldQuantity = portionSize;
    //     const fM = newFood.macroNutrients;

    //     newFood.quantity = newQuantity;

    //     newFood.macroNutrients.carbs = fixN((fM.carbs / oldQuantity) * newQuantity);
    //     newFood.macroNutrients.fats = fixN((fM.fats / oldQuantity) * newQuantity);
    //     newFood.macroNutrients.protein = fixN((fM.protein / oldQuantity) * newQuantity);

    //     // Update micro nutrients
    //     Object.keys(microsDisplay).map((micro) => { 
    //       const microKey = micro as keyof typeof microsDisplay;
    //       newFood.microNutrients[microKey] = fixN((newFood.microNutrients[microKey] as number / oldQuantity) * newQuantity);
    //     });
        
    //     // carbs and protein = 4 kcal per gram, fats = 9 kcal per gram 
    //     newFood.calories = fixN(
    //       newFood.macroNutrients.carbs * 4 +
    //       newFood.macroNutrients.protein * 4 +
    //       newFood.macroNutrients.fats * 9
    //     );        

    //     setPortionInputValue(newQuantity.toString());
    //     setPortionSize(newQuantity);
    //     return newFood;
    //   });
    // };
  
    const handleBlur = () => {
      // Restore the old portion if the input is left empty
      if (portionInput === '') {
        setPortionInput((prevValue) => prevValue === '' ? portionInput.toString() : prevValue );
      }
    };

    const handleSubmitEditing = (nextInputRef: RefObject<TextInput>) => {
      if (nextInputRef.current) {
          nextInputRef.current.focus();
      }
    };

    return (
      <View style={styles.foodDetailOuter}>        
  
        <View style={styles.row}>
          <Text style={[{ color: Colors[colorScheme].text, opacity: 0.8 }, styles.label]}>Valor Diário para referência</Text>
          <View style={styles.rowLabel}>
            <Text style={[{ color: Colors.dark.mealTitleC }, styles.label]}>{dailyGoals.calories}</Text>
            <Text style={[{ color: Colors[colorScheme].text, opacity: 0.8 }, styles.label]}>calorias</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.nutritionalContainer}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.header]}>Fatores Nutricionais</Text>
            <TextInput
              style={[{ color: Colors[colorScheme].text }, styles.headerTitle]}
              value={titleInput}
              placeholder="Nome do alimento"
              placeholderTextColor={'rgba(255, 255, 255, 0.5)'}              
              onChangeText={(t) => setTitleInput(t)}
              onSubmitEditing={() => handleSubmitEditing(portionRef)}
              returnKeyType="next"
              ref={titleRef}
            />
            
            <View style={[styles.rowLabel, styles.thickBorder]}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.subHeader]}>{`Porção de`}</Text>
              <TextInput
                style={[{ color: Colors[colorScheme].text }, styles.quantityInput]}
                inputMode="numeric"
                value={portionInput ?? ''}
                placeholder="Porção"
                placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
                onChangeText={(text) => setPortionInput(text)}
                onFocus={() => setPortionInput('')}
                onBlur={() => handleBlur()}
                onSubmitEditing={() => handleSubmitEditing(carbRef)}
                returnKeyType="next"
                ref={portionRef}
              />
              <Text style={[{ color: Colors[colorScheme].text }, styles.subHeader]}>g</Text>
            </View>
    
            {/* CALORIES */}
            <View style={styles.row}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Calorias</Text>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>{calories}</Text>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${getPercentual(calories, 1, dailyGoals.calories)}%`}
              </Text>
            </View>
    
            {/* FATS */}
            <View style={styles.subMacroOuter}>
              <View style={styles.subRow}>
                <View style={styles.rowLabel}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Gorduras Totais</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <TextInput
                      style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}
                      value={fatInput}                      
                      onChangeText={setFatInput}
                      onSubmitEditing={() => handleSubmitEditing(saturatedFatsRef)}
                      returnKeyType="next"
                      ref={fatRef}
                    />                      
                    <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                  </View>
                </View>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                  { `${getPercentual(fatInput, 9, (dailyGoals.calories * dailyGoals.fats) / 100)}%`}
                </Text>
              </View>

              {[ 'saturatedFats', 'monounsaturatedFats', 'polyunsaturatedFats' ].map((fatType, i) => {
                  const fatKey = fatType as keyof typeof microsDisplay;
                  const fatTypeInput = fatType as keyof typeof subFatsInputsObj;
                  const { value, setValue, ref } = subFatsInputsObj[fatTypeInput];
                  return (
                  <View key={fatType} style={[styles.subRow, styles.subMacroRow]}>
                    <View style={styles.rowLabel}>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>{microsDisplay[fatKey]}</Text>
                      <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <TextInput
                          style={[{ color: Colors.dark.mealTitleC }, styles.label, styles.subMacroLabel]}
                          value={value}
                          onChangeText={(text) => setValue(text)}
                          onSubmitEditing={() => {
                              if (i < Object.keys(subFatsInputsObj).length - 1) {
                                  handleSubmitEditing(Object.values(subFatsInputsObj)[i + 1].ref);
                              } else {
                                  handleSubmitEditing(protRef);
                              }
                          }}
                          ref={ref}
                        />
                          
                        <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                      </View>
                    </View>
                    <Text style={[{ color: Colors.dark.mealTitleC }, styles.subMacroLabel]}>
                      {subFatsInputsObj[fatTypeInput]
                        ? `${getPercentual(subFatsInputsObj[fatTypeInput].value, 9, (dailyGoals.calories * dailyGoals.fats) / 100)}%`
                        : '**'}
                    </Text>
                  </View>
                  )
                } 
              )}
            </View>
    
            {/* PROTEIN */}
            <View style={[styles.row, styles.borderUp]}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Proteínas</Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <TextInput
                    style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}
                    value={protInput}
                    onChangeText={setProtInput}
                    onSubmitEditing={() => handleSubmitEditing(carbRef)}
                    returnKeyType="next"
                    ref={protRef}                    
                  />
                  <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                </View>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${getPercentual(protInput, 4, (dailyGoals.calories * dailyGoals.protein) / 100)}%`}
              </Text>
            </View>

            {/* CARBS */}
            <View style={styles.subMacroOuter}>
              <View style={styles.subRow}>
                <View style={styles.rowLabel}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Carboidratos</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <TextInput
                      style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}
                      value={carbInput}
                      onChangeText={setCarbInput}
                      onSubmitEditing={() => handleSubmitEditing(dietaryFiberRef)}
                      returnKeyType="next"
                      ref={carbRef}                      
                    />                      
                    <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                  </View>
                </View>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                  {`${getPercentual(carbInput, 4, (dailyGoals.calories * dailyGoals.carbs) / 100)}%`}
                </Text>
              </View>
              
              <View style={[styles.subRow, styles.subMacroRow]}>
                <View style={styles.rowLabel}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>{microsDisplay.dietaryFiber}</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <TextInput
                      style={[{ color: Colors.dark.mealTitleC }, styles.label, styles.subMacroLabel]}
                      value={dietaryFiber}
                      onChangeText={setDietaryFiber}
                      onSubmitEditing={() => handleSubmitEditing(cholestRef)}
                      returnKeyType="next"
                      ref={dietaryFiberRef}
                    />                      
                    <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                  </View>
                </View>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.subMacroLabel]}>
                  {`${ getPercentual(dietaryFiber, 1, 28 )}%`}
                </Text>
              </View>
            </View>

            {/* COLESTEROL */}
            <View style={[styles.row, styles.borderUp]}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Colesterol</Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <TextInput
                    style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}
                    value={micros.cholesterol.toString()}
                    onChangeText={(text) => setMicros((p) => ({ ...p, cholesterol: text }))}
                    onSubmitEditing={() => handleSubmitEditing(sodiumRef)}
                    returnKeyType="next"
                    ref={cholestRef}
                  />
                  <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>mg</Text>
                </View>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${ getPercentual(micros.cholesterol, 1, 300 )}%`}
              </Text>
            </View>

            {/* SODIUM */}
            <View style={[styles.row, styles.thickBorder]}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Sódio</Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <TextInput
                    style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}
                    value={micros.sodium.toString()}
                    onChangeText={(text) => setMicros((p) => ({ ...p, sodium: text }))}
                    onSubmitEditing={() => handleSubmitEditing(saturatedFatsRef)}
                    returnKeyType="next"
                    ref={sodiumRef}
                  />
                  <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>mg</Text>
                </View>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${ getPercentual(micros.sodium, 1, 2300 )}%`}
              </Text>
            </View>

            {/* MICRO NUTRIENTS */}
            {Object.keys(microsDisplay).slice(6).map((micro) => { 
                const microKey = micro as keyof typeof microsDisplay;
                
                return (
                  <View key={microKey} style={[styles.row, styles.microRow]}>
                    <View style={styles.rowLabel}>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>{microsDisplay[microKey]}</Text>                      
                      <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <TextInput
                          style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}
                          value={micros[microKey].toString()}
                          onChangeText={(text) => setMicros((p) => ({ ...p, [microKey]: text }))}
                          onSubmitEditing={() => {}}  
                          returnKeyType="next"

                        />
                        <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>{microsMeasure[microKey].measure}</Text>
                      </View>
                    </View>
                    <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                      {`${ getPercentual(micros[microKey], 1, microsMeasure[microKey].dailyRecomended )}%`}
                    </Text>
                  </View>
                )
            })}
            
          </View>
        </ScrollView>
      </View>
    );
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
  foodDetailOuter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: vh - 65,
    marginTop: 20,
    width: '95%',
    backgroundColor: Colors.dark.background,
  },
  quantityInput: {
    width: 50,
    fontSize: vh * 0.018,
    textAlign: 'center',
    color: Colors.dark.mealTitleC,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',        
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.borderBottomFoodDetail,
  },
  microRow: {
    marginBottom: 4,
    borderBottomWidth: 1,    
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  label: {
    fontSize: vh * 0.020,
  },
  nutritionalContainer: {
    marginTop: 20,        
    //flex: 1,
  },
  header: {
    fontSize: vh * 0.032,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: vh * 0.024,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: vh * 0.020,
    marginBottom: 10,
  },
  boldLabel: {
    fontSize: vh * 0.019,
    fontWeight: 'bold',
  },
  weakLabel: {
    fontSize: vh * 0.018,
    opacity: 0.9,
  },
  thickBorder: {
    borderBottomWidth: 9,
    borderBottomColor: Colors.dark.borderBottomFoodDetail,
  },
  borderUp: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.borderBottomFoodDetail,
  },
  subMacroOuter: {
    marginTop: 8,
  },  
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',    
  }, 
  subMacroRow: {    
    marginLeft: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.borderBottomFoodDetail,
  },
  subMacroLabel: {
    fontSize: vh * 0.018,
    opacity: 0.9,
  },  
  scrollView: {
    //flex: 1,    
  },
});

export default CreateFood;