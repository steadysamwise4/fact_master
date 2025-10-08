import { getDB } from '../index.js';

export const problemRepository = {
  async getAll() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['problems'], 'readonly');
      const store = transaction.objectStore('problems');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getById(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['problems'], 'readonly');
      const request = transaction.objectStore('problems').get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async add(user) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['problems'], 'readwrite');
      const request = transaction.objectStore('problems').add(user);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async update(user) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['problemss'], 'readwrite');
      const request = transaction.objectStore('problems').put(user);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['problems'], 'readwrite');
      const request = transaction.objectStore('problems').delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
};
