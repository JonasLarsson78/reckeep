import { useReceiptsStore } from '../store/receiptsStore'

export async function fetchReceipts() {
  const receiptsStore = useReceiptsStore()
  try {
    const res = await fetch('/api/receipts')
    if (!res.ok) return
    const data = await res.json()
    receiptsStore.setReceipts(data.receipts || [])
  } catch {}
}
