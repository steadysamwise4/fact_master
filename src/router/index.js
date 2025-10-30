import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import UserSelect from '../views/UserSelect.vue';
import BattleView from '../views/BattleView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/select-user',
    name: 'UserSelect',
    component: UserSelect,
  },
  {
    path: '/battle/:userId',
    name: 'Battle',
    component: BattleView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

// import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'home',
//       component: HomeView,
//     },
//     {
//       path: '/about',
//       name: 'about',
//       // route level code-splitting
//       // this generates a separate chunk (About.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: () => import('../views/AboutView.vue'),
//     },
//   ],
// })

// export default router
