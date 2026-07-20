import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Trash2,
  Package,
  Pencil,
  Plus,
  Minus,
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import { categories } from '../data/sampleProducts'
import { formatCurrency } from '../utils/formatCurrency'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)

  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

function getStockStatus(product) {
  const quantity = Number(product.quantity)
  const minimumStock = Number(product.minimumStock)

  if (quantity <= minimumStock) return 'low'
  if (quantity <= minimumStock * 1.5) return 'medium'
  return 'good'
}

export default function ProductList() {
  const { products, deleteProduct, updateProduct } = useInventory()

  const [searchParams] = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'all'

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState(initialFilter)
  const [updatingId, setUpdatingId] = useState(null)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || ''
      const productCategory = product.category?.toLowerCase() || ''
      const searchText = search.toLowerCase()

      const matchesSearch =
        productName.includes(searchText) ||
        productCategory.includes(searchText)

      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter

      let matchesStatus = true

      if (statusFilter === 'low-stock') {
        matchesStatus =
          Number(product.quantity) <= Number(product.minimumStock)
      } else if (statusFilter === 'expiring') {
        matchesStatus = daysUntil(product.expiryDate) <= 7
      }

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}" from inventory?`)) {
      await deleteProduct(id)
    }
  }

  const handleStockChange = async (product, change) => {
    const currentQuantity = Number(product.quantity) || 0
    const newQuantity = currentQuantity + change

    if (newQuantity < 0) {
      window.alert('Stock cannot be less than zero.')
      return
    }

    try {
      setUpdatingId(product.id)

      await updateProduct(product.id, {
        ...product,
        quantity: newQuantity,
      })
    } catch (error) {
      console.error('Failed to update stock:', error)
      window.alert('Stock update failed. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Product List</h1>
          <p>
            {filteredProducts.length} of {products.length} products shown
          </p>
        </div>
      </header>

      <div className="filters-bar">
        <div className="search-input">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="low-stock">Low Stock</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock Control</th>
                <th>Quantity</th>
                <th>Min Stock</th>
                <th>Purchase Price (₹)</th>
                <th>Selling Price (₹)</th>
                <th>Margin</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const buyPrice = Number(product.buyPrice) || 0
                const sellPrice = Number(product.sellPrice) || 0

                const margin =
                  buyPrice > 0
                    ? (((sellPrice - buyPrice) / buyPrice) * 100).toFixed(1)
                    : '0.0'

                const stockStatus = getStockStatus(product)
                const days = daysUntil(product.expiryDate)
                const isUpdating = updatingId === product.id

                return (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>

                    <td>
                      <span className="badge badge-neutral">
                        {product.category}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleStockChange(product, -1)}
                          disabled={
                            isUpdating || Number(product.quantity) <= 0
                          }
                          title="Stock Out"
                        >
                          <Minus size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleStockChange(product, 1)}
                          disabled={isUpdating}
                          title="Stock In"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <strong>{product.quantity}</strong>
                    </td>

                    <td>{product.minimumStock}</td>

                    <td>{formatCurrency(product.buyPrice)}</td>

                    <td>{formatCurrency(product.sellPrice)}</td>

                    <td className="text-success">{margin}%</td>

                    <td>
                      <span className={days <= 7 ? 'text-danger' : ''}>
                        {formatDate(product.expiryDate)}
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill status-${stockStatus}`}>
                        {stockStatus === 'low'
                          ? 'Low'
                          : stockStatus === 'medium'
                            ? 'Medium'
                            : 'Good'}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/edit-product/${product.id}`}
                          className="btn-icon btn-icon-edit"
                          title="Edit product"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          onClick={() =>
                            handleDelete(product.id, product.name)
                          }
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}