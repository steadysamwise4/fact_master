<template>
  <div class="battle-screen">
    <!-- Background -->
    <div class="battle-background"></div>

    <!-- Enemy Section -->
    <div class="enemy-section">
      <div
        class="enemy-sprite"
        :class="{ shake: enemyTakingDamage, 'fade-out': enemyDefeated }"
      >
        <img :src="currentEnemy.sprite" :alt="currentEnemy.name" />
      </div>
      <div class="enemy-info">
        <div class="enemy-name">{{ currentEnemy.name }}</div>
        <div class="hp-bar">
          <div
            class="hp-fill enemy-hp"
            :style="{ width: enemyHpPercent + '%' }"
          ></div>
        </div>
        <div class="hp-text">HP: {{ enemyHp }} / {{ currentEnemy.maxHp }}</div>
      </div>

      <!-- Damage numbers -->
      <transition name="damage-float">
        <div v-if="showEnemyDamage" class="damage-number enemy-damage">
          -{{ lastDamage }}
        </div>
      </transition>
    </div>

    <!-- Player Section -->
    <div class="player-section">
      <div
        class="player-sprite"
        :class="{ attack: playerAttacking, hurt: playerTakingDamage }"
      >
        <img :src="playerSprite" alt="Hero" />
      </div>
      <div class="player-info">
        <div class="player-name">{{ playerName }}</div>
        <div class="hp-bar">
          <div
            class="hp-fill player-hp"
            :style="{ width: playerHpPercent + '%' }"
          ></div>
        </div>
        <div class="hp-text">HP: {{ playerHp }} / {{ playerMaxHp }}</div>
      </div>
    </div>

    <!-- Battle UI -->
    <div v-if="battleState === 'ready'">
      <form @submit.prevent="beginBattle">
        <button type="submit" class="btn btn-action" ref="startBtn">
          Start Battle
        </button>
      </form>
    </div>
    <div v-else class="battle-ui">
      <!-- Problem Display -->
      <div v-if="battleState === 'question'" class="problem-box">
        <div class="problem-text">{{ currentProblem.question }}</div>
        <input
          ref="answerInput"
          v-model="playerAnswer"
          type="number"
          class="answer-input"
          @keydown.enter.prevent="onAnswerEnter"
          placeholder="Your answer"
        />
        <div class="timebar">
          <div
            class="timebar-empty"
            :style="{ width: 100 - progress * 100 + '%' }"
          ></div>
          <div class="timebar-seg s1"></div>
          <div class="timebar-seg s2"></div>
          <div class="timebar-seg s3"></div>
          <div class="timebar-seg s4"></div>
          <div class="timebar-seg s5"></div>
        </div>
        <button @click="submitAnswer" class="submit-btn">Attack!</button>
      </div>

      <!-- Battle Messages -->
      <div v-if="battleState === 'message'" class="message-box">
        <div class="message-text">{{ battleMessage }}</div>
      </div>

      <!-- Victory/Defeat -->
      <div v-if="battleState === 'victory'" class="result-box victory">
        <h2>Victory!</h2>
        <p>You defeated {{ currentEnemy.name }}!</p>
        <p>XP Gained: {{ xpGained }}</p>
        <button @click="nextBattle" class="result-btn">Next Battle</button>
      </div>

      <div v-if="battleState === 'defeat'" class="result-box defeat">
        <h2>Defeated...</h2>
        <p>{{ currentEnemy.name }} was too strong!</p>
        <button @click="retry" class="result-btn">Try Again</button>
      </div>
    </div>

    <!-- Back button -->
    <button @click="exitBattle" class="exit-btn">Exit Battle</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  useProblems,
  useUserProblems,
  useUsers,
} from '../composables/useDatabase';
import { useRafTimer } from '@/composables/useRafTimer';

const router = useRouter();
const route = useRoute();

const { updateUserPatch, getOneUser } = useUsers();

const {
  loading: problemsLoading,
  error: problemsError,
  multProblems,
  divProblems,
  loadProblems,
} = useProblems();

