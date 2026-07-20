import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from './database.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(getAllProducts())
})

router.get('/:id', (req, res) => {
  const product = getProductById(req.params.id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(product)
})

router.post('/', (req, res) => {
  const { name, category, quantity, minimumStock, buyPrice, sellPrice, expiryDate } =
    req.body

  if (
    !name?.trim() ||
    !category ||
    quantity == null ||
    minimumStock == null ||
    buyPrice == null ||
    sellPrice == null ||
    !expiryDate
  ) {
    res.status(400).json({ error: 'Missing required product fields' })
    return
  }

  const product = createProduct({
    name: name.trim(),
    category,
    quantity: Number(quantity),
    minimumStock: Number(minimumStock),
    buyPrice: Number(buyPrice),
    sellPrice: Number(sellPrice),
    expiryDate,
  })

  res.status(201).json(product)
})

router.put('/:id', (req, res) => {
  const { name, category, quantity, minimumStock, buyPrice, sellPrice, expiryDate } =
    req.body

  if (
    !name?.trim() ||
    !category ||
    quantity == null ||
    minimumStock == null ||
    buyPrice == null ||
    sellPrice == null ||
    !expiryDate
  ) {
    res.status(400).json({ error: 'Missing required product fields' })
    return
  }

  const product = updateProduct(req.params.id, {
    name: name.trim(),
    category,
    quantity: Number(quantity),
    minimumStock: Number(minimumStock),
    buyPrice: Number(buyPrice),
    sellPrice: Number(sellPrice),
    expiryDate,
  })

  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  res.json(product)
})

router.delete('/:id', (req, res) => {
  const deleted = deleteProduct(req.params.id)
  if (!deleted) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.status(204).send()
})

export default router
