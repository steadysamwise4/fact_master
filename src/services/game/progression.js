export function tier(level) {
  return Math.max(1, Math.ceil(level / 5));
}

// Your chosen damage growth (example from prior step)
export function dmgRange(level) {
  const min = Math.max(1, level - 2);
  const max = Math.max(2, level + 2 + Math.floor(level / 4)); // gentler max
  if (level === 1) return { min: 1, max: 2 };
  return { min, max };
}
export function expectedDamage(level) {
  const { min, max } = dmgRange(level);
  return (min + max) / 2;
}

// Hits target by tier: k=2 (or 3 for harder)
export function targetHits(level, k = 2) {
  const t = tier(level);
  return 7 + (t - 1) * k; // T1=7, T2=9, T3=11 ... with k=2
}

export function calculateEnemyHp(level, k = 2) {
  return Math.round(expectedDamage(level) * targetHits(level, k));
}

// Example damage roll
export function rollDamage(level) {
  const { min, max } = dmgRange(level);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function xpPerCorrect(level) {
  return 5 + Math.floor(level / 5);
}

export function xpToNext(level) {
  return 50 + level * level * 5;
}

export function levelFromTotalXp(totalXp) {
  let lvl = 1,
    spent = 0;
  let needed = xpToNext(lvl);

  while (totalXp - spent >= needed) {
    spent += needed;
    lvl += 1;
    needed = xpToNext(lvl);
  }
  const intoLevel = totalXp - spent; // progress within current level
  const xpRemaining = needed - intoLevel; // total left to next level

  return { level: lvl, intoLevel, xpRequired: needed, xpRemaining };
}
