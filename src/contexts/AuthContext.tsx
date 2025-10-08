import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUser, getUserByEmail, updateLastLogin, createUser } from '../services/userService';
import { validateInvitation, markInvitationUsed } from '../services/invitationService';
import { UserData } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, invitationToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user exists in Firestore
        const firestoreUser = await getUser(user.uid);

        if (!firestoreUser) {
          // User authenticated but not in Firestore - sign them out
          await signOut(auth);
          setCurrentUser(null);
          setUserData(null);
        } else {
          // Update last login
          await updateLastLogin(user.uid);
          setCurrentUser(user);
          setUserData(firestoreUser);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Check if user exists in Firestore
    const firestoreUser = await getUser(userCredential.user.uid);

    if (!firestoreUser) {
      await signOut(auth);
      throw new Error('User not found. You need a valid invitation to access this site.');
    }
  };

  const signup = async (email: string, password: string, invitationToken: string) => {
    // Validate invitation token
    const invitation = await validateInvitation(invitationToken);

    if (!invitation) {
      throw new Error('Invalid or expired invitation token.');
    }

    // Check if invitation email matches
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('This invitation was sent to a different email address.');
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    try {
      // Create user in Firestore
      await createUser(
        userCredential.user.uid,
        email,
        invitation.role,
        invitation.createdBy
      );

      // Mark invitation as used
      await markInvitationUsed(invitation.id!);
    } catch (error) {
      // If Firestore creation fails, delete the auth user
      await userCredential.user.delete();
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Check if user exists in Firestore
    const firestoreUser = await getUserByEmail(result.user.email!);

    if (!firestoreUser) {
      // User not found in Firestore - sign them out
      await signOut(auth);
      throw new Error('Access denied. Your email is not authorized. Please contact an administrator for an invitation.');
    }

    // User exists, update last login
    await updateLastLogin(result.user.uid);
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
