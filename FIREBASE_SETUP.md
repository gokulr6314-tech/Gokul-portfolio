# Firebase Database Integration Guide

This application is ready to connect with your Firebase database (Cloud Firestore or Realtime Database) to store messages submitted via the **Direct Transmission Form** in the Contact section.

---

## 4 Easy Ways to Connect Your Firebase Database

Choose whichever method you prefer:

### Option 1: Connect via File (Drag & Drop / Upload)
1. In the website, scroll to the **Contact** section and click **"Connect Firebase"**.
2. Under **Connection Method**, click **"Connect via File"**.
3. Drag & drop or select your config file from your computer:
   - Supports:
     - `firebaseConfig.json` (Firebase Web config)
     - `google-services.json` (Android/mobile Firebase config)
     - `.env` file (containing `VITE_FIREBASE_*` keys)
     - `.js` / `.ts` config snippet files
4. The credentials will be auto-detected and parsed. Click **"Test Connection"** and **"Save & Connect"**.

---

### Option 2: Load Directly from Local Project Files
If you already pasted your keys into the project's [`.env`](file:///.env) or [`src/firebase.config.ts`](file:///src/firebase.config.ts):
- Click **"Connect Firebase"** > **"Load from .env"** to immediately read and apply the credentials.

---

### Option 3: In the App UI (Quick Paste Code/JSON)
1. In the **"Connect Firebase"** modal, select the **"Paste Code/JSON"** tab.
2. Paste the `const firebaseConfig = { ... }` snippet or JSON from the Firebase Console.
3. Click **"Auto-Detect & Fill Fields"** > **"Save & Connect"**.

---

### Option 4: In the `.env` File
Open the [`.env`](file:///.env) file at the root of your project and paste your keys:

```bash
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef..."
VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com" # (only needed for Realtime DB)
```

---

### Option 3: In `src/firebase.config.ts`
Open [`src/firebase.config.ts`](file:///src/firebase.config.ts) and paste your configuration object:

```typescript
export const defaultFirebaseConfig: Partial<FirebaseConfig> = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Where to Find Your Firebase API Config in Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Click the **Gear icon (⚙️)** next to **Project Overview** in the left sidebar > **Project settings**.
4. In the **General** tab, scroll down to **Your apps**.
5. Under your web app (`</>`), select **Config**.
6. Copy the values or the entire snippet.

---

## Database Security Rules

Make sure your database rules allow contact submissions:

### For Cloud Firestore:
In Firebase Console > **Firestore Database** > **Rules**, paste the rules from [`firestore.rules`](file:///firestore.rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow create: if request.resource.data.name is string
                    && request.resource.data.email is string
                    && request.resource.data.message is string;
      allow read: if true;
      allow update, delete: if false;
    }
  }
}
```

### For Realtime Database:
In Firebase Console > **Realtime Database** > **Rules**, paste the rules from [`database.rules.json`](file:///database.rules.json):
```json
{
  "rules": {
    "messages": {
      ".read": true,
      ".write": true
    }
  }
}
```
