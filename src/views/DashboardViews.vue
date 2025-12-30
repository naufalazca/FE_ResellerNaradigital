<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = ref({
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  completedOrders: 0,
})

onMounted(() => {
  // TODO: Fetch real stats from API
  // For now using dummy data
  stats.value = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  }
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
        <p class="page-subtitle">Kelola bisnis reseller Anda dengan mudah</p>
      </section>

      <section class="stats-section">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Total Pesanan</p>
          </div>
          <h3 class="stat-value">{{ stats.totalOrders }}</h3>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon revenue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Total Pendapatan</p>
          </div>
          <h3 class="stat-value">Rp {{ stats.totalRevenue.toLocaleString('id-ID') }}</h3>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Pesanan Pending</p>
          </div>
          <h3 class="stat-value">{{ stats.pendingOrders }}</h3>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="stat-label">Pesanan Selesai</p>
          </div>
          <h3 class="stat-value">{{ stats.completedOrders }}</h3>
        </div>
      </section>

      <section class="quick-actions">
        <h3 class="section-title">Menu Utama</h3>
        <div class="actions-grid">
          <button class="action-card">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>Pesanan Baru</h4>
            <p>Buat pesanan baru</p>
          </button>

          <button class="action-card">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>Daftar Pesanan</h4>
            <p>Lihat semua pesanan</p>
          </button>

          <button class="action-card">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>Produk</h4>
            <p>Kelola produk</p>
          </button>

          <button class="action-card">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>Laporan</h4>
            <p>Lihat laporan penjualan</p>
          </button>
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
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

/* Quick Actions */
.quick-actions {
  margin-top: 4rem;
}

.section-title {
  font-family: 'Crimson Pro', serif;
  font-size: 1.875rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 2rem 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.05) 0%, transparent 100%);
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover::before {
  height: 100%;
}

.action-card:hover {
  border-color: #14B8A6;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 10px 20px rgba(20, 184, 166, 0.1);
  transform: translateY(-4px);
}

.action-icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.action-card:hover .action-icon {
  background: #14B8A6;
  color: #FFFFFF;
  transform: scale(1.05);
}

.action-card h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
}

.action-card p {
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem 1.5rem 2.5rem;
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

  .quick-actions {
    margin-top: 3rem;
  }

  .section-title {
    font-size: 1.625rem;
    margin-bottom: 1.5rem;
  }

  .actions-grid {
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

  .section-title {
    font-size: 1.5rem;
  }

  .action-card {
    padding: 1.75rem 1.25rem;
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

/* Focus styles for accessibility */
.action-card:focus-visible {
  outline: 2px solid #14B8A6;
  outline-offset: 2px;
}
</style>
