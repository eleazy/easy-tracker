import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Food, FoodSelectionProps, macrosDisplay } from '@/types/general';
import { getTacoTableFoods, getCustomFoods } from '@/firebase/dataHandling';
import { removeAccents, singularPluralMatch } from '@/utils/helperFunctions';

const FoodBank = () => {
  const colorScheme = useColorScheme() ?? 'dark';

    const tacoTableFoods: Food[] = getTacoTableFoods();
    const [customFoods, setCustomFoods] = useState<Food[]>([]);
    const [combinedFoods, setCombinedFoods] = useState<Food[]>([...tacoTableFoods, ...customFoods]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [visibleItems, setVisibleItems] = useState<number>(10);

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
      setVisibleItems(10);
    };

    const loadMoreItems = () => { setVisibleItems((prev) => prev + 10); };

    return (
      <View style={styles.foodBankOuter}>
        <Text style={[{ color: Colors[colorScheme].text }, styles.pageTitle]}>Banco de Alimentos</Text>

        {/* Filter session */}
        <View style={styles.filterOuter}>
          <Pressable style={styles.filterButton}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.filterText]}>Tabela Taco</Text>
          </Pressable>

          <Pressable style={styles.filterButton}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.filterText]}>Meus Alimentos</Text>
          </Pressable>
        </View>

        <View style={styles.foodSelectionOuter}>
          {/* Search logic */}
          <TextInput
              style={[{ color: Colors[colorScheme].text, backgroundColor: Colors.dark.basicBG }, styles.searchInput]}
              placeholder='Pesquisar...'
              placeholderTextColor='gray'
              onChangeText={doSearch}
              value={searchQuery}
              //autoFocus
          />

          <View style={[ styles.foodSelection , {backgroundColor: Colors.dark.basicBG}]}>
            <FlatList
              data={combinedFoods.slice(0, visibleItems)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: food }) => (
                <Pressable style={styles.foodRow} >
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

        <View>
          <Pressable style={styles.addFoodBtn}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.addFoodText]}>Adicionar Alimento</Text>
          </Pressable>
        </View>

      </View>
    )
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
    foodBankOuter: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: vh,
      width: '100%',
      backgroundColor: Colors.dark.basicBG,
      marginTop: 25,      
    },
    pageTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 20,
    },
    filterOuter: {
      width: '95%',
      marginBottom: 10,
      display: 'flex',
      flexDirection: 'row',
      gap: 10,
    },
    filterButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 99,      
      borderColor: 'gray',
      borderWidth: 1,
    },
    filterText: {
      fontSize: 13,
    },
    foodSelectionOuter: {      
      width: '100%',
      display: 'flex',
      flex: 1,
      flexDirection: 'column',  
      alignItems: 'center',      
    },
    searchInput: {
      fontSize: 13,      
      paddingVertical: 6,
      paddingLeft: 16,
      marginVertical: 10,
      borderRadius: 99,
      borderColor: 'gray',
      borderWidth: 1,     
      width: '95%', 
    },
    foodSelection: {      
      padding: 10,      
      //height: vh * 0.60,
      //overflow: 'hidden',
      width: '100%',
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
      width: '50%',
    },
    foodkcalOuter: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    foodTitleInfo: {
      fontSize: 14,      
    },
    foodTitleInfoSuble: {
      fontSize: 13,
      color: 'gray',
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
    addFoodBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 99,      
      borderColor: 'gray',
      borderWidth: 1,
      position: 'absolute',
      bottom: 0, 
    },
    addFoodText: {
      fontSize: 13,
    },    
});

export default FoodBank;