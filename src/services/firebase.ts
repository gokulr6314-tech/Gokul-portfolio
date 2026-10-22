/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  Firestore 
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  push, 
  get, 
  query as rtdbQuery, 
  limitToLast,
  Database 
} from 'firebase/database';
import { FirebaseConfig, ContactSubmission } from '../types';

const STORAGE_KEY = 'portfolio_firebase_config';
const DB_TYPE_KEY = 'portfolio_firebase_db_type'; // 'firestore' | 'realtime'

export type DatabaseType = 'firestore' | 'realtime';

let activeApp: FirebaseApp | null = null;
let activeFirestore: Firestore | null = null;
let activeDatabase: Database | null = null;

import { defaultFirebaseConfig } from '../firebase.config';

/**
 * Retrieve saved Firebase config from localStorage, Vite environment variables, or firebase.config.ts
 */
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  // 1. Check localStorage first (user-configured in UI)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && (parsed.projectId || parsed.databaseURL)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored Firebase config:', err);
  }

  // 2. Check environment variables (.env / VITE_*)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const envDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;

  if (envApiKey && (envProjectId || envDbUrl)) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: envProjectId || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      databaseURL: envDbUrl || ''
    };
  }

  // 3. Check static firebase.config.ts file
  if (defaultFirebaseConfig && defaultFirebaseConfig.apiKey && (defaultFirebaseConfig.projectId || defaultFirebaseConfig.databaseURL)) {
    return {
      apiKey: defaultFirebaseConfig.apiKey,
      authDomain: defaultFirebaseConfig.authDomain || '',
      projectId: defaultFirebaseConfig.projectId || '',
      storageBucket: defaultFirebaseConfig.storageBucket || '',
      messagingSenderId: defaultFirebaseConfig.messagingSenderId || '',
      appId: defaultFirebaseConfig.appId || '',
      databaseURL: defaultFirebaseConfig.databaseURL || ''
    };
  }

  return null;
}

export function getPreferredDatabaseType(): DatabaseType {
  try {
    const saved = localStorage.getItem(DB_TYPE_KEY);
    if (saved === 'realtime' || saved === 'firestore') return saved;
  } catch {}
  return 'firestore';
}

export function setPreferredDatabaseType(type: DatabaseType): void {
  try {
    localStorage.setItem(DB_TYPE_KEY, type);
  } catch {}
}

/**
 * Initialize or get active Firebase App instance
 */
export function getFirebaseInstance(customConfig?: FirebaseConfig): {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  database: Database | null;
} {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey) {
    return { app: null, firestore: null, database: null };
  }

  try {
    // Check if default app exists, or initialize
    if (!getApps().length) {
      activeApp = initializeApp(config);
    } else {
      activeApp = getApp();
    }

    if (config.projectId) {
      try {
        activeFirestore = getFirestore(activeApp);
      } catch (e) {
        console.warn('Firestore initialization notice:', e);
      }
    }

    if (config.databaseURL || config.projectId) {
      try {
        activeDatabase = getDatabase(activeApp);
      } catch (e) {
        console.warn('Realtime Database initialization notice:', e);
      }
    }

    return { app: activeApp, firestore: activeFirestore, database: activeDatabase };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, firestore: null, database: null };
  }
}

/**
 * Save Firebase configuration to localStorage and reinitialize
 */
export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Reinitialize
  getFirebaseInstance(config);
}

/**
 * Remove saved Firebase configuration
 */
export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DB_TYPE_KEY);
  activeApp = null;
  activeFirestore = null;
  activeDatabase = null;
}

/**
 * Parse raw configuration text or file content (supports Web JSON, google-services.json, .env syntax, JS snippet)
 */
