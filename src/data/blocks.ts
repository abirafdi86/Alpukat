export type BlockStatus = 'Active' | 'Inactive' | 'Planning'

export interface Block {
  id: string
  name: string
  farmId: string
  area: number
  trees: number
  variety: string
  plantingYear: number
  status: BlockStatus
  notes: string
  harvestThisMonth: number
  health: { healthy: number; attention: number; sick: number }
  activities: { name: string; date: string }[]
}

export const mockBlocks: Block[] = [
  { id: 'BLK-001', name: 'Block A', farmId: 'FRM-001', area: 8.2, trees: 96, variety: 'Hass', plantingYear: 2019, status: 'Active', notes: 'Primary production block with mature trees.', harvestThisMonth: 204, health: { healthy: 84, attention: 10, sick: 2 }, activities: [{ name: 'Fertilization', date: 'Today' }, { name: 'Harvest inspection', date: 'Sep 18' }] },
  { id: 'BLK-002', name: 'Block B', farmId: 'FRM-001', area: 7.6, trees: 88, variety: 'Hass', plantingYear: 2020, status: 'Active', notes: 'Good canopy coverage and consistent yield.', harvestThisMonth: 189, health: { healthy: 76, attention: 9, sick: 3 }, activities: [{ name: 'Irrigation check', date: 'Sep 20' }] },
  { id: 'BLK-003', name: 'Block C', farmId: 'FRM-002', area: 6.8, trees: 68, variety: 'Fuerte', plantingYear: 2021, status: 'Active', notes: 'Mixed-age trees near the eastern access road.', harvestThisMonth: 176, health: { healthy: 58, attention: 8, sick: 2 }, activities: [{ name: 'Pruning', date: 'Tomorrow' }, { name: 'Soil sampling', date: 'Sep 23' }] },
  { id: 'BLK-004', name: 'Block A', farmId: 'FRM-003', area: 6.1, trees: 62, variety: 'Reed', plantingYear: 2024, status: 'Planning', notes: 'Young trees preparing for the first full season.', harvestThisMonth: 128, health: { healthy: 55, attention: 6, sick: 1 }, activities: [{ name: 'Soil preparation', date: 'Sep 22' }] },
  { id: 'BLK-005', name: 'Block B', farmId: 'FRM-002', area: 7.2, trees: 76, variety: 'Fuerte', plantingYear: 2020, status: 'Active', notes: 'Reliable Fuerte crop with recent pest monitoring.', harvestThisMonth: 142, health: { healthy: 68, attention: 6, sick: 2 }, activities: [{ name: 'Pest Control', date: 'Sep 21' }] },
  { id: 'BLK-006', name: 'Block D', farmId: 'FRM-001', area: 9.1, trees: 70, variety: 'Reed', plantingYear: 2025, status: 'Planning', notes: 'Newly surveyed area awaiting planting completion.', harvestThisMonth: 0, health: { healthy: 64, attention: 6, sick: 0 }, activities: [] },
]
