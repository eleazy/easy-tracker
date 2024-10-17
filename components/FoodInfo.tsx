import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { macrosDisplay, microsDisplay, FoodInfoProps, MacroInput, MacroInputsObj, Food, detailedFood } from "@/types/general";
import { getDetailedFood, getCustomFoods } from '@/firebase/dataHandling';
import { removeAccents, singularPluralMatch, getPercentual, emptyDetailedFood, fixN } from '@/utils/helperFunctions';

const FoodInfo = ({ setShowFoodInfo, foodId }: FoodInfoProps) => {
    const colorScheme = useColorScheme() ?? 'dark';

    const [food, setFood] = useState<detailedFood>();
    const [portionSize, setPortionSize] = useState<number>(100);
    const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number>(2000);
    const dailyMacroTarget = {
        carbs: 50,
        fats: 30,
        protein: 20,
    };

    useEffect(() => {
        getDetailedFood(foodId).then((data: detailedFood) => { setFood(data); });
    }, [foodId]);

    return (
      <View style={styles.foodDetailOuter}>        
  
        <View style={styles.row}>
          <Text style={[{ color: Colors[colorScheme].text }, styles.label]}>Valor Diário para referência</Text>
          <Text>2000</Text>
          <Text style={[{ color: Colors[colorScheme].text }, styles.label]}>kcal</Text>
        </View>
       
        <View style={styles.nutritionalContainer}>
          <Text style={[{ color: Colors[colorScheme].text }, styles.header]}>Fatores Nutricionais</Text>
          <Text style={[{ color: Colors[colorScheme].text }, styles.subHeader, styles.thickBorder]}>{`Porção de ${portionSize}g`}</Text>
  
          {/* CALORIES */}
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Calorias</Text>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>{food?.calories}</Text>
            </View>
            <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
              {`${getPercentual(food?.calories as number, 1, dailyCalorieTarget)}%`}
            </Text>
          </View>
  
          {/* FATS */}
          <View style={styles.subMacroOuter}>
            <View style={styles.subRow}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Gorduras Totais</Text>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
                  {food?.macroNutrients.fats ? `${food?.macroNutrients.fats}g` : '**'}
                </Text>
              </View>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
                {food?.macroNutrients.fats
                  ? `${getPercentual(food?.macroNutrients.fats, 9, (dailyCalorieTarget * dailyMacroTarget.fats) / 100)}%`
                  : '**'}
              </Text>
            </View>

            {[ 'saturatedFats', 'monounsaturatedFats', 'polyunsaturatedFats' ].map((fatType) => {
                const fatKey = fatType as keyof typeof microsDisplay;
                return (
                <View key={fatType} style={[styles.subRow, styles.subMacroRow]}>
                  <View style={styles.rowLabel}>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>{microsDisplay[fatKey]}</Text>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>
                      {food?.microNutrients[fatKey] ? `${food?.microNutrients[fatKey]}g` : '**'}
                    </Text>
                  </View>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.label]}>
                    {food?.microNutrients[fatKey]
                      ? `${getPercentual(food?.microNutrients[fatKey] as number, 9, (dailyCalorieTarget * dailyMacroTarget.fats) / 100)}%`
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
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>{food?.macroNutrients.protein}</Text>
            </View>
            <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
              {`${getPercentual(food?.macroNutrients.protein as number, 4, (dailyCalorieTarget * dailyMacroTarget.protein) / 100)}%`}
            </Text>
          </View>

          {/* CARBS */}
          <View style={styles.subMacroOuter}>
            <View style={styles.subRow}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Carboidratos</Text>
                <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
                  {food?.macroNutrients.carbs ? `${food?.macroNutrients.carbs}g` : '**'}
                </Text>
              </View>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
                {food?.macroNutrients.carbs
                  ? `${getPercentual(food?.macroNutrients.carbs, 9, (dailyCalorieTarget * dailyMacroTarget.carbs) / 100)}%`
                  : '**'}
              </Text>
            </View>
            
            <View style={[styles.subRow, styles.subMacroRow]}>
              <View style={styles.rowLabel}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>{microsDisplay.dietaryFiber}</Text>
                <Text style={[{ color: Colors[colorScheme].text }, styles.label, styles.subMacroLabel]}>
                  {food?.microNutrients.dietaryFiber ? `${food?.microNutrients.dietaryFiber}g` : '**'}
                </Text>
              </View>
              <Text style={[{ color: Colors[colorScheme].text }, styles.label]}>
                {food?.microNutrients.dietaryFiber
                  ? `${getPercentual(food?.microNutrients.dietaryFiber as number, 9, (dailyCalorieTarget * 1234) / 100)}%`
                  : '**'}
              </Text>
            </View>
          </View>

          {/* COLESTEROL */}
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Colesterol</Text>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>{food?.microNutrients.cholesterol}</Text>
            </View>
            <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
              {`${getPercentual(food?.microNutrients.cholesterol as number, 4, (dailyCalorieTarget * 1234) / 100)}%`}
            </Text>
          </View>

          {/* SODIUM */}
          <View style={[styles.row, styles.thickBorder]}>
            <View style={styles.rowLabel}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>Sódio</Text>
              <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>{food?.microNutrients.sodium}</Text>
            </View>
            <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
              {`${getPercentual(food?.microNutrients.sodium as number, 4, (dailyCalorieTarget * 1234) / 100)}%`}
            </Text>
          </View>

          {/* MICRO NUTRIENTS */}
          {
            Object.keys(microsDisplay).slice(6).map((micro) => { 
              const microKey = micro as keyof typeof microsDisplay;
              return (
                <View style={[styles.row, styles.microRow]}>
                  <View style={styles.rowLabel}>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>{microsDisplay[microKey]}</Text>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>{food?.microNutrients[microKey]}</Text>
                  </View>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.boldLabel]}>
                    {`${getPercentual(food?.microNutrients[microKey] as number, 4, (dailyCalorieTarget * 1234) / 100)}%`}
                  </Text>
                </View>
              )
            })
          }

          
        </View>
      </View>
    );
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
  foodDetailOuter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',      
    height: vh,
    width: '100%',
    backgroundColor: Colors.dark.background,    
  },
  row: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',        
    marginBottom: 10,
    borderBottomWidth: 2,
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
  },
  header: {
    fontSize: vh * 0.032,
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
  thickBorder: {
    borderBottomWidth: 9,
    borderBottomColor: Colors.dark.borderBottomFoodDetail,
  },
  borderUp: {
    paddingTop: 10,
    borderTopWidth: 2,
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
    borderTopWidth: 2,
    borderTopColor: Colors.dark.borderBottomFoodDetail,
  },
  subMacroLabel: {
    fontSize: vh * 0.018,
    opacity: 0.9,
  },  
});

export default FoodInfo;