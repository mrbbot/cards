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
      },
      { name: "msapplication-TileColor", content: "#000000" },
      { name: "theme-color", content: "#000000" }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png"
      },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#000000" }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#ffffff" },
  /*
   ** Global CSS
   */
  css: ["~/assets/bulma.sass"],
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
    proxy: true
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
  serverMiddleware: ["~/api/index.ts"]
};
