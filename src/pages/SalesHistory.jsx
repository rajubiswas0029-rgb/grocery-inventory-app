import { useEffect, useState } from 'react'
import { Receipt, Trash2, Printer } from 'lucide-react'
import { fetchSales, deleteSale } from '../utils/salesApi'
import { formatCurrency } from '../utils/formatCurrency'
import { printInvoice } from '../utils/printInvoice'
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function SalesHistory() {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSales = async () => {
    try {
      const data = await fetchSales()
      setSales(data)
    } catch (error) {
      console.error('Failed to load sales:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const handleDelete = async (id, invoiceNumber) => {
    const confirmed = window.confirm(
      `Delete invoice "${invoiceNumber}" from sales history?`
    )

    if (!confirmed) return

    await deleteSale(id)
    setSales((previousSales) =>
      previousSales.filter(
        (sale) => String(sale.id) !== String(id)
      )
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Sales History</h1>
          <p>View all completed sales and invoices</p>
        </div>
      </header>

      {isLoading ? (
        <div className="form-card">
          <p>Loading sales...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          <Receipt size={48} />
          <h3>No sales found</h3>
          <p>Complete a new sale to create your first invoice.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Date</th>
                <th>Print</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <strong>{sale.invoiceNumber}</strong>
                  </td>

                  <td>{sale.customerName || 'Walk-in Customer'}</td>

                  <td>{sale.customerPhone || '—'}</td>

                  <td>
                    {sale.items?.reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    ) || 0}
                  </td>

                  <td>
                    <span className="badge badge-neutral">
                      {sale.paymentMethod?.toUpperCase() || 'CASH'}
                    </span>
                  </td>

                  <td>{formatCurrency(sale.total)}</td>

                  <td>{formatDate(sale.createdAt)}</td>
                  <td>
                     <button
                       type="button"
                        className="btn-icon btn-icon-edit"
                          onClick={() => printInvoice(sale)}
                          title="Print Invoice"
                          >
                           <Printer size={16} />
                            </button>
                          </td>

                  <td>
                    <button
                      type="button"
                      className="btn-icon btn-icon-danger"
                      onClick={() =>
                        handleDelete(sale.id, sale.invoiceNumber)
                      }
                      title="Delete sale"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