export function parseFirebaseSnippet(input: string): Partial<FirebaseConfig> | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Try pure JSON parse (handles Web config, google-services.json, and service account JSON)
  try {
    const json = JSON.parse(trimmed);
    if (typeof json === 'object' && json !== null) {
      // Check if standard Web App Config
      if (json.apiKey || json.projectId) {
        return {
          apiKey: json.apiKey || '',
          authDomain: json.authDomain || (json.projectId ? `${json.projectId}.firebaseapp.com` : ''),
          projectId: json.projectId || '',
          storageBucket: json.storageBucket || (json.projectId ? `${json.projectId}.appspot.com` : ''),
          messagingSenderId: json.messagingSenderId || '',
          appId: json.appId || '',
          databaseURL: json.databaseURL || ''
        };
      }

      // Check if google-services.json format
      if (json.project_info) {
        const projInfo = json.project_info;
        const client = Array.isArray(json.client) && json.client[0] ? json.client[0] : null;
        const apiKey = client?.api_key?.[0]?.current_key || '';
        const appId = client?.client_info?.mobilesdk_app_id || '';
        const projectId = projInfo.project_id || '';
        const storageBucket = projInfo.storage_bucket || '';

        return {
          apiKey,
          authDomain: projectId ? `${projectId}.firebaseapp.com` : '',
          projectId,
          storageBucket,
          messagingSenderId: projInfo.project_number || '',
          appId,
          databaseURL: projInfo.firebase_url || ''
        };
      }
    }
  } catch {}

  // 2. Try .env format (e.g. VITE_FIREBASE_API_KEY="..." or FIREBASE_API_KEY=...)
  if (trimmed.includes('=')) {
    const lines = trimmed.split(/\r?\n/);
    const envMap: Record<string, string> = {};
    for (const line of lines) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z0-9_]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (match) {
        envMap[match[1]] = match[2];
      }
    }

    const apiKey = envMap['VITE_FIREBASE_API_KEY'] || envMap['FIREBASE_API_KEY'] || envMap['API_KEY'];
    const projectId = envMap['VITE_FIREBASE_PROJECT_ID'] || envMap['FIREBASE_PROJECT_ID'] || envMap['PROJECT_ID'];

    if (apiKey || projectId) {
      return {
        apiKey: apiKey || '',
        authDomain: envMap['VITE_FIREBASE_AUTH_DOMAIN'] || envMap['FIREBASE_AUTH_DOMAIN'] || (projectId ? `${projectId}.firebaseapp.com` : ''),
        projectId: projectId || '',
        storageBucket: envMap['VITE_FIREBASE_STORAGE_BUCKET'] || envMap['FIREBASE_STORAGE_BUCKET'] || '',
        messagingSenderId: envMap['VITE_FIREBASE_MESSAGING_SENDER_ID'] || envMap['FIREBASE_MESSAGING_SENDER_ID'] || '',
        appId: envMap['VITE_FIREBASE_APP_ID'] || envMap['FIREBASE_APP_ID'] || '',
        databaseURL: envMap['VITE_FIREBASE_DATABASE_URL'] || envMap['FIREBASE_DATABASE_URL'] || ''
      };
    }
  }

  // 3. Try JS object literal extraction: `const firebaseConfig = { ... };`
  const result: Partial<FirebaseConfig> = {};
  const extractField = (fieldName: string): string => {
    // Regex for: fieldName: "value" or 'value'
    const regex = new RegExp(`["']?${fieldName}["']?\\s*:\\s*["'\`]([^"'\`]+)["'\`]`, 'i');
    const match = trimmed.match(regex);
    return match ? match[1].trim() : '';
  };

  result.apiKey = extractField('apiKey');
  result.authDomain = extractField('authDomain');
  result.projectId = extractField('projectId');
  result.storageBucket = extractField('storageBucket');
  result.messagingSenderId = extractField('messagingSenderId');
  result.appId = extractField('appId');
  result.databaseURL = extractField('databaseURL');

  if (result.apiKey || result.projectId || result.databaseURL) {
    return result;
  }

  return null;
}

/**
 * Test Firebase Connection
 */
export async function testFirebaseConnection(testConfig?: FirebaseConfig): Promise<{
  success: boolean;
  message: string;
  dbType?: DatabaseType;
}> {
  const config = testConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey) {
    return { success: false, message: 'No Firebase configuration provided.' };
  }

  try {
    const { firestore, database } = getFirebaseInstance(config);
    const preferredType = getPreferredDatabaseType();

    // Test Firestore
    if (preferredType === 'firestore' && firestore) {
      try {
        const testRef = collection(firestore, 'messages');
        // Fetch 1 document to verify credentials & rules
        const q = query(testRef, limit(1));
        await getDocs(q);
        return { success: true, message: 'Successfully connected to Cloud Firestore!', dbType: 'firestore' };
      } catch (fsErr: any) {
        // If Firestore rules allow write but not read, or if collection doesn't exist yet, check error code
        if (fsErr.code === 'permission-denied') {
          return { 
            success: false, 
            message: 'Permission denied. Ensure your Firestore security rules allow writes (e.g. allow read, write: if true; for testing).' 
          };
        }
        // Fallback to RTDB test if configured
        if (database) {
          try {
            const rtdbRef = ref(database, 'messages');
            await get(rtdbQuery(rtdbRef, limitToLast(1)));
            return { success: true, message: 'Connected to Firebase Realtime Database!', dbType: 'realtime' };
          } catch {}
        }
        return { success: false, message: `Firestore connection error: ${fsErr.message || fsErr}` };
      }
    }

    // Test Realtime Database
    if (database) {
      try {
        const rtdbRef = ref(database, 'messages');
        await get(rtdbQuery(rtdbRef, limitToLast(1)));
        return { success: true, message: 'Successfully connected to Realtime Database!', dbType: 'realtime' };
      } catch (rtdbErr: any) {
        return { success: false, message: `Realtime Database error: ${rtdbErr.message || rtdbErr}` };
      }
    }

    return { success: false, message: 'Unable to initialize database with the provided credentials.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection test failed.' };
  }
}