const {
  items,
  loading: userProblemsLoading,
  error: userProblemsError,
  setUserId,
  getOneUserProb,
  fetchAllUP,
  fetchUPByType,
  updateUserProb,
  seedUserProbs,
} = useUserProblems();

// Props
const props = defineProps({
  userId: { type: String, required: true },
});

// Read from query with fallbacks
const kind = computed(() => String(route.query.kind ?? 'mult'));
const playerName = computed(() => String(route.query.name ?? 'Hero'));
const playerMaxHp = computed(() => {
  const n = Number(route.query.hp);
  return Number.isFinite(n) && n > 0 ? n : 100;
});

// Emit events
const emit = defineEmits(['battleComplete', 'battleFailed']);

// Battle state
const battleState = ref('ready');
const battleMessage = ref('');

// Start Button
const startBtn = ref(null);
watch(
  () => battleState.value,
  (s) => {
    if (s === 'ready') nextTick(() => startBtn.value?.focus());
  }
);

// Player stats
const playerHp = ref(playerMaxHp.value);
const playerAnswer = ref('');
const answerInput = ref(null);
const playerAttacking = ref(false);
const playerTakingDamage = ref(false);

// Enemy stats
const currentEnemy = ref({
  name: 'Goblin',
  sprite: 'https://via.placeholder.com/150/228B22/FFFFFF?text=Goblin', // Placeholder
  maxHp: 50,
  damage: 10,
});
const enemyHp = ref(currentEnemy.value.maxHp);
const enemyTakingDamage = ref(false);
const enemyDefeated = ref(false);
const showEnemyDamage = ref(false);
const lastDamage = ref(0);

// Problem tracking
const problemSet = computed(() => {
  if (userProblemsLoading.value || userProblemsError.value) return [];
  return kind.value === 'div'
    ? divProblems.value ?? []
    : multProblems.value ?? [];
});

function toBattleProblems(arr) {
  return (arr ?? []).map((p) => ({
    id: p.id,
    question:
      p.prompt ??
      `${p.factors?.[0]} ${p.symbol === 'x' ? '×' : p.symbol || '×'} ${
        p.factors?.[1]
      } =`,
    answer: p.solution,
  }));
}
const battleProblems = computed(() => toBattleProblems(problemSet.value));
const currentProblemCount = ref(0);
const currentProblemIndex = ref(0);
const currentProblem = computed(() => {
  // console.log('battleProblems:', battleProblems.value);
  if (battleProblems.value.length === 0) {
    return { question: '5 × 7', answer: 35 };
  }
  return (
    battleProblems.value[currentProblemIndex.value] || {
      question: '5 × 7',
      answer: 35,
    }
  );
});

// Timer
const { progress, running, lastDurationSec, start, stop, reset } = useRafTimer(
  20000,
  onTimerDone
);

async function onTimerDone() {
  await enemyAttack();
  if (enemyHp.value <= 0) {
    await handleVictory();
  } else if (playerHp.value <= 0) {
    await handleDefeat();
  } else {
    const randomIndex = getRandomInteger(0, battleProblems.value.length);
    currentProblemIndex.value = randomIndex;
    battleState.value = 'ready';
    await nextTick();
    answerInput.value?.focus();
  }
}

// Computed
const playerHpPercent = computed(
  () => (playerHp.value / playerMaxHp.value) * 100
);
const enemyHpPercent = computed(
  () => (enemyHp.value / currentEnemy.value.maxHp) * 100
);
const playerSprite = computed(
  () => 'https://via.placeholder.com/150/4169E1/FFFFFF?text=Hero'
); // Placeholder
const xpGained = computed(() => Math.floor(currentEnemy.value.maxHp / 2));

// Helper functions
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getRandomInteger(min, max) {
  min = Math.ceil(min); // Ensures min is an integer
  max = Math.floor(max); // Ensures max is an integer
  return Math.floor(Math.random() * (max - min)) + min;
}

