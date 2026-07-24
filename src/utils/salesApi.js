const SALES_STORAGE_KEY = 'groceryhub-sales'

function readSales() {
  try {
    const savedSales = window.localStorage.getItem(SALES_STORAGE_KEY)

    if (!savedSales) {
      return []
    }

    const parsedSales = JSON.parse(savedSales)

    return Array.isArray(parsedSales) ? parsedSales : []
  } catch (error) {
    console.error('Failed to read sales:', error)
    return []
  }
}

function saveSales(sales) {
  try {
    window.localStorage.setItem(
      SALES_STORAGE_KEY,
      JSON.stringify(sales)
    )

    console.log('Sales saved successfully:', sales)
  } catch (error) {
    console.error('Failed to save sales:', error)
    throw error
  }
}

function createInvoiceNumber() {
  const now = new Date()

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')

  const uniqueNumber = String(Date.now()).slice(-6)

  return `INV-${date}-${uniqueNumber}`
}

function createId() {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

export async function fetchSales() {
  const sales = readSales()
  console.log('Loaded sales:', sales)
  return sales
}

export async function createSale(sale) {
  const currentSales = readSales()

  const newSale = {
    ...sale,
    id: createId(),
    invoiceNumber: createInvoiceNumber(),
    createdAt: new Date().toISOString(),
  }

  const updatedSales = [newSale, ...currentSales]

  saveSales(updatedSales)

  return newSale
}

export async function deleteSale(id) {
  const currentSales = readSales()

  const updatedSales = currentSales.filter(
    (sale) => String(sale.id) !== String(id)
  )

  saveSales(updatedSales)

  return null
}