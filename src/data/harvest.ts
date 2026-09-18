export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Rejected'
export interface GradingResult { gradeA: number; gradeB: number; gradeC: number; rejected: number }

export interface HarvestRecord {
  id: string
  harvestDate: string
  farmId: string
  blockId: string
  treeId?: string
  variety: string
  fruits: number
  totalWeight: number
  qualityGrade: QualityGrade
  worker: string
  notes: string
  gradingResult?: GradingResult
}

export const mockHarvests: HarvestRecord[] = [
  { id: 'HRV-2026-0917-01', harvestDate: '2026-09-17', farmId: 'FRM-001', blockId: 'BLK-001', treeId: 'TR-0001', variety: 'Hass', fruits: 86, totalWeight: 14, qualityGrade: 'Grade A', worker: 'Dimas Pratama', notes: 'Morning collection, firm fruit.' },
  { id: 'HRV-2026-0917-02', harvestDate: '2026-09-17', farmId: 'FRM-002', blockId: 'BLK-003', treeId: 'TR-0004', variety: 'Fuerte', fruits: 64, totalWeight: 11, qualityGrade: 'Grade B', worker: 'Rani Wijaya', notes: 'Collected after health inspection.' },
  { id: 'HRV-2026-0917-03', harvestDate: '2026-09-17', farmId: 'FRM-001', blockId: 'BLK-002', variety: 'Hass', fruits: 94, totalWeight: 16, qualityGrade: 'Grade A', worker: 'Agus Santoso', notes: 'Uniform size across the row.' },
  { id: 'HRV-2026-0916-01', harvestDate: '2026-09-16', farmId: 'FRM-002', blockId: 'BLK-005', variety: 'Fuerte', fruits: 118, totalWeight: 21, qualityGrade: 'Grade B', worker: 'Rani Wijaya', notes: 'Standard afternoon collection.' },
  { id: 'HRV-2026-0915-01', harvestDate: '2026-09-15', farmId: 'FRM-001', blockId: 'BLK-002', variety: 'Hass', fruits: 102, totalWeight: 18, qualityGrade: 'Grade A', worker: 'Agus Santoso', notes: 'Premium batch reserved for wholesale.' },
  { id: 'HRV-2026-0914-01', harvestDate: '2026-09-14', farmId: 'FRM-003', blockId: 'BLK-004', variety: 'Reed', fruits: 76, totalWeight: 13, qualityGrade: 'Grade C', worker: 'Nia Kusuma', notes: 'Young orchard trial collection.' },
  { id: 'HRV-2026-0913-01', harvestDate: '2026-09-13', farmId: 'FRM-002', blockId: 'BLK-003', variety: 'Fuerte', fruits: 96, totalWeight: 17, qualityGrade: 'Grade A', worker: 'Dimas Pratama', notes: 'Clear weather collection.' },
  { id: 'HRV-2026-0912-01', harvestDate: '2026-09-12', farmId: 'FRM-001', blockId: 'BLK-001', variety: 'Hass', fruits: 108, totalWeight: 19, qualityGrade: 'Grade A', worker: 'Dimas Pratama', notes: 'Excellent color and size.' },
  { id: 'HRV-2026-0908-01', harvestDate: '2026-09-08', farmId: 'FRM-001', blockId: 'BLK-002', variety: 'Hass', fruits: 88, totalWeight: 15, qualityGrade: 'Grade B', worker: 'Agus Santoso', notes: 'Mixed maturity batch.' },
  { id: 'HRV-2026-0903-01', harvestDate: '2026-09-03', farmId: 'FRM-002', blockId: 'BLK-005', variety: 'Fuerte', fruits: 112, totalWeight: 20, qualityGrade: 'Grade B', worker: 'Rani Wijaya', notes: 'Good volume from the east row.' },
  { id: 'HRV-2026-0828-01', harvestDate: '2026-08-28', farmId: 'FRM-001', blockId: 'BLK-001', variety: 'Hass', fruits: 124, totalWeight: 22, qualityGrade: 'Grade A', worker: 'Dimas Pratama', notes: 'Late August premium collection.' },
  { id: 'HRV-2026-0824-01', harvestDate: '2026-08-24', farmId: 'FRM-003', blockId: 'BLK-004', variety: 'Reed', fruits: 68, totalWeight: 12, qualityGrade: 'Grade C', worker: 'Nia Kusuma', notes: 'Small first-season batch.' },
  { id: 'HRV-2026-0719-01', harvestDate: '2026-07-19', farmId: 'FRM-002', blockId: 'BLK-003', variety: 'Fuerte', fruits: 132, totalWeight: 24, qualityGrade: 'Grade A', worker: 'Rani Wijaya', notes: 'Strong mid-season yield.' },
  { id: 'HRV-2026-0628-01', harvestDate: '2026-06-28', farmId: 'FRM-001', blockId: 'BLK-002', variety: 'Hass', fruits: 105, totalWeight: 18, qualityGrade: 'Rejected', worker: 'Agus Santoso', notes: 'Fruit damage from heavy rain.' },
]
