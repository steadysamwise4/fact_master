<!-- views/HomePage.vue -->
<template>
  <div class="home-page">
    <div class="medieval-container">
      <div class="banner-top"></div>

      <div class="content-scroll">
        <h1 class="title">Fact Master</h1>

        <div class="subtitle">
          <span class="sword-left">⚔️</span>
          Master Your Math Through Epic Battles
          <span class="sword-right">⚔️</span>
        </div>

        <div class="description">
          <p>
            Brave warrior, the realm needs heroes who can master the ancient
            arts of multiplication and division!
          </p>
          <p>
            Defeat fearsome monsters by solving math problems. Each correct
            answer strikes your foe!
          </p>
        </div>

        <div class="button-group">
          <button @click="startAdventure" class="medieval-btn primary">
            <span class="btn-border"></span>
            Begin Your Quest
          </button>

          <button @click="viewStats" class="medieval-btn secondary">
            <span class="btn-border"></span>
            View Heroes
          </button>
        </div>

        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">🗡️</div>
            <h3>Battle Monsters</h3>
            <p>Face goblins, dragons, and more!</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Master problems and level up</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Multiple Heroes</h3>
            <p>Create up to 10 characters</p>
          </div>
        </div>
      </div>

      <div class="banner-bottom"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const startAdventure = () => {
  router.push('/select-user');
};

const viewStats = () => {
  router.push('/select-user');
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Georgia', serif;
}

.medieval-container {
  max-width: 900px;
  width: 100%;
  background: linear-gradient(to bottom, #2c1810 0%, #1a0f08 100%);
  border: 4px solid #8b6914;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(139, 105, 20, 0.5),
    inset 0 0 30px rgba(0, 0, 0, 0.5);
  position: relative;
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

.content-scroll {
  padding: 60px 40px;
  background: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

.title {
  font-size: 4rem;
  text-align: center;
  color: #ffd700;
  text-shadow: 3px 3px 0 #8b6914, 6px 6px 10px rgba(0, 0, 0, 0.8);
  margin: 0 0 20px 0;
  font-weight: bold;
  letter-spacing: 4px;
}

.subtitle {
  text-align: center;
  color: #d4af37;
  font-size: 1.3rem;
  margin-bottom: 40px;
  font-style: italic;
}

.sword-left,
.sword-right {
  margin: 0 15px;
  display: inline-block;
  animation: float 2s ease-in-out infinite;
}

.sword-right {
  animation-delay: 1s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.description {
  max-width: 600px;
  margin: 0 auto 50px;
  text-align: center;
  color: #e0d5c7;
  font-size: 1.1rem;
  line-height: 1.8;
}

.description p {
  margin: 15px 0;
}

.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.medieval-btn {
  position: relative;
  padding: 18px 40px;
  font-size: 1.2rem;
  font-family: 'Georgia', serif;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.medieval-btn.primary {
  background: linear-gradient(to bottom, #c9a227 0%, #8b6914 100%);
  color: #1a0f08;
  box-shadow: 0 4px 0 #5a4208, 0 8px 20px rgba(0, 0, 0, 0.5);
}

.medieval-btn.secondary {
  background: linear-gradient(to bottom, #6b5010 0%, #4a3508 100%);
  color: #d4af37;
  box-shadow: 0 4px 0 #2a1808;
}
</style>
