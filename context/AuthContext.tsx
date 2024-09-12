import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { setLoggedUser } from '@/utils/helperFunctions';

const AuthContext = createContext<boolean>(false);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('user logged in');
        setLoggedUser(user.uid);
      } else {
        setLoggedUser(null);
      }
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={isAuthChecked}>
      {children}
    </AuthContext.Provider>
  );
}
