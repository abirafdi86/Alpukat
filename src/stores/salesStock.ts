import { ref } from 'vue'
import { defineStore } from 'pinia'
import { mockSalesPriceHistory, mockSalesStock } from '@/data/sales'
import type { GradingResult } from '@/data/harvest'
import type { SaleProductLine, SalesPriceHistory, SalesStockItem } from '@/types/sales'
import { completeSale, receiveGradedHarvest, reverseGradedHarvest, validateSaleStock, type HarvestStockReceipt } from '@/services/salesStock'

export const useSalesStockStore = defineStore('sales-stock', () => {
  const stock = ref<SalesStockItem[]>(mockSalesStock.map((item) => ({ ...item })))
  const priceHistory = ref<SalesPriceHistory[]>(mockSalesPriceHistory.map((item) => ({ ...item })))
  const harvestReceipts = new Map<string, HarvestStockReceipt>()
  function registerHarvestBaseline(harvestId: string, variety: string, grading: GradingResult, receivedAt: string) { if (!harvestReceipts.has(harvestId)) harvestReceipts.set(harvestId, { harvestId, variety, grading: { ...grading }, receivedAt }) }
  function receiveHarvest(harvestId: string, variety: string, grading: GradingResult, receivedAt: string) { const previous = harvestReceipts.get(harvestId); if (previous) reverseGradedHarvest(stock.value, previous); const receipt = { harvestId, variety, grading: { ...grading }, receivedAt }; receiveGradedHarvest(stock.value, receipt); harvestReceipts.set(harvestId, receipt) }
  function removeHarvest(harvestId: string) { const receipt = harvestReceipts.get(harvestId); if (!receipt) return; reverseGradedHarvest(stock.value, receipt); harvestReceipts.delete(harvestId) }
  function validateSale(lines: SaleProductLine[]) { return validateSaleStock(stock.value, lines) }
  function commitSale(lines: SaleProductLine[]) { return completeSale(stock.value, lines) }
  function updatePrice(stockId: string, newPrice: number, changedBy: string) { const item = stock.value.find((candidate) => candidate.id === stockId); if (!item) return false; const previousPrice = item.pricePerKg; item.pricePerKg = newPrice; item.updatedAt = new Date().toISOString().slice(0, 10); priceHistory.value.unshift({ id: `PRC-${String(priceHistory.value.length + 1).padStart(4, '0')}`, stockId, previousPrice, newPrice, effectiveDate: item.updatedAt, changedBy }); return true }
  return { stock, priceHistory, registerHarvestBaseline, receiveHarvest, removeHarvest, validateSale, commitSale, updatePrice }
})
