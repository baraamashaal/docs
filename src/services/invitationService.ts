import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { InvitationData, UserRole } from '../types/user';

const INVITATIONS_COLLECTION = 'invitations';

/**
 * Generate a random invitation token
 */
const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

/**
 * Create a new invitation
 */
export const createInvitation = async (
  email: string,
  role: UserRole,
  createdBy: string
): Promise<string> => {
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation: Omit<InvitationData, 'id'> = {
    email: email.toLowerCase(),
    role,
    token,
    createdAt: now,
    createdBy,
    expiresAt,
    used: false,
  };

  const docRef = await addDoc(collection(db, INVITATIONS_COLLECTION), {
    ...invitation,
    createdAt: Timestamp.fromDate(invitation.createdAt),
    expiresAt: Timestamp.fromDate(invitation.expiresAt),
  });

  return token;
};

/**
 * Validate an invitation token
 */
export const validateInvitation = async (
  token: string
): Promise<InvitationData | null> => {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('token', '==', token),
    where('used', '==', false)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const invitationDoc = querySnapshot.docs[0];
  const data = invitationDoc.data();

  // Check if expired
  const expiresAt = data.expiresAt.toDate();
  if (expiresAt < new Date()) {
    return null;
  }

  return {
    id: invitationDoc.id,
    email: data.email,
    role: data.role,
    token: data.token,
    createdAt: data.createdAt.toDate(),
    createdBy: data.createdBy,
    expiresAt: expiresAt,
    used: data.used,
  };
};

/**
 * Mark invitation as used
 */
export const markInvitationUsed = async (invitationId: string): Promise<void> => {
  const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
  await updateDoc(invitationRef, {
    used: true,
    usedAt: Timestamp.now(),
  });
};

/**
 * Get all invitations (admin only)
 */
export const getAllInvitations = async (): Promise<InvitationData[]> => {
  const querySnapshot = await getDocs(collection(db, INVITATIONS_COLLECTION));

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      role: data.role,
      token: data.token,
      createdAt: data.createdAt.toDate(),
      createdBy: data.createdBy,
      expiresAt: data.expiresAt.toDate(),
      used: data.used,
      usedAt: data.usedAt?.toDate(),
    };
  });
};
