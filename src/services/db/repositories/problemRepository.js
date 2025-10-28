import { getDB } from '../index.js';

export const problemRepository = {
  async getAllOfProblemType(problem_type) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([problem_type], 'readonly');
      const store = transaction.objectStore(problem_type);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getById(id, problem_type) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([problem_type], 'readonly');
      const request = transaction.objectStore(problem_type).get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
};
// Shouldn't really need these... TODO: Eventually delete if not

// async add(user) {
//   const db = await getDB();
//   return new Promise((resolve, reject) => {
//     const transaction = db.transaction(['problems'], 'readwrite');
//     const request = transaction.objectStore('problems').add(user);

//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// },

// async update(user) {
//   const db = await getDB();
//   return new Promise((resolve, reject) => {
//     const transaction = db.transaction(['problems'], 'readwrite');
//     const request = transaction.objectStore('problems').put(user);

//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// },

// async delete(id) {
//   const db = await getDB();
//   return new Promise((resolve, reject) => {
//     const transaction = db.transaction(['problems'], 'readwrite');
//     const request = transaction.objectStore('problems').delete(id);

//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// },
// };