// Methods
let starting = false;
let justStartedAt = 0;

async function beginBattle(e) {
  e?.preventDefault?.();
  if (starting || running.value) return;
  starting = true;
  justStartedAt = performance.now();

  battleState.value = 'question';
  reset();
  await nextTick();

  // start first, then focus next frame
  start();
  requestAnimationFrame(() =>
    answerInput.value?.focus({ preventScroll: true })
  );

  starting = false;
}

function onAnswerEnter(e) {
  if (performance.now() - justStartedAt < 250) return; // swallow the starting Enter
  submitAnswer();
}

const submitAnswer = async () => {
  const parsed = parseInt(playerAnswer.value, 10);
  if (Number.isNaN(parsed)) return;

  stop();

  const isCorrect =
    parseInt(playerAnswer.value) === currentProblem.value.answer;
  console.log('lastDurationSec:', lastDurationSec.value);

  if (isCorrect) {
    await playerAttack();
  } else {
    await enemyAttack();
  }

  await handleAnswerData(
    currentProblem.value.id,
    lastDurationSec.value,
    isCorrect
  );

  playerAnswer.value = '';

  // Check for battle end
  if (enemyHp.value <= 0) {
    await handleVictory();
  } else if (playerHp.value <= 0) {
    await handleDefeat();
  } else {
    // Next question
    const randomIndex = getRandomInteger(0, battleProblems.value.length);
    currentProblemIndex.value = randomIndex;

    battleState.value = 'ready';
    await nextTick();
    answerInput.value?.focus();
  }
};

const playerAttack = async () => {
  battleState.value = 'message';
  battleMessage.value = `${playerName.value} attacks!`;

  // Attack animation
  playerAttacking.value = true;
  await sleep(500);

  // Damage enemy
  const damage = Math.floor(Math.random() * 10) + 15; // 15-25 damage
  lastDamage.value = damage;
  enemyHp.value = Math.max(0, enemyHp.value - damage);
  enemyTakingDamage.value = true;
  showEnemyDamage.value = true;

  await sleep(300);
  enemyTakingDamage.value = false;
  playerAttacking.value = false;

  await sleep(700);
  showEnemyDamage.value = false;

  await sleep(500);
};

const enemyAttack = async () => {
  battleState.value = 'message';
  battleMessage.value = `Wrong answer! ${currentEnemy.value.name} attacks!`;

  await sleep(1000);

  // Enemy damages player
  const damage = currentEnemy.value.damage;
  playerHp.value = Math.max(0, playerHp.value - damage);
  playerTakingDamage.value = true;

  await sleep(500);
  playerTakingDamage.value = false;

  await sleep(500);
};

const handleAnswerData = async (problemId, newTime, isCorrect) => {
  const problem = await getOneUserProb(problemId);
  const user = await getOneUser(Number(props.userId));
  console.log('problem', problem);

  await updateUserStats(user, problem.type, isCorrect);
  await updateProblemStats(problem, newTime, isCorrect);
};

const updateUserStats = async (user, problemType, isCorrect) => {
  const patch = {};

  patch.totalProbsAttempted = user.totalProbsAttempted + 1;

  if (isCorrect) {
    patch.totalProbsCorrect = user.totalProbsCorrect + 1;
    patch.streak = user.streak + 1;
  } else {
    patch.streak = 0;
  }

  switch (problemType) {
    case 'multiplication':
      patch.totalMultAttempted = user.totalMultAttempted + 1;
      if (isCorrect) patch.totalMultCorrect = user.totalMultCorrect + 1;
      break;
    case 'division':
      patch.totalDivAttempted = user.totalDivAttempted + 1;
      if (isCorrect) patch.totalDivCorrect = user.totalDivCorrect + 1;
      break;
    default:
      console.log('Unidentified problem type or operation');
      throw new Error('Unidentified problem type or operation');
  }

  await updateUserPatch(user.id, patch);
};

