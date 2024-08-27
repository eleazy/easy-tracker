import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';

import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";

interface LoginProps {}

export default function Login({}: LoginProps): JSX.Element {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [blockInput, setBlockInput] = useState<boolean>(false);
    const [signUp, setSignUp] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const fixMessage = (message: string): string => message.slice(5).split('-').join(' ');

    const userLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Handle successful login
            })
            .catch((error) => {
                if (error.code === 'auth/invalid-login-credentials') {
                    Alert.alert('That email address is invalid!');
                } else {
                    error.message && Alert.alert(fixMessage(error.code));
                }
            });
    };

    const userRegister = async () => {        
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setDoc(doc(db, "users", email), { email });

                setBlockInput(true);
            })
            .catch((error) => {
                error.message && Alert.alert(fixMessage(error.code));
            });
    };

    const anonymousLogin = () => {
        signInAnonymously(auth)
            .catch(error => {
                console.error(error);
            });
    };
    
    const inputValue = [email, password];
    const inputSetters = [setEmail, setPassword];
    const inputMode: ('numeric' | 'email' | 'text')[] = ['numeric', 'email', 'text'];

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                {['Email', 'Password'].map((e, i) => {                    
                    return (
                        <View key={i} style={styles.inputGroup}>
                            <Text style={styles.label}>{e}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={inputSetters[i]}
                                    inputMode={inputMode[i]}
                                    secureTextEntry={e === "Password" && !showPassword}
                                    maxLength={e === 'Age' ? 2 : 40}
                                    autoFocus={i === 0}
                                    value={inputValue[i]}
                                    editable={!blockInput}
                                />
                                {e === 'Password' && (
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Text style={styles.showHideButton}>{showPassword ? 'Hide' : 'Show'}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {e === "Password" && (
                                <Text style={styles.passwordHint}>At least 6 characters</Text>
                            )}
                        </View>
                    )
                })}

                <TouchableOpacity onPress={signUp ? userLogin : userRegister}>
                    <Text style={styles.button}>{signUp ? 'Log In' : 'Sign Up'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    setSignUp(!signUp);
                    setShowPassword(false);
                }}>
                    <Text style={styles.switchButton}>{signUp ? 'Sign Up instead' : 'Return'}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={anonymousLogin}>
                <Text style={styles.guestButton}>Continue in guest mode</Text>
            </TouchableOpacity>
        </View>
    );
}

// StyleSheet for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 8,
    },
    formContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    inputGroup: {
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        color: '#d3d3d3',
        fontSize: 20,
        paddingBottom: 8,
    },
    inputContainer: {
        backgroundColor: '#4A4A4A',
        borderRadius: 16,
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        color: '#ffffff',
        width: '100%',
        height: 48,
        textAlign: 'center',
        paddingHorizontal: 8,
        fontSize: 20,
    },
    showHideButton: {
        color: '#d3d3d3',
        fontSize: 12,
        position: 'absolute',
        right: 10,
    },
    passwordHint: {
        color: '#d3d3d3',
        fontSize: 14,
        marginTop: 8,
    },
    button: {
        color: '#ffffff',
        fontSize: 18,
        borderColor: '#A9A9A9',
        borderWidth: 1,
        padding: 8,
        paddingHorizontal: 16,
        textAlign: 'center',
        borderRadius: 16,
    },
    switchButton: {
        color: '#ffffff',
        fontSize: 18,
        marginTop: 16,
    },
    guestButton: {
        color: '#d3d3d3',
        fontSize: 18,
        marginTop: 40,
    },
});
