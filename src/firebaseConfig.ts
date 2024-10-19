// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARizvajIEasBxw--QOK5BGWVTzdmBro3U",
  authDomain: "tree-map-ae44c.firebaseapp.com",
  databaseURL: "https://tree-map-ae44c-default-rtdb.firebaseio.com",
  projectId: "tree-map-ae44c",
  storageBucket: "tree-map-ae44c.appspot.com",
  messagingSenderId: "481276251943",
  appId: "1:481276251943:web:32e678670f70f9c2e3a302",
  measurementId: "G-XY8WVM315R"
};

// Initialize Firebase
const config = initializeApp(firebaseConfig);

export default config;
