import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDq76nfkq8alTcxYACBZIkVUBZMP6Fc5oM',
  authDomain: 'studio-9217529900-4ce94.firebaseapp.com',
  projectId: 'studio-9217529900-4ce94',
  storageBucket: 'studio-9217529900-4ce94.appspot.com', // ✅ fixed
  messagingSenderId: '1071004165989',
  appId: '1:1071004165989:web:d9e19bcb0accfdead9e38c',
  // measurementId: "G-XXXXXXX" // optional if Analytics enabled
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
