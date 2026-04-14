import { useReceiptsStore } from '../store/receiptsStore.js'

export async function fetchReceipts() {
  const receiptsStore = useReceiptsStore()
  try {
    const res = await fetch('/api/receipts')
    if (!res.ok) return
    const data = await res.json()
    receiptsStore.setReceipts(data.receipts || [])
  } catch {}
}
