import { prisma } from '../config/database.js'

export interface FarmFilters {
  skip: number
  take: number
  search?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

const detailSelect = {
  id: true, name: true, location: true, area: true, description: true, status: true, createdAt: true, updatedAt: true,
  _count: { select: { blocks: true, trees: true } },
} as const

export const farmRepository = {
  list: (filters: FarmFilters) => prisma.farm.findMany({
    where: {
      ...(filters.search ? { OR: [{ name: { contains: filters.search, mode: 'insensitive' as const } }, { location: { contains: filters.search, mode: 'insensitive' as const } }] } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    skip: filters.skip,
    take: filters.take,
    orderBy: { createdAt: 'desc' },
    select: detailSelect,
  }),
  count: (filters: Omit<FarmFilters, 'skip' | 'take'>) => prisma.farm.count({
    where: {
      ...(filters.search ? { OR: [{ name: { contains: filters.search, mode: 'insensitive' as const } }, { location: { contains: filters.search, mode: 'insensitive' as const } }] } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  }),
  findById: (id: string) => prisma.farm.findUnique({ where: { id }, select: detailSelect }),
  create: (data: { name: string; location: string; area: string | number; description?: string | null; status: 'ACTIVE' | 'INACTIVE' }) => prisma.farm.create({ data, select: detailSelect }),
  update: (id: string, data: { name?: string; location?: string; area?: string | number; description?: string | null; status?: 'ACTIVE' | 'INACTIVE' }) => prisma.farm.update({ where: { id }, data, select: detailSelect }),
  countProductiveTrees: (farmId: string) => prisma.tree.count({ where: { farmId, status: 'PRODUCTIVE' } }),
}
