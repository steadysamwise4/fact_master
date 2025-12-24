import { getDB } from '../index.js';

export const userRepository = {
  async getAll() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getById(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const request = transaction.objectStore('users').get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async add(user) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');

      const countRequest = store.count();

      countRequest.onsuccess = () => {
        if (countRequest.result >= 10) {
          reject(new Error('Maximum user limit (10) reached'));
          return;
        }

        const addRequest = store.add(user);

        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(addRequest.error);
      };

      countRequest.onerror = () => reject(countRequest.error);
    });
  },

  async update(user) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const request = transaction.objectStore('users').put(user);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async patch(id, patch) {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const cur = getReq.result;
        if (!cur) return rej(new Error('User not found'));
        store.put({ ...cur, ...patch });
      };
      getReq.onerror = () => rej(getReq.error);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  },

  async delete(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const request = transaction.objectStore('users').delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
};
