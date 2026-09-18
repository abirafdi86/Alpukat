export type FarmStatus = 'Active' | 'Inactive' | 'Planning'

export interface Farm {
  id: string
  name: string
  location: string
  totalArea: number
  description: string
  totalBlocks: number
  totalTrees: number
  status: FarmStatus
  createdDate: string
  harvestThisMonth: number
  blocks: { name: string; variety: string; trees: number; status: FarmStatus }[]
  recentHarvest: { date: string; block: string; weight: string; grade: string }[]
  upcomingActivities: { name: string; block: string; date: string }[]
}

export const mockFarms: Farm[] = [
  { id: 'FRM-001', name: 'Sungai Hijau Estate', location: 'Bandung, West Java', totalArea: 48.5, description: 'A productive highland estate focused on premium Hass avocado cultivation.', totalBlocks: 8, totalTrees: 624, status: 'Active', createdDate: 'Jan 12, 2024', harvestThisMonth: 2480, blocks: [{ name: 'Block A', variety: 'Hass', trees: 96, status: 'Active' }, { name: 'Block B', variety: 'Hass', trees: 88, status: 'Active' }, { name: 'Block C', variety: 'Fuerte', trees: 74, status: 'Active' }, { name: 'Block D', variety: 'Reed', trees: 70, status: 'Planning' }], recentHarvest: [{ date: 'Sep 17, 2026', block: 'Block A', weight: '204 kg', grade: 'Grade A' }, { date: 'Sep 15, 2026', block: 'Block B', weight: '189 kg', grade: 'Grade A' }, { date: 'Sep 12, 2026', block: 'Block C', weight: '156 kg', grade: 'Grade B' }], upcomingActivities: [{ name: 'Fertilization', block: 'Block A', date: 'Today' }, { name: 'Irrigation check', block: 'Block C', date: 'Sep 20' }] },
  { id: 'FRM-002', name: 'Bukit Sari Farm', location: 'Garut, West Java', totalArea: 32, description: 'Terraced avocado farm with a mix of Hass and Fuerte varieties.', totalBlocks: 5, totalTrees: 386, status: 'Active', createdDate: 'Mar 08, 2024', harvestThisMonth: 1760, blocks: [{ name: 'Block A', variety: 'Hass', trees: 82, status: 'Active' }, { name: 'Block B', variety: 'Fuerte', trees: 76, status: 'Active' }, { name: 'Block C', variety: 'Hass', trees: 68, status: 'Active' }], recentHarvest: [{ date: 'Sep 16, 2026', block: 'Block C', weight: '176 kg', grade: 'Grade B' }, { date: 'Sep 13, 2026', block: 'Block B', weight: '142 kg', grade: 'Grade A' }], upcomingActivities: [{ name: 'Pruning', block: 'Block C', date: 'Tomorrow' }, { name: 'Pest Control', block: 'Block B', date: 'Sep 21' }] },
  { id: 'FRM-003', name: 'Citra Lestari Orchard', location: 'Cianjur, West Java', totalArea: 24.75, description: 'Young orchard currently preparing new blocks for its first full harvest cycle.', totalBlocks: 4, totalTrees: 238, status: 'Planning', createdDate: 'Jun 20, 2025', harvestThisMonth: 580, blocks: [{ name: 'Block A', variety: 'Reed', trees: 62, status: 'Planning' }, { name: 'Block B', variety: 'Hass', trees: 58, status: 'Planning' }], recentHarvest: [{ date: 'Sep 14, 2026', block: 'Block A', weight: '128 kg', grade: 'Grade C' }], upcomingActivities: [{ name: 'Soil preparation', block: 'Block B', date: 'Sep 22' }] },
  { id: 'FRM-004', name: 'Mekar Wangi Plot', location: 'Sukabumi, West Java', totalArea: 18, description: 'Temporarily inactive plot awaiting irrigation improvements.', totalBlocks: 3, totalTrees: 0, status: 'Inactive', createdDate: 'Aug 04, 2025', harvestThisMonth: 0, blocks: [], recentHarvest: [], upcomingActivities: [{ name: 'Irrigation maintenance', block: 'All blocks', date: 'Sep 25' }] },
]
