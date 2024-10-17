import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
//import { getReactNativePersistence } from 'firebase/auth/react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCVH__PyiMRyn4Nrexpblq9sWqlMeDX-LY',
  authDomain: 'easy-tracker-124cc.firebaseapp.com',
  projectId: 'easy-tracker-124cc',
  storageBucket: 'easy-tracker-124cc.appspot.com',
  messagingSenderId: '252834484314',
  appId: '1:252834484314:web:5d3714da7e6243559bc863',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });
export const auth = getAuth(app);

// navhut973