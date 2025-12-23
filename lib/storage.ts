import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export function scheduleFileDeletion(path: string, delayMs: number = 3600000): void {
  setTimeout(async () => {
    try {
      await deleteFile(path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, delayMs);
}

