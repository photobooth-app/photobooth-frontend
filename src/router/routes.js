const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "gallery", component: () => import("pages/GalleryPage.vue") },
      { path: "status", component: () => import("pages/StatusPage.vue") },
      { path: "admin", component: () => import("pages/AdminPage.vue") },
      {
        path: "playground",
        component: () => import("pages/PlaygroundPage.vue"),
      },
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
