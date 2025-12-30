import { api } from './authServices'

// Types
export interface VoucherPaymentStatsParams {
  startDate?: string // Format: YYYY-MM-DD
  endDate?: string // Format: YYYY-MM-DD
  is_archived?: 0 | 1 // 0 untuk aktif, 1 untuk archived
}

export interface VoucherPaymentStatsData {
  total_payments: number
  unique_active_vouchers: number
  unique_archived_vouchers: number
  total_amount: number
  total_net_amount: number
  total_reseller_fee: number
}

export interface VoucherPaymentStatsResponse {
  success: boolean
  message: string
  data: VoucherPaymentStatsData
}

// Helper function to get current month date range
const getCurrentMonthDateRange = (): { startDate: string; endDate: string } => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  // First day of current month
  const startDate = `${year}-${month}-01`

  // Last day of current month
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

  return { startDate, endDate }
}

// Voucher Payment Services
export const voucherPaymentService = {
  /**
   * Get voucher payment statistics for logged-in reseller
   * Auto-filtered by reseller ownership using middleware
   * Default: Fetches current month data
   *
   * @param params - Filter parameters (startDate, endDate, is_archived)
   * @returns Promise with payment statistics
   */
  async getResellerPaymentStats(
    params?: VoucherPaymentStatsParams
  ): Promise<VoucherPaymentStatsResponse> {
    let endpoint = '/vouchers/payments/reseller/stats'

    // Default to current month if no dates provided
    const dateRange = params?.startDate && params?.endDate
      ? { startDate: params.startDate, endDate: params.endDate }
      : getCurrentMonthDateRange()

    const queryParams = new URLSearchParams()

    queryParams.append('startDate', dateRange.startDate)
    queryParams.append('endDate', dateRange.endDate)

    if (params?.is_archived !== undefined) {
      queryParams.append('is_archived', params.is_archived.toString())
    }

    const queryString = queryParams.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }

    return api.get<VoucherPaymentStatsResponse>(endpoint)
  },

  /**
   * Get payment stats for current month (reseller-specific)
   * Convenience method for fetching current month statistics
   *
   * @param is_archived - Optional filter for archived vouchers
   * @returns Promise with payment statistics for current month
   */
  async getCurrentMonthStats(
    is_archived?: 0 | 1
  ): Promise<VoucherPaymentStatsResponse> {
    return this.getResellerPaymentStats({ is_archived })
  },

  /**
   * Get payment stats for custom date range (reseller-specific)
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param is_archived - Optional filter for archived vouchers
   * @returns Promise with payment statistics for date range
   */
  async getPaymentStatsByDateRange(
    startDate: string,
    endDate: string,
    is_archived?: 0 | 1
  ): Promise<VoucherPaymentStatsResponse> {
    return this.getResellerPaymentStats({ startDate, endDate, is_archived })
  },
}
