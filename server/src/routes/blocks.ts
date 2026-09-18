import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createBlockController, deleteBlockController, getBlockController, listBlocksController, updateBlockController } from '../controllers/blocks.js'

const router = Router()
router.use(authenticate)
router.get('/', listBlocksController)
router.get('/:id', getBlockController)
router.post('/', authorize('OWNER'), createBlockController)
router.patch('/:id', authorize('OWNER'), updateBlockController)
router.delete('/:id', authorize('OWNER'), deleteBlockController)

export default router
