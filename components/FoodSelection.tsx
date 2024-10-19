import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions, FlatList, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Food, FoodSelectionProps, macrosDisplay } from '@/types/typesAndInterfaces';
import { getTacoTableFoods, getCustomFoods } from '@/firebase/dataHandling';
import { removeAccents, singularPluralMatch } from '@/utils/helperFunctions';

const FoodSelection = ( { addFoodToMeal }: FoodSelectionProps ) => {
    const colorScheme = useColorScheme() ?? 'dark';

    const tacoTableFoods: Food[] = getTacoTableFoods();
    const [customFoods, setCustomFoods] = useState<Food[]>([]);
    const [combinedFoods, setCombinedFoods] = useState<Food[]>([...tacoTableFoods, ...customFoods]); // maybe not necessary
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [visibleItems, setVisibleItems] = useState<number>(10);

    useEffect(() => {
        getCustomFoods().then((data: Food[]) => { setCustomFoods(data); });
    }, []);

    useEffect(() => {
      setCombinedFoods([...tacoTableFoods, ...customFoods]);
    }, [customFoods]);
     
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
      setVisibleItems(10);
    };

    const loadMoreItems = () => { setVisibleItems((prev) => prev + 10); };

    return (
      <View style={styles.foodSelectionOuter}>
        {/* Search logic */}
        <TextInput
            style={[{ color: Colors[colorScheme].text, backgroundColor: Colors.dark.background }, styles.searchInput]}
            placeholder='Pesquisar...'
            placeholderTextColor='gray'
            onChangeText={doSearch}
            value={searchQuery}
            autoFocus
        />

        <View style={[ styles.foodSelection , {backgroundColor: Colors.dark.background}]}>
          <FlatList
            data={combinedFoods.slice(0, visibleItems)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item: food }) => (
              <Pressable style={styles.foodRow} onPress={() => addFoodToMeal(food)}>
                <View style={styles.foodTitleOuter}>
                  <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitle]}>{food.title}</Text>
                  <View style={styles.foodkcalOuter}>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitleInfoSuble]}>por 100g - </Text>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitleInfo]}>{food.calories}</Text>
                    <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitleInfoSuble]}> kcal</Text>
                  </View>
                </View>

                <View style={styles.macrosOuter}>
                  {(['carbs', 'fats', 'protein'] as Array<keyof typeof food.macroNutrients>).map((macro) => (
                    <View key={macro} style={styles.foodkcalOuter}>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.foodMacros]}>{food.macroNutrients[macro]} g </Text>
                      <Text style={[{ color: Colors[colorScheme].text }, styles.foodTitleInfoSuble]}>{macrosDisplay[macro]}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            )}
            onEndReached={loadMoreItems}
            onEndReachedThreshold={0.5} // How close to the bottom to trigger loading more (0.5 = halfway)
          />
        </View>
      </View>
    )
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
    foodSelectionOuter: {      
      width: '100%',      
    },
    searchInput: {
      fontSize: vh * 0.021,
      padding: 6,
      paddingLeft: 16,
      marginVertical: 10,
      borderRadius: 99,
      borderColor: 'gray',
      borderWidth: 1,      
    },
    foodSelection: {      
      padding: 10,      
      borderRadius: 10,      
      borderColor: 'gray',
      borderWidth: 1,
      height: vh * 0.35,
      overflow: 'hidden',
    },
    foodRow: {
      paddingBottom: 1,
      marginBottom: 3,      
      borderColor: 'gray',
      borderBottomWidth: 1,      
    },
    foodTitleOuter: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    foodTitle: {
      fontSize: vh * 0.018,
      fontWeight: 'bold',
      width: '50%',
    },
    foodkcalOuter: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    foodTitleInfo: {
      fontSize: vh * 0.018,      
    },
    foodTitleInfoSuble: {
      fontSize: vh * 0.016,
      color: 'gray',
    },
    macrosOuter: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    foodMacros: {
      fontSize: vh * 0.018,      
    },
});

export default FoodSelection