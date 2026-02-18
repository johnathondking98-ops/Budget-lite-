import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyBY0UCxmiHZQJmDqVvRzL7RMSpvO7PxHfQ",
  authDomain: "family-finance-686cb.firebaseapp.com",
  databaseURL: "https://family-finance-686cb-default-rtdb.firebaseio.com",
  projectId: "family-finance-686cb",
  storageBucket: "family-finance-686cb.firebasestorage.app",
  messagingSenderId: "176719391741",
  appId: "1:176719391741:web:1394d37496558e12834794"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.database();

export default firebase;