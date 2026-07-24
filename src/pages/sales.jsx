import { useMemo, useState } from 'react'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Barcode,
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import { formatCurrency } from '../utils/formatCurrency'
import { createSale } from '../utils/salesApi'

export default function Sales() {
  const { products, updateProduct } = useInventory()

  const [search, setSearch] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [cashReceived, setCashReceived] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const availableProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim()

    return products.filter((product) => {
      const productName =
        product.name?.toLowerCase() || ''

      const productCategory =
        product.category?.toLowerCase() || ''

      const productBarcode =
        String(product.barcode || '').toLowerCase()

      const matchesSearch =
        productName.includes(searchText) ||
        productCategory.includes(searchText) ||
        productBarcode.includes(searchText)

      return (
        matchesSearch &&
        Number(product.quantity) > 0
      )
    })
  }, [products, search])

  const addToCart = (product) => {
    const existingItem = cart.find(
      (item) =>
        String(item.id) === String(product.id)
    )

    if (existingItem) {
      if (
        existingItem.cartQuantity >=
        Number(product.quantity)
      ) {
        window.alert(
          `Only ${product.quantity} units available in stock.`
        )
        return
      }

      setCart((previousCart) =>
        previousCart.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                cartQuantity:
                  item.cartQuantity + 1,
              }
            : item
        )
      )

      return
    }

    setCart((previousCart) => [
      ...previousCart,
      {
        ...product,
        cartQuantity: 1,
      },
    ])
  }

  const increaseQuantity = (item) => {
    if (
      item.cartQuantity >=
      Number(item.quantity)
    ) {
      window.alert(
        `Only ${item.quantity} units available in stock.`
      )
      return
    }

    setCart((previousCart) =>
      previousCart.map((cartItem) =>
        String(cartItem.id) === String(item.id)
          ? {
              ...cartItem,
              cartQuantity:
                cartItem.cartQuantity + 1,
            }
          : cartItem
      )
    )
  }

  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                cartQuantity:
                  item.cartQuantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.cartQuantity > 0
        )
    )
  }

  const removeFromCart = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          String(item.id) !== String(id)
      )
    )
  }

  const handleBarcodeScan = () => {
    const scannedBarcode =
      barcodeInput.trim()

    if (!scannedBarcode) {
      return
    }

    const matchedProduct = products.find(
      (product) =>
        String(product.barcode || '').trim() ===
        scannedBarcode
    )

    if (!matchedProduct) {
      window.alert(
        `No product found for barcode: ${scannedBarcode}`
      )

      setBarcodeInput('')
      return
    }

    if (
      Number(matchedProduct.quantity) <= 0
    ) {
      window.alert(
        `${matchedProduct.name} is out of stock.`
      )

      setBarcodeInput('')
      return
    }

    addToCart(matchedProduct)
    setBarcodeInput('')
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.sellPrice) *
        Number(item.cartQuantity),
    0
  )

  const totalItems = cart.reduce(
    (total, item) =>
      total +
      Number(item.cartQuantity),
    0
  )

  const receivedAmount =
    Number(cashReceived || 0)

  const balanceReturn =
    paymentMethod === 'cash'
      ? Math.max(
          receivedAmount - subtotal,
          0
        )
      : 0

  const completeSale = async () => {
    if (cart.length === 0) {
      window.alert(
        'Please add at least one product to the cart.'
      )
      return
    }

    if (
      paymentMethod === 'cash' &&
      receivedAmount < subtotal
    ) {
      window.alert(
        `Cash received must be at least ${formatCurrency(
          subtotal
        )}.`
      )
      return
    }

    if (
      customerPhone &&
      customerPhone.length !== 10
    ) {
      window.alert(
        'Please enter a valid 10-digit mobile number.'
      )
      return
    }

    const confirmed = window.confirm(
      `Complete sale of ${formatCurrency(
        subtotal
      )}?`
    )

    if (!confirmed) return

    try {
      setIsProcessing(true)

      const stockUpdates = cart.map(
        (item) => {
          const latestProduct =
            products.find(
              (product) =>
                String(product.id) ===
                String(item.id)
            )

          if (!latestProduct) {
            throw new Error(
              `${item.name} was not found.`
            )
          }

          const remainingStock =
            Number(latestProduct.quantity) -
            Number(item.cartQuantity)

          if (remainingStock < 0) {
            throw new Error(
              `Not enough stock available for ${item.name}.`
            )
          }

          return {
            product: latestProduct,
            remainingStock,
          }
        }
      )

      for (const update of stockUpdates) {
        await updateProduct(
          update.product.id,
          {
            ...update.product,
            quantity:
              update.remainingStock,
          }
        )
      }

      const savedSale = await createSale({
        customerName:
          customerName.trim() ||
          'Walk-in Customer',

        customerPhone:
          customerPhone.trim(),

        paymentMethod,

        cashReceived:
          paymentMethod === 'cash'
            ? receivedAmount
            : subtotal,

        balanceReturn:
          paymentMethod === 'cash'
            ? balanceReturn
            : 0,

        total: subtotal,

        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: Number(
            item.cartQuantity
          ),
          price: Number(
            item.sellPrice
          ),
          lineTotal:
            Number(item.sellPrice) *
            Number(item.cartQuantity),
        })),
      })

      window.alert(
        `Sale completed successfully!

Invoice: ${savedSale.invoiceNumber}
Total: ${formatCurrency(
          savedSale.total
        )}
Payment: ${paymentMethod.toUpperCase()}`
      )

      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setCashReceived('')
      setBarcodeInput('')
      setPaymentMethod('cash')
    } catch (error) {
      console.error(
        'Sale failed:',
        error
      )

      window.alert(
        error.message ||
          'Sale could not be completed.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Sales / Billing</h1>

          <p>
            Create a new customer bill and
            update stock automatically
          </p>
        </div>
      </header>

      <div className="sales-layout">
        <section className="sales-products">
          <div className="form-card">
            <div className="search-input">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search product, category or barcode..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <div
              className="search-input"
              style={{
                marginTop: '14px',
              }}
            >
              <Barcode size={18} />

              <input
                type="text"
                placeholder="Scan barcode and press Enter..."
                value={barcodeInput}
                onChange={(event) =>
                  setBarcodeInput(
                    event.target.value.replace(
                      /\D/g,
                      ''
                    )
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter'
                  ) {
                    event.preventDefault()
                    handleBarcodeScan()
                  }
                }}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          <div className="sales-product-grid">
            {availableProducts.length ===
            0 ? (
              <div className="empty-state">
                <ShoppingCart size={48} />

                <h3>
                  No available products found
                </h3>

                <p>
                  Try another search or add
                  stock first.
                </p>
              </div>
            ) : (
              availableProducts.map(
                (product) => (
                  <article
                    className="sales-product-card"
                    key={product.id}
                  >
                    <div>
                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        {product.category}
                      </p>

                      {product.barcode && (
                        <small>
                          Barcode:{' '}
                          {product.barcode}
                        </small>
                      )}
                    </div>

                    <div className="sales-product-details">
                      <strong>
                        {formatCurrency(
                          product.sellPrice
                        )}
                      </strong>

                      <span>
                        Stock:{' '}
                        {product.quantity}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        addToCart(product)
                      }
                    >
                      <Plus size={18} />
                      Add to Cart
                    </button>
                  </article>
                )
              )
            )}
          </div>
        </section>

        <aside className="sales-cart">
          <div className="form-card">
            <div className="sales-cart-heading">
              <div>
                <h2>Current Bill</h2>

                <p>
                  {totalItems} item
                  {totalItems !== 1
                    ? 's'
                    : ''}
                </p>
              </div>

              <ShoppingCart size={24} />
            </div>

            <div className="sales-customer-fields">
              <label className="form-field">
                <span>Customer Name</span>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </label>

              <label className="form-field">
                <span>Mobile Number</span>

                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => {
                    const onlyNumbers =
                      event.target.value.replace(
                        /\D/g,
                        ''
                      )

                    setCustomerPhone(
                      onlyNumbers.slice(
                        0,
                        10
                      )
                    )
                  }}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                />
              </label>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state sales-cart-empty">
                <ShoppingCart size={40} />

                <h3>Cart is empty</h3>

                <p>
                  Add products to create a
                  bill.
                </p>
              </div>
            ) : (
              <div className="sales-cart-items">
                {cart.map((item) => (
                  <div
                    className="sales-cart-item"
                    key={item.id}
                  >
                    <div className="sales-cart-item-info">
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {formatCurrency(
                          item.sellPrice
                        )}{' '}
                        ×{' '}
                        {item.cartQuantity}
                      </span>
                    </div>

                    <div className="sales-cart-actions">
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                        title="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <strong>
                        {item.cartQuantity}
                      </strong>

                      <button
                        type="button"
                        className="btn-icon btn-icon-edit"
                        onClick={() =>
                          increaseQuantity(
                            item
                          )
                        }
                        title="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>

                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <strong>
                      {formatCurrency(
                        Number(
                          item.sellPrice
                        ) *
                          Number(
                            item.cartQuantity
                          )
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div className="sales-payment">
              <span>Payment Method</span>

              <div className="sales-payment-options">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={
                      paymentMethod === 'cash'
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  Cash
                </label>

                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={
                      paymentMethod === 'upi'
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  UPI
                </label>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="sales-customer-fields">
                <label className="form-field">
                  <span>
                    Cash Received
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashReceived}
                    onChange={(event) =>
                      setCashReceived(
                        event.target.value
                      )
                    }
                    placeholder="Enter received amount"
                  />
                </label>

                <label className="form-field">
                  <span>
                    Balance Return
                  </span>

                  <input
                    type="text"
                    value={formatCurrency(
                      balanceReturn
                    )}
                    readOnly
                  />
                </label>
              </div>
            )}

            <div className="sales-total">
              <span>Grand Total</span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>
            </div>

            <button
              type="button"
              className="btn btn-primary sales-complete-button"
              onClick={completeSale}
              disabled={
                cart.length === 0 ||
                isProcessing
              }
            >
              <CheckCircle size={18} />

              {isProcessing
                ? 'Processing...'
                : 'Complete Sale'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}