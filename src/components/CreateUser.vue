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
  <button @click="handleAddUser">Add User</button>
</template>

<script setup>
import { ref } from 'vue';
import { useProblems, useUsers } from '@/composables/useDatabase';

const { addUser } = useUsers();
const { loading, error, multProblems, divProblems, loadProblems } =
  useProblems();

const username = ref('');

const handleAddUser = async () => {
  // ensure problems are loaded (in case this component is reused without mount)
  if (!multProblems.value.length && !divProblems.value.length) {
    await loadProblems();
  }
  console.log(username.value);
  const multData = constructUserData(multProblems.value);
  const divData = constructUserData(divProblems.value);
  console.log('multProblems', multProblems.value);
  console.log('divProblems', divProblems.value);
  addUser({ name: username.value, multData, divData });
  username.value = '';
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

// Usage:
const multMastered = getMasteredCount(user.multData);
const divMastered = getMasteredCount(user.divData);
</script>
