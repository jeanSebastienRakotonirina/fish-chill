<template>
  <div>
    <AiInsightsBanner />

    <div class="page-header">
      <h2>{{ t('map.title') }}</h2>
      <button class="btn btn-primary" @click="load" :disabled="loading">
        {{ loading ? t('common.loading') : t('common.refresh') }}
      </button>
    </div>

    <div v-if="error" class="card" style="border-color: var(--danger); margin-bottom: 1rem;">
      {{ error }}
    </div>

    <div class="grid-4" v-if="vessels.length">
      <div class="card">
        <div class="card-title">{{ t('map.vessels') }}</div>
        <div class="card-value">{{ vessels.length }}</div>
      </div>
      <div class="card">
        <div class="card-title">{{ t('map.atSea') }}</div>
        <div class="card-value" style="color: var(--primary)">
          {{ vessels.filter(v => v.status === 'en_mer').length }}
        </div>
      </div>
      <div class="card">
        <div class="card-title">{{ t('map.online') }}</div>
        <div class="card-value" style="color: var(--success)">
          {{ vessels.filter(v => v.isOnline).length }}
        </div>
      </div>
      <div class="card">
        <div class="card-title">{{ t('map.inPort') }}</div>
        <div class="card-value">
          {{ vessels.filter(v => v.status === 'au_port').length }}
        </div>
      </div>
    </div>

    <div class="card" style="padding: 0; margin-bottom: 1.5rem;">
      <VesselMap ref="mapRef" :vessels="vessels" :selected-id="selectedId" height="480px" @select="selectedId = $event" />
    </div>

    <div class="card">
      <h3 style="margin-bottom: 1rem;">{{ t('map.listTitle') }}</h3>
      <table v-if="vessels.length">
        <thead>
          <tr>
            <th>{{ t('map.name') }}</th>
            <th>{{ t('map.status') }}</th>
            <th>{{ t('map.position') }}</th>
            <th>{{ t('map.speed') }}</th>
            <th>{{ t('map.fuel') }}</th>
            <th>{{ t('map.lastSync') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vessels" :key="v._id">
            <td>
              <span :class="['status-dot', v.isOnline ? 'status-online' : 'status-offline']"></span>
              <strong>{{ v.name }}</strong>
            </td>
            <td>
              <span :class="['badge', statusBadge(v.status)]">{{ t('status.' + (v.status || 'au_port')) }}</span>
            </td>
            <td>
              <span v-if="hasPos(v)">
                {{ Number(v.position.lat).toFixed(3) }}, {{ Number(v.position.lng).toFixed(3) }}
              </span>
              <span v-else style="color: var(--warning);">{{ t('map.noPosition') }}</span>
            </td>
            <td>{{ v.position?.speed != null ? v.position.speed + ' ' + t('common.knots') : t('common.none') }}</td>
            <td>
              {{ v.currentFuel != null ? Number(v.currentFuel).toLocaleString() : t('common.none') }} {{ t('common.liters') }}
              <span v-if="v.capacity?.fuel" style="color: var(--text-muted); font-size: 0.8rem;">
                / {{ Math.round((v.currentFuel || 0) / v.capacity.fuel * 100) }}%
              </span>
            </td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">
              {{ formatDate(v.lastSyncAt) }}
            </td>
            <td style="white-space: nowrap;">
              <button
                v-if="hasPos(v)"
                class="btn btn-sm"
                style="margin-right: 0.35rem; border: 1px solid var(--border); background: transparent; color: var(--text);"
                @click="locate(v)"
              >📍 {{ t('map.locate') }}</button>
              <router-link :to="`/navire/${v._id}`" class="btn btn-sm btn-primary">{{ t('common.detail') }}</router-link>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else-if="!loading" class="empty-state">{{ t('common.noVessels') }}</div>
      <div v-else class="loading">{{ t('common.loading') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getVessels } from '../services/api'
import VesselMap from '../components/VesselMap.vue'
import AiInsightsBanner from '../components/AiInsightsBanner.vue'

const { t, locale } = useI18n()
const vessels = ref([])
const loading = ref(false)
const error = ref(null)
const selectedId = ref(null)
const mapRef = ref(null)

const hasPos = (v) => Number.isFinite(Number(v?.position?.lat)) && Number.isFinite(Number(v?.position?.lng))
  && v.position.lat !== null && v.position.lng !== null

function locate(v) {
  selectedId.value = null
  // nextTick-like : relancer la sélection pour re-déclencher le watch même sur le même navire
  setTimeout(() => { selectedId.value = String(v._id); window.scrollTo({ top: 0, behavior: 'smooth' }) }, 0)
}

const statusBadge = (s) => ({
  en_mer: 'badge-info', au_port: 'badge-success', maintenance: 'badge-warning', hors_service: 'badge-danger'
}[s] || 'badge-info')

const formatDate = (d) => d ? new Date(d).toLocaleString(locale.value === 'en' ? 'en-GB' : 'fr-FR', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
}) : t('common.none')

async function load() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getVessels()
    vessels.value = data
  } catch (e) {
    error.value = e?.response?.status === 401 ? t('common.errorGeneric') : t('common.errorBackend')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
