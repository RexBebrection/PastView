import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Start from '@/views/Start.vue';
import Login from '@/views/Login.vue';
import Registration from '@/views/Registration.vue';
import Profile from '@/views/Profile.vue';
import CreateLocation from '@/views/CreateLocation.vue';
import Approve from '@/views/Approve.vue';
import MyPublications from '@/views/MyPublications.vue';
import EditLocation from '@/views/EditLocation.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const routes = [
  {
    path: '/',
    name: 'start',
    component: Start
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/registration',
    name: 'registration',
    component: Registration
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-location',
    name: 'create-location',
    component: CreateLocation,
    meta: { requiresAuth: true }
  },
  {
    path: '/approve',
    name: 'approve', 
    component: Approve,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-publications',
    name: 'my-publications',
    component: MyPublications,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-location/:id',
    name: 'edit-location',
    component: EditLocation,
    meta: { requiresAuth: true },
    props: true
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next();
    } else {
      console.log('You are not logged in');
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
