import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAS5O2jY8MNdLFaJE5UDlik6P4jr8t9etM",
  authDomain: "test1-7ab89.firebaseapp.com",
  projectId: "test1-7ab89",
  storageBucket: "test1-7ab89.firebasestorage.app",
  messagingSenderId: "1005804894958",
  appId: "1:1005804894958:web:a1e6b16b5499d862fc51ff",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
