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
  console.log('multProblems', multProblems.value);
  console.log('divProblems', divProblems.value);
  addUser({ name: username.value });
  username.value = '';
};
</script>
