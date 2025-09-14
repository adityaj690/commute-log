"use client";

import { db } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import type { CommuteLog, CommuteType } from './types';

// Helper to convert Firestore Timestamps to Date objects
const convertTimestamps = (data: any) => {
  const newData = { ...data };
  for (const key in newData) {
    if (newData[key] instanceof Timestamp) {
      newData[key] = newData[key].toDate();
    }
  }
  return newData;
};

// Commute Logs
export const getCommuteLogs = async (userId: string): Promise<CommuteLog[]> => {
  const logsCol = collection(db, 'users', userId, 'commuteLogs');
  const logSnapshot = await getDocs(logsCol);
  const logList = logSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as CommuteLog);
  return logList;
};

export const saveCommuteLog = async (userId: string, log: CommuteLog): Promise<CommuteLog> => {
  const logRef = doc(collection(db, 'users', userId, 'commuteLogs'), log.id);
  const logData = {
    ...log,
    date: Timestamp.fromDate(new Date(log.date)), // Ensure date is a Timestamp
  };
  await setDoc(logRef, logData, { merge: true });
  return log;
};

export const deleteCommuteLog = async (userId: string, logId: string): Promise<void> => {
  const logRef = doc(db, 'users', userId, 'commuteLogs', logId);
  await deleteDoc(logRef);
};


// Commute Types
export const getCommuteTypes = async (userId: string): Promise<CommuteType[]> => {
  const typesCol = collection(db, 'users', userId, 'commuteTypes');
  const typeSnapshot = await getDocs(typesCol);
  const typeList = typeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommuteType));
  // Firestore doesn't guarantee order, so we might need to sort them if order is important.
  // For now, returning as is.
  return typeList;
};

export const saveCommuteTypes = async (userId: string, types: CommuteType[]): Promise<void> => {
    const batch = writeBatch(db);
    const typesColRef = collection(db, 'users', userId, 'commuteTypes');

    // First, delete existing types to handle deletions. This is simple but can be inefficient.
    // A more complex implementation could track changes.
    const existingTypesSnap = await getDocs(typesColRef);
    existingTypesSnap.forEach(doc => batch.delete(doc.ref));
    
    // Now, add all the current types.
    types.forEach(type => {
        const typeRef = doc(typesColRef, type.id);
        batch.set(typeRef, type);
    });

    await batch.commit();
};
