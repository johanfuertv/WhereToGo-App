"use client"

const AUTH_API_URL = "http://localhost:3004/api"

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: "traveler" | "business"
  businessDetails?: {
    name: string
    type: string
    address: string
    city: string
    description: string
  }
  paymentMethod?: {
    type: "credit_card" | "bank_account"
    lastFour?: string
    bank?: string
  }
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    name: string
    email: string
    role: "traveler" | "business"
    businessDetails?: any
    paymentMethods?: any[]
    createdAt: string
    lastLogin: string | null
    isActive: boolean
  }
  token: string
}

// Verificar salud del servicio
export const checkServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${AUTH_API_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return response.ok
  } catch (error) {
    console.error("Auth service health check failed:", error)
    return false
  }
}

// Login
export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error during login:", error)
    throw error
  }
}

// Registro
export const register = async (registerData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error during registration:", error)
    throw error
  }
}

// Obtener perfil
export const getProfile = async (token: string) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching profile:", error)
    throw error
  }
}

// Actualizar perfil
export const updateProfile = async (token: string, profileData: { name?: string; businessDetails?: any }) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

// Cambiar contraseña
export const changePassword = async (token: string, passwordData: { currentPassword: string; newPassword: string }) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

// Verificar token
export const verifyToken = async (token: string) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error verifying token:", error)
    throw error
  }
}

// Logout
export const logout = async (token: string) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error during logout:", error)
    throw error
  }
}

// Obtener estadísticas
export const getStats = async (token: string) => {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching stats:", error)
    throw error
  }
}
