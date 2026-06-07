import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await deleteUser(user);
    } catch (error: any) {
      if (error && (error.code === 'auth/requires-recent-login' || String(error.message).includes('requires-recent-login'))) {
        console.log('[Firebase Auth] User execution requires recent login. Opening re-authentication popup...');
        try {
          await reauthenticateWithPopup(user, googleProvider);
          // Retry the deletion after successful re-auth
          await deleteUser(user);
        } catch (reauthError) {
          console.error('Failed to re-authenticate or delete user:', reauthError);
          throw reauthError;
        }
      } else {
        console.error('Error deleting Firebase user:', error);
        throw error;
      }
    }
  }
};
