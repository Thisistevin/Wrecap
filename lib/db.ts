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

