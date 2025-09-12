import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpmQBXP69Qz5YjlHJNed7mU_gc7i9hvnY",
  authDomain: "i-instructor.firebaseapp.com",
  projectId: "i-instructor",
  storageBucket: "i-instructor.firebasestorage.app",
  messagingSenderId: "337063375759",
  appId: "1:337063375759:web:48c9c3dd3ea96f611151fa",
  measurementId: "G-X16SK78C2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;