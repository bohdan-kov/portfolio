// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [],

  css: ["~/assets/css/main.css", "~/assets/css/reset.css"],

  app: {
    head: {
      title: "Portfolio",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "My Portfolio Website" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  vite: {
    optimizeDeps: {
      include: ["three"],
    },
  },
});
