export function validateProductForm(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Product name is required'
  }

  if (!form.category) {
    errors.category = 'Category is required'
  }

  if (form.barcode && !/^\d+$/.test(form.barcode.trim())) {
    errors.barcode = 'Barcode must contain numbers only'
  }

  if (form.quantity === '' || Number(form.quantity) < 0) {
    errors.quantity = 'Enter a valid quantity'
  }

  if (
    form.minimumStock === '' ||
    Number(form.minimumStock) < 0
  ) {
    errors.minimumStock = 'Enter a valid minimum stock'
  }

  if (form.buyPrice === '' || Number(form.buyPrice) < 0) {
    errors.buyPrice = 'Enter a valid purchase price'
  }

  if (form.sellPrice === '' || Number(form.sellPrice) < 0) {
    errors.sellPrice = 'Enter a valid selling price'
  }

  if (Number(form.sellPrice) < Number(form.buyPrice)) {
    errors.sellPrice =
      'Selling price should be at or above purchase price'
  }

  if (!form.expiryDate) {
    errors.expiryDate = 'Expiry date is required'
  }

  return errors
}

export function formToProduct(form) {
  return {
    name: form.name.trim(),
    barcode: form.barcode.trim(),
    category: form.category,
    quantity: Number(form.quantity),
    minimumStock: Number(form.minimumStock),
    buyPrice: Number(form.buyPrice),
    sellPrice: Number(form.sellPrice),
    expiryDate: form.expiryDate,
  }
}

export const emptyProductForm = {
  name: '',
  barcode: '',
  category: 'Produce',
  quantity: '',
  minimumStock: '',
  buyPrice: '',
  sellPrice: '',
  expiryDate: '',
}

export function productToForm(product) {
  return {
    name: product.name || '',
    barcode: product.barcode || '',
    category: product.category || 'Produce',
    quantity: String(product.quantity ?? ''),
    minimumStock: String(product.minimumStock ?? ''),
    buyPrice: String(product.buyPrice ?? ''),
    sellPrice: String(product.sellPrice ?? ''),
    expiryDate: product.expiryDate || '',
  }
}