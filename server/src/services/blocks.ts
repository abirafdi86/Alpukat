import { blockRepository, type BlockFilters } from '../repositories/block.js'

export class BlockManagementError extends Error {
  constructor(readonly code: 'BLOCK_NOT_FOUND' | 'FARM_NOT_FOUND_OR_INACTIVE' | 'BLOCK_ALREADY_INACTIVE' | 'BLOCK_NAME_EXISTS', message: string) {
    super(message)
    this.name = 'BlockManagementError'
  }
}

export async function listBlocks(filters: BlockFilters) {
  const [blocks, total] = await Promise.all([blockRepository.list(filters), blockRepository.count(filters)])
  return { blocks, total }
}

export async function getBlock(id: string) {
  const block = await blockRepository.findById(id)
  if (!block) throw new BlockManagementError('BLOCK_NOT_FOUND', 'Block not found')
  const productiveTrees = await blockRepository.countProductiveTrees(id)
  const { _count, ...data } = block
  return { ...data, totalTrees: _count.trees, productiveTrees }
}

export async function createBlock(input: { farmId: string; name: string; area: string | number; mainVariety: string; plantingYear: number; status: 'ACTIVE' | 'INACTIVE'; notes?: string | null }) {
  if (!(await blockRepository.farmIsActive(input.farmId))) throw new BlockManagementError('FARM_NOT_FOUND_OR_INACTIVE', 'Block must belong to an active farm')
  if (await blockRepository.findByFarmAndName(input.farmId, input.name)) throw new BlockManagementError('BLOCK_NAME_EXISTS', 'Block name already exists in this farm')
  return blockRepository.create(input)
}

export async function updateBlock(id: string, input: { farmId?: string; name?: string; area?: string | number; mainVariety?: string; plantingYear?: number; status?: 'ACTIVE' | 'INACTIVE'; notes?: string | null }) {
  const current = await blockRepository.findById(id)
  if (!current) throw new BlockManagementError('BLOCK_NOT_FOUND', 'Block not found')
  if (input.farmId && !(await blockRepository.farmIsActive(input.farmId))) throw new BlockManagementError('FARM_NOT_FOUND_OR_INACTIVE', 'Block must belong to an active farm')
  const duplicate = input.name ? await blockRepository.findByFarmAndName(input.farmId ?? current.farmId, input.name) : null
  if (duplicate && duplicate.id !== id) throw new BlockManagementError('BLOCK_NAME_EXISTS', 'Block name already exists in this farm')
  return blockRepository.update(id, input)
}

export async function deactivateBlock(id: string) {
  const block = await blockRepository.findById(id)
  if (!block) throw new BlockManagementError('BLOCK_NOT_FOUND', 'Block not found')
  if (block.status === 'INACTIVE') throw new BlockManagementError('BLOCK_ALREADY_INACTIVE', 'Block is already inactive')
  return blockRepository.update(id, { status: 'INACTIVE' })
}
