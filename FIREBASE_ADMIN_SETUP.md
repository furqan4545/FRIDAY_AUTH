# Firebase Admin SDK Setup

This guide will help you set up the Firebase Admin SDK to enable server-side access to Firebase services, particularly Firestore, which is used to store and retrieve user subscription data.

## 1. Generate a Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** (gear icon) > **Service accounts**
4. Click **Generate new private key**
5. Save the downloaded JSON file securely - it contains sensitive credentials

## 2. Add Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

For the private key, copy it exactly as it appears in the JSON file, including the quotation marks. If you encounter issues with newlines, replace them with `\\n`:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...rest-of-key...T8/bQIDAQAB\n-----END PRIVATE KEY-----\n"
```

## 3. Setup Firestore Database

1. In the Firebase Console, go to **Firestore Database**
2. If not already created, click **Create database**
3. Choose your location and start in production mode
4. Set up the following security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to user documents
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only server can write
    }
    
    // Deny access to all other documents
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 4. Create Indexes for Queries

The webhook handler performs queries on `customerId` and `subscriptionId` fields. Create indexes for these:

1. Go to **Firestore Database** > **Indexes** tab
2. Create a single-field index for:
   - Collection: `users`, Field: `customerId`, Order: `Ascending`
3. Create another index for:
   - Collection: `users`, Field: `subscriptionId`, Order: `Ascending`

## 5. Testing

After setting everything up:

1. Make a test purchase using Stripe
2. The webhook should create a document in the `users` collection
3. The dashboard should display the secret key for paid users 