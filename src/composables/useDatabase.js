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
