<template>
  <h3>Create new user</h3>
  <form id="form">
    <div class="form-control">
      <label for="username">Username</label>
      <input
        type="text"
        required
        id="username"
        autocomplete="off"
        v-model="username"
        placeholder="Enter username..."
      />
    </div>
  </form>
  <div
    class="button-container"
    :class="{ 'disabled-tooltip': !canAddUser }"
    :data-tooltip="!canAddUser ? 'Maximum of 10 users reached' : ''"
  >
    <button @click="handleAddUser" :disabled="!canAddUser">Add User</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProblems, useUsers } from '@/composables/useDatabase';
import { userRepository } from '../services/db/repositories/userRepository';

const { addUser, users } = useUsers();
const { loading, error, multProblems, divProblems, loadProblems } =
  useProblems();

const username = ref('');

const canAddUser = computed(() => users.value.length < 10);

const handleAddUser = async () => {
  // ensure problems are loaded (in case this component is reused without mount)
  if (!multProblems.value.length && !divProblems.value.length) {
    await loadProblems();
  }
  const multData = constructUserData(multProblems.value);
  const divData = constructUserData(divProblems.value);

  try {
    await addUser({ name: username.value, multData, divData });
    username.value = '';
  } catch (e) {
    error.value = e.message;
    alert(e.message);
  }
};

const constructUserData = (problemSet) => {
  const problemObj = {};
  problemSet.forEach((prob) => {
    problemObj[prob.id] = {
      answerTimes: [20, 20, 20, 20, 20],
      avgTime: 20,
      mastered: false,
    };
  });
  return problemObj;
};

// TODO: Figure out where this lives
function updateProblemStats(problemData, problemId, newTime) {
  const problem = problemData[problemId];

  // Update times
  problem.answerTimes.shift();
  problem.answerTimes.push(newTime);

  // Recalculate average
  problem.avgTime =
    problem.answerTimes.reduce((a, b) => a + b) / problem.answerTimes.length;

  // Update mastery status
  problem.mastered = problem.avgTime < 3; // or whatever your threshold is
}

// To derive total count TODO: Figure out where this lives
function getMasteredCount(problemData) {
  return Object.values(problemData).filter((p) => p.mastered).length;
}

// Usage: TODO: Figure out if needed and where it lives
// const multMastered = getMasteredCount(user.multData);
// const divMastered = getMasteredCount(user.divData);
</script>

<style scoped>
.button-container {
  position: relative;
  display: inline-block;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  pointer-events: none; /* Let wrapper handle hover */
}

.disabled-tooltip {
  cursor: not-allowed;
}

.disabled-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  margin-bottom: 8px;
  z-index: 1000;
}

.disabled-tooltip:hover::after {
  opacity: 1;
}
</style>
