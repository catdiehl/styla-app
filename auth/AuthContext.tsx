import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  User,
  Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';
import { generateNonce, makeAuthRedirectForGoogle } from '../utils/auth';
const AuthSession: any = require('expo-auth-session');

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEYS = {
  USER_LOGGED_IN: 'userLoggedIn',
  USER_DATA: 'userData'
};

const saveLoginState = async (user: User) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_LOGGED_IN, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));
  } catch (error) {
    console.error('Error saving login state:', error);
  }
};

const clearLoginState = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOGGED_IN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error clearing login state:', error);
  }
};

const getStoredLoginState = async () => {
  try {
    const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOGGED_IN);
    return isLoggedIn === 'true';
  } catch (error) {
    console.error('Error getting stored login state:', error);
    return false;
  }
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingUser = useRef<User | null>(null);
  const pendingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!auth) {
      setError('Firebase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const wasLoggedIn = await getStoredLoginState();
              console.log('Stored login state:', wasLoggedIn);
      
      if (wasLoggedIn && isInitialLoad) {
        console.log('Waiting for Firebase auth state restoration...');
      } else if (!wasLoggedIn && isInitialLoad) {
        console.log('No stored login, going directly to app');
        setUser(null);
        setLoading(false);
        setIsInitialLoad(false);
        return;
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      console.log('Firebase auth state changed:', newUser ? 'logged in' : 'logged out');
      pendingUser.current = newUser;
      
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }

      if (newUser) {
        await saveLoginState(newUser);
      } else {
        await clearLoginState();
      }
      
      if (isInitialLoad) {
        if (newUser) {
          setUser(newUser);
          setLoading(false);
          setIsInitialLoad(false);
        } else {
          pendingTimeout.current = setTimeout(() => {
            setUser(null);
            setLoading(false);
            setIsInitialLoad(false);
            pendingTimeout.current = null;
          }, 1000);
        }
      } else {
        const delay = newUser ? 700 : 200;
        pendingTimeout.current = setTimeout(() => {
          setUser(pendingUser.current);
          setLoading(false);
          pendingTimeout.current = null;
        }, delay);
      }
    });

    return () => {
      unsubscribe();
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }
    };
  }, [isInitialLoad]);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured');
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase is not configured');
    }

    try {
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID is not configured');
      }

      const redirectUri = makeAuthRedirectForGoogle();
      console.log('Redirect URI:', redirectUri);
      
      const nonce = await generateNonce();
      console.log('Generated nonce:', nonce);

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };

      const request = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        responseType: 'id_token',
        scopes: ['openid', 'profile', 'email'],
        usePKCE: false,
        extraParams: { nonce, prompt: 'select_account' },
      });

      await request.makeAuthUrlAsync(discovery);
      const result = await request.promptAsync(discovery, { useProxy: false });
      console.log('AuthSession result:', result?.type);

      if (result.type === 'success') {
        const idToken = result.params?.id_token;
        if (!idToken) {
          throw new Error('No ID token received');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        return true;
      } else {
        console.log('Auth was not successful:', result);
        throw new Error('Google sign in was cancelled or failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase is not configured');
    }
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 