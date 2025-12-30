<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { authService } from '@/service/authServices'
import NavigationSidebar from '@/components/nav/navigation-sidebar.vue'

const route = useRoute()
const router = useRouter()
const showSidebar = computed(() => route.name !== 'login')
const appName = import.meta.env.VITE_APP_NAME
const sidebarIsOpen = ref(false)

const handleLogout = () => {
  authService.logout()
  router.push('/')
}

const toggleSidebar = () => {
  sidebarIsOpen.value = !sidebarIsOpen.value
}
</script>

<template>
  <div class="app-container">
    <NavigationSidebar
      v-if="showSidebar"
      :app-name="appName"
      :is-open="sidebarIsOpen"
      @logout="handleLogout"
      @toggle="toggleSidebar"
    />

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}

main {
  min-height: 100vh;
  background-color: #f7fafc;
}
</style>
