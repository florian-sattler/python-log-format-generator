import { defineStore } from 'pinia';

type ConfigState = {
  darkTheme: boolean;
};

const setTheme = (dark: boolean) => (document.documentElement.dataset['theme'] = dark ? 'dark' : 'light');

export default defineStore('config', {
  state: (): ConfigState => ({
    darkTheme: window.matchMedia('prefers-color-scheme: dark').matches,
  }),

  actions: {
    toggleTheme() {
      this.darkTheme = !this.darkTheme;
      setTheme(this.darkTheme);
    },
  },

  persist: {
    afterRestore: (ctx) => {
      setTheme(ctx.store.$state.darkTheme);
    },
  },
});
