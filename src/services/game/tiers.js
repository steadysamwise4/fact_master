export function tierFromMastery(mastered, total) {
  if (!total) return 1;
  const pct = mastered / total; // 0..1
  if (pct >= 0.8) return 5;
  if (pct >= 0.6) return 4;
  if (pct >= 0.4) return 3;
  if (pct >= 0.2) return 2;
  return 1;
}
