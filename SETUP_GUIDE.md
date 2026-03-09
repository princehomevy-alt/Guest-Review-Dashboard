# Firebase Setup Guide

## Step-by-Step Firebase Configuration

This guide walks you through setting up Firebase for the Guest Review Operational Intelligence Dashboard.

---

## Part 1: Create Firebase Project

### 1.1 Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "Guest-Review-Dashboard")
4. Click **"Continue"**
5. Disable Google Analytics (optional) and create project
6. Wait for project to provision (1-2 minutes)

### 1.2 Create Firestore Database

1. In Firebase Console, navigate to **"Firestore Database"** from left sidebar
2. Click **"Create database"**
3. Select region closest to you (e.g., `us-central1`)
4. Start in **"Production mode"** (we'll update security rules)
5. Click **"Enable"** and wait for database creation

---

## Part 2: Get Firebase Credentials

### 2.1 Access Project Settings

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Navigate to **"Your apps"** section
4. Click **"</>  Web"** to create a web app, or select existing

### 2.2 Register Web App

If creating new web app:
1. Click **"Register app"**
2. Enter app name (e.g., "Guest Review Dashboard")
3. Copy the provided Firebase configuration
4. This gives you the `firebaseConfig` object

### 2.3 Copy Your Credentials

You'll need these credentials:
```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789abcdef"
}
```

---

## Part 3: Update Dashboard Configuration

### 3.1 Edit Firebase Configuration

1. Open `js/firebase.js` in your code editor
2. Find the `firebaseConfig` object (around line 18)
3. Replace with your actual credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. Save the file

---

## Part 4: Configure Firestore Security Rules

### 4.1 Set Security Rules (Development)

⚠️ **For Development Only**: These rules allow read/write to authenticated users.

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Rules"** tab
3. Replace rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development: Allow authenticated users to read/write everything
    match /{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

4. Click **"Publish"**

### 4.2 Production Security Rules (Later)

When moving to production, use role-based access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties
    match /properties/{propertyId} {
      allow read: if request.auth.uid != null;
      allow create, update: if request.auth.uid != null && 
        request.resource.data.owner == request.auth.uid;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Guests
    match /guests/{guestId} {
      allow read, write: if request.auth.uid != null;
    }
    
    // Action Plans
    match /actionPlans/{actionId} {
      allow read: if request.auth.uid != null;
      allow create, update: if request.auth.uid != null;
    }
  }
}
```

---

## Part 5: Enable Authentication (Optional for MVP)

### 5.1 Enable Anonymous Authentication

For MVP, enable anonymous auth to test without login:

1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"** or go to **"Sign-in method"**
3. Click **"Anonymous"**
4. Toggle enable and click **"Save"**

### 5.2 Add Email/Password Auth (Later)

1. In **"Sign-in method"**, click **"Email/Password"**
2. Enable and save
3. Later implement login in dashboard

---

## Part 6: Firestore Data Structure

### 6.1 Create Collections

Firebase will auto-create collections when you add data. Required collections:

- `properties` - Rental units
- `reviews` - Guest reviews
- `guests` - Guest information  
- `actionPlans` - Issue tracking

### 6.2 Initial Structure

When you add your first item in the dashboard, it will create these collections automatically.

---

## Part 7: Testing Firebase Connection

### 7.1 Test Local Setup

1. Open dashboard in browser (file:// or local server)
2. Check browser console (F12)
3. Should see: `✓ Firebase initialized successfully`

### 7.2 Troubleshooting

If you see errors:

**Error: "apiKey is not defined"**
- Check you replaced all placeholders in firebaseConfig

**Error: "permission-denied"**
- Check Firestore security rules allow your auth method
- If using anonymous, enable in Firebase Console

**Error: "Firestore is not available"**
- Make sure Firestore Database is created in Firebase Console

---

## Part 8: Local Development with Emulator (Optional)

### 8.1 Install Firebase Emulator

```bash
npm install -g firebase-tools
firebase init emulator
```

### 8.2 Start Emulator

```bash
firebase emulator:start
```

### 8.3 Use Emulator in Dashboard

In `js/firebase.js`, uncomment the emulator connection code:

```javascript
if (window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    isEmulator = true;
    console.log('✓ Connected to Firebase Emulator');
  } catch (error) {
    console.log('Firebase Emulator not available');
  }
}
```

---

## Part 9: GitHub Pages Deployment

### 9.1 Create GitHub Repository

1. Create new repo on GitHub (e.g., `guest-review-dashboard`)
2. Clone locally:
```bash
git clone https://github.com/yourusername/guest-review-dashboard.git
cd guest-review-dashboard
```

### 9.2 Add Project Files

1. Copy all dashboard files to repository
2. Make sure `index.html` is in root directory
3. Structure:
```
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── firebase.js
│   ├── api.js
│   ├── dashboard.js
│   ├── properties.js
│   ├── reviews.js
│   ├── actions.js
│   └── utils.js
├── data-model.md
├── SETUP_GUIDE.md
└── DEPLOYMENT_GUIDE.md
```

### 9.3 Push to GitHub

```bash
git add .
git commit -m "Initial commit: Guest Review Dashboard"
git push origin main
```

### 9.4 Enable GitHub Pages

1. Go to repository Settings
2. Scroll to **"GitHub Pages"**
3. Set Source to "main" branch
4. Click "Save"
5. Site will be available at: `https://yourusername.github.io/guest-review-dashboard/`

