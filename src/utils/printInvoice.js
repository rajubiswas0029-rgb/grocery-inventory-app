import { formatCurrency } from './formatCurrency'

const SHOP_DETAILS = {
  name: 'Aditi Grocery Shop',
  tagline: 'Fresh Products • Fair Prices',
  address: 'Garia Station Road, Kolkata, West Bengal',
  phone: '+91 8240975359',
  email: 'rbiswas0029@gmail.com',
  gstNumber: '',
}

function formatInvoiceDate(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function printInvoice(sale) {
  if (!sale) {
    window.alert('Invoice data was not found.')
    return
  }

  const items = Array.isArray(sale.items) ? sale.items : []

  const itemRows = items
    .map((item) => {
      const quantity = Number(item.quantity || 0)
      const price = Number(item.price || 0)

      const lineTotal =
        item.lineTotal !== undefined
          ? Number(item.lineTotal)
          : quantity * price

      return `
        <tr>
          <td>${item.name || 'Product'}</td>
          <td class="center">${quantity}</td>
          <td class="right">${formatCurrency(price)}</td>
          <td class="right">${formatCurrency(lineTotal)}</td>
        </tr>
      `
    })
    .join('')

  const invoiceWindow = window.open(
    '',
    '_blank',
    'width=800,height=900',
  )

  if (!invoiceWindow) {
    window.alert('Please allow pop-ups to print the invoice.')
    return
  }

  invoiceWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>${sale.invoiceNumber || 'Invoice'}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;
            color: #111827;
            background: #ffffff;
            font-family: Arial, sans-serif;
          }

          .invoice {
            width: 100%;
            max-width: 760px;
            margin: 0 auto;
            padding: 28px;
            border: 1px solid #d1d5db;
            border-radius: 12px;
          }

          .invoice-header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 20px;
            border-bottom: 2px solid #10b981;
          }

          .brand h1 {
            margin: 0;
            color: #059669;
            font-size: 28px;
          }

          .brand p,
          .invoice-info p {
            margin: 6px 0 0;
            color: #6b7280;
          }

          .invoice-info {
            text-align: right;
          }

          .invoice-label {
            display: inline-block;
            margin-bottom: 8px;
            padding: 6px 12px;
            border-radius: 999px;
            color: #047857;
            background: #d1fae5;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .customer-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 24px 0;
          }

          .info-box {
            padding: 16px;
            border-radius: 10px;
            background: #f9fafb;
          }

          .info-box span {
            display: block;
            margin-bottom: 6px;
            color: #6b7280;
            font-size: 13px;
          }

          .info-box strong {
            font-size: 15px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            padding: 12px;
            color: #374151;
            background: #ecfdf5;
            text-align: left;
          }

          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }

          .center {
            text-align: center;
          }

          .right {
            text-align: right;
          }

          .invoice-total {
            display: flex;
            justify-content: flex-end;
            margin-top: 22px;
          }

          .total-box {
            width: 320px;
            padding: 18px;
            border-radius: 10px;
            background: #f9fafb;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin: 8px 0;
          }

          .grand-total {
            padding-top: 12px;
            border-top: 2px solid #10b981;
            color: #059669;
            font-size: 20px;
            font-weight: 700;
          }

          .footer {
            margin-top: 30px;
            color: #6b7280;
            text-align: center;
            font-size: 13px;
          }

          .footer p {
            margin: 6px 0 0;
          }

          .print-button {
            display: block;
            margin: 24px auto 0;
            padding: 12px 24px;
            border: 0;
            border-radius: 8px;
            color: #ffffff;
            background: #059669;
            font-size: 15px;
            cursor: pointer;
          }

          @page {
            size: A4;
            margin: 12mm;
          }

          @media (max-width: 600px) {
            body {
              padding: 12px;
            }

            .invoice {
              padding: 18px;
            }

            .invoice-header {
              flex-direction: column;
            }

            .invoice-info {
              text-align: left;
            }

            .customer-section {
              grid-template-columns: 1fr;
            }

            .total-box {
              width: 100%;
            }
          }

          @media print {
            body {
              padding: 0;
            }

            .invoice {
              border: 0;
              box-shadow: none;
            }

            .print-button {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <main class="invoice">
          <section class="invoice-header">
            <div class="brand">
              <h1>${SHOP_DETAILS.name}</h1>

              <p>${SHOP_DETAILS.tagline}</p>

              <p>${SHOP_DETAILS.address}</p>

              <p>Phone: ${SHOP_DETAILS.phone}</p>

              <p>Email: ${SHOP_DETAILS.email}</p>

              ${
                SHOP_DETAILS.gstNumber
                  ? `<p>GSTIN: ${SHOP_DETAILS.gstNumber}</p>`
                  : ''
              }
            </div>

            <div class="invoice-info">
              <span class="invoice-label">
                Customer Invoice
              </span>

              <p>
                <strong>
                  ${sale.invoiceNumber || 'Invoice'}
                </strong>
              </p>

              <p>${formatInvoiceDate(sale.createdAt)}</p>
            </div>
          </section>

          <section class="customer-section">
            <div class="info-box">
              <span>Customer Name</span>

              <strong>
                ${sale.customerName || 'Walk-in Customer'}
              </strong>
            </div>

            <div class="info-box">
              <span>Mobile Number</span>

              <strong>
                ${sale.customerPhone || 'Not provided'}
              </strong>
            </div>
          </section>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th class="center">Quantity</th>
                <th class="right">Price</th>
                <th class="right">Amount</th>
              </tr>
            </thead>

            <tbody>
              ${
                itemRows ||
                `
                  <tr>
                    <td colspan="4" class="center">
                      No invoice items found
                    </td>
                  </tr>
                `
              }
            </tbody>
          </table>

          <section class="invoice-total">
            <div class="total-box">
              <div class="total-row">
                <span>Payment Method</span>

                <strong>
                  ${(sale.paymentMethod || 'cash').toUpperCase()}
                </strong>
              </div>

              ${
                sale.paymentMethod === 'cash'
                  ? `
                    <div class="total-row">
                      <span>Cash Received</span>

                      <strong>
                        ${formatCurrency(sale.cashReceived || 0)}
                      </strong>
                    </div>

                    <div class="total-row">
                      <span>Balance Return</span>

                      <strong>
                        ${formatCurrency(sale.balanceReturn || 0)}
                      </strong>
                    </div>
                  `
                  : ''
              }

              <div class="total-row grand-total">
                <span>Grand Total</span>

                <strong>
                  ${formatCurrency(sale.total || 0)}
                </strong>
              </div>
            </div>
          </section>

          <footer class="footer">
            <strong>
              Thank you for shopping with ${SHOP_DETAILS.name}.
            </strong>

            <p>This is a computer-generated invoice.</p>

            <p>
              For assistance, call ${SHOP_DETAILS.phone}
            </p>
          </footer>

          <button
            class="print-button"
            type="button"
            onclick="window.print()"
          >
            Print Invoice
          </button>
        </main>
      </body>
    </html>
  `)

  invoiceWindow.document.close()
  invoiceWindow.focus()

  setTimeout(() => {
    invoiceWindow.print()
  }, 500)
}