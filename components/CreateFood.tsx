import React, { useEffect, useState, useRef, RefObject } from "react";
import { StyleSheet, View, TextInput, Pressable, Text, Dimensions, Alert, BackHandler } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import { macrosDisplay, CreateFoodProps, MacroInput, MacroInputsObj, Food } from "@/types/general";
import { addCustomFood } from "@/firebase/dataHandling";

const CreateFood = ({ setShowCreateFood, customFoods, setCustomFoods }: CreateFoodProps) => {
    const colorScheme = useColorScheme() ?? 'dark';

    const [ titleInput, setTitleInput ] = useState<string>('');
    const [ portionInput, setPortionInput ] = useState<string>('');
    const [ carbInput, setCarbInput ] = useState<string>('');
    const [ fatInput, setFatInput ] = useState<string>('');
    const [ protInput, setProtInput ] = useState<string>('');
    const [ calories, setCalories ] = useState<number>(0);    

    const nameRef = useRef<TextInput>(null);
    const portionRef = useRef<TextInput>(null);
    const carbRef = useRef<TextInput>(null);
    const fatRef = useRef<TextInput>(null);
    const protRef = useRef<TextInput>(null);

    const macroInputsObj: MacroInputsObj = {
        carbs: { value: carbInput, setValue: setCarbInput, ref: carbRef },
        fats: { value: fatInput, setValue: setFatInput, ref: fatRef },
        protein: { value: protInput, setValue: setProtInput, ref: protRef },
    };

    useEffect(() => {
        const cals = (Number(carbInput) * 4) + (Number(fatInput) * 9) + (Number(protInput) * 4);
        setCalories(cals);

        // Override the back button to close adding food
        const backAction = () => {
            setShowCreateFood(false);
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();

    }, [carbInput, fatInput, protInput]);

    const addFood = () => {
        const food: Food = {
            id: '',
            idMeal: '',
            calories,
            macroNutrients: {
              carbs: Number(carbInput),
              fats: Number(fatInput),
              protein: Number(protInput),              
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

    const handleSubmitEditing = (nextInputRef: RefObject<TextInput>) => {
        if (nextInputRef.current) {
            nextInputRef.current.focus();
        }
    };

    return (
        <View style={styles.createFoodOuter}>
            
            <Text style={[{ color: Colors[colorScheme].text }, styles.pageTitle]}>Adicionar Alimento</Text>

            <View style={styles.createFoodForm}>
                <TextInput 
                    style={[{ color: Colors[colorScheme].text }, styles.nameInput]}
                    placeholder="Nome"
                    placeholderTextColor="gray"
                    value={titleInput}
                    onChangeText={(text) => setTitleInput(text)}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => handleSubmitEditing(portionRef)}
                    ref={nameRef}
                />

                <View style={styles.calorieOuter}>
                    <View style={styles.calorieValueOuter}>
                        <Text style={[{ color: Colors[colorScheme].text }, styles.inputLabelText]}>Calorias</Text>
                        <Text style={[{ color: Colors[colorScheme].text }, styles.calorieValue]}>{calories}</Text>
                    </View>

                    <View style={styles.portionInputOuter}>
                        <Text style={[{ color: Colors[colorScheme].text }, styles.inputLabelText]}>Porção</Text>
                        <TextInput
                            inputMode="numeric"
                            style={[{ color: Colors[colorScheme].text }, styles.portionInput]}
                            value={portionInput}
                            onChangeText={(text) => setPortionInput(text)}
                            onSubmitEditing={() => handleSubmitEditing(carbRef)}
                            returnKeyType="next"
                            ref={portionRef}
                        />
                    </View>
                </View>

                {/* Macro inputs */}
                {Object.keys(macroInputsObj).map((macro, index) => {
                    const { value, setValue, ref } = macroInputsObj[macro as keyof MacroInputsObj];
                    return (
                        <View style={styles.macroInputOuter} key={index}>
                            <Text style={[{ color: Colors[colorScheme].text }, styles.inputLabelText]}>{macrosDisplay[macro as keyof typeof macrosDisplay]}</Text>
                            <TextInput
                                inputMode="numeric"
                                style={[{ color: Colors[colorScheme].text }, styles.valueInput]}
                                value={value}
                                onChangeText={(text) => setValue(text)}
                                onSubmitEditing={() => {
                                    if (index < Object.keys(macroInputsObj).length - 1) {
                                        handleSubmitEditing(Object.values(macroInputsObj)[index + 1].ref);
                                    }
                                }}
                                returnKeyType={index < Object.keys(macroInputsObj).length - 1 ? 'next' : 'done'}
                                ref={ref}
                            />
                        </View>
                    )
                })}

            </View>

            <Pressable style={styles.createFoodButton} onPress={() => addFood()}>
                <Text style={[{ color: Colors[colorScheme].text }, styles.createFoodButtonText]}>Adicionar</Text>
            </Pressable>                
        </View>
    )
}

const vh = Dimensions.get('window').height;

const styles = StyleSheet.create({
    createFoodOuter: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        margin: 20,
    },
    createFoodForm: {
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 10,
    },
    inputLabelText: {
        fontSize: 14,
        fontWeight: 'bold',
        //marginBottom: 5,
        color: 'gray',
    },
    nameInput: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        fontSize: 16,
    },
    calorieOuter: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,        
    },
    portionInputOuter: {
        width: '50%',
        display: 'flex',
        flexDirection: 'row',        
        gap: 10,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    portionInput: {
        width: '40%',
        //marginBottom: 10,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        fontSize: 16,
    },
    calorieValueOuter: {
        width: '50%',                
        fontSize: 16,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 10,
        alignItems: 'flex-end',
    },
    calorieValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    valueInput: {
        width: '20%',
        marginBottom: 4,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        fontSize: 16,
    },
    macroInputOuter: {
        //width: '100%',
        display: 'flex',
        flexDirection: 'row',
        //justifyContent: 'flex-start',
        gap: 10,
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    createFoodButton: {        
        borderRadius: 99,
        marginTop: 20,
    },
    createFoodButtonText: {        
        fontSize: 16,
        fontWeight: 'bold',
    },    

});

export default CreateFood