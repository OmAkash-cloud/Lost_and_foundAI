import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDvwC_6LrpmgklG4uLwcW_mAr3IhUMKOQo",
    authDomain: "lostandfound-ai.firebaseapp.com",
    projectId: "lostandfound-ai",
    storageBucket: "lostandfound-ai.firebasestorage.app",
    messagingSenderId: "623094227616",
    appId: "1:623094227616:web:6cc8761407aeab03d91fc5",
    measurementId: "G-PGKBWC5KQ3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);