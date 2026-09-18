export type ActivityType = 'Watering' | 'Fertilization' | 'Pruning' | 'Pest Control' | 'Disease Treatment' | 'Cleaning' | 'Harvest Preparation' | 'Other'
export type ActivityStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'

export interface Activity {
  id: string
  type: ActivityType
  farmId: string
  blockId: string
  treeId?: string
  scheduledDate: string
  worker: string
  status: ActivityStatus
  notes: string
  cost: number
}

export const mockActivities: Activity[] = [
  { id: 'ACT-0001', type: 'Fertilization', farmId: 'FRM-001', blockId: 'BLK-001', scheduledDate: '2026-09-17', worker: 'Dimas Pratama', status: 'Scheduled', notes: 'Apply organic fertilizer around the root zone.', cost: 350000 },
  { id: 'ACT-0002', type: 'Pruning', farmId: 'FRM-002', blockId: 'BLK-003', scheduledDate: '2026-09-18', worker: 'Rani Wijaya', status: 'Scheduled', notes: 'Shape mature trees and clear low branches.', cost: 275000 },
  { id: 'ACT-0003', type: 'Pest Control', farmId: 'FRM-002', blockId: 'BLK-005', scheduledDate: '2026-09-21', worker: 'Agus Santoso', status: 'Scheduled', notes: 'Preventive treatment after the weekly inspection.', cost: 420000 },
  { id: 'ACT-0004', type: 'Watering', farmId: 'FRM-001', blockId: 'BLK-002', scheduledDate: '2026-09-16', worker: 'Nia Kusuma', status: 'In Progress', notes: 'Check irrigation pressure before watering.', cost: 120000 },
  { id: 'ACT-0005', type: 'Disease Treatment', farmId: 'FRM-001', blockId: 'BLK-001', treeId: 'TR-0002', scheduledDate: '2026-09-15', worker: 'Dimas Pratama', status: 'Completed', notes: 'Leaf discoloration follow-up completed.', cost: 85000 },
  { id: 'ACT-0006', type: 'Harvest Preparation', farmId: 'FRM-001', blockId: 'BLK-002', scheduledDate: '2026-09-14', worker: 'Agus Santoso', status: 'Completed', notes: 'Prepare crates and collection route.', cost: 160000 },
  { id: 'ACT-0007', type: 'Disease Treatment', farmId: 'FRM-002', blockId: 'BLK-003', treeId: 'TR-0004', scheduledDate: '2026-09-12', worker: 'Rani Wijaya', status: 'Scheduled', notes: 'Follow-up treatment for fungal symptoms.', cost: 310000 },
  { id: 'ACT-0008', type: 'Cleaning', farmId: 'FRM-003', blockId: 'BLK-004', scheduledDate: '2026-09-20', worker: 'Nia Kusuma', status: 'Scheduled', notes: 'Clear weeds around the young orchard.', cost: 180000 },
  { id: 'ACT-0009', type: 'Other', farmId: 'FRM-001', blockId: 'BLK-006', scheduledDate: '2026-09-10', worker: 'Agus Santoso', status: 'Cancelled', notes: 'Rescheduled because of heavy rain.', cost: 0 },
  { id: 'ACT-0010', type: 'Watering', farmId: 'FRM-003', blockId: 'BLK-004', scheduledDate: '2026-09-22', worker: 'Nia Kusuma', status: 'Scheduled', notes: 'Young tree watering cycle.', cost: 95000 },
]
