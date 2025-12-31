import { getDB } from '../index.js';
import { PROBLEM_TOTALS } from '../../../config/problems.js';

function normalizeUser(u) {
  if (!u) return u;
  return {
    ...u,
    totalMultMastered: Number.isFinite(u.totalMultMastered)
      ? u.totalMultMastered
      : 0,
    totalDivMastered: Number.isFinite(u.totalDivMastered)
      ? u.totalDivMastered
      : 0,
  };
}

function clampMasteryPatch(user, patch) {
  const mult = patch.totalMultMastered ?? user.totalMultMastered ?? 0;
  const div = patch.totalDivMastered ?? user.totalDivMastered ?? 0;
  return {
    ...patch,
    totalMultMastered: Math.max(0, Math.min(mult, PROBLEM_TOTALS.mult)),
    totalDivMastered: Math.max(0, Math.min(div, PROBLEM_TOTALS.div)),
  };
}

export const userRepository = {
  async getAll() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () =>
        resolve((request.result || []).map(normalizeUser));
      request.onerror = () => reject(request.error);
    });
  },

  async getById(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const request = transaction.objectStore('users').get(id);

      request.onsuccess = () => resolve(normalizeUser(request.result));
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

        const newUser = normalizeUser(user);
        const addRequest = store.add(newUser);

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
      const store = transaction.objectStore('users');

      // Read current to clamp safely
      const getReq = store.get(user.id);
      getReq.onsuccess = () => {
        const cur = normalizeUser(getReq.result);
        if (!cur) return reject(new Error('User not found'));

        const merged = { ...cur, ...user };
        const clamped = clampMasteryPatch(cur, merged);

        const putReq = store.put(clamped);
        putReq.onsuccess = () => resolve(putReq.result);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },
  async patch(id, patch) {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const cur = normalizeUser(getReq.result);
        if (!cur) return rej(new Error('User not found'));

        const clamped = clampMasteryPatch(cur, patch);
        store.put({ ...cur, ...clamped });
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
