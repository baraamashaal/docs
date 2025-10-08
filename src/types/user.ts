export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: Date;
  lastLogin?: Date;
  invitedBy?: string;
}

export interface InvitationData {
  id?: string;
  email: string;
  role: UserRole;
  token: string;
  createdAt: Date;
  createdBy: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

export const ROLE_PERMISSIONS = {
  admin: {
    canInviteUsers: true,
    canManageUsers: true,
    canEditContent: true,
    canViewContent: true,
  },
  editor: {
    canInviteUsers: false,
    canManageUsers: false,
    canEditContent: true,
    canViewContent: true,
  },
  viewer: {
    canInviteUsers: false,
    canManageUsers: false,
    canEditContent: false,
    canViewContent: true,
  },
};
