import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Food, FoodSelectionProps, macrosDisplay } from '@/types/general';
import { getTacoTableFoods, getCustomFoods } from '@/firebase/dataHandling';
import { removeAccents, singularPluralMatch } from '@/utils/helperFunctions';

const FoodSelection = ( { addFoodToMeal }: FoodSelectionProps ) => {
    const colorScheme = useColorScheme() ?? 'dark';

    const tacoTableFoods: Food[] = getTacoTableFoods();
    const [customFoods, setCustomFoods] = useState<Food[]>([]);
    const [combinedFoods, setCombinedFoods] = useState<Food[]>([...tacoTableFoods, ...customFoods]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        getCustomFoods().then((data: Food[]) => { setCustomFoods(data); });
    }, []);

    useEffect(() => {
      setCombinedFoods([...tacoTableFoods, ...customFoods]);
    }, [customFoods]); // test the need of this later when custom foods can be added
 
    const doSearch = (search: string) => {
      setSearchQuery(search);

      const queryTokens = search.toLowerCase().split(" ").map(removeAccents);
  
      const filteredFoods = [...tacoTableFoods, ...customFoods].filter((food) => {
        const foodTitle = removeAccents(food.title.toLowerCase());
        
        return queryTokens.every((token) => {
          return singularPluralMatch(token).some((variation) => foodTitle.includes(variation));
        });
      });
  
      setCombinedFoods(filteredFoods);
      //console.log([...tacoTableFoods, ...customFoods].length, filteredFoods.length);
    };

    return (
      <View>
        {/* Search engine */}
        <TextInput
            style={[{ color: Colors[colorScheme].text }, styles.searchInput]}
            placeholder='Pesquisar...'
            placeholderTextColor={Colors[colorScheme].text}
            onChangeText={doSearch}
            value={searchQuery}
        />

        <View style={styles.foodSelectionOuter}>

              {combinedFoods.map((food, i) => (

                <Pressable key={i} style={styles.foodRow} onPress={() => addFoodToMeal(food)}>
                    <View style={styles.foodTitleOuter}>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitle]}> {food.title} </Text>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitleInfo]}> por 100g - {food.calories} kcal </Text>
                    </View>

                    <View style={styles.macrosOuter}>
                      {(['carbs', 'fats', 'protein'] as Array<keyof typeof food.macroNutrients>).map((macro) => (
                        <Text key={macro} style={[{ color: Colors[colorScheme].text }, styles.foodMacros]}>
                          {food.macroNutrients[macro]}g {macrosDisplay[macro]}
                        </Text>
                      ))}
                    </View>                 
                </Pressable>

              ))}          
        </View>
      </View>
    )
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
    searchInput: {
      fontSize: 16,
      padding: 8,
      marginVertical: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderColor: 'gray',
      borderWidth: 1,
    },
    foodSelectionOuter: {
      padding: 10,      
      borderRadius: 10,      
      borderColor: 'gray',
      borderWidth: 1,
      height: vh * 0.33,
      overflow: 'scroll',            
    },
    foodRow: {
      paddingBottom: 4,
      marginBottom: 10,      
      borderColor: 'gray',
      borderBottomWidth: 1,      
    },
    foodTitleOuter: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    foodTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      
    },
    foodTitleInfo: {
      fontSize: 14,      
    },
    macrosOuter: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    foodMacros: {
      fontSize: 14,      
    },
    text: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    flex: {
      display: 'flex',
      flexDirection: 'row',
    },
    mealHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'green',
      borderBottomColor: 'white',
      borderBottomWidth: 1,
    },
    foodDiv: {  
      borderBottomColor: 'white',
      borderBottomWidth: 1,
    },
    foodList: {
      
    },  
});

export default FoodSelection