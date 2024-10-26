import React, { useEffect, useState, useRef, RefObject } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, useColorScheme, Dimensions, BackHandler, Alert, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { microsDisplay, subFatsInputsObj, detailedFood, mealMacroTotals, CreateFoodProps } from "@/types/typesAndInterfaces";
import { getDailyGoals, addCustomFood } from '@/firebase/dataHandling';
import { microsMeasure, getPercentual, fixN } from '@/utils/helperFunctions';

const CreateFood = ({ setShowCreateFood, customFoods, setCustomFoods }: CreateFoodProps) => {
    const colorScheme = useColorScheme() ?? 'dark';
        
    const [ dailyGoals, setDailyGoals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});

    const [ titleInput, setTitleInput ] = useState<string>('');
    const [ calories, setCalories ] = useState<number>(0);
    const [ portionInput, setPortionInput ] = useState<string>('0');
    const [ carbInput, setCarbInput ] = useState<string>('0');
    const [ fatInput, setFatInput ] = useState<string>('0');
    const [ protInput, setProtInput ] = useState<string>('0');

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
      if ([carbInput, protInput, fatInput].some(macro => macro === "")) return;
      const cals = fixN(
        (parseInt(carbInput) * 4) +
        (parseInt(protInput) * 4) +
        (parseInt(fatInput) * 9)
      );
      setCalories(cals);
    }, [carbInput, protInput, fatInput]);

    const addFood = () => {
      const food: detailedFood = {
          id: '',
          idMeal: '',
          calories,
          macroNutrients: {
            carbs: Number(carbInput),
            fats: Number(fatInput),
            protein: Number(protInput),              
          },
          microNutrients: {
            saturatedFats: Number(saturatedFats),
            monounsaturatedFats: Number(monounsaturatedFats),
            polyunsaturatedFats: Number(polyunsaturatedFats),
            dietaryFiber: Number(dietaryFiber),
            ash: Number(micros.ash),
            calcium: Number(micros.calcium),
            magnesium: Number(micros.magnesium),
            manganese: Number(micros.manganese),
            phosphorus: Number(micros.phosphorus),
            iron: Number(micros.iron),
            sodium: Number(micros.sodium),
            potassium: Number(micros.potassium),
            copper: Number(micros.copper),
            zinc: Number(micros.zinc),
            thiamine: Number(micros.thiamine),
            pyridoxine: Number(micros.pyridoxine),
            niacin: Number(micros.niacin),
            riboflavin: Number(micros.riboflavin),
            vitaminC: Number(micros.vitaminC),
            RE: Number(micros.RE),
            RAE: Number(micros.RAE),
            cholesterol: Number(micros.cholesterol),
            retinol: Number(micros.retinol),
          },
          quantity: Number(portionInput),
          title: titleInput,
          isCustom: true,
      };

      addCustomFood(food)
          .then(() => {
              setShowCreateFood(false);     
              setCustomFoods([...customFoods, food]);
          })
          .catch((error) => {
              console.error('Error adding food:', error);
              Alert.alert('Erro', 'Erro ao adicionar alimento. Tente novamente.');
          });
    };
  
    const inputPress = (input: string ) => {
      // When the input is focused, clear the current value in the input field
      switch (input) {
        case 'portion':
          setPortionInput('');
          break;
        case 'carb':
          setCarbInput('');
          break;
        case 'prot':
          setProtInput('');
          break;
        case 'fat':
          setFatInput('');
          break;
        case 'saturatedFats':
          setSaturatedFats('');
          break;
        case 'monounsaturatedFats':
          setMonounsaturatedFats('');
          break;
        case 'polyunsaturatedFats':
          setPolyunsaturatedFats('');
          break;
        case 'dietaryFiber':
          setDietaryFiber('');
          break;
        case 'cholesterol':
          setMicros((p) => ({ ...p, cholesterol: '' }));
          break;
        case 'sodium':
          setMicros((p) => ({ ...p, sodium: '' }));
          break;
        default:
          setMicros((p) => ({ ...p, [input]: '' }));
          break;
      }
    };
    
    const handleBlur = (input: string ) => {
      // Restore the old value if the input is left empty
      switch (input) {
        case 'portion':
          if (portionInput === '') setPortionInput('0');
          break;
        case 'carb':
          if (carbInput === '') setCarbInput('0');
          break;
        case 'prot':
          if (protInput === '') setProtInput('0');
          break;
        case 'fat':
          if (fatInput === '') setFatInput('0');
          break;
        case 'saturatedFats':
          if (saturatedFats === '') setSaturatedFats('0');
          break;
        case 'monounsaturatedFats':
          if (monounsaturatedFats === '') setMonounsaturatedFats('0');
          break;
        case 'polyunsaturatedFats':
          if (polyunsaturatedFats === '') setPolyunsaturatedFats('0');
          break;
        case 'dietaryFiber':
          if (dietaryFiber === '') setDietaryFiber('0');
          break;
        case 'cholesterol':
          if (micros.cholesterol === '') setMicros((p) => ({ ...p, cholesterol: 0 }));
          break;
        case 'sodium':
          if (micros.sodium === '') setMicros((p) => ({ ...p, sodium: 0 }));
          break;
        default:
          if (micros[input as keyof typeof micros] === '') setMicros((p) => ({ ...p, [input]: 0 }));
          break;
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
          <Text style={[{ color: Colors[colorScheme].text, opacity: 0.8 }, styles.label]}>Valor diário para referência</Text>
          <View style={styles.rowLabel}>
            <Text style={[{ color: Colors.dark.mealTitleC }, styles.label]}>{dailyGoals.calories}</Text>
            <Text style={[{ color: Colors[colorScheme].text, opacity: 0.8 }, styles.label]}>calorias</Text>
          </View>
        </View>

        <ScrollView>
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
                onFocus={() => inputPress('portion')}
                onBlur={() => handleBlur('portion')}
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
                      inputMode="numeric"
                      value={fatInput}                      
                      onChangeText={setFatInput}
                      onBlur={() => handleBlur('fat')}
                      onPress={() => inputPress('fat')}
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
                          inputMode="numeric"
                          value={value}
                          onChangeText={(text) => setValue(text)}
                          onBlur={() => handleBlur(fatType)}
                          onPress={() => inputPress(fatType)}
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
                    inputMode="numeric"
                    value={protInput}
                    onChangeText={setProtInput}
                    onBlur={() => handleBlur('prot')}
                    onPress={() => inputPress('prot')}
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
                      inputMode="numeric"
                      value={carbInput}
                      onChangeText={setCarbInput}
                      onBlur={() => handleBlur('carb')}
                      onPress={() => inputPress('carb')}
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
                      inputMode="numeric"
                      value={dietaryFiber}
                      onChangeText={setDietaryFiber}
                      onBlur={() => handleBlur('dietaryFiber')}
                      onPress={() => inputPress('dietaryFiber')}
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
                    inputMode="numeric"
                    value={micros.cholesterol.toString()}
                    onChangeText={(text) => setMicros((p) => ({ ...p, cholesterol: text }))}
                    onBlur={() => handleBlur('cholesterol')}
                    onPress={() => inputPress('cholesterol')}
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
                    inputMode="numeric"
                    value={micros.sodium.toString()}
                    onChangeText={(text) => setMicros((p) => ({ ...p, sodium: text }))}
                    onBlur={() => handleBlur('sodium')}
                    onPress={() => inputPress('sodium')}
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
                          inputMode="numeric"
                          value={micros[microKey].toString()}
                          onChangeText={(text) => setMicros((p) => ({ ...p, [microKey]: text }))}
                          onBlur={() => handleBlur(microKey)}
                          onPress={() => inputPress(microKey)}
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

        <Pressable style={styles.saveBtn} onPress={() => addFood()}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.saveText]}>Salvar</Text>
        </Pressable>
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
  saveText: {
    color: 'white',
    fontSize: vh * 0.024,
    paddingVertical: vh * 0.016,
    fontWeight: 'bold',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: Colors.dark.saveBtnBG,
    display: 'flex',    
    alignItems: 'center',  
    marginBottom: 30,
  },
});

export default CreateFood;