const STORAGE_KEY = 'grocery-inventory-products'

function readProducts() {
  try {
    const savedProducts = localStorage.getItem(STORAGE_KEY)

    if (!savedProducts) {
      return []
    }

    const products = JSON.parse(savedProducts)
    return Array.isArray(products) ? products : []
  } catch (error) {
    console.error('Failed to read products:', error)
    return []
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function fetchProducts() {
  return readProducts()
}

export async function createProduct(product) {
  const products = readProducts()

  const newProduct = {
    ...product,
    id: product.id || createId(),
  }

  const updatedProducts = [...products, newProduct]
  saveProducts(updatedProducts)

  return newProduct
}

export async function updateProduct(id, product) {
  const products = readProducts()

  const updatedProduct = {
    ...product,
    id,
  }

  const updatedProducts = products.map((item) =>
    String(item.id) === String(id) ? updatedProduct : item
  )

  saveProducts(updatedProducts)
  return updatedProduct
}

export async function deleteProduct(id) {
  const products = readProducts()

  const updatedProducts = products.filter(
    (item) => String(item.id) !== String(id)
  )

  saveProducts(updatedProducts)
  return null
}