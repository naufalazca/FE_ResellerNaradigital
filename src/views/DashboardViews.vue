<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { voucherPaymentService } from '@/service/voucherpaymentsServices'
import type { VoucherPaymentStatsData } from '@/service/voucherpaymentsServices'

const stats = ref<VoucherPaymentStatsData>({
  total_payments: 0,
  unique_active_vouchers: 0,
  unique_archived_vouchers: 0,
  total_amount: 0,
  total_net_amount: 0,
  total_reseller_fee: 0,
})

const loading = ref(true)
const error = ref<string | null>(null)

const getCurrentMonth = () => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

const currentMonth = ref(getCurrentMonth())

const fetchPaymentStats = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch stats untuk bulan ini
    const response = await voucherPaymentService.getCurrentMonthStats()

    if (response.success) {
      stats.value = response.data
    } else {
      error.value = response.message || 'Gagal mengambil data statistik'
    }
  } catch (err) {
    console.error('Error fetching payment stats:', err)
    error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPaymentStats()
})
</script>

<template>
  <div class="home-container">
    <!-- Minimal Top Bar -->
    <div class="top-bar">
      <div class="top-bar-content">
        <h1 class="page-title">Dashboard Reseller</h1>
      </div>
    </div>

    <main class="main-content">
      <section class="welcome-section">
        <p class="page-subtitle">Statistik Pembayaran Voucher - {{ currentMonth }}</p>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Memuat data statistik...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchPaymentStats" class="retry-button">Coba Lagi</button>
      </div>

      <section v-else class="stats-section">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Total Voucher Terjual</p>
          </div>
          <h3 class="stat-value">{{ stats.total_payments }}</h3>
          <p class="stat-description">Transaksi bulan ini</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon revenue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Pendapatan</p>
          </div>
          <h3 class="stat-value">Rp {{ stats.total_amount.toLocaleString('id-ID') }}</h3>
          <p class="stat-description">Total pendapatan kotor</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Voucher Aktif</p>
          </div>
          <h3 class="stat-value">{{ stats.unique_active_vouchers }}</h3>
          <p class="stat-description">Voucher dengan pembayaran</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Fee Reseller</p>
          </div>
          <h3 class="stat-value">Rp {{ stats.total_reseller_fee.toLocaleString('id-ID') }}</h3>
          <p class="stat-description">Total fee bulan ini</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* Container */
.home-container {
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
}

.page-title {
  font-family: 'Crimson Pro', serif;
  font-size: 1.875rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

/* Main Content */
.main-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 2rem 3rem;
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 3rem;
}

.page-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 1.0625rem;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Loading & Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 16px;
}

.loading-state p,
.error-state p {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  color: #64748B;
  margin: 0 0 1rem 0;
}

.retry-button {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #FFFFFF;
  background: #14B8A6;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.retry-button:hover {
  background: #0D9488;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(20, 184, 166, 0.2);
}

.retry-button:active {
  transform: translateY(0);
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.stat-card {
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 16px;
  padding: 2rem;
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
  gap: 1rem;
  margin-bottom: 1.25rem;
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

.stat-icon.orders {
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
}

.stat-icon.revenue {
  background: rgba(251, 146, 60, 0.1);
  color: #FB923C;
}

.stat-icon.pending {
  background: rgba(168, 85, 247, 0.1);
  color: #A855F7;
}

.stat-icon.completed {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.stat-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-value {
  font-family: 'Crimson Pro', serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.stat-description {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8125rem;
  color: #94A3B8;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 1.5rem 2.5rem;
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .top-bar {
    padding: 1.25rem 1.5rem;
  }

  .top-bar-content {
    padding-left: 3.5rem;
  }

  .page-title {
    font-size: 1.625rem;
  }

  .main-content {
    padding: 2rem 1.5rem;
  }

  .welcome-section {
    margin-bottom: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    padding: 1.75rem;
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

  .main-content {
    padding: 1.75rem 1.25rem;
  }

  .page-subtitle {
    font-size: 0.9375rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-value {
    font-size: 2rem;
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
</style>
