import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, useColorScheme, Dimensions, BackHandler } from 'react-native';
import { Colors } from '@/constants/Colors';
import { microsDisplay, FoodInfoProps, detailedFood, mealMacroTotals } from "@/types/typesAndInterfaces";
import { getDetailedFood, getDailyGoals } from '@/firebase/dataHandling';
import { microsMeasure, getPercentual, fixN } from '@/utils/helperFunctions';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const FoodInfo = ({ setShowFoodInfo, foodId }: FoodInfoProps) => {
    const colorScheme = useColorScheme() ?? 'dark';

    const [ food, setFood ] = useState<detailedFood>();
    const [ portionSize, setPortionSize ] = useState<number>( food?.quantity ?? 100);
    const [ portionInputValue, setPortionInputValue ] = useState<string>( portionSize.toString() );
    const [ dailyGoals, setDailyGoals ] = useState<mealMacroTotals>({calories: 0, carbs: 0, fats: 0, protein: 0});

    useEffect(() => {
        getDetailedFood(foodId).then((data: detailedFood) => { setFood(data); });
        getDailyGoals().then((data) => { setDailyGoals(data); });

        // Override the back button to close the food info
        const backAction = () => {
          setShowFoodInfo(false);
          return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [foodId]);

    const changeQuantity = (value: string) => {
      // modify the Food object quantity and recalculate the macros
      // very similar to the changeQuantity function in MealCard.tsx      
      if (value === '') { setPortionInputValue(''); }
      
      const newQuantity = parseInt(value);      
      if (isNaN(newQuantity) || newQuantity < 0) return;
      
      // Update food in state      
      setFood((prevFood) => {
        if (!prevFood) return prevFood;

        const newFood = { ...prevFood };
        const oldQuantity = portionSize;
        const fM = newFood.macroNutrients;

        newFood.quantity = newQuantity;

        newFood.macroNutrients.carbs = fixN((fM.carbs / oldQuantity) * newQuantity);
        newFood.macroNutrients.fats = fixN((fM.fats / oldQuantity) * newQuantity);
        newFood.macroNutrients.protein = fixN((fM.protein / oldQuantity) * newQuantity);

        // Update micro nutrients
        Object.keys(microsDisplay).map((micro) => { 
          const microKey = micro as keyof typeof microsDisplay;
          newFood.microNutrients[microKey] = fixN((newFood.microNutrients[microKey] as number / oldQuantity) * newQuantity);
        });
        
        // carbs and protein = 4 kcal per gram, fats = 9 kcal per gram 
        newFood.calories = fixN(
          newFood.macroNutrients.carbs * 4 +
          newFood.macroNutrients.protein * 4 +
          newFood.macroNutrients.fats * 9
        );        

        setPortionInputValue(newQuantity.toString());
        setPortionSize(newQuantity);
        return newFood;
      });
    };
  
    const handleBlur = () => {
      // Restore the old portion if the input is left empty
      if (portionInputValue === '') {
        setPortionInputValue((prevValue) => prevValue === '' ? portionSize.toString() : prevValue );
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
            <Text style={[{ color: Colors[colorScheme].text }, styles.headerTitle]}>{food?.title}</Text>
            
            <View style={[styles.rowLabel, styles.thickBorder]}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.subHeader]}>{`Porção de`}</Text>
              <TextInput
                style={[{ color: Colors[colorScheme].text }, styles.quantityInput]}
                inputMode="numeric"
                value={portionInputValue ?? ''}
                onChangeText={(text) => changeQuantity( text)}
                onFocus={() => setPortionInputValue('')}
                onBlur={() => handleBlur()}
              />
              <Text style={[{ color: Colors[colorScheme].text }, styles.subHeader]}>g</Text>
            </View>
    
            {/* CALORIES */}
            <View style={styles.row}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Calorias</Text>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>{food?.calories}</Text>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${getPercentual(food?.calories, 1, dailyGoals.calories)}%`}
              </Text>
            </View>
    
            {/* FATS */}
            <View style={styles.subMacroOuter}>
              <View style={styles.subRow}>
                <View style={styles.rowLabel}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Gorduras Totais</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                      {food?.macroNutrients.fats ? `${food?.macroNutrients.fats}` : '**'}
                    </Text>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                  </View>
                </View>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                  { `${getPercentual(food?.macroNutrients.fats, 9, (dailyGoals.calories * dailyGoals.fats) / 100)}%`}
                </Text>
              </View>

              {[ 'saturatedFats', 'monounsaturatedFats', 'polyunsaturatedFats' ].map((fatType) => {
                  const fatKey = fatType as keyof typeof microsDisplay;
                  return (
                  <View key={fatType} style={[styles.subRow, styles.subMacroRow]}>
                    <View style={styles.rowLabel}>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>{microsDisplay[fatKey]}</Text>
                      <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Text style={[{ color: Colors.dark.mealTitleC }, styles.label, styles.subMacroLabel]}>
                          {food?.microNutrients[fatKey] ? `${food?.microNutrients[fatKey]}` : '**'}
                        </Text>
                        <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                      </View>
                    </View>
                    <Text style={[{ color: Colors.dark.mealTitleC }, styles.subMacroLabel]}>
                      {food?.microNutrients[fatKey]
                        ? `${getPercentual(food?.microNutrients[fatKey] as number, 9, (dailyGoals.calories * dailyGoals.fats) / 100)}%`
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
                  <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>{food?.macroNutrients.protein}</Text>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                </View>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${getPercentual(food?.macroNutrients.protein, 4, (dailyGoals.calories * dailyGoals.protein) / 100)}%`}
              </Text>
            </View>

            {/* CARBS */}
            <View style={styles.subMacroOuter}>
              <View style={styles.subRow}>
                <View style={styles.rowLabel}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Carboidratos</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                      {food?.macroNutrients.carbs ? `${food?.macroNutrients.carbs}` : '**'}
                    </Text>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                  </View>
                </View>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                  {`${getPercentual(food?.macroNutrients.carbs, 4, (dailyGoals.calories * dailyGoals.carbs) / 100)}%`}
                </Text>
              </View>
              
              <View style={[styles.subRow, styles.subMacroRow]}>
                <View style={styles.rowLabel}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>{microsDisplay.dietaryFiber}</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Text style={[{ color: Colors.dark.mealTitleC }, styles.label, styles.subMacroLabel]}>
                      {food?.microNutrients.dietaryFiber ? `${food?.microNutrients.dietaryFiber}` : '**'}
                    </Text>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>g</Text>
                  </View>
                </View>
                <Text style={[{ color: Colors.dark.mealTitleC }, styles.subMacroLabel]}>
                  {`${ getPercentual(food?.microNutrients.dietaryFiber, 1, 28 )}%`}
                </Text>
              </View>
            </View>

            {/* COLESTEROL */}
            <View style={[styles.row, styles.borderUp]}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Colesterol</Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>{food?.microNutrients.cholesterol}</Text>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>mg</Text>
                </View>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${ getPercentual(food?.microNutrients.cholesterol, 1, 300 )}%`}
              </Text>
            </View>

            {/* SODIUM */}
            <View style={[styles.row, styles.thickBorder]}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Sódio</Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>{food?.microNutrients.sodium}</Text>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>mg</Text>
                </View>
              </View>
              <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                {`${ getPercentual(food?.microNutrients.sodium, 1, 2300 )}%`}
              </Text>
            </View>

            {/* MICRO NUTRIENTS */}
            {Object.keys(microsDisplay).slice(6).map((micro) => { 
                const microKey = micro as keyof typeof microsDisplay;
                if (food?.microNutrients[microKey] == 0 || food?.microNutrients[microKey] === " ") return null;
                return (
                  <View key={microKey} style={[styles.row, styles.microRow]}>
                    <View style={styles.rowLabel}>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>{microsDisplay[microKey]}</Text>                      
                      <View style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>{food?.microNutrients[microKey]}</Text>
                        <Text style={[{ color: Colors[colorScheme].text }, styles.weakLabel]}>{microsMeasure[microKey].measure}</Text>
                      </View>
                    </View>
                    <Text style={[{ color: Colors.dark.mealTitleC }, styles.boldLabel]}>
                      {`${ getPercentual(food?.microNutrients[microKey], 1, microsMeasure[microKey].dailyRecomended )}%`}
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

export default FoodInfo;