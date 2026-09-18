import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createUserController, getUserController, listUsersController, updateUserController, updateUserStatusController } from '../controllers/users.js'

const router = Router()
router.use(authenticate, authorize('OWNER'))
router.get('/', listUsersController)
router.get('/:id', getUserController)
router.post('/', createUserController)
router.patch('/:id', updateUserController)
router.patch('/:id/status', updateUserStatusController)

export default router
