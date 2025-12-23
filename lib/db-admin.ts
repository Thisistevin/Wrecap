import { adminDb, initializeAdmin } from './firebase-admin';
import { Retrospective, Photo } from './db';
import { logger } from './logger';

function getDb() {
  if (!adminDb) {
    const services = initializeAdmin();
    return services.adminDb;
  }
  return adminDb;
}

export async function getRetrospectiveAdmin(id: string): Promise<Retrospective | null> {
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firebase Admin DB not initialized');
    }
    
    const docRef = db.collection('retrospectives').doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data } as Retrospective;
    }
    return null;
  } catch (error: any) {
    logger.error('Error getting retrospective:', error);
    throw new Error(`Failed to get retrospective: ${error.message}`);
  }
}

export async function updateRetrospectiveAdmin(id: string, updates: Partial<Retrospective>): Promise<void> {
  try {
    logger.log('🔄 [db-admin] Updating retrospective:', id);
    logger.log('📝 [db-admin] Updates:', JSON.stringify(updates, null, 2));
    
    const db = getDb();
    if (!db) {
      throw new Error('Firebase Admin DB not initialized');
    }
    
    const docRef = db.collection('retrospectives').doc(id);
    await docRef.update(updates as any);
    
    logger.log('✅ [db-admin] Retrospective updated successfully:', id);
  } catch (error: any) {
    logger.error('❌ [db-admin] Error updating retrospective:', error);
    logger.error('❌ [db-admin] Error details:', error.message);
    logger.error('❌ [db-admin] Error stack:', error.stack);
    throw new Error(`Failed to update retrospective: ${error.message}`);
  }
}

export async function createRetrospectiveAdmin(data: Omit<Retrospective, 'id' | 'createdAt'>): Promise<string> {
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firebase Admin DB not initialized');
    }
    
    const docRef = await db.collection('retrospectives').add({
      ...data,
      createdAt: new Date(),
      status: 'processing',
    } as any);
    return docRef.id;
  } catch (error: any) {
    logger.error('Error creating retrospective:', error);
    throw new Error(`Failed to create retrospective: ${error.message}`);
  }
}

export async function createPhotoAdmin(data: Omit<Photo, 'id' | 'createdAt'>): Promise<string> {
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firebase Admin DB not initialized');
    }
    
    const docRef = await db.collection('photos').add({
      ...data,
      createdAt: new Date(),
    } as any);
    return docRef.id;
  } catch (error: any) {
    logger.error('Error creating photo:', error);
    throw new Error(`Failed to create photo: ${error.message}`);
  }
}

