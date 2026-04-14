import { useReceiptsStore } from '../store/receiptsStore'
import { useAuthStore } from '../store/authStore'

export async function fetchReceipts() {
  const receiptsStore = useReceiptsStore()
  const authStore = useAuthStore()
  try {
    const authHeader = authStore.token ? `Bearer ${authStore.token}` : ''
    console.log('fetchReceipts: token', authStore.token)
    console.log('fetchReceipts: Authorization header', authHeader)
    const res = await fetch('/api/receipts', {
      headers: {
        Authorization: authHeader,
      },
    })
    if (!res.ok) {
      console.error(
        'fetchReceipts: response not ok',
        res.status,
        await res.text()
      )
      return
    }
    const data = await res.json()
    receiptsStore.setReceipts(data.receipts || [])
  } catch (err) {
    console.error('fetchReceipts: error', err)
  }
}
