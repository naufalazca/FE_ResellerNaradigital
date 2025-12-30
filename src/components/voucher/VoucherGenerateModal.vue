<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { voucherService, type VoucherGroupData } from '@/service/voucherServices'
import { authService } from '@/service/authServices'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [count: number]
}>()

// Form data
const quantity = ref(10)
const prefix = ref('VOUCHER')
const usernamePattern = ref<'uppercase' | 'lowercase' | 'lowercase-number' | 'uppercase-number'>('uppercase-number')
const groupId = ref<number | undefined>(undefined)
const groupName = ref('')
const status = ref<'active' | 'inactive'>('inactive')
const resellerId = ref<number | undefined>(authService.getCurrentUser()?.id)

// Voucher groups data
const voucherGroups = ref<VoucherGroupData[]>([])
const isLoadingGroups = ref(false)

// State
const step = ref<'form' | 'generating' | 'complete'>('form')
const isGenerating = ref(false)
const progress = ref(0)
const totalGenerated = ref(0)
const failedCount = ref(0)
const errorMessages = ref<string[]>([])

// Computed
const isValid = computed(() => {
  return (
    quantity.value > 0 &&
    quantity.value <= 1000 &&
    prefix.value.trim() !== '' &&
    groupId.value !== undefined &&
    groupId.value !== null &&
    groupId.value > 0 &&
    groupName.value.trim() !== ''
  )
})

const estimatedTime = computed(() => {
  const seconds = Math.ceil(quantity.value * 0.5) // Estimate 0.5s per voucher
  if (seconds < 60) return `~${seconds}s`
  return `~${Math.ceil(seconds / 60)}m`
})

// Generate preview vouchers
const previewVouchers = computed(() => {
  const previews: string[] = []
  const count = Math.min(quantity.value, 5)

  for (let i = 0; i < count; i++) {
    const username = generateUsername()
    previews.push(username)
  }

  if (quantity.value > 5) {
    previews.push('...')
  }

  return previews
})

