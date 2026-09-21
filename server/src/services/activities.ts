import { activityRepository, type ActivityFilters } from '../repositories/activity.js'

type ActivityInput = { type: 'WATERING' | 'FERTILIZATION' | 'PRUNING' | 'PEST_CONTROL' | 'DISEASE_TREATMENT' | 'CLEANING' | 'HARVEST_PREPARATION' | 'OTHER'; farmId: string; blockId: string; treeId?: string | null; assignedWorkerId: string; scheduledDate: Date; status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; notes?: string | null; cost: string | number }

export class ActivityManagementError extends Error {
  constructor(readonly code: 'ACTIVITY_NOT_FOUND' | 'FARM_NOT_FOUND' | 'BLOCK_NOT_FOUND' | 'BLOCK_FARM_MISMATCH' | 'TREE_NOT_FOUND' | 'TREE_BLOCK_MISMATCH' | 'WORKER_NOT_FOUND_OR_INACTIVE', message: string) {
    super(message)
    this.name = 'ActivityManagementError'
  }
}

async function validateRelations(input: ActivityInput) {
  if (!(await activityRepository.findFarm(input.farmId))) throw new ActivityManagementError('FARM_NOT_FOUND', 'Farm not found')
  const block = await activityRepository.findBlock(input.blockId)
  if (!block) throw new ActivityManagementError('BLOCK_NOT_FOUND', 'Block not found')
  if (block.farmId !== input.farmId) throw new ActivityManagementError('BLOCK_FARM_MISMATCH', 'Block does not belong to the selected farm')
  if (input.treeId) {
    const tree = await activityRepository.findTree(input.treeId)
    if (!tree) throw new ActivityManagementError('TREE_NOT_FOUND', 'Tree not found')
    if (tree.blockId !== input.blockId) throw new ActivityManagementError('TREE_BLOCK_MISMATCH', 'Tree does not belong to the selected block')
  }
  if (!(await activityRepository.findActiveWorker(input.assignedWorkerId))) throw new ActivityManagementError('WORKER_NOT_FOUND_OR_INACTIVE', 'Assigned worker does not exist or is inactive')
}

export async function listActivities(filters: ActivityFilters) {
  const [activities, total] = await Promise.all([activityRepository.list(filters), activityRepository.count(filters)])
  return { activities, total }
}

export async function getActivity(id: string) {
  const activity = await activityRepository.findById(id)
  if (!activity) throw new ActivityManagementError('ACTIVITY_NOT_FOUND', 'Activity not found')
  return activity
}

export async function createActivity(input: ActivityInput) {
  await validateRelations(input)
  return activityRepository.create(input)
}

export async function updateActivity(id: string, input: Partial<ActivityInput>) {
  const current = await activityRepository.findById(id)
  if (!current) throw new ActivityManagementError('ACTIVITY_NOT_FOUND', 'Activity not found')
  await validateRelations({ ...current, ...input, farmId: input.farmId ?? current.farmId, blockId: input.blockId ?? current.blockId, assignedWorkerId: input.assignedWorkerId ?? current.assignedWorkerId, type: input.type ?? current.type, scheduledDate: input.scheduledDate ?? current.scheduledDate, status: input.status ?? current.status, cost: input.cost ?? current.cost } as ActivityInput)
  return activityRepository.update(id, input)
}

export async function deleteActivity(id: string) {
  const activity = await activityRepository.findById(id)
  if (!activity) throw new ActivityManagementError('ACTIVITY_NOT_FOUND', 'Activity not found')
  return activityRepository.update(id, { status: 'CANCELLED' })
}
