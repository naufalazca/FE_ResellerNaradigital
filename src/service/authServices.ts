// Types
export interface User {
  id: number
  username: string
  role: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface LoginRequest {
  username: string
  password: string
}

// Constants
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

// Token Management
export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY)
  },

  clearAuth(): void {
    this.removeToken()
    this.removeUser()
  },
}

// Auth Services
export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login gagal')
    }

    const data: LoginResponse = await response.json()

    // Simpan token dan user data
    if (data.success && data.data.token) {
      tokenService.setToken(data.data.token)
      tokenService.setUser(data.data.user)
    }

    return data
  },

  logout(): void {
    tokenService.clearAuth()
  },

  isAuthenticated(): boolean {
    return !!tokenService.getToken()
  },

  getCurrentUser(): User | null {
    return tokenService.getUser()
  },
}

// Authenticated Fetch Helper
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = tokenService.getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Jika unauthorized, clear auth dan redirect ke login
  if (response.status === 401) {
    tokenService.clearAuth()
    window.location.href = '/'
  }

  return response
}

// API Helper untuk request dengan token
export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await authenticatedFetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request gagal')
    }

    return response.json()
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await authenticatedFetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request gagal')
    }

    return response.json()
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await authenticatedFetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request gagal')
    }

    return response.json()
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await authenticatedFetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        method: 'DELETE',
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request gagal')
    }

    return response.json()
  },

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await authenticatedFetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request gagal')
    }

    return response.json()
  },
}
