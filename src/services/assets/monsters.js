import { tierFromMastery } from '@/services/game/tiers';

import slime from '@/assets/images/enemies/slime.png';
import bat from '@/assets/images/enemies/bat.png';
import rat from '@/assets/images/enemies/rat.png';
import goblin from '@/assets/images/enemies/goblin.png';
import wolf from '@/assets/images/enemies/wolf.png';
import imp from '@/assets/images/enemies/imp.png';
import skeleton from '@/assets/images/enemies/skeleton.png';
import bandit from '@/assets/images/enemies/bandit.png';
import spider from '@/assets/images/enemies/spider.png';

export const monsterPools = {
  mult: [
    ['Slime', 'Bat', 'Rat'], // tier 1
    ['Lich', 'Hydra', 'Dragonling'], // tier 2
    ['Skeleton', 'Bandit', 'Spider'], // tier 3
    ['Troll', 'Golem', 'Mage'], // tier 4
    ['Ancient Titan', 'Void Serpent', 'Elder Dragon'], // tier 5
  ],
  div: [
    ['Goblin', 'Imp', 'Wolf'], // tier 1
    ['Orc', 'Wraith', 'Harpy'], // tier 2
    ['Wyvern', 'Warlock', 'Assassin'], // tier 3
    ['Behemoth', 'Phoenix', 'Star Drake'], // tier 4
    ['Reaper', 'Skull Bearer', 'Were Beast'], // tier 5
  ],
};

export const monsterSprites = {
  Slime: slime,
  Bat: bat,
  Rat: rat,
  Goblin: goblin,
  Imp: imp,
  Wolf: wolf,
  Skeleton: skeleton,
  Bandit: bandit,
  Spider: spider,
};

export function pickMonsterByOp(op, mastered, total) {
  const pools = monsterPools[op] || monsterPools.mult;
  const t = Math.max(1, Math.min(5, tierFromMastery(mastered, total)));
  const tierIdx = t - 1;
  const names = pools[tierIdx] || pools[0];
  const name = names[Math.floor(Math.random() * names.length)];
  return { name, key: name, sprite: monsterSprites[name], tier: t };
}
