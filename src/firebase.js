import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAb54Nq9c2cmU82SX1OqcAJ4F_v6U3j2hY",
  authDomain: "rhinoboybot-bashboard.firebaseapp.com",
  projectId: "rhinoboybot-bashboard",
  storageBucket: "rhinoboybot-bashboard.firebasestorage.app",
  messagingSenderId: "652217219419",
  appId: "1:652217219419:web:ab8cdc98e409731dc0027e",
  measurementId: "G-VLH73NXQ3X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const ALLOWED_EMAIL = 'rhinoboy1972@gmail.com';
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user.email !== ALLOWED_EMAIL) {
    await signOut(auth);
    throw new Error('Access denied. This dashboard is restricted.');
  }
  return result.user;
}

export async function logOut() {
  await signOut(auth);
}
