import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHbSIzhsBN_e26jNfrTipwW_xG3G0JjdY",
  authDomain: "charity-donation-45ad3.firebaseapp.com",
  projectId: "charity-donation-45ad3",
  storageBucket: "charity-donation-45ad3.firebasestorage.app",
  messagingSenderId: "688423385309",
  appId: "1:688423385309:web:cc55153d64fc4040668334",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
