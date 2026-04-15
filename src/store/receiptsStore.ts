import { defineStore } from 'pinia'

export const useReceiptsStore = defineStore('receipts', {
  state: () => ({
    receipts: [] as Array<{ id: number; name: string; created_at: string }>,
    loaded: false,
  }),
  actions: {
    setReceipts(
      receipts: Array<{ id: number; name: string; created_at: string }>
    ) {
      this.receipts = receipts
      this.loaded = true
      localStorage.setItem('receipts', JSON.stringify(receipts))
    },
    loadFromStorage() {
      const data = localStorage.getItem('receipts')
      if (data) {
        this.receipts = JSON.parse(data)
        this.loaded = true
      }
    },
    clearReceipts() {
      this.receipts = []
      this.loaded = false
      localStorage.removeItem('receipts')
    },
    removeReceipt(id: number) {
      this.receipts = this.receipts.filter((r) => r.id !== id)
      localStorage.setItem('receipts', JSON.stringify(this.receipts))
    },
  },
})
