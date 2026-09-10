<template>
  <div class="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl animate__animated animate__fadeIn border border-slate-700/80">
    <!-- Browser Mockup Header -->
    <div class="bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <!-- Window Controls & URL bar -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
          <span class="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
        </div>
        <div class="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          <span class="text-teal-400">🔒 https://</span>
          <span>localhost:3000{{ currentPath }}</span>
        </div>
      </div>

      <!-- Viewport & Device Toggles -->
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button 
            @click="viewportMode = 'desktop'"
            class="px-2.5 py-1 rounded-lg transition"
            :class="viewportMode === 'desktop' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-400 hover:text-white'"
            title="Desktop View"
          >
            🖥️ Desktop
          </button>
          <button 
            @click="viewportMode = 'tablet'"
            class="px-2.5 py-1 rounded-lg transition"
            :class="viewportMode === 'tablet' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-400 hover:text-white'"
            title="Tablet View"
          >
            📱 Tablet
          </button>
        </div>

        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[11px] font-mono">
          <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span>Interactive Live UI</span>
        </div>
      </div>
    </div>

    <!-- Web App Canvas Container -->
    <div class="bg-slate-950/60 p-2 sm:p-4 overflow-x-auto flex justify-center min-h-[640px]">
      <div 
        class="transition-all duration-300 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl"
        :class="viewportMode === 'desktop' ? 'w-full' : 'w-[768px] max-w-full'"
        style="min-height: 600px;"
      >
        <!-- App Shell / Layout -->
        <div class="flex-1 flex overflow-hidden min-h-[580px]">
          <!-- Template Sidebar -->
          <aside class="w-56 sm:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            <!-- App Brand -->
            <div class="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-teal-500/20">
                ⚡
              </div>
              <div class="min-w-0">
                <h2 class="font-bold text-sm text-white truncate">{{ config.projectName }}</h2>
                <span class="text-[10px] text-teal-400 font-mono tracking-wide uppercase">
                  {{ frontendLabel }}
                </span>
              </div>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
              <div class="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Overview
              </div>
              <button 
                @click="currentPath = '/'"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left"
                :class="currentPath === '/' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </button>

              <div class="pt-4 px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Entities Management
              </div>

              <button 
                v-for="entity in config.entities" 
                :key="entity.id"
                @click="currentPath = `/${entity.name.toLowerCase()}s`"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left"
                :class="currentPath === `/${entity.name.toLowerCase()}s` ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span>📦</span>
                  <span class="truncate">{{ entity.label || entity.name }}</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">CRUD</span>
              </button>
            </nav>

            <!-- User Info Footer -->
            <div class="p-3 border-t border-slate-800">
              <div class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/60">
                <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-teal-300">
                  AD
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-medium text-white truncate">Administrator</p>
                  <p class="text-[10px] text-slate-500 truncate">admin@system.local</p>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Viewport Content -->
          <div class="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
            <!-- Navbar Header in Mockup -->
            <header class="h-16 bg-slate-900/60 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2 text-xs font-mono">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-slate-300">Backend API:</span>
                <span class="text-teal-400 font-bold uppercase">{{ config.backend }} + {{ config.database }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  Swagger / OpenAPI
                </span>
              </div>
            </header>

            <!-- Page 1: Dashboard View -->
            <div v-if="currentPath === '/'" class="p-6 space-y-6 animate__animated animate__fadeIn">
              <!-- Welcome Hero -->
              <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 class="text-xl font-bold text-white tracking-tight">Overview Dashboard</h3>
                  <p class="text-xs text-slate-400 mt-1">
                    {{ config.description || 'Welcome to your custom enterprise full-stack web application.' }}
                  </p>
                </div>
                <div class="flex items-center gap-2 font-mono text-xs">
                  <span class="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    Live Reactive Demo
                  </span>
                </div>
              </div>

              <!-- Metric Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="(entity, idx) in config.entities" 
                  :key="entity.id"
                  @click="currentPath = `/${entity.name.toLowerCase()}s`"
                  class="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 p-5 rounded-2xl transition hover:bg-slate-800/60 shadow-sm"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ entity.label || entity.name }}</span>
                    <span class="text-xl">📦</span>
                  </div>
                  <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-white">{{ getEntityRecords(entity).length }}</span>
                    <span class="text-xs text-emerald-400 font-medium">+{{ idx + 3 }} recent</span>
                  </div>
                  <p class="mt-3 text-xs text-teal-400 flex items-center gap-1 font-medium">
                    <span>Manage records</span>
                    <span>→</span>
                  </p>
                </div>

                <!-- System Health Card -->
                <div class="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Health</span>
                    <span class="text-xl">💚</span>
                  </div>
                  <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-emerald-400">99.9%</span>
                  </div>
                  <p class="mt-3 text-xs text-slate-500">All services connected</p>
                </div>
              </div>

              <!-- Entity Directory Cards -->
              <div class="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <h4 class="font-bold text-sm text-white mb-4">Data Entities Directory</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="entity in config.entities" 
                    :key="entity.id"
                    @click="currentPath = `/${entity.name.toLowerCase()}s`"
                    class="cursor-pointer p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition group"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-sm text-slate-200 group-hover:text-teal-300 transition">{{ entity.label || entity.name }}</span>
                      <span class="text-[11px] text-slate-500 font-mono">{{ entity.fields.length }} fields</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-2">Interactive table with filters, search, modal create/edit, and mock data.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 2: Entity Data Table & CRUD View -->
            <div v-else-if="selectedEntity" class="p-6 space-y-6 animate__animated animate__fadeIn">
              <!-- Entity Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <button @click="currentPath = '/'" class="text-xs text-teal-400 hover:underline">← Dashboard</button>
                    <span class="text-slate-600">/</span>
                    <span class="text-xs text-slate-400">{{ selectedEntity.name }}</span>
                  </div>
                  <h3 class="text-xl font-bold text-white tracking-tight mt-1">{{ selectedEntity.label || selectedEntity.name }}</h3>
                  <p class="text-xs text-slate-400 mt-0.5">Live CRUD table with search and dynamic record editing.</p>
                </div>

                <button 
                  @click="openAddModal"
                  class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center gap-1.5 active:scale-95"
                >
                  <span>＋</span>
                  <span>Add New {{ selectedEntity.name }}</span>
                </button>
              </div>

              <!-- Search Bar & Filters -->
              <div class="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div class="relative flex-1 max-w-sm">
                  <input 
                    v-model="tableSearch"
                    type="text" 
                    :placeholder="`Search ${selectedEntity.name}...`" 
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div class="text-xs text-slate-400 font-mono">
                  Showing {{ filteredRecords.length }} records
                </div>
              </div>

              <!-- Interactive Data Table -->
              <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs text-slate-300">
                    <thead class="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px]">
                      <tr>
                        <th class="px-5 py-3">ID</th>
                        <th v-for="f in selectedEntity.fields" :key="f.id" class="px-5 py-3">
                          {{ f.label || f.name }}
                        </th>
                        <th class="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 font-normal">
                      <tr v-for="rec in filteredRecords" :key="rec.id" class="hover:bg-slate-800/30 transition">
                        <td class="px-5 py-3.5 font-mono text-slate-500">#{{ rec.id }}</td>
                        <td v-for="f in selectedEntity.fields" :key="f.id" class="px-5 py-3.5">
                          <span v-if="f.type === 'boolean'" :class="rec[f.name] ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'" class="px-2 py-0.5 rounded-full text-[10px] font-mono border">
                            {{ rec[f.name] ? 'Active' : 'Inactive' }}
                          </span>
                          <span v-else-if="f.type === 'decimal'" class="font-mono text-teal-300">
                            {{ formatCurrency(rec[f.name]) }}
                          </span>
                          <span v-else class="text-slate-200">
                            {{ rec[f.name] }}
                          </span>
                        </td>
                        <td class="px-5 py-3.5 text-right space-x-2">
                          <button 
                            @click="editRecord(rec)"
                            class="text-teal-400 hover:text-teal-300 font-semibold"
                          >
                            Edit
                          </button>
                          <button 
                            @click="deleteRecord(rec.id)"
                            class="text-rose-400 hover:text-rose-300 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div 
      v-if="modalOpen && selectedEntity" 
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate__animated animate__fadeIn animate__faster"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate__animated animate__zoomIn animate__faster">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 class="font-bold text-base text-white">
            {{ isEditing ? `Edit ${selectedEntity.name}` : `Create New ${selectedEntity.name}` }}
          </h4>
          <button @click="modalOpen = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="saveRecord" class="space-y-4">
          <div v-for="f in selectedEntity.fields" :key="f.id">
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              {{ f.label || f.name }} <span v-if="f.required" class="text-rose-400">*</span>
            </label>

            <!-- Boolean Switch -->
            <div v-if="f.type === 'boolean'" class="flex items-center gap-2">
              <input 
                v-model="formData[f.name]" 
                type="checkbox" 
                class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500"
              />
              <span class="text-xs text-slate-400">Yes / Enabled</span>
            </div>

            <!-- Number / Decimal Input -->
            <input 
              v-else-if="f.type === 'int' || f.type === 'decimal'"
              v-model="formData[f.name]"
              type="number"
              :step="f.type === 'decimal' ? '0.01' : '1'"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />

            <!-- Textarea -->
            <textarea 
              v-else-if="f.type === 'text'"
              v-model="formData[f.name]"
              rows="3"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            ></textarea>

            <!-- Regular Text -->
            <input 
              v-else
              v-model="formData[f.name]"
              type="text"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button 
              type="button" 
              @click="modalOpen = false" 
              class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20"
            >
              {{ isEditing ? 'Save Changes' : 'Create Record' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TemplateConfig, EntityModel } from '~/types/template'

const props = defineProps<{
  config: TemplateConfig
}>()

const viewportMode = ref<'desktop' | 'tablet'>('desktop')
const currentPath = ref('/')
const tableSearch = ref('')
const modalOpen = ref(false)
const isEditing = ref(false)
const formData = ref<Record<string, any>>({})
const mockStore = ref<Record<string, any[]>>({})

const frontendLabel = computed(() => {
  if (props.config.frontend === 'vue') return 'Vue 3 + Vite'
  if (props.config.frontend === 'angular') return 'Angular 18+'
  return 'React 18 + Vite'
})

// Initialize mock records
const initMockData = () => {
  const store: Record<string, any[]> = {}
  for (const entity of props.config.entities) {
    const list: any[] = []
    const count = props.config.mockDataCount || 5
    for (let i = 1; i <= Math.min(count, 8); i++) {
      const rec: Record<string, any> = { id: i }
      for (const field of entity.fields) {
        if (field.type === 'string') {
          if (field.name.toLowerCase().includes('name') || field.name.toLowerCase().includes('title')) {
            rec[field.name] = `${entity.name} #${i}`
          } else if (field.name.toLowerCase().includes('email')) {
            rec[field.name] = `customer${i}@company.com`
          } else if (field.name.toLowerCase().includes('sku')) {
            rec[field.name] = `SKU-00${i}`
          } else if (field.name.toLowerCase().includes('phone')) {
            rec[field.name] = `089-123-456${i}`
          } else {
            rec[field.name] = `Sample ${field.name} ${i}`
          }
        } else if (field.type === 'int') {
          rec[field.name] = i * 15
        } else if (field.type === 'decimal') {
          rec[field.name] = (i * 125.5).toFixed(2)
        } else if (field.type === 'boolean') {
          rec[field.name] = i % 2 !== 0
        } else if (field.type === 'text') {
          rec[field.name] = `Standard enterprise description notes for record ${i}.`
        } else {
          rec[field.name] = '2026-09-10'
        }
      }
      list.push(rec)
    }
    store[entity.name.toLowerCase()] = list
  }
  mockStore.value = store
}

initMockData()

watch(() => props.config, () => {
  initMockData()
}, { deep: true })

const selectedEntity = computed<EntityModel | null>(() => {
  if (currentPath.value === '/') return null
  const cleanPath = currentPath.value.replace('/', '').toLowerCase()
  return props.config.entities.find(e => `${e.name.toLowerCase()}s` === cleanPath || e.name.toLowerCase() === cleanPath) || null
})

const getEntityRecords = (entity: EntityModel) => {
  return mockStore.value[entity.name.toLowerCase()] || []
}

const filteredRecords = computed(() => {
  if (!selectedEntity.value) return []
  const list = getEntityRecords(selectedEntity.value)
  if (!tableSearch.value) return list
  const q = tableSearch.value.toLowerCase()
  return list.filter(item => {
    return Object.values(item).some(val => String(val).toLowerCase().includes(q))
  })
})

const formatCurrency = (val: any) => {
  const num = Number(val)
  if (isNaN(num)) return val
  return '฿' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const openAddModal = () => {
  if (!selectedEntity.value) return
  isEditing.value = false
  const blank: Record<string, any> = {}
  for (const f of selectedEntity.value.fields) {
    blank[f.name] = f.type === 'boolean' ? true : (f.defaultValue || '')
  }
  formData.value = blank
  modalOpen.value = true
}

const editRecord = (rec: any) => {
  isEditing.value = true
  formData.value = { ...rec }
  modalOpen.value = true
}

const deleteRecord = (id: number) => {
  if (!selectedEntity.value) return
  const key = selectedEntity.value.name.toLowerCase()
  mockStore.value[key] = mockStore.value[key].filter(r => r.id !== id)
}

const saveRecord = () => {
  if (!selectedEntity.value) return
  const key = selectedEntity.value.name.toLowerCase()
  if (isEditing.value) {
    const idx = mockStore.value[key].findIndex(r => r.id === formData.value.id)
    if (idx !== -1) {
      mockStore.value[key][idx] = { ...formData.value }
    }
  } else {
    const newId = (mockStore.value[key].length > 0 ? Math.max(...mockStore.value[key].map(r => r.id)) : 0) + 1
    mockStore.value[key].push({ id: newId, ...formData.value })
  }
  modalOpen.value = false
}
</script>