// Generate username based on pattern
const generateUsername = (): string => {
  let randomStr = ''
  const length = 6 // Length of random string

  switch (usernamePattern.value) {
    case 'uppercase':
      // Only uppercase letters (A-Z)
      randomStr = Array.from({ length }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join('')
      break

    case 'lowercase':
      // Only lowercase letters (a-z)
      randomStr = Array.from({ length }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('')
      break

    case 'lowercase-number':
      // Lowercase letters and numbers
      const lowerNumChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      randomStr = Array.from({ length }, () =>
        lowerNumChars[Math.floor(Math.random() * lowerNumChars.length)]
      ).join('')
      break

    case 'uppercase-number':
      // Uppercase letters and numbers
      const upperNumChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      randomStr = Array.from({ length }, () =>
        upperNumChars[Math.floor(Math.random() * upperNumChars.length)]
      ).join('')
      break
  }

  return `${prefix.value}${randomStr}`
}

// Generate password (always same as username)
const generatePassword = (username: string): string => {
  return username
}

// Fetch voucher groups
const fetchVoucherGroups = async () => {
  try {
    isLoadingGroups.value = true
    const response = await voucherService.getAllVoucherGroups()

    if (response.success) {
      voucherGroups.value = response.data

      // Set default group if available and not already set
      if (voucherGroups.value.length > 0) {
        // Only set default if groupId is undefined, 0, or if current groupId doesn't exist in the fetched groups
        const currentGroupExists = groupId.value ? voucherGroups.value.some(g => g.id === groupId.value) : false

        if (groupId.value === undefined || groupId.value === 0 || !currentGroupExists) {
          const defaultGroup = voucherGroups.value[0]

          if (defaultGroup) {
            groupId.value = defaultGroup.id
            groupName.value = defaultGroup.groupname
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch voucher groups:', error)
  } finally {
    isLoadingGroups.value = false
  }
}

// Handle group selection change
const handleGroupChange = () => {
  const selectedGroup = voucherGroups.value.find(
    group => group.id === groupId.value
  )

  if (selectedGroup) {
    groupName.value = selectedGroup.groupname
  }
}

// Watch groupId changes to update groupName
watch(groupId, () => {
  handleGroupChange()
})

// Generate batch identifier automatically
const getBatchIdentifier = (): string => {
  const now = new Date()

  // Format date as DD-MM-YYYY
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const dateStr = `${day}-${month}-${year}`

  // Format time as HH:MM
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}`

  // Remove "hotspot_" prefix from groupname if exists
  const cleanGroupName = groupName.value.replace(/^hotspot_/i, '')

  return `${cleanGroupName}-${dateStr}-${timeStr}`
}

// Generate vouchers
const generateVouchers = async () => {
  step.value = 'generating'
  isGenerating.value = true
  progress.value = 0
  totalGenerated.value = 0
  failedCount.value = 0
  errorMessages.value = []

  const batch = getBatchIdentifier()
  const totalVouchers = quantity.value

  for (let i = 0; i < totalVouchers; i++) {
    const username = generateUsername()
    const password = generatePassword(username)

    try {
      await voucherService.createVoucherData({
        username,
        password,
        group_id: groupId.value as number,
        groupname: groupName.value,
        status: status.value,
        keterangan: batch,
        reseller_id: resellerId.value,
      })

      totalGenerated.value++
    } catch (error) {
      failedCount.value++
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errorMessages.value.push(`${username}: ${errorMsg}`)
    }

    // Update progress
    progress.value = Math.round(((i + 1) / totalVouchers) * 100)

    // Small delay to prevent overwhelming the server
    if (i < totalVouchers - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  isGenerating.value = false
  step.value = 'complete'
}

// Handle submit
const handleSubmit = () => {
  if (!isValid.value) return
  generateVouchers()
}

// Handle close
const handleClose = () => {
  if (isGenerating.value) {
    if (!confirm('Generation is in progress. Are you sure you want to close?')) {
      return
    }
  }

  if (step.value === 'complete' && totalGenerated.value > 0) {
    emit('success', totalGenerated.value)
  }

  resetForm()
  emit('close')
}

// Reset form
const resetForm = () => {
  step.value = 'form'
  quantity.value = 10
  prefix.value = 'VOUCHER'
  usernamePattern.value = 'uppercase-number'

  // Reset to first group if available
  if (voucherGroups.value.length > 0) {
    const defaultGroup = voucherGroups.value[0]
    if (defaultGroup) {
      groupId.value = defaultGroup.id
      groupName.value = defaultGroup.groupname
    } else {
      groupId.value = undefined
      groupName.value = ''
    }
  } else {
    groupId.value = undefined
    groupName.value = ''
  }

  status.value = 'inactive'
  resellerId.value = authService.getCurrentUser()?.id
  progress.value = 0
  totalGenerated.value = 0
  failedCount.value = 0
  errorMessages.value = []
}

// Watch modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Fetch voucher groups when modal opens
    fetchVoucherGroups()
  } else {
    // Reset after animation
    setTimeout(resetForm, 300)
  }
})

// Fetch voucher groups on mount
onMounted(() => {
  fetchVoucherGroups()
})
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Generate Vouchers</h2>
            <p class="modal-subtitle">Create multiple vouchers at once</p>
          </div>
          <button
            @click="handleClose"
            class="btn-close"
            :disabled="isGenerating"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Form Step -->
          <div v-if="step === 'form'" class="form-container">
            <div class="form-section">
              <h3 class="section-title">Quantity</h3>
              <div class="form-group">
                <label class="form-label">Number of vouchers</label>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  max="1000"
                  class="form-input"
                  placeholder="Enter quantity (max 1000)"
                />
                <p class="form-hint">Estimated time: {{ estimatedTime }}</p>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Username Configuration</h3>
              <div class="form-group">
                <label class="form-label">Prefix</label>
                <input
                  v-model="prefix"
                  type="text"
                  class="form-input"
                  placeholder="e.g., VOUCHER"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Random Pattern</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input
                      v-model="usernamePattern"
                      type="radio"
                      value="uppercase"
                      class="radio-input"
                    />
                    <span>Uppercase (ABCDEF)</span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="usernamePattern"
                      type="radio"
                      value="lowercase"
                      class="radio-input"
                    />
                    <span>Lowercase (abcdef)</span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="usernamePattern"
                      type="radio"
                      value="lowercase-number"
                      class="radio-input"
                    />
                    <span>Lowercase & Number (a1b2c3)</span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="usernamePattern"
                      type="radio"
                      value="uppercase-number"
                      class="radio-input"
                    />
                    <span>Uppercase & Number (A1B2C3)</span>
                  </label>
                </div>
              </div>

              <div class="preview-box">
                <p class="preview-label">Preview:</p>
                <div class="preview-list">
                  <span
                    v-for="(username, index) in previewVouchers"
                    :key="index"
                    class="preview-item"
                  >
                    {{ username }}
                  </span>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Voucher Details</h3>
              <div class="form-group">
                <label class="form-label">Voucher Group</label>
                <select
                  v-model.number="groupId"
                  class="form-select"
                  :disabled="isLoadingGroups || voucherGroups.length === 0"
                >
                  <option v-if="isLoadingGroups" :value="undefined" disabled>Loading groups...</option>
                  <option v-else-if="voucherGroups.length === 0" :value="undefined" disabled>No groups available</option>
                  <option
                    v-for="group in voucherGroups"
                    :key="group.id"
                    :value="group.id"
                  >
                    {{ group.groupname }} (ID: {{ group.id }}){{ group.price ? ` - Rp ${group.price.toLocaleString()}` : '' }}
                  </option>
                </select>
                <p class="form-hint" v-if="groupId && groupId > 0">Selected: {{ groupName }} (ID: {{ groupId }})</p>
                <p class="form-hint error-text" v-else-if="!isLoadingGroups && voucherGroups.length === 0">No voucher groups available. Please contact administrator.</p>
              </div>

              <div class="form-group">
                <label class="form-label">Reseller ID</label>
                <input
                  v-model.number="resellerId"
                  type="number"
                  min="1"
                  class="form-input"
                  readonly
                  placeholder="Auto-filled with current user ID"
                />
                <p class="form-hint">Automatically assigned to the currently logged-in user</p>
              </div>
            </div>
          </div>

          <!-- Generating Step -->
          <div v-else-if="step === 'generating'" class="progress-container">
            <div class="progress-icon">
              <svg class="spinner" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="28" stroke="#E7E5E4" stroke-width="4"/>
                <path d="M32 4a28 28 0 0128 28" stroke="#14B8A6" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="progress-title">Generating Vouchers...</h3>
            <div class="progress-stats">
              <span>{{ totalGenerated }} / {{ quantity }} created</span>
              <span v-if="failedCount > 0" class="error-text">{{ failedCount }} failed</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
            <p class="progress-percentage">{{ progress }}%</p>
          </div>

          <!-- Complete Step -->
          <div v-else-if="step === 'complete'" class="complete-container">
            <div class="complete-icon" :class="failedCount > 0 ? 'warning' : 'success'">
              <svg v-if="failedCount === 0" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3"/>
                <path d="M20 32l8 8 16-16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3"/>
                <path d="M32 20v16M32 44h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>

            <h3 class="complete-title">
              {{ failedCount === 0 ? 'Generation Complete!' : 'Generation Completed with Errors' }}
            </h3>

            <div class="complete-stats">
              <div class="stat-item success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
                </svg>
                <span>{{ totalGenerated }} vouchers created</span>
              </div>

              <div v-if="failedCount > 0" class="stat-item error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9h2v4H9V9zm0-4h2v2H9V5z" fill="currentColor"/>
                </svg>
                <span>{{ failedCount }} vouchers failed</span>
              </div>
            </div>

            <div v-if="errorMessages.length > 0" class="error-list">
              <h4 class="error-list-title">Error Details:</h4>
              <div class="error-list-container">
                <p v-for="(error, index) in errorMessages.slice(0, 10)" :key="index" class="error-message">
                  {{ error }}
                </p>
                <p v-if="errorMessages.length > 10" class="error-more">
                  And {{ errorMessages.length - 10 }} more errors...
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            v-if="step === 'form'"
            @click="handleClose"
            class="btn btn-secondary"
          >
            Cancel
          </button>

          <button
            v-if="step === 'form'"
            @click="handleSubmit"
            class="btn btn-primary"
            :disabled="!isValid"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 5v10m-5-5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Generate {{ quantity }} Voucher{{ quantity > 1 ? 's' : '' }}
          </button>

          <button
            v-if="step === 'complete'"
            @click="handleClose"
            class="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

/* Modal Container */
.modal-container {
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 20px 48px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Modal Header */
.modal-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid #E7E5E4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.modal-title {
  font-family: 'Crimson Pro', serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.modal-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.01em;
}

.btn-close {
  width: 2.5rem;
  height: 2.5rem;
  background: transparent;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-close:hover:not(:disabled) {
  background: #FEF2F2;
  border-color: #FCA5A5;
  color: #DC2626;
}

.btn-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #F5F5F4;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #D6D3D1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #A8A29E;
}

/* Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.01em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #E7E5E4;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.01em;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #0F172A;
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #14B8A6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-input:read-only {
  background: #F5F5F4;
  color: #64748B;
  cursor: not-allowed;
}

.form-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.01em;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #FAFAF9;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.radio-label:hover {
  border-color: #14B8A6;
  background: rgba(20, 184, 166, 0.05);
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #14B8A6;
}

.radio-label span {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #0F172A;
  flex: 1;
}

/* Preview Box */
.preview-box {
  padding: 1rem;
  background: #FAFAF9;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
}

.preview-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64748B;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preview-item {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #14B8A6;
  background: rgba(20, 184, 166, 0.1);
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
}

/* Progress Container */
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 1rem;
  text-align: center;
}

.progress-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-title {
  font-family: 'Crimson Pro', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #64748B;
}

.error-text {
  color: #DC2626;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E7E5E4;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #14B8A6 0%, #0F9D8F 100%);
  border-radius: 4px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-percentage {
  font-family: 'Outfit', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #14B8A6;
  margin: 0;
}

/* Complete Container */
.complete-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 1rem;
  text-align: center;
}

.complete-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complete-icon.success {
  color: #22C55E;
}

.complete-icon.warning {
  color: #FB923C;
}

.complete-title {
  font-family: 'Crimson Pro', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.02em;
}

.complete-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
}

.stat-item.success {
  background: rgba(34, 197, 94, 0.1);
  color: #16A34A;
}

.stat-item.error {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

/* Error List */
.error-list {
  width: 100%;
  text-align: left;
}

.error-list-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 0.75rem 0;
}

.error-list-container {
  max-height: 200px;
  overflow-y: auto;
  padding: 1rem;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 10px;
}

.error-list-container::-webkit-scrollbar {
  width: 6px;
}

.error-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.error-list-container::-webkit-scrollbar-thumb {
  background: #FCA5A5;
  border-radius: 3px;
}

.error-message {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  color: #DC2626;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.error-message:last-child {
  margin-bottom: 0;
}

.error-more {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #DC2626;
  margin: 0.5rem 0 0 0;
  font-style: italic;
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #E7E5E4;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary {
  background: #14B8A6;
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: #0F9D8F;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #FFFFFF;
  color: #0F172A;
  border: 1px solid #E7E5E4;
}

.btn-secondary:hover {
  background: #F1F5F9;
  border-color: #D6D3D1;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1.25rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    padding: 1.25rem 1.5rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.btn:focus-visible,
.btn-close:focus-visible,
.form-input:focus-visible,
.form-select:focus-visible {
  outline: 2px solid #14B8A6;
  outline-offset: 2px;
}
</style>
