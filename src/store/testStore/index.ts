import { defineStore } from 'pinia'

export const useTestStore = defineStore('test', {
  state: () => ({
    count: 0,
    name: 'Pinia Store',
  }),
  actions: {
    increment() {
      this.count++
    },
    setName(newName: string) {
      this.name = newName
    },
  },
  getters: {
    doubleCount: (state) => state.count * 2,
    greeting: (state) => `Hello, ${state.name}!`,
  },
})
