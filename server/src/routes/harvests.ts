import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createHarvestController, deleteHarvestController, getHarvestController, listHarvestsController, updateHarvestController } from '../controllers/harvests.js'

const router = Router()
router.use(authenticate)
router.get('/', listHarvestsController)
router.get('/:id', getHarvestController)
router.post('/', authorize('OWNER', 'WORKER'), createHarvestController)
router.patch('/:id', authorize('OWNER', 'WORKER'), updateHarvestController)
router.delete('/:id', authorize('OWNER'), deleteHarvestController)

export default router
