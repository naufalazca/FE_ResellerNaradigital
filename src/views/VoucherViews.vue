<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VoucherList from '@/components/voucher/VoucherList.vue'
import VoucherGenerateModal from '@/components/voucher/VoucherGenerateModal.vue'
import { voucherService } from '@/service/voucherServices'

const voucherListRef = ref<InstanceType<typeof VoucherList> | null>(null)
const isGenerateModalOpen = ref(false)

// Statistics state
const statistics = ref({
  total_generated: 0,
  total_active: 0,
  total_available: 0,
  total_sold: 0,
  total_expired: 0
})

const isLoadingStats = ref(false)

const fetchStatistics = async () => {
  try {
    isLoadingStats.value = true
    const response = await voucherService.getVoucherStatistics()

    if (response.success) {
      statistics.value = {
        total_generated: response.data.total_generated,
        total_active: response.data.total_active,
        total_available: response.data.total_available,
        total_sold: response.data.total_sold,
        total_expired: response.data.total_expired
      }
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  } finally {
    isLoadingStats.value = false
  }
}

const handleRefresh = () => {
  voucherListRef.value?.refresh()
  fetchStatistics()
}

const openGenerateModal = () => {
  isGenerateModalOpen.value = true
}

const closeGenerateModal = () => {
  isGenerateModalOpen.value = false
}

const handleGenerateSuccess = (count: number) => {
  // Refresh list after successful generation
  voucherListRef.value?.refresh()
  fetchStatistics()
  closeGenerateModal()

  // Show success notification (you can implement a toast/notification system)
  alert(`Successfully generated ${count} voucher(s)!`)
}

onMounted(() => {
  fetchStatistics()
})
</script>

<template>
  <div class="voucher-container">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="top-bar-content">
        <div class="top-bar-left">
          <h1 class="page-title">Voucher Data</h1>
          <p class="page-subtitle">Manage your voucher inventory</p>
        </div>
        <div class="top-bar-actions">
          <button @click="handleRefresh" class="btn-action btn-secondary">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Refresh
          </button>
          <button @click="openGenerateModal" class="btn-action btn-primary">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 5v10m-5-5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Create Voucher
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Stats Cards -->
      <section class="stats-section">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon vouchers">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Total Vouchers</p>
          </div>
          <h3 class="stat-value">{{ isLoadingStats ? '-' : statistics.total_generated }}</h3>
          <p class="stat-description">All vouchers in system</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon active">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Active</p>
          </div>
          <h3 class="stat-value">{{ isLoadingStats ? '-' : statistics.total_active }}</h3>
          <p class="stat-description">Ready to use</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon sold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Sold</p>
          </div>
          <h3 class="stat-value">{{ isLoadingStats ? '-' : statistics.total_sold }}</h3>
          <p class="stat-description">Already purchased</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon available">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Available</p>
          </div>
          <h3 class="stat-value">{{ isLoadingStats ? '-' : statistics.total_available }}</h3>
          <p class="stat-description">Ready for sale</p>
        </div>
      </section>

      <!-- Voucher List -->
      <section class="voucher-section">
        <VoucherList ref="voucherListRef" />
      </section>
    </main>

    <!-- Generate Modal -->
    <VoucherGenerateModal
      :is-open="isGenerateModalOpen"
      @close="closeGenerateModal"
      @success="handleGenerateSuccess"
    />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* Container */
.voucher-container {
  min-height: 100vh;
  background: #FAFAF9;
}

/* Top Bar */
.top-bar {
  background: #FFFFFF;
  border-bottom: 1px solid #E7E5E4;
  padding: 1.5rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.top-bar-left {
  flex: 1;
}

.page-title {
  font-family: 'Crimson Pro', serif;
  font-size: 1.875rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.page-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.01em;
}

.top-bar-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
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

.btn-primary:hover {
  background: #0F9D8F;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
}

.btn-secondary {
  background: #FFFFFF;
  color: #0F172A;
  border: 1px solid #E7E5E4;
}

.btn-secondary:hover {
  border-color: #14B8A6;
  color: #14B8A6;
}

/* Main Content */
.main-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 2rem 3rem;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #E7E5E4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  border-color: #D6D3D1;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 10px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.stat-card:hover::before {
  background: #14B8A6;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
}

.stat-icon.vouchers {
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
}

.stat-icon.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.stat-icon.sold {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.stat-icon.available {
  background: rgba(168, 85, 247, 0.1);
  color: #A855F7;
}

.stat-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748B;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-value {
  font-family: 'Crimson Pro', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.stat-description {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Voucher Section */
.voucher-section {
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 1.5rem 2.5rem;
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .top-bar {
    padding: 1.25rem 1.5rem;
  }

  .top-bar-content {
    padding-left: 3.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }

  .top-bar-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .btn-action {
    flex: 1;
    justify-content: center;
  }

  .page-title {
    font-size: 1.625rem;
  }

  .main-content {
    padding: 2rem 1.5rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

@media (max-width: 480px) {
  .top-bar {
    padding: 1rem 1.25rem;
  }

  .top-bar-content {
    padding-left: 3rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .main-content {
    padding: 1.75rem 1.25rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .btn-action {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
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

/* Focus styles */
.btn-action:focus-visible {
  outline: 2px solid #14B8A6;
  outline-offset: 2px;
}
</style>
