export function tier(level) {
  return Math.max(1, Math.ceil(level / 5));
}

export function reqAnswers(level) {
  const t = tier(level);
  const min = 10 + (t - 1) * 3,
    max = 17 + (t - 1) * 3;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function dmgPerCorrect(level) {
  return 1 + Math.floor(level / 10);
}

export function xpPerCorrect(level) {
  return 5 + Math.floor(level / 5);
}

export function xpToNext(level) {
  return 50 + level * level * 5;
}

export function pickMonster(level) {
  const pools = [
    ['Slime', 'Bat', 'Rat'],
    ['Goblin', 'Imp', 'Wolf'],
    ['Skeleton', 'Bandit', 'Spider'],
    ['Orc', 'Wraith', 'Harpy'],
    ['Troll', 'Golem', 'Mage'],
    ['Wyvern', 'Warlock', 'Assassin'],
    ['Lich', 'Hydra', 'Dragonling'],
    ['Behemoth', 'Phoenix', 'Elder Dragon'],
    ['Ancient Titan', 'Void Serpent', 'Star Drake'],
  ];
  const idx = Math.min(pools.length, tier(level)) - 1;
  const name = pools[idx][Math.floor(Math.random() * pools[idx].length)];
  return { name };
}
