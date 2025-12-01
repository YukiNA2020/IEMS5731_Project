// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import PostDetailView from '../views/PostDetailView.vue';
import CreatePostView from '../views/CreatePostView.vue';
// router/index.js 顶部
import UserCenterView from '../views/UserCenterView.vue'; 
import EditProfileView from '../views/EditProfileView.vue';




const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/create', component: CreatePostView }, 
    {
      path: '/posts/:id',
      name: 'post-detail',
      component: PostDetailView,
      props: true,
    },
    { path: '/profile', name: 'profile', component: UserCenterView },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: EditProfileView,
    },
    {
      path: '/profile/:id',  // 新增动态用户主页
      name: 'profile-with-id',
      component: UserCenterView,
    },
    {
      path: '/profile',  // 兼容无 id 时默认查看当前用户
      name: 'profile',
      component: UserCenterView,
    },
  ],
});

export default router;
