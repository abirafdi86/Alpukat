import { prisma } from '../config/database.js'

export interface HarvestFilters {
  skip: number
  take: number
  search?: string
  startDate?: Date
  endDate?: Date
  farmId?: string
  blockId?: string
  treeId?: string
  workerId?: string
  variety?: string
  grade?: 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'REJECTED'
}

export const relationSelect = {
  farm: { select: { id: true, name: true, location: true } },
  block: { select: { id: true, name: true, farmId: true } },
  tree: { select: { id: true, treeCode: true, variety: true } },
  worker: { select: { id: true, fullName: true, email: true } },
} as const

export const itemSelect = { id: true, variety: true, grade: true, fruitCount: true, weight: true, createdAt: true, updatedAt: true } as const
const whereFor = (filters: Omit<HarvestFilters, 'skip' | 'take'>) => ({
  ...(filters.search ? { OR: [{ notes: { contains: filters.search, mode: 'insensitive' as const } }, { items: { some: { variety: { contains: filters.search, mode: 'insensitive' as const } } } }] } : {}),
  ...(filters.startDate || filters.endDate ? { harvestDate: { ...(filters.startDate ? { gte: filters.startDate } : {}), ...(filters.endDate ? { lte: filters.endDate } : {}) } } : {}),
  ...(filters.farmId ? { farmId: filters.farmId } : {}),
  ...(filters.blockId ? { blockId: filters.blockId } : {}),
  ...(filters.treeId ? { treeId: filters.treeId } : {}),
  ...(filters.workerId ? { workerId: filters.workerId } : {}),
  ...(filters.variety || filters.grade ? { items: { some: { ...(filters.variety ? { variety: { contains: filters.variety, mode: 'insensitive' as const } } : {}), ...(filters.grade ? { grade: filters.grade } : {}) } } } : {}),
})

export const harvestRepository = {
  list: (filters: HarvestFilters) => prisma.harvest.findMany({ where: whereFor(filters), skip: filters.skip, take: filters.take, orderBy: { harvestDate: 'desc' }, include: { ...relationSelect, items: { select: itemSelect } } }),
  count: (filters: Omit<HarvestFilters, 'skip' | 'take'>) => prisma.harvest.count({ where: whereFor(filters) }),
  findById: (id: string) => prisma.harvest.findUnique({ where: { id }, include: { ...relationSelect, items: { select: itemSelect } } }),
}
