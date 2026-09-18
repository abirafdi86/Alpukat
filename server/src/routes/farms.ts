import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createFarmController, deleteFarmController, getFarmController, listFarmsController, updateFarmController } from '../controllers/farms.js'

const router = Router()
router.use(authenticate)
router.get('/', listFarmsController)
router.get('/:id', getFarmController)
router.post('/', authorize('OWNER'), createFarmController)
router.patch('/:id', authorize('OWNER'), updateFarmController)
router.delete('/:id', authorize('OWNER'), deleteFarmController)

export default router
