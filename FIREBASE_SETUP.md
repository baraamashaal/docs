# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your Docusaurus site.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter a project name and follow the setup wizard
4. Once created, you'll be redirected to your project dashboard

## Step 2: Enable Authentication Methods

1. In the Firebase Console, click on "Authentication" in the left sidebar
2. Click on the "Sign-in method" tab
3. Enable the authentication providers you want to use:
   - **Email/Password**: Click on it, toggle "Enable", and save
   - **Google**: Click on it, toggle "Enable", add a project support email, and save
   - Add other providers as needed

## Step 3: Register Your Web App

1. In the Firebase Console, go to Project Settings (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click on the web icon `</>`
4. Enter an app nickname (e.g., "Docs Site")
5. Click "Register app"
6. You'll see your Firebase configuration object

## Step 4: Configure Your Application

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in the `.env` file with values from the Firebase Console:
   ```
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. **IMPORTANT**: Never commit the `.env` file to version control. It's already added to `.gitignore`.

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings > Authorized domains
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourdomain.com`)
   - For GitHub Pages: `username.github.io`

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. You should see the login page
3. Try creating an account with email/password
4. Try signing in with Google (if enabled)

## Features Implemented

### Authentication Methods
- ✅ Email/Password authentication
- ✅ Google Sign-in
- ✅ Sign up for new users

### Components Created
- **Login Component**: Full-featured login/signup form
- **Private Route**: Protects all documentation behind authentication
- **User Profile**: Shows logged-in user email with logout button
- **Auth Context**: Manages authentication state across the app

### Protected Content
All documentation is now protected. Users must log in to access any content.

## Customization

### Change What's Protected
Edit `src/theme/Root.tsx` to customize what requires authentication:

```tsx
// To protect only specific routes instead of everything:
export default function Root({ children }) {
  return (
    <AuthProvider>
      {/* Remove PrivateRoute wrapper to make site public */}
      {/* Add PrivateRoute only around specific components */}
      {children}
    </AuthProvider>
  );
}
```

### Styling
- Login styles: `src/components/Login.module.css`
- User profile styles: `src/components/UserProfile.module.css`

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
Add your domain to Authorized domains in Firebase Console.

### Environment variables not loading
Make sure your `.env` file is in the root directory and restart your dev server.

### Google Sign-in not working
1. Check that Google provider is enabled in Firebase Console
2. Verify authorized domains include your current domain
3. Make sure you've added a support email in the Google provider settings

## Security Notes

- The `.env` file is gitignored to keep your credentials safe
- Never expose your Firebase config in public repositories
- For production, use environment variables in your hosting platform
- Firebase security rules should be configured for your Firestore/Storage if you add those features later

## Production Deployment

For GitHub Pages or other static hosts:
1. Set environment variables in your hosting platform's dashboard
2. For GitHub Pages, use GitHub Secrets and update your workflow file
3. Make sure to add your production domain to Firebase authorized domains

## Next Steps

- Add user profiles or user-specific data
- Implement password reset functionality
- Add email verification
- Customize the login page design
- Add role-based access control
