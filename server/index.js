import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import productsRouter from './routes/products.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/products', productsRouter)

const distPath = path.join(__dirname, '../dist')
const indexHtml = path.join(distPath, 'index.html')

if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(indexHtml)
  })
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
