// ---------------------------------------------------------
// FIREBASE SETUP
// This file connects the game to your own free Firebase project.
// That's what makes the leaderboard global — visible to every
// player, on every device — instead of saved in just one browser.
//
// Follow "Set up the global leaderboard" in README.md to get your
// own values from the Firebase console, then paste them in below.
// Nothing else in the project needs to change.
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxOltTRdJ-6KQtQC6PqrRmHRepOsiqLbU",
  authDomain: "taylor-swift-word-guess.firebaseapp.com",
  projectId: "taylor-swift-word-guess",
  storageBucket: "taylor-swift-word-guess.firebasestorage.app",
  messagingSenderId: "563355248869",
  appId: "1:563355248869:web:24c4ec7614bdcef2474c0c"
};

// Note: we don't need Firebase Analytics for this game, so it's left
// out on purpose — getAnalytics(app) was never used anywhere.
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp };