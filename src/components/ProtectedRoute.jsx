import { Navigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useInventory()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
