import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  fetchProducts,
  updateProduct as apiUpdateProduct,
} from '../utils/productApi'

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        const data = await fetchProducts()
        if (!cancelled) setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [])

  const login = (email, password) => {
    if (email.trim() && password.trim()) {
      setIsAuthenticated(true)
      return { success: true }
    }
    return { success: false, message: 'Please enter email and password.' }
  }

  const logout = () => setIsAuthenticated(false)

  const addProduct = async (product) => {
    const newProduct = await apiCreateProduct(product)
    setProducts((prev) => [newProduct, ...prev])
    return newProduct
  }

  const updateProduct = async (id, updates) => {
    const updated = await apiUpdateProduct(id, updates)
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }

  const deleteProduct = async (id) => {
    await apiDeleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const getProductById = (id) => products.find((p) => p.id === id)

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      products,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
    }),
    [isAuthenticated, isLoading, products],
  )

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider')
  }
  return context
}
