export type ProductivityStatus = 'Productive' | 'Not Productive' | 'Young Tree' | 'Dead'
export type TreeHealth = 'Healthy' | 'Needs Attention' | 'Sick'

export interface TreeActivity {
  type: 'Fertilization' | 'Pruning' | 'Pest Treatment' | 'Health Inspection' | 'Harvest'
  date: string
  note: string
}

export interface Tree {
  id: string
  qrCode: string
  farmId: string
  blockId: string
  variety: string
  plantingDate: string
  age: number
  productivityStatus: ProductivityStatus
  health: TreeHealth
  lastHarvest: string
  historicalHarvest: number
  harvestThisYear: number
  averageHarvest: number
  notes: string
  activities: TreeActivity[]
}

export const mockTrees: Tree[] = [
  { id: 'TR-0001', qrCode: 'tree:TR-0001', farmId: 'FRM-001', blockId: 'BLK-001', variety: 'Hass', plantingDate: '2019-03-14', age: 7, productivityStatus: 'Productive', health: 'Healthy', lastHarvest: 'Sep 17, 2026', historicalHarvest: 1240, harvestThisYear: 286, averageHarvest: 41, notes: 'Strong canopy and consistent fruit set.', activities: [{ type: 'Harvest', date: 'Sep 17, 2026', note: '14 kg Grade A fruit collected.' }, { type: 'Health Inspection', date: 'Sep 10, 2026', note: 'No signs of disease.' }, { type: 'Fertilization', date: 'Aug 28, 2026', note: 'Organic fertilizer applied.' }] },
  { id: 'TR-0002', qrCode: 'tree:TR-0002', farmId: 'FRM-001', blockId: 'BLK-001', variety: 'Hass', plantingDate: '2019-04-02', age: 7, productivityStatus: 'Productive', health: 'Needs Attention', lastHarvest: 'Sep 17, 2026', historicalHarvest: 1086, harvestThisYear: 254, averageHarvest: 36, notes: 'Monitor leaf discoloration on lower branches.', activities: [{ type: 'Health Inspection', date: 'Sep 16, 2026', note: 'Leaf discoloration observed.' }, { type: 'Pest Treatment', date: 'Sep 12, 2026', note: 'Preventive treatment applied.' }] },
  { id: 'TR-0003', qrCode: 'tree:TR-0003', farmId: 'FRM-001', blockId: 'BLK-002', variety: 'Hass', plantingDate: '2020-01-22', age: 6, productivityStatus: 'Productive', health: 'Healthy', lastHarvest: 'Sep 15, 2026', historicalHarvest: 940, harvestThisYear: 231, averageHarvest: 38, notes: 'Healthy mature tree.', activities: [{ type: 'Harvest', date: 'Sep 15, 2026', note: '12 kg Grade A fruit collected.' }, { type: 'Pruning', date: 'Aug 20, 2026', note: 'Canopy shaped for airflow.' }] },
  { id: 'TR-0004', qrCode: 'tree:TR-0004', farmId: 'FRM-002', blockId: 'BLK-003', variety: 'Fuerte', plantingDate: '2021-06-10', age: 5, productivityStatus: 'Productive', health: 'Sick', lastHarvest: 'Sep 16, 2026', historicalHarvest: 602, harvestThisYear: 148, averageHarvest: 30, notes: 'Under observation after fungal symptoms.', activities: [{ type: 'Health Inspection', date: 'Sep 16, 2026', note: 'Fungal symptoms confirmed.' }, { type: 'Pest Treatment', date: 'Sep 16, 2026', note: 'Treatment scheduled for follow-up.' }] },
  { id: 'TR-0005', qrCode: 'tree:TR-0005', farmId: 'FRM-002', blockId: 'BLK-005', variety: 'Fuerte', plantingDate: '2020-02-18', age: 6, productivityStatus: 'Not Productive', health: 'Healthy', lastHarvest: 'No harvest yet', historicalHarvest: 0, harvestThisYear: 0, averageHarvest: 0, notes: 'Healthy tree with no fruit set this season.', activities: [{ type: 'Fertilization', date: 'Sep 05, 2026', note: 'Nutrients replenished before next cycle.' }] },
  { id: 'TR-0006', qrCode: 'tree:TR-0006', farmId: 'FRM-003', blockId: 'BLK-004', variety: 'Reed', plantingDate: '2024-02-09', age: 2, productivityStatus: 'Young Tree', health: 'Healthy', lastHarvest: 'No harvest yet', historicalHarvest: 0, harvestThisYear: 0, averageHarvest: 0, notes: 'Young tree in establishment stage.', activities: [{ type: 'Fertilization', date: 'Aug 30, 2026', note: 'Young tree feed applied.' }, { type: 'Pruning', date: 'Aug 12, 2026', note: 'Training prune completed.' }] },
  { id: 'TR-0007', qrCode: 'tree:TR-0007', farmId: 'FRM-001', blockId: 'BLK-006', variety: 'Reed', plantingDate: '2025-02-12', age: 1, productivityStatus: 'Young Tree', health: 'Healthy', lastHarvest: 'No harvest yet', historicalHarvest: 0, harvestThisYear: 0, averageHarvest: 0, notes: 'Recently planted and growing as expected.', activities: [{ type: 'Health Inspection', date: 'Sep 08, 2026', note: 'Growth is on track.' }] },
  { id: 'TR-0008', qrCode: 'tree:TR-0008', farmId: 'FRM-002', blockId: 'BLK-005', variety: 'Fuerte', plantingDate: '2018-01-30', age: 8, productivityStatus: 'Dead', health: 'Sick', lastHarvest: 'Jun 04, 2026', historicalHarvest: 314, harvestThisYear: 22, averageHarvest: 18, notes: 'Marked for removal after unsuccessful recovery.', activities: [{ type: 'Health Inspection', date: 'Jun 10, 2026', note: 'Tree marked for removal.' }] },
]

export function findTreeByIdentifier(identifier: string) {
  return mockTrees.find((tree) => tree.id === identifier || tree.qrCode === identifier)
}
