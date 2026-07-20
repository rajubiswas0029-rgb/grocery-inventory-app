import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { categories } from '../data/sampleProducts'
import {
  emptyProductForm,
  formToProduct,
  validateProductForm,
} from '../utils/productValidation'

export default function ProductForm({
  initialValues = emptyProductForm,
  onSubmit,
  submitLabel = 'Save Product',
  successMessage,
}) {
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateProductForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await onSubmit(formToProduct(form))
      setSuccess(true)
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const handleReset = () => {
    setForm(initialValues)
    setErrors({})
    setSuccess(false)
  }

  return (
    <div className="form-card">
      {success && successMessage && (
        <div className="form-success">{successMessage}</div>
      )}

      <form className="product-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <label className="form-field form-field-full">
            <span>Product Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Organic Almond Milk"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="form-field">
            <span>Category</span>
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </label>

          <label className="form-field">
            <span>Quantity</span>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </label>

          <label className="form-field">
            <span>Minimum Stock</span>
            <input
              type="number"
              name="minimumStock"
              value={form.minimumStock}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
            {errors.minimumStock && (
              <span className="field-error">{errors.minimumStock}</span>
            )}
          </label>

          <label className="form-field">
            <span>Purchase Price (₹)</span>
            <input
              type="number"
              name="buyPrice"
              value={form.buyPrice}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.buyPrice && <span className="field-error">{errors.buyPrice}</span>}
          </label>

          <label className="form-field">
            <span>Selling Price (₹)</span>
            <input
              type="number"
              name="sellPrice"
              value={form.sellPrice}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.sellPrice && <span className="field-error">{errors.sellPrice}</span>}
          </label>

          <label className="form-field">
            <span>Expiry Date</span>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
            />
            {errors.expiryDate && (
              <span className="field-error">{errors.expiryDate}</span>
            )}
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
