import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXPOWUzhGZNFjuVXX-bRZYyOqVRUL-vwQ",
  authDomain: "bigproject-d6daf.firebaseapp.com",
  projectId: "bigproject-d6daf",
  storageBucket: "bigproject-d6daf.appspot.com",
  messagingSenderId: "540438748170",
  appId: "1:540438748170:web:416d4e38ac4a3be11513f3",
  measurementId: "G-MVPMBS32W2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 