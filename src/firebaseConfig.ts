// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJDU_NHHumcYDpsfSSAZCWhBUb-tCl1jc",
  authDomain: "tree-map-alcaldia.firebaseapp.com",
  databaseURL: "https://tree-map-alcaldia-default-rtdb.firebaseio.com",
  projectId: "tree-map-alcaldia",
  storageBucket: "tree-map-alcaldia.appspot.com",
  messagingSenderId: "363928218840",
  appId: "1:363928218840:web:ebba88f21405ced4323bad"
};

// Initialize Firebase
const config = initializeApp(firebaseConfig);

export default config;
