export type InventoryCategory = 'Fertilizer' | 'Pesticides' | 'Tools' | 'Packaging' | 'Other'
export type StockTransactionType = 'Stock In' | 'Stock Out'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  currentStock: number
  unit: string
  minimumStock: number
  purchasePrice: number
  supplier: string
  lastUpdated: string
}

export interface StockTransaction {
  id: string
  itemId: string
  type: StockTransactionType
  quantity: number
  date: string
  note: string
}

export const mockInventory: InventoryItem[] = [
  { id: 'INV-0001', name: 'NPK 16-16-16 Fertilizer', category: 'Fertilizer', currentStock: 42, unit: 'bags', minimumStock: 20, purchasePrice: 185000, supplier: 'Tani Makmur Supplies', lastUpdated: '2026-09-16' },
  { id: 'INV-0002', name: 'Organic Compost', category: 'Fertilizer', currentStock: 18, unit: 'bags', minimumStock: 20, purchasePrice: 75000, supplier: 'Hijau Lestari', lastUpdated: '2026-09-15' },
  { id: 'INV-0003', name: 'Neem Oil Concentrate', category: 'Pesticides', currentStock: 7, unit: 'bottles', minimumStock: 10, purchasePrice: 92000, supplier: 'Agro Sehat Indonesia', lastUpdated: '2026-09-12' },
  { id: 'INV-0004', name: 'Copper Fungicide', category: 'Pesticides', currentStock: 0, unit: 'kg', minimumStock: 8, purchasePrice: 128000, supplier: 'Agro Sehat Indonesia', lastUpdated: '2026-09-10' },
  { id: 'INV-0005', name: 'Pruning Shears', category: 'Tools', currentStock: 14, unit: 'pieces', minimumStock: 6, purchasePrice: 145000, supplier: 'Kebun Jaya Tools', lastUpdated: '2026-09-08' },
  { id: 'INV-0006', name: 'Harvest Crates', category: 'Packaging', currentStock: 86, unit: 'pieces', minimumStock: 40, purchasePrice: 58000, supplier: 'Berkah Packaging', lastUpdated: '2026-09-16' },
  { id: 'INV-0007', name: 'Jute Collection Bags', category: 'Packaging', currentStock: 24, unit: 'packs', minimumStock: 25, purchasePrice: 42000, supplier: 'Berkah Packaging', lastUpdated: '2026-09-14' },
  { id: 'INV-0008', name: 'Work Gloves', category: 'Other', currentStock: 0, unit: 'pairs', minimumStock: 12, purchasePrice: 28000, supplier: 'Kebun Jaya Tools', lastUpdated: '2026-09-05' },
]

export const mockStockTransactions: StockTransaction[] = [
  { id: 'STX-0001', itemId: 'INV-0001', type: 'Stock In', quantity: 50, date: '2026-09-16', note: 'Monthly fertilizer delivery.' },
  { id: 'STX-0002', itemId: 'INV-0001', type: 'Stock Out', quantity: 8, date: '2026-09-16', note: 'Issued to Block A.' },
  { id: 'STX-0003', itemId: 'INV-0002', type: 'Stock Out', quantity: 12, date: '2026-09-15', note: 'Applied to young trees.' },
  { id: 'STX-0004', itemId: 'INV-0003', type: 'Stock Out', quantity: 5, date: '2026-09-12', note: 'Pest control treatment.' },
]
