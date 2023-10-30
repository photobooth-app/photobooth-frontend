const routes = [
  {
    // default route is kiosk frontend
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "gallery", component: () => import("pages/GalleryPage.vue") },
      {
        path: "itemviewer/:id",
        component: () => import("pages/ItemViewerPage.vue"),
      },
    ],
  },

  {
    // extended layout for admins
    path: "/admin",
    //TODO: implement route guard: https://dev.to/rachel_cheuk/part-1-user-roles-and-management-quasar-8jp
    meta: { requiresAuth: true, requiresAdmin: true },
    component: () => import("layouts/AdminLayout.vue"),
    children: [
      { path: "", component: () => import("pages/AdminPage.vue") },
      { path: "gallery", component: () => import("pages/GalleryPage.vue") },
      { path: "files", component: () => import("pages/AdminFilesPage.vue") },
      { path: "status", component: () => import("pages/StatusPage.vue") },
      { path: "help", component: () => import("pages/AdminHelpPage.vue") },
      {
        path: "playground",
        component: () => import("pages/PlaygroundPage.vue"),
      },
      {
        path: "config",
        component: () => import("pages/ConfigPage.vue"),
      },
    ],
  },

  {
    // extended layout for admins
    path: "/standalone",
    component: () => import("layouts/StandaloneLayout.vue"),
    children: [
      { path: "gallery", component: () => import("pages/GalleryPage.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
