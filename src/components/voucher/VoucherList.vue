<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { voucherService, type VoucherData, type GetAllVoucherParams } from '@/service/voucherServices'

// Props
interface Props {
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: false,
  refreshInterval: 30000, // 30 seconds
})

// State
const vouchers = ref<VoucherData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedStatus = ref<string>('all')
const selectedIsSold = ref<string>('all')
const selectedVouchers = ref<string[]>([])

// Filters
const filters = computed<GetAllVoucherParams>(() => {
  const params: GetAllVoucherParams = {}

  if (selectedStatus.value !== 'all') {
    params.status = selectedStatus.value as 'active' | 'inactive' | 'expired'
  }

  if (selectedIsSold.value !== 'all') {
    params.is_sold = selectedIsSold.value === 'sold' ? 1 : 0
  }

  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }

  return params
})

// Filtered vouchers (client-side filtering for better UX)
const filteredVouchers = computed(() => {
  return vouchers.value
})

// Select All
const isAllSelected = computed(() => {
  return filteredVouchers.value.length > 0 &&
         selectedVouchers.value.length === filteredVouchers.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedVouchers.value = []
  } else {
    selectedVouchers.value = filteredVouchers.value.map(v => v.username)
  }
}

const toggleSelectVoucher = (username: string) => {
  const index = selectedVouchers.value.indexOf(username)
  if (index > -1) {
    selectedVouchers.value.splice(index, 1)
  } else {
    selectedVouchers.value.push(username)
  }
}

// Fetch vouchers
const fetchVouchers = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await voucherService.getAllVoucherData(filters.value)

    if (response.success && Array.isArray(response.data)) {
      vouchers.value = response.data
    } else if (response.success && !Array.isArray(response.data)) {
      vouchers.value = [response.data]
    } else {
      vouchers.value = []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch vouchers'
    vouchers.value = []
  } finally {
    loading.value = false
  }
}

// Delete single voucher
const deleteVoucher = async (username: string) => {
  if (!confirm(`Are you sure you want to delete voucher "${username}"? This action cannot be undone.`)) {
    return
  }

  try {
    await voucherService.deleteVoucherByUsername(username)
    await fetchVouchers()
    selectedVouchers.value = selectedVouchers.value.filter(v => v !== username)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to delete voucher')
  }
}

// Delete selected vouchers (batch)
const deleteSelectedVouchers = async () => {
  if (selectedVouchers.value.length === 0) {
    alert('Please select at least one voucher to delete')
    return
  }

  if (!confirm(`Are you sure you want to delete ${selectedVouchers.value.length} voucher(s)? This action cannot be undone.`)) {
    return
  }

  try {
    const response = await voucherService.deleteVouchersBatch(selectedVouchers.value)

    if (response.data.failed > 0) {
      alert(`Deleted ${response.data.deleted} vouchers. ${response.data.failed} failed.`)
    }

    await fetchVouchers()
    selectedVouchers.value = []
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to delete vouchers')
  }
}

// Refresh
const refresh = async () => {
  await fetchVouchers()
}

// Auto refresh
let refreshTimer: number | undefined
const setupAutoRefresh = () => {
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer = window.setInterval(() => {
      fetchVouchers()
    }, props.refreshInterval)
  }
}

const clearAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = undefined
  }
}

// Lifecycle
onMounted(async () => {
  await fetchVouchers()
  setupAutoRefresh()
})

// Cleanup
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  clearAutoRefresh()
})

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return dateString
  }
}

// Get status badge class
const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case 'active':
      return 'status-badge-active'
    case 'inactive':
      return 'status-badge-inactive'
    case 'expired':
      return 'status-badge-expired'
    default:
      return 'status-badge-default'
  }
}

// Expose methods to parent
defineExpose({
  refresh,
  fetchVouchers,
})
</script>

