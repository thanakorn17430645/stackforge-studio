import type { TemplateConfig, GeneratedFile, EntityModel, EntityField } from '~/types/template'

export function generateVueFrontend(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const projectName = config.projectName || 'FrontendApp'

  // 1. package.json
  files.push({
    path: 'frontend/package.json',
    content: JSON.stringify({
      name: `${projectName.toLowerCase()}-frontend`,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite --host',
        build: 'vue-tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        vue: '^3.5.13',
        'vue-router': '^4.5.0',
        pinia: '^2.3.1',
        axios: '^1.7.9',
        'animate.css': '^4.1.1',
        'lucide-vue-next': '^0.475.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.2.1',
        autoprefixer: '^10.4.20',
        postcss: '^8.5.2',
        tailwindcss: '^3.4.17',
        typescript: '^5.7.3',
        vite: '^6.1.0',
        'vue-tsc': '^2.2.0'
      }
    }, null, 2)
  })

  // 2. vite.config.ts
  files.push({
    path: 'frontend/vite.config.ts',
    content: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})`
  })

  // tsconfig.json & tsconfig.node.json
  files.push({
    path: 'frontend/tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'preserve',
        strict: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      references: [{ path: './tsconfig.node.json' }]
    }, null, 2)
  })

  files.push({
    path: 'frontend/tsconfig.node.json',
    content: JSON.stringify({
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true
      },
      include: ['vite.config.ts']
    }, null, 2)
  })

  files.push({
    path: 'frontend/src/vite-env.d.ts',
    content: `/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}`
  })

  // 3. tailwind.config.js & index.html
  files.push({
    path: 'frontend/tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e'
        }
      }
    }
  },
  plugins: []
}`
  })

  files.push({
    path: 'frontend/index.html',
    content: `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - Management Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`
  })

  // 4. src/assets/main.css
  files.push({
    path: 'frontend/src/assets/main.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
}`
  })

  // 5. src/main.ts
  files.push({
    path: 'frontend/src/main.ts',
    content: `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import 'animate.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')`
  })

  // 6. src/App.vue
  files.push({
    path: 'frontend/src/App.vue',
    content: `<template>
  <router-view />
</template>`
  })

  // 7. src/services/apiClient.ts
  files.push({
    path: 'frontend/src/services/apiClient.ts',
    content: `import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)`
  })

  // 8. Layout: src/layouts/AppLayout.vue
  files.push({
    path: 'frontend/src/layouts/AppLayout.vue',
    content: `<template>
  <div class="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
    <!-- Mobile Sidebar Backdrop Overlay -->
    <div 
      v-if="mobileSidebarOpen" 
      @click="mobileSidebarOpen = false"
      class="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate__animated animate__fadeIn animate__faster"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0"
      :class="mobileSidebarOpen ? 'translate-x-0 animate__animated animate__fadeInLeft animate__faster' : '-translate-x-full md:translate-x-0'"
    >
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-teal-500/20">
            ⚡
          </div>
          <div>
            <h1 class="font-bold text-sm leading-tight text-white">${projectName}</h1>
            <span class="text-[10px] text-teal-400 font-mono font-medium tracking-wider uppercase">Enterprise Studio</span>
          </div>
        </div>
        <button @click="mobileSidebarOpen = false" class="md:hidden text-slate-400 hover:text-white text-sm">✕</button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Overview
        </div>
        <router-link 
          to="/" 
          @click="mobileSidebarOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="$route.path === '/' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
        >
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>

        <div class="pt-4 px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Data Entities
        </div>
        ${config.entities.map(e => {
          const pName = e.name.toLowerCase() + 's'
          return `<router-link 
          to="/${pName}" 
          @click="mobileSidebarOpen = false"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="$route.path.startsWith('/${pName}') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
        >
          <div class="flex items-center gap-3">
            <span>📦</span>
            <span>${e.label || e.name}</span>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">CRUD</span>
        </router-link>`
        }).join('\n        ')}
      </nav>

      <!-- Footer User Profile -->
      <div class="p-3 border-t border-slate-800">
        <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-teal-300">
            AD
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-200 truncate">Administrator</p>
            <p class="text-[10px] text-slate-500 truncate">admin@system.local</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Navbar -->
      <header class="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div class="flex items-center gap-3">
          <!-- Mobile Sidebar Toggle -->
          <button 
            @click="mobileSidebarOpen = true"
            class="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs"
          >
            ☰
          </button>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
            ● Online
          </span>
          <span class="text-xs text-slate-400 font-mono hidden xs:inline">DB: ${config.database.toUpperCase()}</span>
        </div>

        <div class="flex items-center gap-3">
          <a href="http://localhost:8080/swagger" target="_blank" class="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition">
            <span>Swagger API</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      <!-- Page Content View -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-8 animate__animated animate__fadeIn animate__faster">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileSidebarOpen = ref(false)
