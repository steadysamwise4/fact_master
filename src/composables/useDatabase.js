import { ref, onMounted, computed } from 'vue';
import { userRepository } from '@/services/db/repositories/userRepository';
import { problemRepository } from '../services/db/repositories/problemRepository';
import { userProblemRepository as repo } from '@/services/db/repositories/userProblemRepository';

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
    const userId = await userRepository.add(user);

    await fetchUsers(); // Refresh list
    return userId;
  };

  const getOneUser = async (userId) => {
    try {
      console.log('userId inside getOneUser', userId);
      const user = await userRepository.getById(userId);
      console.log('inside getOneUser', user);
      return user;
    } catch (e) {
      error.value = e?.message ?? String(e);
      throw e;
    }
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

  const updateUserPatch = async (id, patch) => {
    const idx = users.value.findIndex((u) => u.id === id);
    const prev = idx >= 0 ? { ...users.value[idx] } : null;

    if (idx >= 0) users.value[idx] = { ...users.value[idx], ...patch };

    try {
      await userRepository.patch(id, patch); // implement in repo
    } catch (e) {
      if (idx >= 0) users.value[idx] = prev; // rollback
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
    getOneUser,
    updateUserPatch,
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

export function useUserProblems() {
  const userId = ref(null);
  const items = ref([]); // last fetched set
  const loading = ref(false);
  const error = ref(null);

  function setUserId(id) {
    userId.value = id;
  }

  async function fetchAllUP() {
    if (!userId.value) return;
    loading.value = true;
    error.value = null;
    try {
      items.value = await repo.listByUser(userId.value);
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUPByType(type) {
    if (!userId.value) return;
    loading.value = true;
    error.value = null;
    try {
      items.value = await repo.listByUserAndType(userId.value, type);
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  async function getOneUserProb(problemId) {
    if (!userId.value) return null;
    return repo.getUserProblem(userId.value, problemId);
  }

  async function seedUserProbs(problems) {
    if (!userId.value) return;
    await repo.seedUserProblems(userId.value, problems);
    // Optional: refresh
    // await fetchAll();
  }

  async function updateUserProb(problemId, patch) {
    if (!userId.value) return;
    await repo.updateUserProblem({ userId: userId.value, problemId, patch });
  }

  return {
    items,
    loading,
    error,
    setUserId,
    fetchAllUP,
    fetchUPByType,
    getOneUserProb,
    seedUserProbs,
    updateUserProb,
  };
}
