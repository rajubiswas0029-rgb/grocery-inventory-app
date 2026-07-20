import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { sampleProducts } from '../src/data/sampleProducts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'inventory.db')

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    minimum_stock INTEGER NOT NULL,
    buy_price REAL NOT NULL,
    sell_price REAL NOT NULL,
    expiry_date TEXT NOT NULL
  )
`)

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    minimumStock: row.minimum_stock,
    buyPrice: row.buy_price,
    sellPrice: row.sell_price,
    expiryDate: row.expiry_date,
  }
}

function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM products').get().count
  if (count > 0) return

  const insert = db.prepare(`
    INSERT INTO products (
      id, name, category, quantity, minimum_stock, buy_price, sell_price, expiry_date
    ) VALUES (
      @id, @name, @category, @quantity, @minimumStock, @buyPrice, @sellPrice, @expiryDate
    )
  `)

  const insertMany = db.transaction((products) => {
    for (const product of products) {
      insert.run(product)
    }
  })

  insertMany(sampleProducts)
}

seedDatabase()

export function getAllProducts() {
  const rows = db
    .prepare('SELECT * FROM products ORDER BY name COLLATE NOCASE ASC')
    .all()
  return rows.map(rowToProduct)
}

export function getProductById(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  return row ? rowToProduct(row) : null
}

export function createProduct(product) {
  const id = crypto.randomUUID()
  const data = { ...product, id }

  db.prepare(`
    INSERT INTO products (
      id, name, category, quantity, minimum_stock, buy_price, sell_price, expiry_date
    ) VALUES (
      @id, @name, @category, @quantity, @minimumStock, @buyPrice, @sellPrice, @expiryDate
    )
  `).run(data)

  return getProductById(id)
}

export function updateProduct(id, updates) {
  const existing = getProductById(id)
  if (!existing) return null

  const merged = { ...existing, ...updates, id }

  db.prepare(`
    UPDATE products SET
      name = @name,
      category = @category,
      quantity = @quantity,
      minimum_stock = @minimumStock,
      buy_price = @buyPrice,
      sell_price = @sellPrice,
      expiry_date = @expiryDate
    WHERE id = @id
  `).run(merged)

  return getProductById(id)
}

export function deleteProduct(id) {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id)
  return result.changes > 0
}

export default db
