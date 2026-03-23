import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBX5n5rnqeLunwuHjFnV-TREVXbITrFlEQ",
  authDomain: "safe-path-69095.firebaseapp.com",
  projectId: "safe-path-69095",
  storageBucket: "safe-path-69095.firebasestorage.app",
  messagingSenderId: "715567646138",
  appId: "1:715567646138:web:f9b0a836c7a87045a98983",
  measurementId: "G-X45MXLCRQ7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
