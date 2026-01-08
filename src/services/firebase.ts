import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBf3RMZHEVVz8sHWMbk5hdos5lp5BiNn0",
  authDomain: "picpurge.firebaseapp.com",
  projectId: "picpurge",
  storageBucket: "picpurge.appspot.com",
  messagingSenderId: "83521325220",
  appId: "1:83521325220:web:0ef623b20f364302f3fe31",
  measurementId: "G-50YSLPKKVC",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
