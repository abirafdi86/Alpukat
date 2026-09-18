import type { Customer, CustomerPurchase, Sale, SaleTransactionDetail, SalesAnalyticsRange, SalesAnalyticsSeries, SalesPriceHistory, SalesStockItem, TopCustomerSales } from '@/types/sales'

export const mockSales: Sale[] = [
  { id: 'SAL-0001', invoiceNumber: 'INV-2026-0092', customerId: 'CUS-0003', saleDate: '2026-09-17', variety: 'Hass', quantity: 720, totalWeightKg: 120, totalAmount: 4_200_000, paymentStatus: 'Paid', orderStatus: 'Delivered' },
  { id: 'SAL-0002', invoiceNumber: 'INV-2026-0091', customerId: 'CUS-0001', saleDate: '2026-09-17', variety: 'Fuerte', quantity: 540, totalWeightKg: 90, totalAmount: 3_850_000, paymentStatus: 'Partial', orderStatus: 'Ready' },
  { id: 'SAL-0003', invoiceNumber: 'INV-2026-0090', customerId: 'CUS-0002', saleDate: '2026-09-16', variety: 'Hass', quantity: 900, totalWeightKg: 150, totalAmount: 6_750_000, paymentStatus: 'Unpaid', orderStatus: 'Processing' },
  { id: 'SAL-0004', invoiceNumber: 'INV-2026-0089', customerId: 'CUS-0001', saleDate: '2026-09-15', variety: 'Reed', quantity: 480, totalWeightKg: 80, totalAmount: 2_800_000, paymentStatus: 'Paid', orderStatus: 'Delivered' },
  { id: 'SAL-0005', invoiceNumber: 'INV-2026-0088', customerId: 'CUS-0003', saleDate: '2026-09-14', variety: 'Hass', quantity: 390, totalWeightKg: 65, totalAmount: 2_925_000, paymentStatus: 'Paid', orderStatus: 'Delivered' },
  { id: 'SAL-0006', invoiceNumber: 'INV-2026-0087', customerId: 'CUS-0002', saleDate: '2026-09-12', variety: 'Fuerte', quantity: 660, totalWeightKg: 110, totalAmount: 4_400_000, paymentStatus: 'Partial', orderStatus: 'Confirmed' },
  { id: 'SAL-0007', invoiceNumber: 'INV-2026-0086', customerId: 'CUS-0003', saleDate: '2026-09-10', variety: 'Reed', quantity: 300, totalWeightKg: 50, totalAmount: 1_600_000, paymentStatus: 'Unpaid', orderStatus: 'Draft' },
  { id: 'SAL-0008', invoiceNumber: 'INV-2026-0085', customerId: 'CUS-0001', saleDate: '2026-09-08', variety: 'Hass', quantity: 1_080, totalWeightKg: 180, totalAmount: 8_100_000, paymentStatus: 'Paid', orderStatus: 'Delivered' },
  { id: 'SAL-0009', invoiceNumber: 'INV-2026-0084', customerId: 'CUS-0002', saleDate: '2026-09-05', variety: 'Fuerte', quantity: 510, totalWeightKg: 85, totalAmount: 3_400_000, paymentStatus: 'Paid', orderStatus: 'Delivered' },
  { id: 'SAL-0010', invoiceNumber: 'INV-2026-0083', customerId: 'CUS-0003', saleDate: '2026-09-03', variety: 'Hass', quantity: 450, totalWeightKg: 75, totalAmount: 3_375_000, paymentStatus: 'Partial', orderStatus: 'Ready' },
  { id: 'SAL-0011', invoiceNumber: 'INV-2026-0082', customerId: 'CUS-0001', saleDate: '2026-09-01', variety: 'Reed', quantity: 570, totalWeightKg: 95, totalAmount: 3_040_000, paymentStatus: 'Paid', orderStatus: 'Cancelled' },
  { id: 'SAL-0012', invoiceNumber: 'INV-2026-0081', customerId: 'CUS-0002', saleDate: '2026-08-29', variety: 'Hass', quantity: 750, totalWeightKg: 125, totalAmount: 5_625_000, paymentStatus: 'Paid', orderStatus: 'Delivered' },
]