</script>`
  })

  // 9. Dashboard View: src/views/DashboardView.vue
  files.push({
    path: 'frontend/src/views/DashboardView.vue',
    content: `<template>
  <div class="space-y-8 max-w-7xl mx-auto animate__animated animate__fadeIn">
    <!-- Header Hero -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 p-6 rounded-2xl border border-slate-800 animate__animated animate__fadeInDown">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h2>
        <p class="text-sm text-slate-400 mt-1">${config.description || 'Manage your enterprise data entities with automated real-time CRUD and metrics.'}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 text-xs font-mono border border-teal-500/20">
          Ready for Production
        </span>
      </div>
    </div>

    <!-- KPI Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(config.entities.length + 1, 4)} gap-5">
      ${config.entities.map((e, idx) => {
        const pName = e.name.toLowerCase() + 's'
        const count = 12 + idx * 8
        return `<div class="bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-xl p-5 hover:bg-slate-800/60 transition shadow-sm animate__animated animate__fadeInUp" style="animation-delay: ${idx * 0.1}s">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">${e.label || e.name}</span>
          <span class="text-lg">📦</span>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-white">${count}</span>
          <span class="text-xs text-emerald-400 font-medium">+${idx + 2} today</span>
        </div>
        <router-link to="/${pName}" class="mt-4 inline-flex items-center text-xs font-medium text-teal-400 hover:text-teal-300">
          Manage items →
        </router-link>
      </div>`
      }).join('\n      ')}
      
      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm animate__animated animate__fadeInUp" style="animation-delay: 0.3s">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Health Status</span>
          <span class="text-lg">💚</span>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-emerald-400">99.98%</span>
        </div>
        <p class="mt-4 text-xs text-slate-500">All services connected</p>
      </div>
    </div>

    <!-- Quick Action / Entity Directory -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 class="text-lg font-bold text-white mb-4">Data Entities Directory</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${config.entities.map(e => {
          const pName = e.name.toLowerCase() + 's'
          return `<router-link 
          to="/${pName}"
          class="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800/80 transition group flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-slate-200 group-hover:text-teal-300 transition">${e.label || e.name}</h4>
              <span class="text-xs text-slate-500 font-mono">${e.fields.length} fields</span>
            </div>
            <p class="text-xs text-slate-400 mt-2 line-clamp-2">Full CRUD management table, search, filters, validation modal, and API integration.</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-medium text-teal-400">
            Open Table →
          </div>
        </router-link>`
        }).join('\n        ')}
      </div>
    </div>
  </div>
</template>`
  })

  // 10. Router: src/router/index.ts
  files.push({
    path: 'frontend/src/router/index.ts',
    content: `import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView
      },
      ${config.entities.map(e => {
        const pName = e.name.toLowerCase() + 's'
        return `{
        path: '${pName}',
        name: '${pName}',
        component: () => import('../views/${e.name}/${e.name}ListView.vue')
      }`
      }).join(',\n      ')}
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router`
  })

  // 11. Entity Views & Services for each entity
  for (const entity of config.entities) {
    const entityName = entity.name
    const pName = entityName.toLowerCase() + 's'
    const pluralController = entityName.endsWith('y') ? entityName.slice(0, -1) + 'ies' : entityName + 's'

    // Service: src/services/<Entity>Service.ts
    files.push({
      path: `frontend/src/services/${entityName}Service.ts`,
      content: `import { apiClient } from './apiClient'

