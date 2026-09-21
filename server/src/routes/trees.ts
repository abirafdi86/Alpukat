import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createTreeController, deleteTreeController, getTreeController, listTreesController, updateTreeController } from '../controllers/trees.js'

const router = Router()
router.use(authenticate)
router.get('/', listTreesController)
router.get('/:id', getTreeController)
router.post('/', authorize('OWNER'), createTreeController)
router.patch('/:id', authorize('OWNER'), updateTreeController)
router.delete('/:id', authorize('OWNER'), deleteTreeController)

export default router
