import { prisma } from '../config/database.js'

export interface BlockFilters {
  skip: number
  take: number
  search?: string
  farmId?: string
  status?: 'ACTIVE' | 'INACTIVE'
  mainVariety?: string
}

const listSelect = {
  id: true, farmId: true, name: true, area: true, mainVariety: true, plantingYear: true, status: true, notes: true, createdAt: true, updatedAt: true,
  farm: { select: { id: true, name: true, location: true, status: true } },
} as const

const detailSelect = {
  ...listSelect,
  _count: { select: { trees: true, harvests: true, activities: true } },
} as const

const whereFor = (filters: Omit<BlockFilters, 'skip' | 'take'>) => ({
  ...(filters.search ? { OR: [{ name: { contains: filters.search, mode: 'insensitive' as const } }, { mainVariety: { contains: filters.search, mode: 'insensitive' as const } }] } : {}),
  ...(filters.farmId ? { farmId: filters.farmId } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.mainVariety ? { mainVariety: { contains: filters.mainVariety, mode: 'insensitive' as const } } : {}),
})

export const blockRepository = {
  list: (filters: BlockFilters) => prisma.block.findMany({ where: whereFor(filters), skip: filters.skip, take: filters.take, orderBy: { createdAt: 'desc' }, select: listSelect }),
  count: (filters: Omit<BlockFilters, 'skip' | 'take'>) => prisma.block.count({ where: whereFor(filters) }),
  findById: (id: string) => prisma.block.findUnique({ where: { id }, select: detailSelect }),
  findByFarmAndName: (farmId: string, name: string) => prisma.block.findFirst({ where: { farmId, name } }),
  farmIsActive: (farmId: string) => prisma.farm.findFirst({ where: { id: farmId, status: 'ACTIVE' }, select: { id: true, name: true, location: true, status: true } }),
  create: (data: { farmId: string; name: string; area: string | number; mainVariety: string; plantingYear: number; status: 'ACTIVE' | 'INACTIVE'; notes?: string | null }) => prisma.block.create({ data, select: detailSelect }),
  update: (id: string, data: { farmId?: string; name?: string; area?: string | number; mainVariety?: string; plantingYear?: number; status?: 'ACTIVE' | 'INACTIVE'; notes?: string | null }) => prisma.block.update({ where: { id }, data, select: detailSelect }),
  countProductiveTrees: (blockId: string) => prisma.tree.count({ where: { blockId, status: 'PRODUCTIVE' } }),
}
