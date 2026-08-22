// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAGECl7XmgpLwL8WTc4Y00rMGw4eMZNs8",
  authDomain: "sudaisasia-goldbase.firebaseapp.com",
  projectId: "sudaisasia-goldbase",
  storageBucket: "sudaisasia-goldbase.firebasestorage.app",
  messagingSenderId: "760849486667",
  appId: "1:760849486667:web:d7a63e4d53fd18edd68ece",
  measurementId: "G-G8S7QH2HJT"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const BACKEND_URL = "https://data-server-axhf.onrender.com";
