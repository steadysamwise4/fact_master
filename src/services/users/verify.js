import { getDB } from '../db';
import { userRepository } from '../db/repositories/userRepository';

export async function verifyMasteryCounters(userId) {
  const db = await getDB();
  const user = await userRepository.getById(userId);
  const tx = db.transaction('userProblems', 'readonly');
  const req = tx.objectStore('userProblems').index('byUser').getAll(userId);

  const records = await new Promise((res, rej) => {
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });

  const mult = records.filter(
    (r) => r.mastered && r.problemType === 'multiplication'
  ).length;
  const div = records.filter(
    (r) => r.mastered && r.problemType === 'division'
  ).length;

  if (
    mult !== (user.totalMultMastered ?? 0) ||
    div !== (user.totalDivMastered ?? 0)
  ) {
    await userRepository.patch(userId, {
      totalMultMastered: mult,
      totalDivMastered: div,
    });
    return { fixed: true, mult, div };
  }
  return { fixed: false };
}
