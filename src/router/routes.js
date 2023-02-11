const routes = [
  {
    // default route is kiosk frontend
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "gallery", component: () => import("pages/GalleryPage.vue") },
      {
        path: "newItemArrived",
        component: () => import("pages/NewItemArrivedPage.vue"),
      },
    ],
  },

  {
    // extended layout for admins
    path: "/admin",
    component: () => import("layouts/AdminLayout.vue"),
    children: [
      { path: "", component: () => import("pages/AdminPage.vue") },
      { path: "gallery", component: () => import("pages/GalleryPage.vue") },
      { path: "status", component: () => import("pages/StatusPage.vue") },
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
