const firebaseConfig = {
  apiKey: "AIzaSyDYnwz3uUsdNdLnT7Rn-Upj1qbNM2gZjwI",
  authDomain: "goldbase-f0575.firebaseapp.com",
  databaseURL: "https://goldbase-f0575-default-rtdb.firebaseio.com",
  projectId: "goldbase-f0575",
  storageBucket: "goldbase-f0575.firebasestorage.app",
  messagingSenderId: "664830660899",
  appId: "1:664830660899:web:e05945d2667c4258053c96",
  measurementId: "G-YP9QHV3CWD"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const BACKEND_URL = "https://data-server-axhf.onrender.com";
