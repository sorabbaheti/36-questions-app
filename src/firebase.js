import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBzcJlEZ3LLhmw9o8HddDOgHr_-sFvq-e8",
  authDomain: "questions-88abd.firebaseapp.com",
  databaseURL: "https://questions-88abd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "questions-88abd",
  storageBucket: "questions-88abd.firebasestorage.app",
  messagingSenderId: "474216451108",
  appId: "1:474216451108:web:d8297c8579f84c4dd45cb1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
