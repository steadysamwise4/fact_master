import { getDB } from '../index.js';

export const userProblemRepository = {
  async getUserProblem(userId, problemId) {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('userProblems', 'readonly');
      tx.objectStore('userProblems').get([userId, problemId]).onsuccess = (e) =>
        res(e.target.result || null);
      tx.onerror = () => rej(tx.error);
    });
  },

  async seedUserProblems(userId, problems) {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('userProblems', 'readwrite');
      const store = tx.objectStore('userProblems');
      const now = Date.now();
      for (const p of problems) {
        store.add({
          userId,
          problemId: p.id,
          type: p.operation,
          answerTimes: [20, 20, 20, 20, 20],
          answerTimeAvg: 20,
          mastered: false,
        });
      }
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  },

  async updateUserProblem({ userId, problemId, patch }) {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('userProblems', 'readwrite');
      const store = tx.objectStore('userProblems');
      const key = [userId, problemId];

      const getReq = store.get(key);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) return rej(new Error('UserProblem not found'));
        store.put({ ...existing, ...patch });
      };
      getReq.onerror = () => rej(getReq.error);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  },

  async getById(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userProblems'], 'readonly');
      const request = transaction.objectStore('userProblems').get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async listByUser(userId) {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('userProblems', 'readonly');
      const idx = tx.objectStore('userProblems').index('byUser');
      const out = [];
      idx.openCursor(IDBKeyRange.only(userId)).onsuccess = (e) => {
        const cur = e.target.result;
        if (!cur) return res(out);
        out.push(cur.value);
        cur.continue();
      };
      tx.onerror = () => rej(tx.error);
    });
  },

  // NEW: all problems for a user by type
  async listByUserAndType(userId, type) {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('userProblems', 'readonly');
      const idx = tx.objectStore('userProblems').index('byUserType');
      const out = [];
      idx.openCursor(IDBKeyRange.only([userId, type])).onsuccess = (e) => {
        const cur = e.target.result;
        if (!cur) return res(out);
        out.push(cur.value);
        cur.continue();
      };
      tx.onerror = () => rej(tx.error);
    });
  },
};
