import { ref, onMounted } from 'vue';
import { userRepository } from '@/services/db/repositories/userRepository';
import { problemRepository } from '../services/db/repositories/problemRepository';

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
    const result = await userRepository.add(user);
    await fetchUsers(); // Refresh list
    return result;
  };

  const removeUser = async (userId) => {
    try {
      await userRepository.delete(userId);
      await fetchUsers(); // Refresh the list
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  };

  onMounted(() => {
    fetchUsers();
  });

  return {
    users,
    loading,
    error,
    removeUser,
    fetchUsers,
    addUser,
  };
}

export function useProblems() {
  const multProblems = ref([]);
  const divProblems = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const MULT = 'mult_problems';
  const DIV = 'div_problems';

  const loadProblems = async () => {
    loading.value = true;
    error.value = null;
    try {
      multProblems.value = await problemRepository.getAllOfProblemType(MULT);
      divProblems.value = await problemRepository.getAllOfProblemType(DIV);
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await loadProblems();
  });

  return {
    loading,
    error,
    loadProblems,
    multProblems,
    divProblems,
  };
}
