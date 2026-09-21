import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createActivityController, deleteActivityController, getActivityController, listActivitiesController, updateActivityController } from '../controllers/activities.js'

const router = Router()
router.use(authenticate)
router.get('/', listActivitiesController)
router.get('/:id', getActivityController)
router.post('/', authorize('OWNER', 'WORKER'), createActivityController)
router.patch('/:id', authorize('OWNER', 'WORKER'), updateActivityController)
router.delete('/:id', authorize('OWNER'), deleteActivityController)

export default router
