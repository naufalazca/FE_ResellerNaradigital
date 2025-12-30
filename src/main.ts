import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Set document title from environment variable
document.title = import.meta.env.VITE_APP_NAME

const app = createApp(App)

app.use(router)

app.mount('#app')
