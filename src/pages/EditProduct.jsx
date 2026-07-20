import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '../components/ProductForm'
import { useInventory } from '../context/InventoryContext'
import { productToForm } from '../utils/productValidation'

export default function EditProduct() {
  const { id } = useParams()
  const { getProductById, updateProduct, isLoading } = useInventory()
  const navigate = useNavigate()

  const product = getProductById(id)

  if (isLoading) return null

  if (!product) {
    return <Navigate to="/products" replace />
  }

  const handleSubmit = async (productData) => {
    await updateProduct(id, productData)
    setTimeout(() => navigate('/products'), 1200)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/products" className="back-link">
            <ArrowLeft size={18} />
            Back to Product List
          </Link>
          <h1>Edit Product</h1>
          <p>Update details for {product.name}</p>
        </div>
      </header>

      <ProductForm
        key={product.id}
        initialValues={productToForm(product)}
        onSubmit={handleSubmit}
        submitLabel="Update Product"
        successMessage="Product updated successfully! Redirecting..."
      />
    </div>
  )
}
