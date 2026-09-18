import type { GradingResult } from '@/data/harvest'
import type { SaleProductLine, SalesStockItem } from '@/types/sales'

export const CRATE_WEIGHT_KG = 10
export type SellableGrade = 'Grade A' | 'Grade B' | 'Grade C'

export interface HarvestStockReceipt { harvestId: string; variety: string; grading: GradingResult; receivedAt: string }
export interface StockValidationResult { valid: boolean; shortages: string[] }

export function gradingTotal(grading: GradingResult) {
  return grading.gradeA + grading.gradeB + grading.gradeC + grading.rejected
}

export function receiveGradedHarvest(stock: SalesStockItem[], receipt: HarvestStockReceipt) {
  const quantities: Record<SellableGrade, number> = { 'Grade A': receipt.grading.gradeA, 'Grade B': receipt.grading.gradeB, 'Grade C': receipt.grading.gradeC }
  for (const [grade, quantity] of Object.entries(quantities) as [SellableGrade, number][]) {
    if (quantity <= 0) continue
    const item = stock.find((candidate) => candidate.variety === receipt.variety && candidate.grade === grade)
    if (item) { item.availableWeightKg += quantity; item.updatedAt = receipt.receivedAt }
    else stock.push({ id: `STK-${String(stock.length + 1).padStart(4, '0')}`, variety: receipt.variety, grade, availableWeightKg: quantity, reservedWeightKg: 0, soldWeightKg: 0, unit: 'kg', pricePerKg: 0, updatedAt: receipt.receivedAt })
  }
}

export function reverseGradedHarvest(stock: SalesStockItem[], receipt: HarvestStockReceipt) {
  const quantities: Record<SellableGrade, number> = { 'Grade A': receipt.grading.gradeA, 'Grade B': receipt.grading.gradeB, 'Grade C': receipt.grading.gradeC }
  for (const [grade, quantity] of Object.entries(quantities) as [SellableGrade, number][]) {
    const item = stock.find((candidate) => candidate.variety === receipt.variety && candidate.grade === grade)
    if (item) item.availableWeightKg = Math.max(0, item.availableWeightKg - quantity)
  }
}

export function lineWeightKg(line: SaleProductLine) {
  return Math.round(Number(line.quantity) * (line.unit === 'crate' ? CRATE_WEIGHT_KG : 1))
}

export function validateSaleStock(stock: SalesStockItem[], lines: SaleProductLine[]): StockValidationResult {
  const requested = new Map<string, number>()
  lines.forEach((line) => requested.set(line.stockId, (requested.get(line.stockId) ?? 0) + lineWeightKg(line)))
  const shortages = [...requested].filter(([stockId, weight]) => weight > (stock.find((item) => item.id === stockId)?.availableWeightKg ?? 0)).map(([stockId]) => stockId)
  return { valid: shortages.length === 0, shortages }
}

export function completeSale(stock: SalesStockItem[], lines: SaleProductLine[]) {
  const validation = validateSaleStock(stock, lines)
  if (!validation.valid) return validation
  const sold = new Map<string, number>()
  lines.forEach((line) => sold.set(line.stockId, (sold.get(line.stockId) ?? 0) + lineWeightKg(line)))
  sold.forEach((weight, stockId) => { const item = stock.find((candidate) => candidate.id === stockId)!; item.availableWeightKg -= weight; item.soldWeightKg += weight; item.updatedAt = new Date().toISOString().slice(0, 10) })
  return validation
}
