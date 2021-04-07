import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Index from '@/components/views/Index.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'index',
    component: Index,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.name == null) {
    //라우터에 name지정 안해주면 index로 리다이렉트
    next({
      path: '/',
    });
  }
  next();
});

export default router;
