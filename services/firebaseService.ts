
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import type { AppUser } from '../types.ts';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
// Request additional scopes for Google Workspace integrations
provider.addScope('https://www.googleapis.com/auth/presentations');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/gmail.send');


export const signInWithGoogle = async (): Promise<FirebaseUser> => {
    const result = await signInWithPopup(auth, provider);

    // Capture the OAuth access token to use with GAPI
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (accessToken) {
        // Store it in session storage for gapi to use across the app
        sessionStorage.setItem('google_access_token', accessToken);
    }

    return result.user;
};

export const signOutUser = async (): Promise<void> => {
    // Clear the stored token on sign out
    sessionStorage.removeItem('google_access_token');
    await signOut(auth);
};

export const onFirebaseAuthChanged = (callback: (user: AppUser | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            const appUser: AppUser = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                tier: 'free', // Default tier
            };
            callback(appUser);
        } else {
            callback(null);
        }
    });
};

export const saveUserToken = async (uid: string, service: string, token: string): Promise<void> => {
    const userDocRef = doc(db, 'user_secrets', uid);
    await setDoc(userDocRef, {
        tokens: {
            [service]: token
        }
    }, { merge: true });
};

export const getUserToken = async (uid: string, service: string): Promise<string | null> => {
    const userDocRef = doc(db, 'user_secrets', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.tokens?.[service] || null;
    }
    return null;
};