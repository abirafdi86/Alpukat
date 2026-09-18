import { prisma } from '../config/database.js'

export interface UserFilters {
  skip: number
  take: number
  search?: string
  role?: 'OWNER' | 'WORKER'
  status?: 'ACTIVE' | 'INACTIVE'
}

export const userRepository = {
  list: (filters: UserFilters) => prisma.user.findMany({
    where: {
      ...(filters.search ? { OR: [{ fullName: { contains: filters.search, mode: 'insensitive' as const } }, { email: { contains: filters.search, mode: 'insensitive' as const } }] } : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    skip: filters.skip,
    take: filters.take,
    orderBy: { createdAt: 'desc' },
  }),
  count: (filters: Omit<UserFilters, 'skip' | 'take'>) => prisma.user.count({
    where: {
      ...(filters.search ? { OR: [{ fullName: { contains: filters.search, mode: 'insensitive' as const } }, { email: { contains: filters.search, mode: 'insensitive' as const } }] } : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  create: (data: { fullName: string; email: string; phone?: string; role: 'OWNER' | 'WORKER'; passwordHash: string }) => prisma.user.create({ data }),
  update: (id: string, data: { fullName?: string; email?: string; phone?: string | null; role?: 'OWNER' | 'WORKER'; status?: 'ACTIVE' | 'INACTIVE' }) => prisma.user.update({ where: { id }, data }),
}
