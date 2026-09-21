import { prisma } from '../config/database.js'
import type { ActivityStatus } from '@prisma/client'

export interface ActivityFilters {
  skip: number
  take: number
  startDate?: Date
  endDate?: Date
  farmId?: string
  blockId?: string
  treeId?: string
  assignedWorkerId?: string
  type?: 'WATERING' | 'FERTILIZATION' | 'PRUNING' | 'PEST_CONTROL' | 'DISEASE_TREATMENT' | 'CLEANING' | 'HARVEST_PREPARATION' | 'OTHER'
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  view?: 'upcoming' | 'overdue' | 'completed'
}

const relationSelect = {
  farm: { select: { id: true, name: true, location: true } },
  block: { select: { id: true, name: true, farmId: true } },
  tree: { select: { id: true, treeCode: true, variety: true } },
  assignedWorker: { select: { id: true, fullName: true, email: true, status: true } },
} as const

const whereFor = (filters: Omit<ActivityFilters, 'skip' | 'take'>) => {
  const now = new Date()
  const dateFilter = filters.view === 'overdue'
    ? { lt: now }
    : filters.view === 'upcoming'
      ? { gte: now }
      : filters.startDate || filters.endDate
        ? { ...(filters.startDate ? { gte: filters.startDate } : {}), ...(filters.endDate ? { lte: filters.endDate } : {}) }
        : undefined
  return {
    ...(dateFilter ? { scheduledDate: dateFilter } : {}),
    ...(filters.farmId ? { farmId: filters.farmId } : {}),
    ...(filters.blockId ? { blockId: filters.blockId } : {}),
    ...(filters.treeId ? { treeId: filters.treeId } : {}),
    ...(filters.assignedWorkerId ? { assignedWorkerId: filters.assignedWorkerId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.view === 'overdue' ? { status: { notIn: ['COMPLETED', 'CANCELLED'] as ActivityStatus[] } } : filters.view === 'completed' ? { status: 'COMPLETED' as const } : filters.status ? { status: filters.status } : {}),
  }
}

export const activityRepository = {
  list: (filters: ActivityFilters) => prisma.activity.findMany({ where: whereFor(filters), skip: filters.skip, take: filters.take, orderBy: { scheduledDate: 'asc' }, include: relationSelect }),
  count: (filters: Omit<ActivityFilters, 'skip' | 'take'>) => prisma.activity.count({ where: whereFor(filters) }),
  findById: (id: string) => prisma.activity.findUnique({ where: { id }, include: relationSelect }),
  findFarm: (id: string) => prisma.farm.findUnique({ where: { id }, select: { id: true } }),
  findBlock: (id: string) => prisma.block.findUnique({ where: { id }, select: { id: true, farmId: true } }),
  findTree: (id: string) => prisma.tree.findUnique({ where: { id }, select: { id: true, blockId: true } }),
  findActiveWorker: (id: string) => prisma.user.findFirst({ where: { id, status: 'ACTIVE' }, select: { id: true } }),
  create: (data: { type: 'WATERING' | 'FERTILIZATION' | 'PRUNING' | 'PEST_CONTROL' | 'DISEASE_TREATMENT' | 'CLEANING' | 'HARVEST_PREPARATION' | 'OTHER'; farmId: string; blockId: string; treeId?: string | null; assignedWorkerId: string; scheduledDate: Date; status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; notes?: string | null; cost: string | number }) => prisma.activity.create({ data, include: relationSelect }),
  update: (id: string, data: Partial<{ type: 'WATERING' | 'FERTILIZATION' | 'PRUNING' | 'PEST_CONTROL' | 'DISEASE_TREATMENT' | 'CLEANING' | 'HARVEST_PREPARATION' | 'OTHER'; farmId: string; blockId: string; treeId: string | null; assignedWorkerId: string; scheduledDate: Date; status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; notes: string | null; cost: string | number }>) => prisma.activity.update({ where: { id }, data, include: relationSelect }),
}
