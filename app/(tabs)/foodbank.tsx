import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Dimensions, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Food, macrosDisplay } from '@/types/typesAndInterfaces';
import { getTacoTableFoods, getCustomFoods } from '@/firebase/dataHandling';
import { removeAccents, singularPluralMatch } from '@/utils/helperFunctions';
import CreateFood from '@/components/CreateFood';
import FoodInfo from '@/components/FoodInfo';

const FoodBank = () => {
  const colorScheme = useColorScheme() ?? 'dark';

    const tacoTableFoods: Food[] = getTacoTableFoods();
    const [ customFoods, setCustomFoods ] = useState<Food[]>([]);
    const [ combinedFoods, setCombinedFoods ] = useState<Food[]>([...tacoTableFoods, ...customFoods]);
    const [ searchQuery, setSearchQuery ] = useState<string>("");
    const [ visibleItems, setVisibleItems ] = useState<number>(10);
    const [ showCreateFood, setShowCreateFood ] = useState<boolean>(false);
    const [ showFoodInfo, setShowFoodInfo ] = useState<boolean>(false);
    const [ foodId, setFoodId ] = useState<string>('');
    const [ activeFilter, setActiveFilter ] = useState<string>('all');

    useEffect(() => {
        getCustomFoods().then((data: Food[]) => setCustomFoods(data));
    }, []);

    useEffect(() => {
      setCombinedFoods([...tacoTableFoods, ...customFoods]);
    }, [customFoods]);
 
    const doSearch = (search: string) => {
      setSearchQuery(search);

      const queryTokens = search.toLowerCase().split(" ").map(removeAccents);
  
      let foodsToSearch: Food[] = [];
      if (activeFilter === 'taco') {
        foodsToSearch = tacoTableFoods;
      } else if (activeFilter === 'custom') {
        foodsToSearch = customFoods;
      } else {
        foodsToSearch = [...tacoTableFoods, ...customFoods];
      }
    
      const filteredFoods = foodsToSearch.filter((food) => {
        const foodTitle = removeAccents(food.title.toLowerCase());
        return queryTokens.every((token) => {
          return singularPluralMatch(token).some((variation) => foodTitle.includes(variation));
        });
      });
  
      setCombinedFoods(filteredFoods);
      setVisibleItems(10);
    };

    const filterFoods = (filter: string) => {
      if (filter === 'taco' && activeFilter !== 'taco') {
        setCombinedFoods(tacoTableFoods);
        setActiveFilter('taco');
      } else if (filter === 'custom' && activeFilter !== 'custom') {
        setCombinedFoods(customFoods);
        setActiveFilter('custom');
      } else {
        setCombinedFoods([...tacoTableFoods, ...customFoods]);
        setActiveFilter('all');
      }
      setVisibleItems(10);
    };

    const loadMoreItems = () => setVisibleItems((prev) => prev + 10);

    return (
      <View style={styles.foodBankOuter}>

        { showCreateFood && <CreateFood setShowCreateFood={setShowCreateFood} customFoods={customFoods} setCustomFoods={setCustomFoods} /> }

        { showFoodInfo && <FoodInfo setShowFoodInfo={setShowFoodInfo} foodId={foodId}/> }

        <Text style={[{ color: Colors[colorScheme].text }, styles.pageTitle]}>Banco de Alimentos</Text>

        {/* Filter session */}
        <View style={styles.filterOuter}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
            <Pressable style={[styles.filterButton, activeFilter == 'taco' && styles.activeFilterBtn]} onPress={()=> filterFoods('taco')}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.filterText]}>Tabela Taco</Text>
            </Pressable>

            <Pressable style={[styles.filterButton, activeFilter == 'custom' && styles.activeFilterBtn]} onPress={()=> filterFoods('custom')}>
              <Text style={[{ color: Colors[colorScheme].text }, styles.filterText]}>Meus Alimentos</Text>
            </Pressable>
          </View>

          <Pressable style={styles.filterButton} onPress={() => setShowCreateFood(true)}>
            <Text style={[{ color: Colors[colorScheme].text }, styles.filterText]}>Adicionar Alimento</Text>
          </Pressable>
        </View>

        <View style={styles.foodSelectionOuter}>
          {/* Search logic */}
          <TextInput
              style={[{ color: Colors[colorScheme].text }, styles.searchInput]}
              placeholder='Pesquisar...'
              placeholderTextColor='gray'
              onChangeText={doSearch}
              value={searchQuery}
              //autoFocus
          />

          <View style={[ styles.foodSelection ]}>
            <FlatList
              data={combinedFoods.slice(0, visibleItems)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: food }) => (
                <Pressable style={styles.foodRow} onPress={() => { setFoodId(food.id); setShowFoodInfo(true); }}>
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
      </View>
    )
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
    foodBankOuter: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',      
      height: vh,
      width: '100%',
      backgroundColor: Colors.dark.background,
      marginTop: 25,      
    },
    pageTitle: {
      fontSize: vh * 0.025,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 20,
    },
    filterOuter: {
      width: '95%',
      marginBottom: 10,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    filterButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 99,      
      borderColor: 'gray',
      borderWidth: 1,
    },
    activeFilterBtn: {
      backgroundColor: Colors.dark.saveBtnBG,
      borderColor: Colors.dark.saveBtnBG,
    },
    filterText: {
      fontSize: vh * 0.015,
    },
    foodSelectionOuter: {      
      width: '100%',
      display: 'flex',
      flexDirection: 'column',  
      alignItems: 'center',
    },
    searchInput: {
      fontSize: 13,      
      paddingVertical: 2,
      paddingLeft: 16,
      marginVertical: 8,
      borderRadius: 99,
      borderColor: 'gray',
      borderWidth: 1,     
      width: '95%', 
    },
    foodSelection: {      
      padding: 10,      
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
      fontSize: vh * 0.015,
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

export default FoodBank;