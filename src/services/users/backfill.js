import { userRepository } from '@/services/db/repositories/userRepository';
import { getDB } from '@/services/db';
import { PROBLEM_TOTALS } from '@/config/problems.js'; // your constants

export async function backfillMasteryForUser(userId) {
  const db = await getDB();
  const tx = db.transaction('userProblems', 'readonly');
  const store = tx.objectStore('userProblems');
  const idx = store.index('byUser');
  const req = idx.getAll(userId);

  const [user, records] = await Promise.all([
    userRepository.getById(userId),
    new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    }),
  ]);
  console.log('backfill user:', user);

  let mult = 0,
    div = 0;
  for (const r of records) {
    if (r.mastered) {
      if (r.type === 'multiplication') mult++;
      else if (r.type === 'division') div++;
    }
  }

  // clamp to totals just in case
  const { mult: totalMult, div: totalDiv } = PROBLEM_TOTALS;
  mult = Math.min(mult, totalMult);
  div = Math.min(div, totalDiv);

  await userRepository.patch(user.id, {
    totalMultMastered: mult,
    totalDivMastered: div,
  });
}
