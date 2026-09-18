import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

export interface ApiHealthResponse {
  success: boolean
  message: string
}

export class ApiError extends Error {
  readonly status?: number
  readonly details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function getApiError(error: AxiosError<{ message?: string }>): ApiError {
  if (!error.response) {
    return new ApiError('Unable to connect to the AFMS API.')
  }

  return new ApiError(
    error.response.data?.message ?? 'The AFMS API returned an error.',
    error.response.status,
    error.response.data,
  )
}

export const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => config)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => Promise.reject(getApiError(error)),
)

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  const response = await api.get<ApiHealthResponse>('/health')
  return response.data
}
