import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBztD1UbSZcZZlB7W4htGSCDp_TvPz4DbM",
  authDomain: "crypto-portfolio-96a00.firebaseapp.com",
  projectId: "crypto-portfolio-96a00",
  storageBucket: "crypto-portfolio-96a00.firebasestorage.app",
  messagingSenderId: "122453879078",
  appId: "1:122453879078:web:ff9db595db49774306b9e7",
  measurementId: "G-6MQX9SS5KG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };