"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithPopup,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User,
  AuthError
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isConfigured = auth !== null;

  // Set up auth state listener - this is the primary way we detect login state
  useEffect(() => {
    if (!auth || typeof window === 'undefined') {
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google via popup
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      console.error("Firebase auth is not initialized");
      throw new Error("Firebase auth is not initialized");
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      // Check if error is a Firebase AuthError 
      const authError = error as AuthError;
      
      // Firebase error codes for popup being closed
      // auth/popup-closed-by-user or auth/cancelled-popup-request
      if (authError.code === 'auth/popup-closed-by-user' || 
          authError.code === 'auth/cancelled-popup-request') {
        console.log('User closed the popup window, not throwing error');
        return; // Don't rethrow the error when user just closed the popup
      }
      
      console.error("Error during Google sign-in:", error);
      throw error; // Rethrow other errors so they can be handled by the caller
    }
  };

  // Sign out
  const signOut = async () => {
    if (!auth) {
      console.error("Firebase auth is not initialized");
      return;
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 