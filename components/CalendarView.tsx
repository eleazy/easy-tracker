import React, { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, Text, Dimensions, BackHandler } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import {  getTotalCaloriesOfMonth } from "@/firebase/dataHandling";
import { CalendarViewProps } from "@/types/typesAndInterfaces";
import { AddOrSubDay, getDaysOfMonth, monthName } from "@/utils/helperFunctions";

const CalendarView = ({ setShowCalendar, foodDiaryDay, setFoodDiaryDay }: CalendarViewProps) => {
    const colorScheme = useColorScheme() ?? 'dark';

    const [ calorieTotals, setCalorieTotals ] = useState<{ [key: string]: string }>({});

    const year = Number(foodDiaryDay.split('-')[0]);
    const month = Number(foodDiaryDay.split('-')[1]) - 1; // Adjust for 0-indexed months

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const daysArray = getDaysOfMonth(year, month);

    const calendarGrid = new Array(firstDay).fill(null).concat(daysArray);

    useEffect(() => {
      // Fetch total calories for the month      
      getTotalCaloriesOfMonth(year, month+1)
        .then((totals) => {
          setCalorieTotals(totals);
        })
        .catch((error) => { console.error(error); });

      // Override the back button to close the calendar
      const backAction = () => {
        setShowCalendar(false);
        return true;
      };
      const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
      );
      return () => backHandler.remove();
      
    }, [month]);

    const changeMonth = (offset: number) => {
      const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
      const newStringDate = AddOrSubDay(foodDiaryDay, offset * daysInCurrentMonth);
      setFoodDiaryDay(newStringDate);
    };

    const openDay = (day: number) => {
      setFoodDiaryDay(`${year}-${month+1 < 10 ? `0${month+1}` : month+1}-${day < 10 ? `0${day}` : day}`)
      setShowCalendar(false);
    };

    return (
      <View style={styles.calendarOuter}>

        <View style={styles.monthChangeOuter}>
          <Pressable onPress={() => changeMonth(-1)}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </Pressable>

          <Text style={[{ color: Colors[colorScheme].text }, styles.monthTitle]}>{monthName(month)}</Text>          

          <Pressable onPress={() => changeMonth(1)}>
            <Ionicons name="arrow-forward" size={24} color={Colors[colorScheme].text} />
          </Pressable>
        </View>
         
        <View style={styles.calendarGridOuter}> 
  
          <View style={styles.daysOfWeekRow}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day, index) => (
              <Text key={index} style={[{ color: Colors[colorScheme].text }, styles.dayOfWeek]}>{day}</Text>                
            ))}
          </View>
  
          {/* Render the days in a 7-column grid */}
          <View style={styles.calendarGrid}>
            {calendarGrid.map((day, index) => (

              <Pressable key={index} style={styles.calendarDayOuter} onPress={() => openDay(day)}>
                <View>
                  {day ? <Text style={styles.calendarDay}>{day}</Text> : <Text></Text>}

                  <Text style={[{ color: Colors[colorScheme].text }, styles.dayTotalCalorie]}>
                    { day ? calorieTotals[`${year}-${month+1 < 10 ? `0${month+1}` : month+1}-${day < 10 ? `0${day}` : day}`] || '0' : <Text></Text> }
                  </Text>
                </View>
              </Pressable>

            ))}
          </View>
  
        </View>
  
      </View>
    );
  }
  
  const vh = Dimensions.get('window').height;
  const vw = Dimensions.get('window').width;
  
  const styles = StyleSheet.create({
    calendarOuter: {
      height: '100%',
      padding: 20,
    },
    monthChangeOuter: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },   
    monthTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    calendarGridOuter: {
      display: 'flex',
      flexDirection: 'column',
    },
    daysOfWeekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    dayOfWeek: {
      width: `${100 / 7}%`,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 16,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',      
    },
    calendarDayOuter: {      
      width: `${100 / 7}%`,
      height: 100,
      justifyContent: 'flex-start',
      paddingTop: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'gray',
    },
    calendarDay: {
      fontSize: 16,
      textAlign: 'center',
      color:'gray'      ,
    },
    dayTotalCalorie: {
      fontSize: 13,      
    },
  });
  
  export default CalendarView;