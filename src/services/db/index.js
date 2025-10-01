const DB_VERSION = 1;

let dbInstance = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FactMasterDB', DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
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