<template>
  <div class="voucher-list">
    <!-- Header & Filters -->
    <div class="list-header">
      <div class="filters-row">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 17.5l-3.625-3.625m2.083-5a7.083 7.083 0 11-14.166 0 7.083 7.083 0 0114.166 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input
            v-model="searchQuery"
            @input="fetchVouchers"
            type="text"
            placeholder="Search by username..."
            class="search-input"
          />
        </div>

        <div class="filters-group">
          <select v-model="selectedStatus" @change="fetchVouchers" class="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <select v-model="selectedIsSold" @change="fetchVouchers" class="filter-select">
            <option value="all">All Vouchers</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>

          <button @click="refresh" class="btn-refresh" :disabled="loading">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'spinning': loading }">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedVouchers.length > 0" class="bulk-actions">
        <span class="selected-count">{{ selectedVouchers.length }} selected</span>
        <button @click="deleteSelectedVouchers" class="btn-delete-bulk">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" fill="currentColor"/>
          </svg>
          Delete Selected
        </button>
        <button @click="selectedVouchers = []" class="btn-clear-selection">Clear</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-message">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9h2v4H9V9zm0-4h2v2H9V5z" fill="currentColor"/>
      </svg>
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading && vouchers.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading vouchers...</p>
    </div>

    <!-- Table -->
    <div v-else-if="filteredVouchers.length > 0" class="table-container">
      <table class="voucher-table">
        <thead>
          <tr>
            <th class="th-checkbox">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="checkbox"
              />
            </th>
            <th>Username</th>
            <th>Group Name</th>
            <th>Status</th>
            <th>Sold</th>
            <th>Keterangan</th>
            <th>Created At</th>
            <th class="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="voucher in filteredVouchers" :key="voucher.voucher_id" class="table-row">
            <td class="td-checkbox">
              <input
                type="checkbox"
                :checked="selectedVouchers.includes(voucher.username)"
                @change="toggleSelectVoucher(voucher.username)"
                class="checkbox"
              />
            </td>
            <td class="td-username">{{ voucher.username }}</td>
            <td>{{ voucher.groupname }}</td>
            <td>
              <span :class="['status-badge', getStatusBadgeClass(voucher.status)]">
                {{ voucher.status || 'unknown' }}
              </span>
            </td>
            <td>
              <span :class="voucher.is_sold ? 'sold-badge sold' : 'sold-badge available'">
                {{ voucher.is_sold ? 'Sold' : 'Available' }}
              </span>
            </td>
            <td class="td-keterangan">{{ voucher.keterangan || '-' }}</td>
            <td class="td-date">{{ formatDate(voucher.created_at) }}</td>
            <td class="td-actions">
              <button @click="deleteVoucher(voucher.username)" class="btn-delete" title="Delete">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" fill="currentColor"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 56c13.255 0 24-10.745 24-24S45.255 8 32 8 8 18.745 8 32s10.745 24 24 24z" stroke="#D6D3D1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M32 40v-8m0-8h.01" stroke="#D6D3D1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>No vouchers found</h3>
      <p>Try adjusting your filters or create a new voucher</p>
    </div>

    <!-- Stats Footer -->
    <div v-if="filteredVouchers.length > 0" class="stats-footer">
      <span class="stats-text">Total: {{ filteredVouchers.length }} voucher(s)</span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* Container */
.voucher-list {
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 16px;
  overflow: hidden;
}

/* Header */
.list-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E7E5E4;
  background: #FAFAF9;
}

.filters-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.search-box {
  flex: 1;
  min-width: 280px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748B;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #0F172A;
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  outline: none;
  border-color: #14B8A6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.filters-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #0F172A;
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-select:hover {
  border-color: #D6D3D1;
}

.filter-select:focus {
  outline: none;
  border-color: #14B8A6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #0F172A;
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-refresh:hover:not(:disabled) {
  border-color: #14B8A6;
  color: #14B8A6;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(20, 184, 166, 0.05);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
}

.selected-count {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0F172A;
  flex: 1;
}

.btn-delete-bulk {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #FFFFFF;
  background: #DC2626;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-delete-bulk:hover {
  background: #B91C1C;
}

.btn-clear-selection {
  padding: 0.5rem 1rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748B;
  background: transparent;
  border: 1px solid #E7E5E4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-clear-selection:hover {
  background: #F1F5F9;
  color: #0F172A;
}

/* Error */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin: 1.5rem;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 10px;
  color: #DC2626;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E7E5E4;
  border-top-color: #14B8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-container p {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #64748B;
  margin: 0;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
}

.voucher-table thead {
  background: #FAFAF9;
  border-bottom: 1px solid #E7E5E4;
}

.voucher-table th {
  padding: 1rem 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748B;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.th-checkbox {
  width: 50px;
}

.th-actions {
  width: 100px;
  text-align: center;
}

.voucher-table tbody tr {
  border-bottom: 1px solid #F5F5F4;
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.voucher-table tbody tr:hover {
  background: #FAFAF9;
}

.voucher-table td {
  padding: 1rem 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #0F172A;
}

.td-checkbox {
  width: 50px;
}

.td-username {
  font-weight: 500;
  color: #14B8A6;
}

.td-keterangan {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #64748B;
}

.td-date {
  color: #64748B;
  font-size: 0.875rem;
}

.td-actions {
  text-align: center;
}

/* Checkbox */
.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #14B8A6;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 6px;
  text-transform: capitalize;
}

.status-badge-active {
  background: rgba(34, 197, 94, 0.1);
  color: #16A34A;
}

.status-badge-inactive {
  background: rgba(251, 146, 60, 0.1);
  color: #EA580C;
}

.status-badge-expired {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

.status-badge-default {
  background: rgba(100, 116, 139, 0.1);
  color: #64748B;
}

/* Sold Badge */
.sold-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 6px;
}

.sold-badge.sold {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

.sold-badge.available {
  background: rgba(34, 197, 94, 0.1);
  color: #16A34A;
}

/* Buttons */
.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #DC2626;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-delete:hover {
  background: #FEF2F2;
  border-color: #FCA5A5;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-family: 'Crimson Pro', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #64748B;
  margin: 0;
}

/* Stats Footer */
.stats-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #E7E5E4;
  background: #FAFAF9;
}

.stats-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748B;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .filters-group {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .table-container {
    overflow-x: scroll;
  }

  .voucher-table {
    min-width: 800px;
  }
}
</style>
