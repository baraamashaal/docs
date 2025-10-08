import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserData, UserRole } from '../types/user';

const USERS_COLLECTION = 'users';

/**
 * Create a new user in Firestore
 */
export const createUser = async (
  uid: string,
  email: string,
  role: UserRole,
  invitedBy?: string
): Promise<void> => {
  const userData: UserData = {
    uid,
    email: email.toLowerCase(),
    role,
    createdAt: new Date(),
    lastLogin: new Date(),
    invitedBy,
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), {
    ...userData,
    createdAt: Timestamp.fromDate(userData.createdAt),
    lastLogin: Timestamp.fromDate(userData.lastLogin!),
  });
};

/**
 * Get user data from Firestore
 */
export const getUser = async (uid: string): Promise<UserData | null> => {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    uid: userDoc.id,
    email: data.email,
    role: data.role,
    displayName: data.displayName,
    createdAt: data.createdAt.toDate(),
    lastLogin: data.lastLogin?.toDate(),
    invitedBy: data.invitedBy,
  };
};

/**
 * Check if user exists by email
 */
export const getUserByEmail = async (email: string): Promise<UserData | null> => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', email.toLowerCase())
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  const data = userDoc.data();

  return {
    uid: userDoc.id,
    email: data.email,
    role: data.role,
    displayName: data.displayName,
    createdAt: data.createdAt.toDate(),
    lastLogin: data.lastLogin?.toDate(),
    invitedBy: data.invitedBy,
  };
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    lastLogin: Timestamp.now(),
  });
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<UserData[]> => {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email,
      role: data.role,
      displayName: data.displayName,
      createdAt: data.createdAt.toDate(),
      lastLogin: data.lastLogin?.toDate(),
      invitedBy: data.invitedBy,
    };
  });
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  uid: string,
  role: UserRole
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { role });
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (uid: string): Promise<void> => {
  await deleteDoc(doc(db, USERS_COLLECTION, uid));
};