---

## Part 10: Configure CORS (If Needed)

### 10.1 Verify CORS Configuration

By default, Firebase SDK handles CORS. If issues:

1. In Firebase Console, go to **"Settings"** > **"Authorized domains"**
2. Add your GitHub Pages domain: `yourusername.github.io`
3. Add localhost for testing: `localhost:3000`, etc.

---

## Part 11: Load Sample Data (Optional)

### 11.1 Using Dashboard UI

1. Open dashboard
2. Go to **"Properties"** page
3. Click **"+ Add New Property"**
4. Fill in sample property details
5. Repeat for multiple properties

### 11.2 Load Via Code

In `index.html`, uncomment this line in the initialization:

```javascript
// await loadSampleData();
```

This will create 3 sample properties.

---

## Verification Checklist

- [ ] Firebase project created
- [ ] Firestore database created
- [ ] Firebase credentials copied
- [ ] `js/firebase.js` updated with credentials
- [ ] Firestore security rules published
- [ ] Authentication method enabled
- [ ] Dashboard opens without errors
- [ ] Console shows "✓ Firebase initialized successfully"
- [ ] Can add new properties in dashboard
- [ ] Can add new reviews in dashboard

---

## Troubleshooting

### Dashboard won't load

1. Check browser console (F12) for errors
2. Verify Firebase credentials in `js/firebase.js`
3. Clear browser cache and reload
4. Check internet connection

### Can't add data to Firestore

1. Check security rules allow your auth method
2. Verify Firestore database is created
3. Check collection names match API module

### Data not persisting

1. Confirm you see ✓ in Firestore console for new documents
2. Check browser storage isn't being cleared
3. Reload page and check if data returns

---

## Next Steps

1. **Local Testing**: Test all features locally before deploying
2. **Load Sample Data**: Create representative test data
3. **Team Access**: Add team members to Firebase project
4. **Production Security**: Implement proper authentication rules
5. **Backup Strategy**: Enable Firestore backup in Firebase Console
6. **Monitoring**: Set up Firebase monitoring and alerts

---

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [GitHub Pages Help](https://docs.github.com/en/pages)

---

## Important Security Notes

⚠️ **For Development Only**: The current setup allows unauthenticated read/write for testing.

For **Production**, implement:
- User authentication (Firebase Auth)
- Role-based access control
- Data validation
- Rate limiting
- Audit logging

See `data-model.md` for SaaS scaling security recommendations.