const updateProblemStats = async (problem, newTime, isCorrect) => {
  const patch = {};
  let time = newTime;
  if (!isCorrect) {
    time = 20;
  }
  // Update times
  patch.answerTimes = problem.answerTimes;
  if (problem.answerTimes.length >= 10) {
    patch.answerTimes = problem.answerTimes.shift();
  }
  patch.answerTimes.push(time);

  // Recalculate average
  patch.avgSec =
    patch.answerTimes.reduce((a, b) => a + b) / problem.answerTimes.length;

  // Update mastery status
  patch.mastered = patch.avgSec < 5; // or whatever your threshold is
  await updateUserProb(problem.problemId, patch);
};

const handleVictory = async () => {
  enemyDefeated.value = true;
  await sleep(1000);
  battleState.value = 'victory';
  emit('battleComplete', {
    xp: xpGained.value,
    problemsAttempted: currentProblemCount.value + 1,
  });
};

const handleDefeat = async () => {
  battleState.value = 'defeat';
  emit('battleFailed');
};

const nextBattle = () => {
  // Reset for next battle
  enemyHp.value = currentEnemy.value.maxHp;
  enemyDefeated.value = false;
  playerHp.value = playerMaxHp.value;
  currentProblemIndex.value = getRandomInteger(0, battleProblems.value.length);
  battleState.value = 'question';
  reset();
  nextTick(() => answerInput.value?.focus());
  start();
};

const retry = () => {
  // Reset everything
  playerHp.value = playerMaxHp.value;
  enemyHp.value = currentEnemy.value.maxHp;
  enemyDefeated.value = false;
  currentProblemIndex.value = getRandomInteger(0, battleProblems.value.length);
  battleState.value = 'question';
  nextTick(() => answerInput.value?.focus());
};

const exitBattle = () => {
  router.push('/select-user');
};

onMounted(async () => {
  setUserId(Number(props.userId));
  await loadProblems();
  const len = battleProblems.value.length;
  if (len > 0) currentProblemIndex.value = getRandomInteger(0, len);
  startBtn.value?.focus();
});
</script>

<style scoped>
.battle-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Georgia', serif;
}

.battle-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    transparent 2px,
    transparent 4px,
    rgba(0, 0, 0, 0.1) 6px
  );
  pointer-events: none;
}

/* Enemy Section */
.enemy-section {
  position: relative;
  padding: 60px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 300px;
}

.enemy-sprite {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
  position: relative;
}

.enemy-sprite img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
}

.enemy-sprite.shake {
  animation: shake 0.3s;
}

.enemy-sprite.fade-out {
  animation: fadeOut 1s forwards;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px) rotate(-5deg);
  }
  75% {
    transform: translateX(10px) rotate(5deg);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
}

.enemy-info {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 15px 25px;
  min-width: 250px;
}

