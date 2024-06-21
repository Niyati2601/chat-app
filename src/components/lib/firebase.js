import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';

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
export const messaging = getMessaging();


export const requestToken = () => {
    return getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY }).then((currentToken) => {
        if (currentToken) {
            console.log('current token for client: ', currentToken);
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    });
}

export const onMessageListener = () => {
    return new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('payload: ', payload);
            resolve(payload);
        });
    });
}