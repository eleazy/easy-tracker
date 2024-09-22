import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { navigate } from '@/components/navigation/navigationRef';

export default function Account() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigate to the login screen after successful sign-out
      navigate('login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Account</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
