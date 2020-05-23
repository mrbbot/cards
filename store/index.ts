export const state = () => ({
  navbarTitle: ""
});

export const mutations = {
  setNavbarTitle(state: any, title?: string) {
    state.navbarTitle = title || "";
  }
};
