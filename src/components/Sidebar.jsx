import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  ShoppingBasket,
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Product List', icon: Package },
  { to: '/add-product', label: 'Add Product', icon: PlusCircle },
]

export default function Sidebar() {
  const { logout } = useInventory()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <ShoppingBasket size={22} />
        </div>
        <div>
          <h1>GroceryHub</h1>
          <p>Inventory Manager</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  )
}
