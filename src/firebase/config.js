import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAuUja45LAWkuiFK2Ptu1wFZHdyqIpli9o",
  authDomain: "cih-1-2c98b.firebaseapp.com",
  projectId: "cih-1-2c98b",
  storageBucket: "cih-1-2c98b.firebasestorage.app",
  messagingSenderId: "624970714787",
  appId: "1:624970714787:web:68231eff342474aec3f916",
  measurementId: "G-ZL35DNMBXF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

// Connect to emulators if running locally
if (window.location.hostname === 'localhost') {
  // connectAuthEmulator(auth, "http://127.0.0.1:9099");
  // connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  // connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export default app;