export interface ${entityName}Item {
  id?: number
  ${entity.fields.map(f => `${f.name}${f.required ? '' : '?'}: ${getTsType(f.type)}`).join('\n  ')}
  createdAt?: string
  updatedAt?: string
}

export const ${entityName}Service = {
  async getAll(search?: string, page = 1, pageSize = 20) {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    
    const res = await apiClient.get<${entityName}Item[]>('/${pluralController}', { params })
    return {
      data: res.data,
      total: Number(res.headers['x-total-count'] || res.data.length)
    }
  },

  async getById(id: number) {
    const res = await apiClient.get<${entityName}Item>(\`/${pluralController}/\${id}\`)
    return res.data
  },

  async create(data: any) {
    const res = await apiClient.post<${entityName}Item>('/${pluralController}', data)
    return res.data
  },

  async update(id: number, data: any) {
    const res = await apiClient.put(\`/${pluralController}/\${id}\`, data)
    return res.data
  },

  async delete(id: number) {
    const res = await apiClient.delete(\`/${pluralController}/\${id}\`)
    return res.data
  }
}`
    })

    // ListView: src/views/<Entity>/<Entity>ListView.vue
    files.push({
      path: `frontend/src/views/${entityName}/${entityName}ListView.vue`,
      content: `<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">${entity.label || entity.name}</h2>
        <p class="text-xs text-slate-400 mt-1">Manage ${entity.name} records, search, create, edit, and delete.</p>
      </div>

      <button 
        @click="openCreateModal"
        class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm rounded-xl flex items-center gap-2 transition shadow-lg shadow-teal-500/20"
      >
        <span>＋</span>
        <span>Add ${entity.name}</span>
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
      <div class="relative flex-1 max-w-md">
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Search ${entity.name}..." 
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
      </div>
      <button 
        @click="loadItems" 
        class="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
      >
        ↻ Refresh
      </button>
    </div>

    <!-- Data Table Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 text-center text-slate-400">
        <div class="inline-block animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mb-2"></div>
        <p class="text-sm">Loading records...</p>
      </div>

      <div v-else-if="items.length === 0" class="p-12 text-center">
        <span class="text-4xl">📂</span>
        <h4 class="mt-3 text-base font-semibold text-slate-300">No records found</h4>
        <p class="text-xs text-slate-500 mt-1">Get started by creating your first ${entity.name}.</p>
        <button 
          @click="openCreateModal"
          class="mt-4 px-3.5 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-medium rounded-lg transition"
        >
          Add New
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-800/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
            <tr>
              <th class="px-6 py-3.5">ID</th>
              ${entity.fields.map(f => `<th class="px-6 py-3.5">${f.label || f.name}</th>`).join('\n              ')}
              <th class="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-normal">
            <tr v-for="item in items" :key="item.id" class="hover:bg-slate-800/40 transition">
              <td class="px-6 py-4 font-mono text-xs text-slate-400">#{{ item.id }}</td>
              ${entity.fields.map(f => {
                if (f.type === 'boolean') {
                  return `<td class="px-6 py-4">
                <span :class="item.${f.name} ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'" class="px-2.5 py-0.5 rounded-full text-[11px] font-mono border">
                  {{ item.${f.name} ? 'Yes' : 'No' }}
                </span>
              </td>`
                }
                if (f.type === 'decimal' || f.type === 'int') {
                  return `<td class="px-6 py-4 font-mono font-medium text-slate-200">
                {{ item.${f.name} }}
              </td>`
                }
                return `<td class="px-6 py-4 text-slate-200">
                {{ item.${f.name} }}
              </td>`
              }).join('\n              ')}
              <td class="px-6 py-4 text-right space-x-2">
                <button 
                  @click="openEditModal(item)"
                  class="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Edit
                </button>
                <button 
                  @click="handleDelete(item.id!)"
                  class="px-2.5 py-1 text-xs font-medium rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate__animated animate__fadeIn animate__faster">
      <div class="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate__animated animate__zoomIn animate__faster">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-white">{{ isEditing ? 'Edit ${entity.name}' : 'Create ${entity.name}' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="p-6 space-y-4">
          ${entity.fields.map(f => {
            if (f.type === 'boolean') {
              return `<div class="flex items-center gap-3 pt-2">
            <input 
              v-model="formData.${f.name}"
              id="field-${f.name}" 
              type="checkbox" 
              class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500" 
            />
            <label for="field-${f.name}" class="text-sm font-medium text-slate-300 cursor-pointer">
              ${f.label || f.name}
            </label>
          </div>`
            }
            if (f.type === 'text') {
              return `<div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">${f.label || f.name} ${f.required ? '*' : ''}</label>
            <textarea 
              v-model="formData.${f.name}" 
              rows="3"
              ${f.required ? 'required' : ''}
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            ></textarea>
          </div>`
            }
            return `<div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">${f.label || f.name} ${f.required ? '*' : ''}</label>
            <input 
              v-model="formData.${f.name}" 
              type="${getInputType(f.type)}"
              ${f.required ? 'required' : ''}
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>`
          }).join('\n          ')}

          <div class="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="submitting"
              class="px-5 py-2 text-sm font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition"
            >
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ${entityName}Service, type ${entityName}Item } from '@/services/${entityName}Service'

const items = ref<${entityName}Item[]>([])
const loading = ref(true)
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)
const submitting = ref(false)

const getInitialForm = () => ({
  ${entity.fields.map(f => `${f.name}: ${getFormInitialValue(f)}`).join(',\n  ')}
})

const formData = ref<any>(getInitialForm())

const loadItems = async () => {
  loading.value = true
  try {
    const res = await ${entityName}Service.getAll(searchQuery.value)
    items.value = res.data
  } catch (err) {
    console.error('Failed to load items', err)
  } finally {
    loading.value = false
  }
}

let searchTimer: any = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadItems()
  }, 300)
}

const openCreateModal = () => {
  isEditing.value = false
  currentId.value = null
  formData.value = getInitialForm()
  showModal.value = true
}

const openEditModal = (item: ${entityName}Item) => {
  isEditing.value = true
  currentId.value = item.id!
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  submitting.value = true
  try {
    if (isEditing.value && currentId.value) {
      await ${entityName}Service.update(currentId.value, formData.value)
    } else {
      await ${entityName}Service.create(formData.value)
    }
    closeModal()
    await loadItems()
  } catch (err) {
    alert('Operation failed. Please check backend connection.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this record?')) return
  try {
    await ${entityName}Service.delete(id)
    await loadItems()
  } catch (err) {
    alert('Delete failed')
  }
}

onMounted(() => {
  loadItems()
})
</script>`
    })
  }

  // 12. Frontend Dockerfile & nginx.conf
  files.push({
    path: 'frontend/Dockerfile',
    content: `# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Runtime Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
  })

  files.push({
    path: 'frontend/nginx.conf',
    content: `server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`
  })

  return files
}

function getTsType(type: FieldType): string {
  switch (type) {
    case 'string':
    case 'text':
      return 'string'
    case 'int':
    case 'decimal':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'datetime':
      return 'string'
  }
}

function getInputType(type: FieldType): string {
  switch (type) {
    case 'int':
    case 'decimal':
      return 'number'
    case 'datetime':
      return 'datetime-local'
    default:
      return 'text'
  }
}

function getFormInitialValue(field: EntityField): string {
  if (field.defaultValue) {
    if (field.defaultValue.startsWith("'") && field.defaultValue.endsWith("'")) {
      return `"${field.defaultValue.slice(1, -1)}"`
    }
    return field.defaultValue
  }
  switch (field.type) {
    case 'string':
    case 'text':
      return "''"
    case 'int':
    case 'decimal':
      return '0'
    case 'boolean':
      return 'false'
    case 'datetime':
      return 'new Date().toISOString()'
  }
}
