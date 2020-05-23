import indexer from "./api/services/indexer";

export default {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: "Cards",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#ffffff" },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ["~/plugins/reindex.client.ts"],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxt/typescript-build"],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxt/http"],
  http: {
    prefix: "/api"
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend() {}
  },
  hooks: {
    async ready() {
      if (process.env.NODE_ENV !== "development") {
        // @ts-ignore
        await indexer(process.env.CARDS_PATH);
      }
    }
  },
  serverMiddleware: ["~/api/index.ts"]
};
