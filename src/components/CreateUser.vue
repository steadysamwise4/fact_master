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
import { useUsers } from '@/composables/useDatabase';

const { addUser } = useUsers();

const username = ref('');

const handleAddUser = () => {
  console.log(username.value);
  addUser({ name: username.value });
  username.value = '';
};
</script>
