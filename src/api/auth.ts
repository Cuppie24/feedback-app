import { apiClient } from './client'

export interface LoginCredentials {
  username: string
  password: string
}

// Shape of the authenticated-user payload isn't fixed by contract yet;
// keep it open so extra fields from the backend don't break typing.
export type AuthUser = Record<string, unknown>

export function login(credentials: LoginCredentials): Promise<AuthUser> {
  return apiClient.post<AuthUser>('/authn', credentials)
}

// Empty GET, purely a session check — the cookie alone tells the backend
// who's asking. Resolves if signed in, rejects (401) if not; the caller
// only cares which of those happened, not any response body.
export function checkAuthStatus(): Promise<void> {
  return apiClient.get<void>('/authn/me')
}
