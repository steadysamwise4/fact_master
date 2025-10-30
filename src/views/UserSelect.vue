<!-- views/UserSelect.vue -->
<template>
  <div class="user-select-page">
    <div class="medieval-container">
      <div class="banner-top"></div>

      <div class="content-area">
        <h1 class="page-title">Select Your Hero</h1>

        <!-- User List -->
        <div class="heroes-section">
          <h2 class="section-title">Your Heroes</h2>

          <div v-if="users.length === 0" class="no-heroes">
            <p>No heroes yet. Create your first champion!</p>
          </div>

          <div v-else class="hero-grid">
            <div
              v-for="user in users"
              :key="user.id"
              class="hero-card"
              @click="selectUser(user)"
            >
              <div class="hero-avatar">👤</div>
              <div class="hero-name">{{ user.name }}</div>
              <div class="hero-stats">
                <div class="stat">
                  <span class="stat-label">Mult:</span>
                  <span class="stat-value">{{
                    getMasteredCount(user.multData)
                  }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Div:</span>
                  <span class="stat-value">{{
                    getMasteredCount(user.divData)
                  }}</span>
                </div>
              </div>
              <button class="delete-btn" @click.stop="deleteUser(user.id)">
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Create New User -->
        <div class="create-section">
          <h2 class="section-title">Create New Hero</h2>

          <form @submit.prevent="handleAddUser" class="create-form">
            <div class="form-group">
              <label for="username">Hero Name</label>
              <input
                type="text"
                required
                id="username"
                autocomplete="off"
                v-model="username"
                placeholder="Enter hero name..."
                :disabled="!canAddUser"
              />
            </div>

            <div
              class="button-container"
              :class="{ 'disabled-tooltip': !canAddUser }"
              :data-tooltip="
                !canAddUser
                  ? 'Maximum of 10 heroes reached. Delete one to add another.'
                  : ''
              "
            >
              <button
                type="submit"
                class="medieval-btn primary"
                :disabled="!canAddUser"
              >
                <span class="btn-text">Create Hero</span>
              </button>
            </div>
          </form>

          <div v-if="error" class="error-message">{{ error }}</div>
        </div>

        <button @click="goHome" class="back-btn">← Back to Home</button>
      </div>

      <div class="banner-bottom"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProblems, useUsers } from '@/composables/useDatabase';

const router = useRouter();

const { addUser, users, removeUser } = useUsers();
const { loading, error, multProblems, divProblems, loadProblems } =
  useProblems();

const username = ref('');

const canAddUser = computed(() => users.value.length < 10);

const handleAddUser = async () => {
  if (!username.value.trim()) return;

  // ensure problems are loaded
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

const selectUser = (user) => {
  // Navigate to battle with user data
  router.push({
    name: 'Battle',
    params: { userId: user.id },
  });
};

const deleteUser = async (userId) => {
  if (confirm('Are you sure you want to delete this hero?')) {
    await removeUser(userId);
  }
};

const goHome = () => {
  router.push('/');
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

const getMasteredCount = (problemData) => {
  if (!problemData) return 0;
  return Object.values(problemData).filter((p) => p.mastered).length;
};
</script>

<style scoped>
.user-select-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Georgia', serif;
}

.medieval-container {
  max-width: 1000px;
  width: 100%;
  background: linear-gradient(to bottom, #2c1810 0%, #1a0f08 100%);
  border: 4px solid #8b6914;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(139, 105, 20, 0.5),
    inset 0 0 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.banner-top,
.banner-bottom {
  height: 20px;
  background: repeating-linear-gradient(
    90deg,
    #8b6914 0px,
    #8b6914 20px,
    #6b5010 20px,
    #6b5010 40px
  );
  border-bottom: 2px solid #5a4208;
}

.banner-bottom {
  border-bottom: none;
  border-top: 2px solid #5a4208;
}

.content-area {
  padding: 40px;
}

.page-title {
  font-size: 3rem;
  text-align: center;
  color: #ffd700;
  text-shadow: 3px 3px 0 #8b6914, 6px 6px 10px rgba(0, 0, 0, 0.8);
  margin: 0 0 40px 0;
  font-weight: bold;
  letter-spacing: 3px;
}

.section-title {
  font-size: 1.8rem;
  color: #d4af37;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid #8b6914;
  padding-bottom: 10px;
}

/* Heroes Section */
.heroes-section {
  margin-bottom: 50px;
}

.no-heroes {
  text-align: center;
  color: #8b7355;
  font-style: italic;
  padding: 40px;
  font-size: 1.2rem;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.hero-card {
  background: linear-gradient(to bottom, #3a2518 0%, #2a1810 100%);
  border: 3px solid #8b6914;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.hero-card:hover {
  transform: translateY(-5px);
  border-color: #ffd700;
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
}

.hero-avatar {
  font-size: 4rem;
  margin-bottom: 10px;
}

.hero-name {
  font-size: 1.3rem;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.hero-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  color: #8b7355;
  font-size: 0.9rem;
}

.stat-value {
  color: #4ade80;
  font-size: 1.2rem;
  font-weight: bold;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  background: rgba(239, 68, 68, 0.8);
  border: 2px solid #dc2626;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #ef4444;
  transform: scale(1.1);
}

/* Create Section */
.create-section {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
}

.create-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #d4af37;
  font-size: 1.1rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #8b6914;
  border-radius: 4px;
  color: #e0d5c7;
  font-family: 'Georgia', serif;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group input::placeholder {
  color: #8b7355;
}

.button-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.medieval-btn {
  width: 100%;
  position: relative;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-family: 'Georgia', serif;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-radius: 4px;
}

.medieval-btn.primary {
  background: linear-gradient(to bottom, #c9a227 0%, #8b6914 100%);
  color: #1a0f08;
  box-shadow: 0 4px 0 #5a4208, 0 8px 20px rgba(0, 0, 0, 0.5);
}

.medieval-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #5a4208, 0 10px 25px rgba(0, 0, 0, 0.6);
}

.medieval-btn.primary:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #5a4208, 0 4px 15px rgba(0, 0, 0, 0.5);
}

.medieval-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
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

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #ef4444;
  border-radius: 4px;
  color: #fca5a5;
  text-align: center;
}

.back-btn {
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #8b6914;
  border-radius: 4px;
  color: #d4af37;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Georgia', serif;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: #ffd700;
  color: #ffd700;
}

/* Responsive */
@media (max-width: 768px) {
  .content-area {
    padding: 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .hero-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .hero-card {
    padding: 15px;
  }

  .hero-avatar {
    font-size: 3rem;
  }

  .hero-name {
    font-size: 1.1rem;
  }
}
</style>
