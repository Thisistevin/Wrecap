import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Photo {
  id?: string;
  retrospectiveId: string;
  userId: string;
  photoUrl: string;
  type: 'user' | 'friend';
  createdAt: any;
}

export interface Retrospective {
  id?: string;
  userId: string;
  userPic: string;
  friendPic: string;
  textContentJson: string; // Path to JSON file in storage
  zipFileUrl?: string; // Temporary zip file URL for processing
  createdAt: any;
  status: 'processing' | 'completed' | 'failed';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paidAt?: any;
  title?: string;
  ephemeral?: boolean;
}

export async function createRetrospective(data: Omit<Retrospective, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'retrospectives'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'processing',
  });
  return docRef.id;
}

export async function updateRetrospective(id: string, updates: Partial<Retrospective>): Promise<void> {
  const docRef = doc(db, 'retrospectives', id);
  await setDoc(docRef, updates, { merge: true });
}

export async function getRetrospective(id: string): Promise<Retrospective | null> {
  const docRef = doc(db, 'retrospectives', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Retrospective;
  }
  return null;
}

export async function createPhoto(data: Omit<Photo, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'photos'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Initialize credits for a user if they don't exist
 * Creates a document in the 'credits' collection with 0 credits
 * @param userId - The user's Firebase Auth UID
 * @returns Promise<boolean> - true if credits were initialized, false if they already existed
 */
export async function initializeUserCredits(userId: string): Promise<boolean> {
  try {
    const creditsRef = doc(db, 'credits', userId);
    const creditsDoc = await getDoc(creditsRef);
    
    if (!creditsDoc.exists()) {
      // User doesn't have a credits document, create one with 0 credits
      await setDoc(creditsRef, {
        credits: 0,
        createdAt: serverTimestamp(),
      });
      console.log('✅ Credits initialized for user:', userId);
      return true;
    }
    
    // User already has credits document
    return false;
  } catch (error) {
    console.error('❌ Error initializing user credits:', error);
    throw error;
  }
}

