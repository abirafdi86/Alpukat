import { prisma } from '../config/database.js'

export interface TreeFilters {
  skip: number
  take: number
  search?: string
  farmId?: string
  blockId?: string
  variety?: string
  status?: 'PRODUCTIVE' | 'NOT_PRODUCTIVE' | 'YOUNG' | 'DEAD'
  health?: 'HEALTHY' | 'NEEDS_ATTENTION' | 'SICK'
}

const farmSelect = { id: true, name: true, location: true, status: true } as const
const blockSelect = { id: true, name: true, farmId: true, mainVariety: true, status: true } as const
const listSelect = {
  id: true, treeCode: true, farmId: true, blockId: true, variety: true, plantingDate: true, status: true, health: true, notes: true, createdAt: true, updatedAt: true,
  farm: { select: farmSelect }, block: { select: blockSelect },
} as const
const detailSelect = {
  ...listSelect,
  harvests: { orderBy: { harvestDate: 'desc' as const }, take: 5, select: { id: true, harvestDate: true, notes: true, items: { select: { variety: true, grade: true, weight: true, fruitCount: true } } } },
  activities: { orderBy: { scheduledDate: 'desc' as const }, take: 5, select: { id: true, type: true, scheduledDate: true, status: true, notes: true, cost: true } },
} as const

const whereFor = (filters: Omit<TreeFilters, 'skip' | 'take'>) => ({
  ...(filters.search ? { OR: [{ treeCode: { contains: filters.search, mode: 'insensitive' as const } }, { variety: { contains: filters.search, mode: 'insensitive' as const } }] } : {}),
  ...(filters.farmId ? { farmId: filters.farmId } : {}),
  ...(filters.blockId ? { blockId: filters.blockId } : {}),
  ...(filters.variety ? { variety: { contains: filters.variety, mode: 'insensitive' as const } } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.health ? { health: filters.health } : {}),
})

export const treeRepository = {
  list: (filters: TreeFilters) => prisma.tree.findMany({ where: whereFor(filters), skip: filters.skip, take: filters.take, orderBy: { createdAt: 'desc' }, select: listSelect }),
  count: (filters: Omit<TreeFilters, 'skip' | 'take'>) => prisma.tree.count({ where: whereFor(filters) }),
  findById: (id: string) => prisma.tree.findUnique({ where: { id }, select: detailSelect }),
  findByCode: (treeCode: string) => prisma.tree.findUnique({ where: { treeCode } }),
  findFarm: (farmId: string) => prisma.farm.findUnique({ where: { id: farmId }, select: farmSelect }),
  findBlock: (blockId: string) => prisma.block.findUnique({ where: { id: blockId }, select: blockSelect }),
  create: (data: { treeCode: string; farmId: string; blockId: string; variety: string; plantingDate: Date; status: 'PRODUCTIVE' | 'NOT_PRODUCTIVE' | 'YOUNG' | 'DEAD'; health: 'HEALTHY' | 'NEEDS_ATTENTION' | 'SICK'; notes?: string | null }) => prisma.tree.create({ data, select: listSelect }),
  update: (id: string, data: Partial<{ treeCode: string; farmId: string; blockId: string; variety: string; plantingDate: Date; status: 'PRODUCTIVE' | 'NOT_PRODUCTIVE' | 'YOUNG' | 'DEAD'; health: 'HEALTHY' | 'NEEDS_ATTENTION' | 'SICK'; notes: string | null }>) => prisma.tree.update({ where: { id }, data, select: listSelect }),
}
