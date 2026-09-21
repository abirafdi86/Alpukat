import { treeRepository, type TreeFilters } from '../repositories/tree.js'

export class TreeManagementError extends Error {
  constructor(readonly code: 'TREE_NOT_FOUND' | 'FARM_NOT_FOUND' | 'BLOCK_NOT_FOUND' | 'BLOCK_FARM_MISMATCH' | 'TREE_CODE_ALREADY_EXISTS' | 'TREE_ALREADY_DEAD', message: string) {
    super(message)
    this.name = 'TreeManagementError'
  }
}

async function validateRelationships(farmId: string, blockId: string) {
  if (!(await treeRepository.findFarm(farmId))) throw new TreeManagementError('FARM_NOT_FOUND', 'Farm not found')
  const block = await treeRepository.findBlock(blockId)
  if (!block) throw new TreeManagementError('BLOCK_NOT_FOUND', 'Block not found')
  if (block.farmId !== farmId) throw new TreeManagementError('BLOCK_FARM_MISMATCH', 'Block does not belong to the selected farm')
}

export async function listTrees(filters: TreeFilters) {
  const [trees, total] = await Promise.all([treeRepository.list(filters), treeRepository.count(filters)])
  return { trees, total }
}

export async function getTree(id: string) {
  const tree = await treeRepository.findById(id)
  if (!tree) throw new TreeManagementError('TREE_NOT_FOUND', 'Tree not found')
  const totalWeight = tree.harvests.reduce((total, harvest) => total + harvest.items.reduce((sum, item) => sum + Number(item.weight), 0), 0)
  const lastHarvestDate = tree.harvests[0]?.harvestDate ?? null
  return { ...tree, harvestSummary: { totalHarvest: tree.harvests.length, totalHarvestedWeight: totalWeight, lastHarvestDate }, recentHarvests: tree.harvests, recentActivities: tree.activities }
}

export async function createTree(input: { treeCode: string; farmId: string; blockId: string; variety: string; plantingDate: Date; status: 'PRODUCTIVE' | 'NOT_PRODUCTIVE' | 'YOUNG' | 'DEAD'; health: 'HEALTHY' | 'NEEDS_ATTENTION' | 'SICK'; notes?: string | null }) {
  if (await treeRepository.findByCode(input.treeCode)) throw new TreeManagementError('TREE_CODE_ALREADY_EXISTS', 'Tree code already exists')
  await validateRelationships(input.farmId, input.blockId)
  return treeRepository.create(input)
}

export async function updateTree(id: string, input: Partial<{ treeCode: string; farmId: string; blockId: string; variety: string; plantingDate: Date; status: 'PRODUCTIVE' | 'NOT_PRODUCTIVE' | 'YOUNG' | 'DEAD'; health: 'HEALTHY' | 'NEEDS_ATTENTION' | 'SICK'; notes: string | null }>) {
  const current = await treeRepository.findById(id)
  if (!current) throw new TreeManagementError('TREE_NOT_FOUND', 'Tree not found')
  if (input.treeCode && input.treeCode !== current.treeCode && await treeRepository.findByCode(input.treeCode)) throw new TreeManagementError('TREE_CODE_ALREADY_EXISTS', 'Tree code already exists')
  await validateRelationships(input.farmId ?? current.farmId, input.blockId ?? current.blockId)
  return treeRepository.update(id, input)
}

export async function deactivateTree(id: string) {
  const tree = await treeRepository.findById(id)
  if (!tree) throw new TreeManagementError('TREE_NOT_FOUND', 'Tree not found')
  if (tree.status === 'DEAD') throw new TreeManagementError('TREE_ALREADY_DEAD', 'Tree is already inactive')
  return treeRepository.update(id, { status: 'DEAD' })
}
