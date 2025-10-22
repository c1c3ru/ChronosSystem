// API Client - Centralized API calls
class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // === USERS API ===
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.role) searchParams.set('role', params.role)
    
    const query = searchParams.toString()
    return this.request(`/users${query ? `?${query}` : ''}`)
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`)
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // === MACHINES API ===
  async getMachines(activeOnly?: boolean) {
    const query = activeOnly ? '?active=true' : ''
    return this.request(`/machines${query}`)
  }

  async getMachine(id: string) {
    return this.request(`/machines/${id}`)
  }

  async createMachine(machineData: any) {
    return this.request('/machines', {
      method: 'POST',
      body: JSON.stringify(machineData),
    })
  }

  async updateMachine(id: string, machineData: any) {
    return this.request(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(machineData),
    })
  }

  async deleteMachine(id: string) {
    return this.request(`/machines/${id}`, {
      method: 'DELETE',
    })
  }

  // === ATTENDANCE API ===
  async getAttendanceRecords(params?: {
    userId?: string
    machineId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.userId) searchParams.set('userId', params.userId)
    if (params?.machineId) searchParams.set('machineId', params.machineId)
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return this.request(`/attendance${query ? `?${query}` : ''}`)
  }

  async createAttendanceRecord(recordData: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(recordData),
    })
  }

  // === DASHBOARD API ===
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  async getRecentActivity(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return this.request(`/dashboard/activity${query}`)
  }

  // === QR CODE API ===
  async generateQRCode(machineId: string) {
    return this.request('/qr/generate', {
      method: 'POST',
      body: JSON.stringify({ machineId }),
    })
  }

  async validateQRCode(qrData: string, location?: { latitude: number, longitude: number }) {
    return this.request('/qr/validate', {
      method: 'POST',
      body: JSON.stringify({ qrData, location }),
    })
  }
}

export const apiClient = new ApiClient()

// === REACT HOOKS FOR API CALLS ===
import { useState, useEffect } from 'react'

export function useUsers(params?: Parameters<typeof apiClient.getUsers>[0]) {
  const [users, setUsers] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.getUsers(params)
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [JSON.stringify(params)])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getUsers(params)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  return { users, loading, error, refetch }
}

export function useMachines(activeOnly?: boolean) {
  const [machines, setMachines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMachines = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getMachines(activeOnly)
      setMachines(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar máquinas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()
  }, [activeOnly])

  return { machines, loading, error, refetch: fetchMachines }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}

export function useRecentActivity(limit?: number) {
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivity = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getRecentActivity(limit)
      setActivity(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [limit])

  return { activity, loading, error, refetch: fetchActivity }
}