export const mockCustomers: Customer[] = [
  { id: 'CUS-0001', name: 'Segar Nusantara', type: 'Distributor', phone: '+62 812-4500-1200', email: 'purchasing@segarnusantara.id', address: 'Jl. Soekarno Hatta 184, Bandung', contactPerson: 'Andi Prasetyo', notes: 'Weekly bulk delivery customer.', totalTransactions: 18, totalPurchase: 78_450_000, outstandingPayment: 2_500_000, lastPurchase: '2026-09-17', active: true },
  { id: 'CUS-0002', name: 'Pasar Buah Sari', type: 'Fruit Store', phone: '+62 813-7720-4400', email: 'order@buahsari.id', address: 'Pasar Induk Kramat Jati, Jakarta', contactPerson: 'Sari Wulandari', notes: 'Prefers Hass and Fuerte varieties.', totalTransactions: 12, totalPurchase: 46_800_000, outstandingPayment: 4_000_000, lastPurchase: '2026-09-16', active: true },
  { id: 'CUS-0003', name: 'Toko Hijau', type: 'Fruit Store', phone: '+62 811-2090-3300', email: 'halo@tokohijau.id', address: 'Jl. Pajajaran 72, Bogor', contactPerson: 'Rizky Maulana', notes: 'Pickup orders twice per month.', totalTransactions: 8, totalPurchase: 24_375_000, outstandingPayment: 0, lastPurchase: '2026-09-17', active: true },
  { id: 'CUS-0004', name: 'Dapur Avokad', type: 'Restaurant', phone: '+62 857-1102-8800', email: 'supply@dapuravokad.id', address: 'Jl. Cihampelas 36, Bandung', contactPerson: 'Maya Lestari', notes: 'Requires ripe-ready fruit.', totalTransactions: 9, totalPurchase: 19_650_000, outstandingPayment: 0, lastPurchase: '2026-09-12', active: true },
  { id: 'CUS-0005', name: 'Freshmart Cibubur', type: 'Supermarket', phone: '+62 821-9088-1440', email: 'produce@freshmart.id', address: 'Cibubur Junction, Depok', contactPerson: 'Bima Saputra', notes: 'Requires labelled crates and delivery notes.', totalTransactions: 15, totalPurchase: 66_200_000, outstandingPayment: 0, lastPurchase: '2026-09-10', active: true },
  { id: 'CUS-0006', name: 'Nadia Permata', type: 'Individual', phone: '+62 852-6610-2200', email: 'nadia@example.com', address: 'Sentul, Bogor', contactPerson: 'Nadia Permata', notes: 'Seasonal direct customer.', totalTransactions: 3, totalPurchase: 2_850_000, outstandingPayment: 0, lastPurchase: '2026-08-28', active: false },
]

