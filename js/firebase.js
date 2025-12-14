import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";  
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsRaUdNwpqXRu-bl5EfBfeRhgPAUqTnOY",
  authDomain: "chess-game-62cf2.firebaseapp.com",
  projectId: "chess-game-62cf2",
  storageBucket: "chess-game-62cf2.firebasestorage.app",
  messagingSenderId: "826933459638",
  appId: "1:826933459638:web:805ef68daccd53695f4417",
  measurementId: "G-5YVXNJ8NHW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);