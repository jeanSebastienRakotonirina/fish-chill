<template>
  <!-- Pages publiques : landing, login, register (sans sidebar) -->
  <router-view v-if="isPublic" />

  <!-- App authentifiée avec sidebar -->
  <div v-else class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <h1>
          🐟 {{ t('app.name') }}
          <span>{{ t('app.tagline') }}</span>
        </h1>
      </div>
      <nav>
        <router-link to="/app" class="nav-link">
          <span>🗺️</span> <span>{{ t('nav.map') }}</span>
        </router-link>
        <router-link to="/captures" class="nav-link">
          <span>🎣</span> <span>{{ t('nav.catches') }}</span>
        </router-link>
        <router-link v-if="canWrite" to="/filets" class="nav-link">
          <span>🕸️</span> <span>{{ t('nav.nets') }}</span>
        </router-link>
        <router-link to="/stats" class="nav-link">
          <span>📊</span> <span>{{ t('nav.stats') }}</span>
        </router-link>
      </nav>

      <div class="user-info" v-if="user">
        <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
        <div class="user-role">{{ t('roles.' + user.role) }}</div>
        <button class="btn-logout" @click="doLogout">{{ t('auth.logout') }}</button>
      </div>

      <div class="lang-switcher">
        <button
          :class="['lang-btn', locale === 'fr' ? 'active' : '']"
          @click="switchLang('fr')"
        >{{ t('lang.fr') }}</button>
        <button
          :class="['lang-btn', locale === 'en' ? 'active' : '']"
          @click="switchLang('en')"
        >{{ t('lang.en') }}</button>
      </div>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
    <AiAssistant />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from './i18n'
import { getUser, logout, isAuthenticated } from './services/auth'
import AiAssistant from './components/AiAssistant.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const user = ref(getUser())

const isPublic = computed(() =>
  ['landing', 'login', 'register'].includes(route.name)
)

const canWrite = computed(() =>
  user.value && ['admin', 'terre', 'embarque'].includes(user.value.role)
)

function switchLang(lang) {
  setLocale(lang)
}

function doLogout() {
  logout()
  user.value = null
  router.push('/')
}

onMounted(() => {
  user.value = getUser()
})

watch(() => route.name, () => {
  user.value = getUser()
})
</script>

<style scoped>
.lang-switcher {
  display: flex;
  gap: 0.4rem;
  padding: 0.75rem 1.5rem 1rem;
}

.lang-btn {
  flex: 1;
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.15s;
  cursor: pointer;
}

.lang-btn:hover {
  border-color: var(--primary);
  color: var(--text);
}

.lang-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.user-info {
  margin-top: auto;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--primary);
  margin-top: 2px;
  margin-bottom: 0.6rem;
}

.btn-logout {
  width: 100%;
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-logout:hover {
  border-color: var(--danger);
  color: var(--danger);
}
</style>
