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
              @click="toggleSelected(user)"
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

              <div class="hero-actions" v-if="selectedUser?.id === user.id">
                <button
                  class="medieval-btn"
                  @click.stop="startBattle(user, 'mult')"
                >
                  Multiplication
                </button>
                <button
                  class="medieval-btn"
                  @click.stop="startBattle(user, 'div')"
                >
                  Division
                </button>
              </div>

              <button
                class="delete-btn"
                @click.stop="deleteUser(user.id)"
                aria-label="Delete hero"
                title="Delete hero"
              >
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useProblems, useUsers } from '@/composables/useDatabase';

const router = useRouter();

const { addUser, users, removeUser } = useUsers();
const { loading, error, multProblems, divProblems, loadProblems } =
  useProblems();

const username = ref('');

const selectedUser = ref(null);

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

function toggleSelected(user) {
  selectedUser.value = selectedUser.value?.id === user.id ? null : user;
}

function startBattle(user, kind) {
  router.push({
    name: 'Battle',
    params: { userId: user.id },
    query: {
      name: user.name,
      hp: String(user.maxHp ?? 100),
      kind,
    },
  });
}

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
/* Layout & containers */
.user-select-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Georgia', serif;
}
.medieval-container {
  max-width: 1000px;
  width: 100%;
  background: linear-gradient(to bottom, #2c1810, #1a0f08);
  border: 4px solid #8b6914;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(139, 105, 20, 0.5),
    inset 0 0 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.banner-top,
.banner-bottom {
  height: 20px;
  background: repeating-linear-gradient(
    90deg,
    #8b6914 0 20px,
    #6b5010 20px 40px
  );
  border-bottom: 2px solid #5a4208;
}
.banner-bottom {
  border-bottom: 0;
  border-top: 2px solid #5a4208;
}
.content-area {
  padding: 40px;
}

/* Headers */
.page-title {
  margin: 0 0 40px;
  text-align: center;
  font-size: 3rem;
  color: #ffd700;
  text-shadow: 3px 3px 0 #8b6914, 6px 6px 10px rgba(0, 0, 0, 0.8);
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

/* Heroes */
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}
.hero-card {
  position: relative;
  padding: 18px;
  background: radial-gradient(120% 120% at 50% 0%, #3b2619 0%, #2a1810 65%);
  border: 2px solid #6f5210;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease,
    border-color 0.15s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
}
.hero-card:hover {
  transform: translateY(-3px);
  border-color: #d4af37;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
}
.hero-card.selected {
  border-color: #ffd700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2), 0 10px 26px rgba(0, 0, 0, 0.55);
}

.hero-avatar {
  font-size: 3.5rem;
  margin-bottom: 8px;
}
.hero-name {
  font-size: 1.2rem;
  color: #ffd700;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
}
.hero-stats {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  margin-top: 8px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  color: #b7976b;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}
.stat-value {
  color: #86efac;
  font-size: 1.1rem;
  font-weight: 700;
}

/* Buttons: unified base + variants */
.btn {
  appearance: none;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.25);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

/* Primary (Create Hero) */
.btn-primary {
  width: 100%;
  padding: 14px 34px;
  font-size: 1.1rem;
  color: #1a0f08;
  background: linear-gradient(to bottom, #ccaa2f, #8b6914);
  box-shadow: 0 4px 0 #5a4208, 0 10px 20px rgba(0, 0, 0, 0.4);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #5a4208, 0 12px 24px rgba(0, 0, 0, 0.45);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 2px 0 #5a4208, 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* Hero action buttons (Multiplication/Division) */
.hero-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.btn-action {
  padding: 10px 14px;
  font-size: 0.9rem;
  color: #23150e;
  background: linear-gradient(to bottom, #e3cfaa, #c3a676);
  border: 1px solid #6b5010;
  box-shadow: 0 3px 0 #5a4208, 0 6px 12px rgba(0, 0, 0, 0.3);
}
.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 #5a4208, 0 10px 16px rgba(0, 0, 0, 0.35);
}
.btn-action:active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #5a4208, 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Destructive */
.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 30px;
  height: 30px;
  line-height: 1;
  border-radius: 50%;
  color: #fff;
  font-size: 1.2rem;
  background: linear-gradient(to bottom, #f87171, #dc2626);
  border: 1px solid #991b1b;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.delete-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}
.delete-btn:active {
  transform: translateY(1px);
}

/* Forms */
.create-section {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #8b6914;
  border-radius: 10px;
  padding: 28px;
  margin-bottom: 30px;
}
.create-form {
  max-width: 500px;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  color: #d4af37;
  font-size: 1.05rem;
  margin-bottom: 8px;
  font-weight: 700;
}
.form-group input {
  width: 100%;
  padding: 12px;
  font-size: 1.05rem;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #8b6914;
  border-radius: 6px;
  color: #e0d5c7;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.form-group input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.25);
}
.form-group input:disabled {
  opacity: 0.6;
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
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 13px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  margin-bottom: 8px;
  z-index: 1000;
}
.disabled-tooltip:hover::after {
  opacity: 1;
}

.error-message {
  margin-top: 14px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid #ef4444;
  border-radius: 6px;
  color: #fecaca;
  text-align: center;
}

/* Back button */
.back-btn {
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #8b6914;
  border-radius: 8px;
  color: #d4af37;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease,
    border-color 0.12s ease, color 0.12s ease, background 0.12s ease;
  font-family: 'Georgia', serif;
}
.back-btn:hover {
  background: rgba(0, 0, 0, 0.75);
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
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }
  .hero-card {
    padding: 14px;
  }
  .hero-avatar {
    font-size: 3rem;
  }
  .hero-name {
    font-size: 1.05rem;
  }
  .btn-action {
    width: 100%;
  }
}
</style>
