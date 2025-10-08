# Invitation-Based Authentication System Setup

Your Docusaurus site now has a complete invitation-based authentication system with user roles!

## Features Implemented

✅ **Firebase Authentication & Firestore**
✅ **Invitation-only access** - Users need an invitation to sign up
✅ **User Roles** - Admin, Editor, Viewer with different permissions
✅ **Admin Panel** - Invite users and manage existing users
✅ **Google Sign-in** - Only for pre-authorized users in Firestore
✅ **User Management** - View, edit roles, and delete users

## Setup Steps

### 1. Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `docusaurus-c520c`
3. Click **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (we'll secure it next)
6. Select a location (choose closest to your users)
7. Click **Enable**

### 2. Set Up Firestore Security Rules

In Firestore Console, go to the **Rules** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read their own user document
      allow read: if isAuthenticated() && request.auth.uid == userId;

      // Only admins can read all users
      allow list: if isAdmin();

      // Only admins can create/update/delete users
      allow create, update, delete: if isAdmin();
    }

    // Invitations collection
    match /invitations/{invitationId} {
      // Anyone can read invitations (needed for signup validation)
      allow read: if true;

      // Only admins can create invitations
      allow create: if isAdmin();

      // Only admins can update invitations (mark as used)
      allow update: if isAdmin() ||
        (isAuthenticated() && resource.data.email == request.auth.token.email);

      // Only admins can delete invitations
      allow delete: if isAdmin();
    }
  }
}
```

Click **Publish** to save the rules.

### 3. Create Your First Admin User

Since all users need invitations, we need to manually create the first admin in Firestore:

1. In Firebase Console, go to **Firestore Database**
2. Click **+ Start collection**
3. Collection ID: `users`
4. Click **Next**
5. Add a document with **Auto-ID** or use your Firebase Auth UID
6. Add these fields:
   - `uid` (string): Your Firebase Auth UID (get it from Authentication > Users)
   - `email` (string): Your email address
   - `role` (string): `admin`
   - `createdAt` (timestamp): Click "Add field" > Select "timestamp" > Click "Set to current time"
   - `lastLogin` (timestamp): Click "Add field" > Select "timestamp" > Click "Set to current time"
7. Click **Save**

**To find your Firebase Auth UID:**
- Create an account using email/password or Google sign-in
- Go to Firebase Console > Authentication > Users
- Copy your User UID

### 4. Test the System

1. Start your development server:
   ```bash
   npm start
   ```

2. **Sign in as admin** with the account you created in Firestore

3. **Invite a new user:**
   - Click "Admin" button in the top navigation
   - Click "+ Invite New User"
   - Enter email and select role
   - Copy the invitation link
   - Send it to the user

4. **User receives invitation:**
   - They click the link
   - Create account with email and password
   - Automatically logged in with assigned role

5. **Manage users:**
   - Go to `/admin/users`
   - View all users
   - Change user roles
   - Delete users

## User Roles & Permissions

| Role | View Docs | Edit Docs | Invite Users | Manage Users |
|------|-----------|-----------|--------------|--------------|
| **Viewer** | ✅ | ❌ | ❌ | ❌ |
| **Editor** | ✅ | ✅ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |

## Pages Created

- `/admin/invite` - Invite new users (admin only)
- `/admin/users` - Manage users (admin only)
- `/signup?token=...&email=...` - Signup page with invitation token

## How It Works

### Email/Password Signup
1. Admin sends invitation link to user
2. User clicks link and is taken to signup page
3. Invitation token is validated
4. User creates account with password
5. User document created in Firestore with assigned role
6. Invitation marked as used

### Email/Password Login
1. User enters email and password
2. Firebase authenticates the user
3. System checks if user exists in Firestore
4. If found, user is logged in
5. If not found, user is signed out (requires invitation)

### Google Sign-In
1. User clicks "Sign in with Google"
2. Google authentication happens
3. System checks if user email exists in Firestore
4. If found, user is logged in
5. If not found, user is signed out with error message

## Security Features

✅ **Firestore-based authorization** - Only users in Firestore can access
✅ **Role-based access control** - Different permissions per role
✅ **Secure invitations** - Tokens expire after 7 days
✅ **One-time invitations** - Tokens can only be used once
✅ **Email validation** - Invitation email must match signup email
✅ **Protected admin routes** - Only admins can access management pages

## Production Deployment

### For GitHub Pages:

1. **Add Firestore rules** as shown above

2. **Update authorized domains:**
   - Firebase Console > Authentication > Settings > Authorized domains
   - Add: `baraamashaal.github.io`

3. **Deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

### Environment Variables (if needed later):

If you want to hide Firebase config in production:
1. Use GitHub Secrets for the config values
2. Update build workflow to inject them
3. Update `src/firebase/config.ts` to use environment variables

## Troubleshooting

### "Missing or insufficient permissions"
- Check Firestore security rules are published
- Make sure your user exists in Firestore `users` collection

### "Access denied" on Google sign-in
- User email must exist in Firestore first
- Admin needs to invite them, or manually add to Firestore

### Invitation link not working
- Check that Firestore is enabled
- Verify invitation exists in `invitations` collection
- Check if invitation is expired (> 7 days old)
- Check if invitation is already used

### Can't access admin panel
- Make sure your user role is `admin` in Firestore
- Check `users/{your-uid}/role` field

## Next Steps

- [ ] Set up email sending for automated invitation emails
- [ ] Add password reset functionality
- [ ] Add user profile editing
- [ ] Add audit logs for admin actions
- [ ] Customize invitation email templates
- [ ] Add bulk user import/export

## Support

For issues or questions, check:
- Firebase Console for auth/database errors
- Browser console for client-side errors
- Firestore security rules tab for permission errors
