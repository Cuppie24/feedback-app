const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const AUTH_REFRESH_PATH = '/authn/refresh'
const LOGIN_PATH = '/authn'
const UNAUTHORIZED_EVENT = 'auth:unauthorized'

let refreshPromise: Promise<void> | null = null

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function notifyUnauthorized() {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
}

function refreshAuth(): Promise<void> {
  refreshPromise ??= request<void>(AUTH_REFRESH_PATH, { method: 'GET' }, false, true)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  hasRetried = false,
  isRefreshRequest = false,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    // The backend sets the auth token as an httpOnly cookie; this makes the
    // browser send it on requests and store it from Set-Cookie responses.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data = await response.json()
      message = data?.message ?? message
    } catch {
      // Response had no JSON body; fall back to statusText.
    }
    const error = new ApiError(message, response.status)

    if (response.status === 401 && path !== LOGIN_PATH) {
      if (isRefreshRequest) {
        throw error
      }

      if (hasRetried) {
        notifyUnauthorized()
        throw error
      }

      try {
        await refreshAuth()
      } catch {
        notifyUnauthorized()
        throw error
      }

      return request<T>(path, options, true)
    }

    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
}
