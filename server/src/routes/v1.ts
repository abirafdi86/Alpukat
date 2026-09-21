import { Router } from 'express'
import authRouter from './auth.js'
import usersRouter from './users.js'
import farmsRouter from './farms.js'
import blocksRouter from './blocks.js'
import treesRouter from './trees.js'
import harvestsRouter from './harvests.js'
import activitiesRouter from './activities.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/farms', farmsRouter)
router.use('/blocks', blocksRouter)
router.use('/trees', treesRouter)
router.use('/harvests', harvestsRouter)
router.use('/activities', activitiesRouter)

router.get('/health', (_request, response) => {
  response.json({
    success: true,
    message: 'AFMS API is running',
  })
})

export default router
