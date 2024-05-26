import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { hasAccessToken } from '../util/auth';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    //scrollBehavior: () => ({ left: 0, top: 0 }),
    // seems to not work properly - TODO
    scrollBehavior: (to, from, savedPosition) => (savedPosition ? { savedPosition } : { left: 0, top: 0 }),
    // following works, but: TODO
    /*scrollBehavior(to, from, savedPosition) {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      let position = { x: 0, y: 0 };
      if (savedPosition) {
        position = savedPosition;
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(position);
        }, 100);
      });
    },*/
    routes,

    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    if (to.meta.requiresAdmin && !hasAccessToken()) {
      return next('/auth/');
    }

    return next();
  });

  return Router;
});
