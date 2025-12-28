import { tier } from '../game/progression';

import slime from '@/assets/images/enemies/slime.png';
import bat from '@/assets/images/enemies/bat.png';
import rat from '@/assets/images/enemies/rat.png';
import goblin from '@/assets/images/enemies/goblin.png';
import wolf from '@/assets/images/enemies/wolf.png';
import imp from '@/assets/images/enemies/imp.png';
import skeleton from '@/assets/images/enemies/skeleton.png';
import bandit from '@/assets/images/enemies/bandit.png';
import spider from '@/assets/images/enemies/spider.png';

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
  const sprite = monsterSprites[name] ?? monsterSprites['Bat'];
  console.log('sprite:', sprite);
  return { name, key: name.toLocaleLowerCase(), sprite };
}
