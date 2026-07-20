import { useNavigate } from 'react-router-dom'
import ProductForm from '../components/ProductForm'
import { useInventory } from '../context/InventoryContext'

export default function AddProduct() {
  const { addProduct } = useInventory()
  const navigate = useNavigate()

  const handleSubmit = async (productData) => {
    await addProduct(productData)
    setTimeout(() => navigate('/products'), 1200)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Add Product</h1>
          <p>Add a new item to your inventory</p>
        </div>
      </header>

      <ProductForm
        onSubmit={handleSubmit}
        submitLabel="Save Product"
        successMessage="Product added successfully! Redirecting..."
      />
    </div>
  )
}
