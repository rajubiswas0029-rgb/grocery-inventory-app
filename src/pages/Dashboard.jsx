import { Link } from 'react-router-dom'
import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import StatCard from '../components/StatCard'
import { formatCurrency } from '../utils/formatCurrency'

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

export default function Dashboard() {
  const { products } = useInventory()

  const totalProducts = products.length
  const lowStockCount = products.filter((p) => p.quantity <= p.minimumStock).length
  const expiringSoonCount = products.filter((p) => daysUntil(p.expiryDate) <= 7).length
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.quantity * p.buyPrice,
    0,
  )
  const potentialRevenue = products.reduce(
    (sum, p) => sum + p.quantity * p.sellPrice,
    0,
  )

  const lowStockItems = products
    .filter((p) => p.quantity <= p.minimumStock)
    .slice(0, 5)

  const expiringItems = products
    .filter((p) => daysUntil(p.expiryDate) <= 7)
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))
    .slice(0, 5)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your grocery inventory</p>
        </div>
        <Link to="/add-product" className="btn btn-primary">
          Add Product
          <ArrowRight size={18} />
        </Link>
      </header>

      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={totalProducts}
          subtitle="Unique items in stock"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount}
          subtitle="At or below minimum"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          subtitle="Within 7 days"
          icon={Clock}
          variant="danger"
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          subtitle={`Potential revenue: ${formatCurrency(potentialRevenue)}`}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>
              <AlertTriangle size={20} />
              Low Stock Alerts
            </h2>
            <Link to="/products?filter=low-stock">View all</Link>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="empty-message">All products are above minimum stock.</p>
          ) : (
            <ul className="alert-list">
              {lowStockItems.map((product) => (
                <li key={product.id} className="alert-item">
                  <div>
                    <strong>{product.name}</strong>
                    <span className="badge badge-warning">{product.category}</span>
                  </div>
                  <span className="alert-meta">
                    {product.quantity} / {product.minimumStock} min
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>
              <Clock size={20} />
              Expiring Soon
            </h2>
            <Link to="/products?filter=expiring">View all</Link>
          </div>
          {expiringItems.length === 0 ? (
            <p className="empty-message">No products expiring within 7 days.</p>
          ) : (
            <ul className="alert-list">
              {expiringItems.map((product) => {
                const days = daysUntil(product.expiryDate)
                return (
                  <li key={product.id} className="alert-item">
                    <div>
                      <strong>{product.name}</strong>
                      <span className="badge badge-danger">{product.category}</span>
                    </div>
                    <span className="alert-meta">
                      {days <= 0 ? 'Expired' : `${days} day${days === 1 ? '' : 's'} left`}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>
            <TrendingUp size={20} />
            Quick Stats
          </h2>
        </div>
        <div className="quick-stats">
          <div className="quick-stat">
            <span>Categories</span>
            <strong>{new Set(products.map((p) => p.category)).size}</strong>
          </div>
          <div className="quick-stat">
            <span>Total Units</span>
            <strong>{products.reduce((sum, p) => sum + p.quantity, 0)}</strong>
          </div>
          <div className="quick-stat">
            <span>Avg. Margin</span>
            <strong>
              {products.length
                ? `${(
                    (products.reduce(
                      (sum, p) => sum + (p.sellPrice - p.buyPrice) / p.buyPrice,
                      0,
                    ) /
                      products.length) *
                    100
                  ).toFixed(1)}%`
                : '0%'}
            </strong>
          </div>
        </div>
      </section>
    </div>
  )
}
