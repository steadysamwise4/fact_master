import { ref, onMounted } from 'vue';
import { userRepository } from '@/services/db/repositories/userRepository';

export function useUsers() {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      users.value = await userRepository.getAll();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const addUser = async (user) => {
    try {
      await userRepository.add(user);
      await fetchUsers(); // Refresh list
    } catch (e) {
      error.value = e.message;
    }
  };

  onMounted(() => {
    fetchUsers();
  });

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
  };
}
