import { farmRepository, type FarmFilters } from '../repositories/farm.js'

interface FarmRecord {
  id: string
  name: string
  location: string
  area: unknown
  description: string | null
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: Date
  updatedAt: Date
  _count: { blocks: number; trees: number }
}

export class FarmManagementError extends Error {
  constructor(readonly code: 'FARM_NOT_FOUND' | 'FARM_ALREADY_INACTIVE' | 'FARM_UPDATE_CONFLICT', message: string) {
    super(message)
    this.name = 'FarmManagementError'
  }
}

function serializeFarm(farm: FarmRecord | null, productiveTrees = 0) {
  if (!farm) return null
  const { _count, ...data } = farm
  return { ...data, totalBlocks: _count.blocks, totalTrees: _count.trees, productiveTrees }
}

export async function listFarms(filters: FarmFilters) {
  const [farms, total] = await Promise.all([farmRepository.list(filters), farmRepository.count(filters)])
  return { farms: (farms as FarmRecord[]).map((farm) => serializeFarm(farm)), total }
}

export async function getFarm(id: string) {
  const farm = await farmRepository.findById(id)
  if (!farm) throw new FarmManagementError('FARM_NOT_FOUND', 'Farm not found')
  return serializeFarm(farm, await farmRepository.countProductiveTrees(id))
}

export async function createFarm(input: { name: string; location: string; area: string | number; description?: string | null; status: 'ACTIVE' | 'INACTIVE' }) {
  return serializeFarm(await farmRepository.create(input))
}

export async function updateFarm(id: string, input: { name?: string; location?: string; area?: string | number; description?: string | null; status?: 'ACTIVE' | 'INACTIVE' }) {
  if (!(await farmRepository.findById(id))) throw new FarmManagementError('FARM_NOT_FOUND', 'Farm not found')
  return serializeFarm(await farmRepository.update(id, input))
}

export async function deactivateFarm(id: string) {
  const farm = await farmRepository.findById(id)
  if (!farm) throw new FarmManagementError('FARM_NOT_FOUND', 'Farm not found')
  if (farm.status === 'INACTIVE') throw new FarmManagementError('FARM_ALREADY_INACTIVE', 'Farm is already inactive')
  return serializeFarm(await farmRepository.update(id, { status: 'INACTIVE' }))
}
