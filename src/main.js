import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

createApp(App).use(router).mount('#app');

const firebaseConfig = {
  apiKey: "AIzaSyA_e0D4JlvkLdZvTE3PA7hy0W15wTXuMxI",
  authDomain: "kursova-5374b.firebaseapp.com",
  databaseURL: "https://kursova-5374b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kursova-5374b",
  storageBucket: "kursova-5374b.appspot.com",
  messagingSenderId: "444568413958",
  appId: "1:444568413958:web:e4258c7fa4134d96fee087"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Corrected
const storage = getStorage(app);  // Corrected