.enemy-name {
  color: #ff6b6b;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

/* HP Bars */
.hp-bar {
  width: 100%;
  height: 24px;
  background: #2a1810;
  border: 2px solid #8b6914;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.hp-fill {
  height: 100%;
  transition: width 0.5s ease;
  background: linear-gradient(to bottom, #4ade80 0%, #22c55e 100%);
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

.hp-fill.enemy-hp {
  background: linear-gradient(to bottom, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.hp-fill.player-hp {
  background: linear-gradient(to bottom, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

.hp-text {
  color: #e0d5c7;
  font-size: 0.9rem;
  text-align: center;
  font-weight: bold;
}

/* Damage Numbers */
.damage-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: #ff6b6b;
  text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000,
    -2px 2px 0 #000;
  pointer-events: none;
  z-index: 100;
}

.damage-float-enter-active {
  animation: damageFloat 1s ease-out;
}

@keyframes damageFloat {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(0.8);
  }
}

/* Player Section */
.player-section {
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.player-sprite {
  width: 120px;
  height: 120px;
  margin-bottom: 15px;
}

.player-sprite img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
}

.player-sprite.attack {
  animation: attackLunge 0.5s;
}

.player-sprite.hurt {
  animation: hurt 0.5s;
}

@keyframes attackLunge {
  0% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-40px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes hurt {
  0%,
  100% {
    transform: translateX(0);
    filter: brightness(1);
  }
  25% {
    transform: translateX(-5px);
    filter: brightness(1.5) hue-rotate(-20deg);
  }
  75% {
    transform: translateX(5px);
    filter: brightness(1.5) hue-rotate(-20deg);
  }
}

.player-info {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 15px 25px;
  min-width: 250px;
}

.player-name {
  color: #60a5fa;
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

/* Battle UI */
.battle-ui {
  margin-top: auto;
  padding: 20px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.8) 20%
  );
}

.problem-box,
.message-box,
.result-box {
  background: rgba(44, 24, 16, 0.95);
  border: 3px solid #8b6914;
  border-radius: 8px;
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.problem-text {
  font-size: 2.5rem;
  color: #ffd700;
  text-align: center;
  margin-bottom: 25px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.answer-input {
  width: 100%;
  padding: 15px;
  font-size: 1.5rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #8b6914;
  border-radius: 4px;
  color: #e0d5c7;
  font-family: 'Georgia', serif;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.answer-input::placeholder {
  color: #8b7355;
}
.timebar {
  position: relative;
  height: 20px;
  background: linear-gradient(
    to right,
    #dc2626 0 40%,
    #f59e0b 40% 80%,
    #16a34a 80% 100%
  );
  border: 2px solid #8b6914;
  border-radius: 8px;
  overflow: hidden;
}

/* “empty” overlay that covers the gradient from right to left */
.timebar-empty {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 0%; /* start at 0 (fully colored) */
  background: #2b1a12; /* empty bar color */
  transition: width 80ms linear;
}

/* segments unchanged */
.timebar-seg {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 215, 0, 0.35);
  pointer-events: none;
}
.timebar-seg.s1 {
  left: 20%;
}
.timebar-seg.s2 {
  left: 40%;
}
.timebar-seg.s3 {
  left: 60%;
}
.timebar-seg.s4 {
  left: 80%;
}
.timebar-seg.s5 {
  display: none;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.3rem;
  font-weight: bold;
  background: linear-gradient(to bottom, #c9a227 0%, #8b6914 100%);
  color: #1a0f08;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0 4px 0 #5a4208, 0 8px 20px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
  font-family: 'Georgia', serif;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #5a4208, 0 10px 25px rgba(0, 0, 0, 0.6);
}

.submit-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #5a4208, 0 4px 15px rgba(0, 0, 0, 0.5);
}

.message-box {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-text {
  font-size: 1.5rem;
  color: #e0d5c7;
  text-align: center;
  line-height: 1.6;
}

.result-box {
  text-align: center;
}

.result-box h2 {
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
}

.result-box.victory h2 {
  color: #4ade80;
}

.result-box.defeat h2 {
  color: #ef4444;
}

.result-box p {
  font-size: 1.3rem;
  color: #e0d5c7;
  margin: 15px 0;
}

.result-btn {
  margin-top: 30px;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(to bottom, #c9a227 0%, #8b6914 100%);
  color: #1a0f08;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0 4px 0 #5a4208, 0 8px 20px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
  font-family: 'Georgia', serif;
}

.result-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #5a4208, 0 10px 25px rgba(0, 0, 0, 0.6);
}

.result-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #5a4208, 0 4px 15px rgba(0, 0, 0, 0.5);
}

.exit-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #8b6914;
  border-radius: 4px;
  color: #d4af37;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Georgia', serif;
  z-index: 1000;
}

.exit-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: #ffd700;
  color: #ffd700;
}

/* Responsive */
@media (max-width: 768px) {
  .enemy-sprite {
    width: 120px;
    height: 120px;
  }

  .player-sprite {
    width: 100px;
    height: 100px;
  }

  .problem-text {
    font-size: 2rem;
  }

  .answer-input {
    font-size: 1.2rem;
  }

  .result-box h2 {
    font-size: 2rem;
  }
}
</style>
