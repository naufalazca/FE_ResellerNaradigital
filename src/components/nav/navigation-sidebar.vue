<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  appName: string
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  logout: []
  toggle: []
}>()

const handleLogout = () => {
  emit('logout')
}

const toggleSidebar = () => {
  emit('toggle')
}
</script>

<template>
  <div>
    <!-- Floating Toggle Button (visible when closed) -->
    <button v-if="!isOpen" @click="toggleSidebar" class="floating-toggle" aria-label="Open menu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Overlay -->
    <div v-if="isOpen" @click="toggleSidebar" class="overlay"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'open': isOpen }">
      <div class="sidebar-header">
        <h2 class="app-name">{{ appName }}</h2>
        <button @click="toggleSidebar" class="close-btn" aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/home" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10l7-7 7 7M5 8v9a1 1 0 001 1h3v-4a1 1 0 011-1h2a1 1 0 011 1v4h3a1 1 0 001-1V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Home</span>
        </RouterLink>

        <RouterLink to="/vouchers" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h0a2 2 0 002-2M9 5a2 2 0 012-2h0a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Voucher</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="btn-logout">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 3h3a1 1 0 011 1v12a1 1 0 01-1 1h-3M8 16l-5-5m0 0l5-5m-5 5h13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=Outfit:wght@300;400;500;600&display=swap');

/* Floating Toggle Button */
.floating-toggle {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  width: 3rem;
  height: 3rem;
  background: #FAFAF9;
  border: 1px solid #E7E5E4;
  border-radius: 12px;
  cursor: pointer;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-toggle:hover {
  background: #FFFFFF;
  border-color: #14B8A6;
  color: #14B8A6;
  transform: translateY(-1px);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.06),
    0 8px 20px rgba(20, 184, 166, 0.12);
}

.floating-toggle:active {
  transform: translateY(0);
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 999;
  animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: -280px;
  top: 0;
  height: 100vh;
  width: 280px;
  background: #FAFAF9;
  box-shadow:
    4px 0 12px rgba(0, 0, 0, 0.04),
    8px 0 24px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.open {
  left: 0;
}

/* Header */
.sidebar-header {
  padding: 2rem 1.75rem 1.5rem;
  border-bottom: 1px solid #E7E5E4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.app-name {
  margin: 0;
  font-family: 'Crimson Pro', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0F172A;
  letter-spacing: -0.02em;
  flex: 1;
  line-height: 1.2;
}

/* Close Button */
.close-btn {
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.close-btn:hover {
  background: #F1F5F9;
  border-color: #E2E8F0;
  color: #0F172A;
}

.close-btn:active {
  transform: scale(0.95);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 2rem 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #D6D3D1;
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #A8A29E;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.75rem;
  margin: 0.25rem 1rem;
  text-decoration: none;
  color: #64748B;
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 0.9375rem;
  letter-spacing: -0.01em;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-icon {
  flex-shrink: 0;
  opacity: 0.7;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  color: #14B8A6;
  background: rgba(20, 184, 166, 0.06);
  transform: translateX(2px);
}

.nav-item:hover .nav-icon {
  opacity: 1;
  transform: scale(1.05);
}

.nav-item.router-link-exact-active {
  color: #14B8A6;
  background: rgba(20, 184, 166, 0.1);
  font-weight: 500;
}

.nav-item.router-link-exact-active .nav-icon {
  opacity: 1;
}

.nav-item.router-link-exact-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: #14B8A6;
  border-radius: 0 2px 2px 0;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: 60%;
    opacity: 1;
  }
}

/* Footer */
.sidebar-footer {
  padding: 1.5rem 1.75rem 2rem;
  border-top: 1px solid #E7E5E4;
}

.btn-logout {
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  color: #64748B;
  border: 1px solid #E7E5E4;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  font-size: 0.9375rem;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}

.btn-logout svg {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-logout:hover {
  background: #FEF2F2;
  border-color: #FCA5A5;
  color: #DC2626;
}

.btn-logout:hover svg {
  transform: translateX(-2px);
}

.btn-logout:active {
  transform: scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .floating-toggle {
    top: 1.25rem;
    left: 1.25rem;
    width: 2.75rem;
    height: 2.75rem;
  }

  .sidebar {
    width: 300px;
    left: -300px;
  }

  .sidebar.open {
    left: 0;
  }
}

@media (max-width: 480px) {
  .floating-toggle {
    top: 1rem;
    left: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }

  .sidebar {
    width: 85%;
    max-width: 320px;
    left: -100%;
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-header {
    padding: 1.75rem 1.5rem 1.25rem;
  }

  .app-name {
    font-size: 1.375rem;
  }

  .sidebar-nav {
    padding: 1.5rem 0;
  }

  .nav-item {
    margin: 0.25rem 0.75rem;
    padding: 0.875rem 1.5rem;
  }

  .sidebar-footer {
    padding: 1.25rem 1.5rem 1.75rem;
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
.floating-toggle:focus-visible,
.close-btn:focus-visible,
.nav-item:focus-visible,
.btn-logout:focus-visible {
  outline: 2px solid #14B8A6;
  outline-offset: 2px;
}
</style>
