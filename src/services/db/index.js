import { seedProblemsIfEmpty } from './seed';

export const DB_VERSION = 6;

let dbInstance = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FactMasterDB', DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = async () => {
      dbInstance = request.result;
      try {
        await seedProblemsIfEmpty(dbInstance);
        resolve(dbInstance);
      } catch (err) {
        reject(err);
      }
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('mult_problems')) {
        db.createObjectStore('mult_problems', {
          keyPath: 'id',
          autoIncrement: false,
        });
      }

      if (!db.objectStoreNames.contains('div_problems')) {
        db.createObjectStore('div_problems', {
          keyPath: 'id',
          autoIncrement: false,
        });
      }

      if (!db.objectStoreNames.contains('userProblems')) {
        // Use composite key; include type if IDs aren’t globally unique
        const up = db.createObjectStore('userProblems', {
          keyPath: ['userId', 'problemId'],
        });
        up.createIndex('byUser', 'userId');
        up.createIndex('byProblem', 'problemId');
        up.createIndex('byUserAndProblemType', ['userId', 'problemType']);
      }
      // Add more stores as needed
    };
  });
};

export const getDB = async () => {
  if (!dbInstance) {
    await initDB();
  }
  return dbInstance;
};
