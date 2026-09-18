export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid'
export type OrderStatus = 'Draft' | 'Confirmed' | 'Processing' | 'Ready' | 'Delivered' | 'Cancelled'
export type CustomerType = 'Individual' | 'Fruit Store' | 'Restaurant' | 'Distributor' | 'Supermarket' | 'Other'

export interface Sale {
  id: string
  invoiceNumber: string
  customerId: string
  saleDate: string
  variety: string
  quantity: number
  totalWeightKg: number
  totalAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
}

export interface SaleDetailProduct { id: string; variety: string; grade: 'Grade A' | 'Grade B' | 'Grade C'; quantity: number; unit: 'kg'; pricePerUnit: number; discount: number; subtotal: number }
export interface SalePayment { id: string; date: string; method: PaymentMethod; amount: number }
export interface SaleTransactionDetail extends Sale {
  products: SaleDetailProduct[]; subtotal: number; discount: number; deliveryCost: number; grandTotal: number; amountPaid: number
  deliveryMethod: DeliveryMethod; deliveryDate: string; deliveryAddress: string; payments: SalePayment[]
}

export type SalesAnalyticsRange = '7d' | '30d' | '3m' | '6m' | '1y'
export interface SalesAnalyticsSeries { labels: string[]; revenue: number[]; volume: number[] }
export interface TopCustomerSales { customerId: string; totalPurchase: number; totalWeightKg: number; transactions: number }

export interface Customer {
  id: string
  name: string
  type: CustomerType
  phone: string
  email: string
  address: string
  contactPerson: string
  notes: string
  totalTransactions: number
  totalPurchase: number
  outstandingPayment: number
  lastPurchase: string
  active: boolean
}

export interface CustomerPurchase {
  id: string
  customerId: string
  invoiceNumber: string
  date: string
  products: string
  weightKg: number
  total: number
  paymentStatus: PaymentStatus
}

export interface SalesStockItem {
  id: string
  variety: string
  grade: 'Grade A' | 'Grade B' | 'Grade C'
  availableWeightKg: number
  reservedWeightKg: number
  soldWeightKg: number
  unit: 'kg'
  pricePerKg: number
  updatedAt: string
}

export interface SalesPriceHistory {
  id: string
  stockId: string
  previousPrice: number
  newPrice: number
  effectiveDate: string
  changedBy: string
}

export type SaleUnit = 'kg' | 'crate'
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Other'
export type DeliveryMethod = 'Customer Pickup' | 'Farm Delivery' | 'Third Party Delivery'

export interface SaleProductLine { id: string; stockId: string; quantity: number; unit: SaleUnit; pricePerUnit: number; discount: number }
export interface NewSaleForm {
  customerId: string; transactionDate: string; invoiceNumber: string; products: SaleProductLine[]; additionalCost: number
  paymentMethod: PaymentMethod; paymentStatus: PaymentStatus; amountPaid: number
  deliveryMethod: DeliveryMethod; deliveryDate: string; deliveryAddress: string; deliveryCost: number; deliveryNotes: string; notes: string
}
