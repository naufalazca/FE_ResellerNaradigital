import { api, authenticatedFetch } from './authServices'

// Types
export interface VoucherData {
  voucher_id?: number
  username: string
  password: string
  group_id: number
  groupname: string
  reseller_id?: number
  status?: 'active' | 'inactive' | 'expired'
  keterangan?: string
  is_sold?: number
  created_at?: string
  updated_at?: string
}

export interface CreateVoucherRequest {
  username: string
  password: string
  group_id: number
  groupname: string
  reseller_id?: number
  status?: 'active' | 'inactive' | 'expired'
  keterangan?: string
}

export interface CreateVoucherResponse {
  success: boolean
  message: string
  data: {
    voucher_id: number
    username: string
    groupname: string
  }
}

export interface VoucherDataResponse {
  success: boolean
  message?: string
  data: VoucherData | VoucherData[]
}

export interface GetAllVoucherParams {
  status?: 'active' | 'inactive' | 'expired'
  is_sold?: 0 | 1
  reseller_id?: number
  group_id?: number
  keterangan?: string
  search?: string
}

export interface DeleteVoucherResponse {
  success: boolean
  message: string
  data: {
    username: string
    deleted_tables: {
      voucher_data: number
      radcheck: number
      radusergroup: number
    }
  }
}

export interface DeleteBatchRequest {
  usernames: string[]
}

export interface DeleteBatchResponse {
  success: boolean
  message: string
  data: {
    total: number
    deleted: number
    failed: number
    failed_usernames: Array<{
      username: string
      error: string
    }>
  }
}

export interface DeleteByKeteranganResponse {
  success: boolean
  message: string
  data: {
    total_deleted: number
    keterangan?: string
    deleted_usernames?: string[]
    deleted_tables: {
      voucher_data: number
      radcheck: number
      radusergroup: number
    }
  }
}

// Voucher Services
export const voucherService = {
  /**
   * Create new voucher with RADIUS integration
   * @param voucherData - Voucher data to create
   * @returns Promise with created voucher data
   */
  async createVoucherData(
    voucherData: CreateVoucherRequest
  ): Promise<CreateVoucherResponse> {
    return api.post<CreateVoucherResponse>('/voucher-data', voucherData)
  },

  /**
   * Get all voucher data with optional filters
   * @param params - Filter parameters (status, is_sold, reseller_id, group_id, keterangan, search)
   * @returns Promise with array of voucher data
   */
  async getAllVoucherData(
    params?: GetAllVoucherParams
  ): Promise<VoucherDataResponse> {
    let endpoint = '/voucher-data'

    if (params) {
      const queryParams = new URLSearchParams()

      if (params.status) queryParams.append('status', params.status)
      if (params.is_sold !== undefined) queryParams.append('is_sold', params.is_sold.toString())
      if (params.reseller_id) queryParams.append('reseller_id', params.reseller_id.toString())
      if (params.group_id) queryParams.append('group_id', params.group_id.toString())
      if (params.keterangan) queryParams.append('keterangan', params.keterangan)
      if (params.search) queryParams.append('search', params.search)

      const queryString = queryParams.toString()
      if (queryString) {
        endpoint += `?${queryString}`
      }
    }

    return api.get<VoucherDataResponse>(endpoint)
  },

  /**
   * Get voucher data by ID
   * @param id - Voucher ID
   * @returns Promise with voucher data
   */
  async getVoucherDataById(id: number): Promise<VoucherDataResponse> {
    return api.get<VoucherDataResponse>(`/voucher-data/${id}`)
  },

  /**
   * Delete voucher and all related RADIUS entries by username (HARD DELETE)
   * @param username - Voucher username to delete
   * @returns Promise with deletion result
   */
  async deleteVoucherByUsername(
    username: string
  ): Promise<DeleteVoucherResponse> {
    return api.delete<DeleteVoucherResponse>(`/voucher-data/username/${username}`)
  },

  /**
   * Delete multiple vouchers by usernames (HARD DELETE - batch operation)
   * @param usernames - Array of voucher usernames to delete
   * @returns Promise with batch deletion result
   */
  async deleteVouchersBatch(
    usernames: string[]
  ): Promise<DeleteBatchResponse> {
    const response = await authenticatedFetch(
      `${import.meta.env.VITE_API_URL}/voucher-data/batch`,
      {
        method: 'DELETE',
        body: JSON.stringify({ usernames }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Batch delete failed')
    }

    return response.json()
  },

  /**
   * Delete vouchers by keterangan filter (HARD DELETE with filter)
   * @param keterangan - Keterangan value to filter vouchers for deletion
   * @returns Promise with deletion result
   */
  async deleteVouchersByKeterangan(
    keterangan: string
  ): Promise<DeleteByKeteranganResponse> {
    return api.delete<DeleteByKeteranganResponse>(
      `/voucher-data/by-keterangan/${keterangan}`
    )
  },
}
