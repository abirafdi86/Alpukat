import { prisma } from '../config/database.js'
import type { Prisma } from '@prisma/client'
import { harvestRepository, itemSelect, relationSelect, type HarvestFilters } from '../repositories/harvest.js'

type HarvestItemInput = { variety: string; grade: 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'REJECTED'; fruitCount: number; weight: number }
type HarvestInput = { harvestDate: Date; farmId: string; blockId: string; treeId?: string | null; workerId: string; notes?: string | null; items: HarvestItemInput[] }

export class HarvestManagementError extends Error {
  constructor(readonly code: 'HARVEST_NOT_FOUND' | 'FARM_NOT_FOUND' | 'BLOCK_NOT_FOUND' | 'BLOCK_FARM_MISMATCH' | 'TREE_NOT_FOUND' | 'TREE_BLOCK_MISMATCH' | 'WORKER_NOT_FOUND_OR_INACTIVE' | 'HARVEST_ITEM_REQUIRED', message: string) {
    super(message)
    this.name = 'HarvestManagementError'
  }
}

async function validateRelations(tx: Prisma.TransactionClient, input: HarvestInput) {
  const farm = await tx.farm.findUnique({ where: { id: input.farmId }, select: { id: true } })
  if (!farm) throw new HarvestManagementError('FARM_NOT_FOUND', 'Farm not found')
  const block = await tx.block.findUnique({ where: { id: input.blockId }, select: { id: true, farmId: true } })
  if (!block) throw new HarvestManagementError('BLOCK_NOT_FOUND', 'Block not found')
  if (block.farmId !== input.farmId) throw new HarvestManagementError('BLOCK_FARM_MISMATCH', 'Block does not belong to the selected farm')
  if (input.treeId) {
    const tree = await tx.tree.findUnique({ where: { id: input.treeId }, select: { id: true, blockId: true } })
    if (!tree) throw new HarvestManagementError('TREE_NOT_FOUND', 'Tree not found')
    if (tree.blockId !== input.blockId) throw new HarvestManagementError('TREE_BLOCK_MISMATCH', 'Tree does not belong to the selected block')
  }
  const worker = await tx.user.findUnique({ where: { id: input.workerId }, select: { id: true, status: true } })
  if (!worker || worker.status !== 'ACTIVE') throw new HarvestManagementError('WORKER_NOT_FOUND_OR_INACTIVE', 'Worker does not exist or is inactive')
  if (!input.items.length) throw new HarvestManagementError('HARVEST_ITEM_REQUIRED', 'At least one harvest item is required')
}

function totals(items: Array<{ fruitCount: number; weight: unknown }>) {
  return { totalFruitCount: items.reduce((sum, item) => sum + item.fruitCount, 0), totalWeight: items.reduce((sum, item) => sum + Number(item.weight), 0) }
}

function serialize<T extends { items: Array<{ fruitCount: number; weight: unknown }> }>(harvest: T) {
  const { totalFruitCount, totalWeight } = totals(harvest.items)
  return { ...harvest, totalFruitCount, totalWeight }
}

export async function listHarvests(filters: HarvestFilters) {
  const [harvests, total] = await Promise.all([harvestRepository.list(filters), harvestRepository.count(filters)])
  return { harvests: harvests.map(serialize), total }
}

export async function getHarvest(id: string) {
  const harvest = await harvestRepository.findById(id)
  if (!harvest) throw new HarvestManagementError('HARVEST_NOT_FOUND', 'Harvest not found')
  return serialize(harvest)
}

export async function createHarvest(input: HarvestInput) {
  const harvest = await prisma.$transaction(async (tx) => {
    await validateRelations(tx, input)
    return tx.harvest.create({ data: { harvestDate: input.harvestDate, farmId: input.farmId, blockId: input.blockId, treeId: input.treeId ?? null, workerId: input.workerId, notes: input.notes ?? null, items: { create: input.items.map((item) => ({ variety: item.variety, grade: item.grade, fruitCount: item.fruitCount, weight: item.weight })) } }, include: { ...relationSelect, items: { select: itemSelect } } })
  })
  return serialize(harvest)
}

export async function updateHarvest(id: string, input: HarvestInput) {
  const harvest = await prisma.$transaction(async (tx) => {
    if (!(await tx.harvest.findUnique({ where: { id }, select: { id: true } }))) throw new HarvestManagementError('HARVEST_NOT_FOUND', 'Harvest not found')
    await validateRelations(tx, input)
    await tx.harvestItem.deleteMany({ where: { harvestId: id } })
    return tx.harvest.update({ where: { id }, data: { harvestDate: input.harvestDate, farmId: input.farmId, blockId: input.blockId, treeId: input.treeId ?? null, workerId: input.workerId, notes: input.notes ?? null, items: { create: input.items.map((item) => ({ variety: item.variety, grade: item.grade, fruitCount: item.fruitCount, weight: item.weight })) } }, include: { ...relationSelect, items: { select: itemSelect } } })
  })
  return serialize(harvest)
}

export async function deleteHarvest(id: string) {
  await prisma.$transaction(async (tx) => {
    if (!(await tx.harvest.findUnique({ where: { id }, select: { id: true } }))) throw new HarvestManagementError('HARVEST_NOT_FOUND', 'Harvest not found')
    await tx.harvestItem.deleteMany({ where: { harvestId: id } })
    await tx.harvest.delete({ where: { id } })
  })
}
