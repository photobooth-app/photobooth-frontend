const routes = [
  {
    // default route is kiosk frontend
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'itempresenter',
        component: () => import('pages/ItemPresenterPage.vue'),
      },
      {
        path: 'itemapproval',
        component: () => import('pages/ItemApprovalPage.vue'),
      },
    ],
  },
  {
    // gallery route
    path: '/gallery',
    component: () => import('layouts/GalleryLayout.vue'),
    children: [{ path: '', component: () => import('pages/GalleryPage.vue') }],
  },
  {
    // extended layout for admins
    path: '/admin',
    //TODO: implement route guard: https://dev.to/rachel_cheuk/part-1-user-roles-and-management-quasar-8jp
    meta: { requiresAuth: true, requiresAdmin: true },
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminPage.vue') },
      { path: 'gallery', component: () => import('pages/GalleryPage.vue') },
      { path: 'files', component: () => import('pages/AdminFilesPage.vue') },
      { path: 'status', component: () => import('pages/AdminStatusPage.vue') },
      { path: 'logs', component: () => import('pages/AdminLogsPage.vue') },
      { path: 'help', component: () => import('pages/AdminHelpPage.vue') },
      { path: '1ststart', component: () => import('pages/Admin1stStartPage.vue') },
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
    // slideshow layout
    path: '/slideshow',
    component: () => import('layouts/SlideshowLayout.vue'),
    children: [{ path: 'random', component: () => import('pages/SlideshowPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
