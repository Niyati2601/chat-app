import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "react-chat-app-f71ff.firebaseapp.com",
    projectId: "react-chat-app-f71ff",
    storageBucket: "react-chat-app-f71ff.appspot.com",
    messagingSenderId: "580218668194",
    appId: "1:580218668194:web:5405f919ddfc245dc643fb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()