export const mockSaleDetails: SaleTransactionDetail[] = mockSales.map((sale, index) => {
  const grade = (index % 3 === 0 ? 'Grade A' : index % 3 === 1 ? 'Grade B' : 'Grade C') as 'Grade A' | 'Grade B' | 'Grade C'
  const discount = index % 4 === 0 ? 250_000 : 0
  const deliveryCost = index % 2 === 0 ? 150_000 : 0
  const subtotal = sale.totalAmount + discount - deliveryCost
  const grandTotal = subtotal - discount + deliveryCost
  const expectedPaid = sale.paymentStatus === 'Paid' ? grandTotal : sale.paymentStatus === 'Partial' ? Math.floor(grandTotal * 0.6) : 0
  const payments = sale.paymentStatus === 'Partial' && index === 1
    ? [{ id: 'PAY-0001', date: '2026-09-17', method: 'Bank Transfer' as const, amount: 2_000_000 }, { id: 'PAY-0002', date: '2026-09-18', method: 'Bank Transfer' as const, amount: 1_500_000 }]
    : expectedPaid > 0 ? [{ id: `PAY-${String(index + 1).padStart(4, '0')}`, date: sale.saleDate, method: 'Bank Transfer' as const, amount: expectedPaid }] : []
  const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  return { ...sale, products: [{ id: `LINE-${String(index + 1).padStart(4, '0')}`, variety: sale.variety, grade, quantity: sale.totalWeightKg, unit: 'kg', pricePerUnit: Math.round(subtotal / sale.totalWeightKg), discount, subtotal }], subtotal, discount, deliveryCost, grandTotal, amountPaid, paymentStatus: amountPaid >= grandTotal ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid', deliveryMethod: deliveryCost ? 'Farm Delivery' : 'Customer Pickup', deliveryDate: sale.saleDate, deliveryAddress: mockCustomers.find((customer) => customer.id === sale.customerId)?.address ?? '', payments }
})

export const mockCustomerPurchases: CustomerPurchase[] = [
  { id: 'PUR-001', customerId: 'CUS-0001', invoiceNumber: 'INV-2026-0091', date: '2026-09-17', products: 'Fuerte Grade B', weightKg: 90, total: 3_850_000, paymentStatus: 'Partial' },
  { id: 'PUR-002', customerId: 'CUS-0001', invoiceNumber: 'INV-2026-0089', date: '2026-09-15', products: 'Reed Grade A', weightKg: 80, total: 2_800_000, paymentStatus: 'Paid' },
  { id: 'PUR-003', customerId: 'CUS-0001', invoiceNumber: 'INV-2026-0085', date: '2026-09-08', products: 'Hass Grade A', weightKg: 180, total: 8_100_000, paymentStatus: 'Paid' },
  { id: 'PUR-004', customerId: 'CUS-0002', invoiceNumber: 'INV-2026-0090', date: '2026-09-16', products: 'Hass Grade A, Fuerte Grade B', weightKg: 150, total: 6_750_000, paymentStatus: 'Unpaid' },
  { id: 'PUR-005', customerId: 'CUS-0002', invoiceNumber: 'INV-2026-0087', date: '2026-09-12', products: 'Fuerte Grade A', weightKg: 110, total: 4_400_000, paymentStatus: 'Partial' },
  { id: 'PUR-006', customerId: 'CUS-0003', invoiceNumber: 'INV-2026-0092', date: '2026-09-17', products: 'Hass Grade A', weightKg: 120, total: 4_200_000, paymentStatus: 'Paid' },
]

export const mockSalesStock: SalesStockItem[] = [
  { id: 'STK-0001', variety: 'Hass', grade: 'Grade A', availableWeightKg: 480, reservedWeightKg: 85, soldWeightKg: 620, unit: 'kg', pricePerKg: 35_000, updatedAt: '2026-09-18' },
  { id: 'STK-0002', variety: 'Hass', grade: 'Grade B', availableWeightKg: 220, reservedWeightKg: 40, soldWeightKg: 310, unit: 'kg', pricePerKg: 28_000, updatedAt: '2026-09-18' },
  { id: 'STK-0003', variety: 'Miki', grade: 'Grade A', availableWeightKg: 350, reservedWeightKg: 70, soldWeightKg: 440, unit: 'kg', pricePerKg: 37_000, updatedAt: '2026-09-18' },
  { id: 'STK-0004', variety: 'Miki', grade: 'Grade B', availableWeightKg: 310, reservedWeightKg: 55, soldWeightKg: 280, unit: 'kg', pricePerKg: 27_000, updatedAt: '2026-09-17' },
  { id: 'STK-0005', variety: 'Fuerte', grade: 'Grade A', availableWeightKg: 490, reservedWeightKg: 90, soldWeightKg: 510, unit: 'kg', pricePerKg: 38_000, updatedAt: '2026-09-18' },
  { id: 'STK-0006', variety: 'Fuerte', grade: 'Grade B', availableWeightKg: 250, reservedWeightKg: 35, soldWeightKg: 265, unit: 'kg', pricePerKg: 27_400, updatedAt: '2026-09-16' },
  { id: 'STK-0007', variety: 'Reed', grade: 'Grade C', availableWeightKg: 150, reservedWeightKg: 20, soldWeightKg: 175, unit: 'kg', pricePerKg: 25_000, updatedAt: '2026-09-17' },
  { id: 'STK-0008', variety: 'Hass', grade: 'Grade C', availableWeightKg: 120, reservedWeightKg: 15, soldWeightKg: 130, unit: 'kg', pricePerKg: 24_000, updatedAt: '2026-09-15' },
  { id: 'STK-0009', variety: 'Miki', grade: 'Grade C', availableWeightKg: 80, reservedWeightKg: 10, soldWeightKg: 95, unit: 'kg', pricePerKg: 26_500, updatedAt: '2026-09-14' },
  { id: 'STK-0010', variety: 'Reed', grade: 'Grade B', availableWeightKg: 0, reservedWeightKg: 0, soldWeightKg: 210, unit: 'kg', pricePerKg: 27_500, updatedAt: '2026-09-13' },
]

export const mockSalesPriceHistory: SalesPriceHistory[] = [
  { id: 'PRC-0001', stockId: 'STK-0001', previousPrice: 33_000, newPrice: 35_000, effectiveDate: '2026-09-18', changedBy: 'Demo Owner' },
  { id: 'PRC-0002', stockId: 'STK-0002', previousPrice: 27_000, newPrice: 28_000, effectiveDate: '2026-09-18', changedBy: 'Demo Owner' },
  { id: 'PRC-0003', stockId: 'STK-0003', previousPrice: 35_000, newPrice: 37_000, effectiveDate: '2026-09-16', changedBy: 'Demo Owner' },
  { id: 'PRC-0004', stockId: 'STK-0005', previousPrice: 36_000, newPrice: 38_000, effectiveDate: '2026-09-15', changedBy: 'Demo Owner' },
]

export const mockSalesAnalytics: Record<SalesAnalyticsRange, SalesAnalyticsSeries> = {
  '7d': { labels: ['12 Sep', '13 Sep', '14 Sep', '15 Sep', '16 Sep', '17 Sep', '18 Sep'], revenue: [3_200_000, 4_050_000, 2_925_000, 5_800_000, 6_750_000, 8_050_000, 4_900_000], volume: [82, 105, 75, 148, 170, 205, 124] },
  '30d': { labels: ['20 Aug', '25 Aug', '30 Aug', '4 Sep', '9 Sep', '14 Sep', '18 Sep'], revenue: [4_800_000, 5_450_000, 6_100_000, 5_900_000, 6_750_000, 7_200_000, 6_550_000], volume: [190, 215, 240, 228, 270, 292, 260] },
  '3m': { labels: ['Jul', 'Aug', 'Sep'], revenue: [31_200_000, 38_600_000, 42_750_000], volume: [1_310, 1_590, 1_850] },
  '6m': { labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], revenue: [24_800_000, 27_400_000, 29_900_000, 31_200_000, 38_600_000, 42_750_000], volume: [1_020, 1_140, 1_230, 1_310, 1_590, 1_850] },
  '1y': { labels: ['Oct', 'Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Sep'], revenue: [20_100_000, 22_600_000, 23_900_000, 24_800_000, 29_900_000, 38_600_000, 42_750_000], volume: [840, 930, 980, 1_020, 1_230, 1_590, 1_850] },
}
export const mockSalesByVariety = { labels: ['Hass', 'Fuerte', 'Miki', 'Reed'], values: [650, 510, 430, 260] }
export const mockSalesByGrade = { labels: ['Grade A', 'Grade B', 'Grade C'], values: [980, 610, 260] }
export const mockTopCustomerSales: TopCustomerSales[] = [
  { customerId: 'CUS-0001', totalPurchase: 12_500_000, totalWeightKg: 380, transactions: 6 },
  { customerId: 'CUS-0002', totalPurchase: 10_850_000, totalWeightKg: 325, transactions: 5 },
  { customerId: 'CUS-0003', totalPurchase: 8_200_000, totalWeightKg: 245, transactions: 4 },
]
