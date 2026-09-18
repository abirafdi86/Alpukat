import { Router } from 'express'
import authRouter from './auth.js'
import usersRouter from './users.js'
import farmsRouter from './farms.js'
import blocksRouter from './blocks.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/farms', farmsRouter)
router.use('/blocks', blocksRouter)

router.get('/health', (_request, response) => {
  response.json({
    success: true,
    message: 'AFMS API is running',
  })
})

export default router
