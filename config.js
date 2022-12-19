// Firebase Config

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage'

const firebaseConfig = {
    apiKey: "AIzaSyA1LE7fn18guulU7GwjmOhJvzWms25z82A",
    authDomain: "mr-recipe-799e9.firebaseapp.com",
    projectId: "mr-recipe-799e9",
    storageBucket: "mr-recipe-799e9.appspot.com",
    messagingSenderId: "789389115158",
    appId: "1:789389115158:web:ba0084d924208627e89a37",
    measurementId: "G-07Q05LH9BH"
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };