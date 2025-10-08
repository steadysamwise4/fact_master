const STORE = 'problems';

export async function seedProblemsIfEmpty(db) {
  const hasAny = await countStore(db, STORE);
  if (hasAny > 0) return;

  console.log('seeding multiplication problems...');

  // const seed = [
  //   { id: 'p1', title: 'Two Sum' },
  //   { id: 'p2', title: 'Reverse String' },
  // ];
  // await putMany(db, STORE, seed);
}

function countStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function putMany(db, storeName, items) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