/**
 * Save Contact Message to Firebase Database
 */
export async function saveMessageToFirebase(submission: ContactSubmission): Promise<{
  success: boolean;
  storage: 'firestore' | 'realtime' | 'local';
  error?: string;
}> {
  const config = getStoredFirebaseConfig();
  if (!config) {
    return { success: false, storage: 'local', error: 'No Firebase configuration found' };
  }

  const { firestore, database } = getFirebaseInstance(config);
  const preferredType = getPreferredDatabaseType();

  const payload = {
    id: submission.id,
    name: submission.name,
    email: submission.email,
    message: submission.message,
    timestamp: submission.timestamp,
    createdAt: new Date().toISOString(),
    isRead: false,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web client'
  };

  // Try Preferred Database Type (Default: Firestore)
  if (preferredType === 'firestore' && firestore) {
    try {
      const messagesCollection = collection(firestore, 'messages');
      await addDoc(messagesCollection, {
        ...payload,
        serverTime: serverTimestamp()
      });
      return { success: true, storage: 'firestore' };
    } catch (fsErr: any) {
      console.warn('Firestore write failed, attempting Realtime DB fallback:', fsErr);
      if (database) {
        try {
          const messagesRef = ref(database, 'messages');
          await push(messagesRef, payload);
          return { success: true, storage: 'realtime' };
        } catch (rtdbErr: any) {
          return { success: false, storage: 'local', error: fsErr.message || rtdbErr.message };
        }
      }
      return { success: false, storage: 'local', error: fsErr.message };
    }
  }

  // If Realtime Database preferred
  if (database) {
    try {
      const messagesRef = ref(database, 'messages');
      await push(messagesRef, payload);
      return { success: true, storage: 'realtime' };
    } catch (rtdbErr: any) {
      return { success: false, storage: 'local', error: rtdbErr.message };
    }
  }

  return { success: false, storage: 'local', error: 'Database service not initialized' };
}

/**
 * Fetch messages from Firebase Database
 */
export async function fetchFirebaseMessages(): Promise<ContactSubmission[]> {
  const config = getStoredFirebaseConfig();
  if (!config) return [];

  const { firestore, database } = getFirebaseInstance(config);
  const preferredType = getPreferredDatabaseType();
  const list: ContactSubmission[] = [];

  if (preferredType === 'firestore' && firestore) {
    try {
      const messagesCollection = collection(firestore, 'messages');
      const q = query(messagesCollection, orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      snap.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: d.id || doc.id,
          name: d.name || 'Anonymous',
          email: d.email || '',
          message: d.message || '',
          timestamp: d.timestamp || new Date().toLocaleString(),
          isRead: !!d.isRead,
          source: 'firebase'
        });
      });
      return list;
    } catch (e) {
      console.warn('Error fetching Firestore messages:', e);
    }
  }

  if (database) {
    try {
      const messagesRef = ref(database, 'messages');
      const snap = await get(rtdbQuery(messagesRef, limitToLast(50)));
      if (snap.exists()) {
        const val = snap.val();
        Object.keys(val).forEach((key) => {
          const d = val[key];
          list.unshift({
            id: d.id || key,
            name: d.name || 'Anonymous',
            email: d.email || '',
            message: d.message || '',
            timestamp: d.timestamp || new Date().toLocaleString(),
            isRead: !!d.isRead,
            source: 'firebase'
          });
        });
      }
      return list;
    } catch (e) {
      console.warn('Error fetching Realtime Database messages:', e);
    }
  }

  return list;
}
