// Firebase SDK 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyB7b0ZvqrRZhSATLyMK19sBufbtVkKOkU4",
  authDomain: "hayesung-2921b.firebaseapp.com",
  projectId: "hayesung-2921b",
  storageBucket: "hayesung-2921b.firebasestorage.app",
  messagingSenderId: "1043789335111",
  appId: "1:1043789335111:web:c619f43f96ce3f78ce7f62"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// export로 다른 파일에서 사용 가능하도록
export { db, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, increment };