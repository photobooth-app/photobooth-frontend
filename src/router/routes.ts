import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    // default route is kiosk frontend
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'itemapproval', component: () => import('pages/ItemApprovalPage.vue') },
      { path: 'gallery', component: () => import('pages/GalleryPage.vue') },
      { path: 'mediaviewer/:id', name: 'mediaviewer', component: () => import('pages/GalleryDetailPage.vue'), props: { startTimer: false } },
      { path: 'itempresenter/:id', name: 'itempresenter', component: () => import('pages/GalleryDetailPage.vue'), props: { startTimer: true } },
    ],
  },

  {
    // auth layout
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', redirect: '/auth/login' },
      { path: '/', redirect: '/auth/login' },
      { path: 'login', component: () => import('src/pages/LoginPage.vue') },
    ],
  },

  {
    // extended layout for admins
    path: '/admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminDashboardPage.vue') },
      { path: 'gallery', component: () => import('pages/GalleryPage.vue') },
      { path: 'files', component: () => import('pages/AdminFilesPage.vue') },
      { path: 'logs', component: () => import('pages/AdminLogsPage.vue') },
      { path: 'help', component: () => import('pages/AdminHelpPage.vue') },
      { path: '1ststart', component: () => import('pages/Admin1stStartPage.vue') },
      { path: 'multicam', component: () => import('pages/AdminMulticamPage.vue') },
      {
        name: 'config',
        path: 'config/:section?',
        component: () => import('pages/AdminConfigPage.vue'),
      },
    ],
  },

  {
    // standalone layouts
    path: '/standalone',
    component: () => import('layouts/StandaloneLayout.vue'),
    children: [
      { path: 'gallery', component: () => import('pages/GalleryPage.vue') },
      { path: 'slideshow', component: () => import('pages/SlideshowPage.vue') },
    ],
  },
  {
    // slideshows share the same layout with main currently.
    path: '/slideshow',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: 'random', component: () => import('pages/SlideshowPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
