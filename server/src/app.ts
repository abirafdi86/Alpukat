import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import v1Router from './routes/v1.js'
import { isAuthServiceError } from './routes/auth.js'
import { UserManagementError } from './services/users.js'
import { FarmManagementError } from './services/farms.js'
import { BlockManagementError } from './services/blocks.js'
import { TreeManagementError } from './services/trees.js'
import { HarvestManagementError } from './services/harvests.js'
import { ActivityManagementError } from './services/activities.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: true, credentials: true }))
  app.use(cookieParser())
  app.use(morgan('dev'))
  app.use(express.json())
  app.use('/api/v1', v1Router)

  app.use((_request, response) => {
    response.status(404).json({ success: false, message: 'Route not found' })
  })

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (isAuthServiceError(error)) {
      const status = error.code === 'INVALID_CREDENTIALS' ? 401 : error.code === 'EMAIL_ALREADY_EXISTS' ? 409 : error.code === 'ACCOUNT_INACTIVE' ? 403 : 401
      return response.status(status).json({ success: false, code: error.code, message: error.message })
    }
    if (error instanceof UserManagementError) {
      const status = error.code === 'USER_NOT_FOUND' ? 404 : error.code === 'EMAIL_ALREADY_EXISTS' ? 409 : 400
      return response.status(status).json({ success: false, code: error.code, message: error.message })
    }
    if (error instanceof FarmManagementError) {
      const status = error.code === 'FARM_NOT_FOUND' ? 404 : error.code === 'FARM_UPDATE_CONFLICT' ? 409 : 400
      return response.status(status).json({ success: false, code: error.code, message: error.message })
    }
    if (error instanceof BlockManagementError) {
      const status = error.code === 'BLOCK_NOT_FOUND' ? 404 : error.code === 'BLOCK_NAME_EXISTS' ? 409 : 400
      return response.status(status).json({ success: false, code: error.code, message: error.message })
    }
    if (error instanceof TreeManagementError) {
      const status = error.code === 'TREE_NOT_FOUND' || error.code === 'FARM_NOT_FOUND' || error.code === 'BLOCK_NOT_FOUND' ? 404 : error.code === 'TREE_CODE_ALREADY_EXISTS' || error.code === 'BLOCK_FARM_MISMATCH' ? 409 : 400
      return response.status(status).json({ success: false, code: error.code, message: error.message })
    }
    if (error instanceof HarvestManagementError) {
      const status = error.code === 'HARVEST_NOT_FOUND' || error.code === 'FARM_NOT_FOUND' || error.code === 'BLOCK_NOT_FOUND' || error.code === 'TREE_NOT_FOUND' || error.code === 'WORKER_NOT_FOUND_OR_INACTIVE' ? 404 : error.code === 'BLOCK_FARM_MISMATCH' || error.code === 'TREE_BLOCK_MISMATCH' ? 409 : 400
      return response.status(status).json({ success: false, code: error.code, message: error.message })
    }
    if (error instanceof ActivityManagementError) {
      const status = error.code === 'ACTIVITY_NOT_FOUND' || error.code === 'FARM_NOT_FOUND' || error.code === 'BLOCK_NOT_FOUND' || error.code === 'TREE_NOT_FOUND' || error.code === 'WORKER_NOT_FOUND_OR_INACTIVE' ? 404 : error.code === 'BLOCK_FARM_MISMATCH' || error.code === 'TREE_BLOCK_MISMATCH' ? 409 : 400
      return response.status(status).json({ success: false, code: error.code, message: error.message })
    }
    console.error(error)
    return response.status(500).json({ success: false, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' })
  })

  return app
}
