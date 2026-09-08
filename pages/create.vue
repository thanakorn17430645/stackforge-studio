<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/" class="text-xs text-slate-500 hover:text-teal-400">Templates</NuxtLink>
          <span class="text-slate-600">/</span>
          <span class="text-xs text-teal-400 font-medium">Custom Template Builder</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">Template Architecture Studio</h1>
        <p class="text-xs text-slate-400 mt-1">Configure your full-stack layers, design data entities, or ask AI to design them for you.</p>
      </div>

      <!-- Quick Preset Loaders -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500 font-medium">Load Preset:</span>
        <button 
          @click="store.loadPreset('ecommerce-pro')" 
          class="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
        >
          E-Commerce
        </button>
        <button 
          @click="store.loadPreset('saas-crm-suite')" 
          class="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
        >
          CRM SaaS
        </button>
        <button 
          @click="store.loadPreset('clinic-care')" 
          class="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
        >
          Clinic
        </button>
      </div>
    </div>

    <!-- Step Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
      <button 
        @click="activeTab = 'stack'"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2"
        :class="activeTab === 'stack' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'"
      >
        <span>1. Tech Stack & DevOps</span>
      </button>

      <button 
        @click="activeTab = 'entities'"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2"
        :class="activeTab === 'entities' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'"
      >
        <span>2. Database Entities & CRUD ({{ store.config.entities.length }})</span>
      </button>
    </div>

    <!-- Tab 1: Stack Selector -->
    <div v-show="activeTab === 'stack'">
      <StackSelector />
    </div>

    <!-- Tab 2: Entity & Field Designer -->
    <div v-show="activeTab === 'entities'">
      <EntityDesigner />
    </div>

    <!-- CLI Command Box -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-sm">💻</span>
          <span class="text-xs font-bold text-white uppercase tracking-wider">Or create via Terminal / PowerShell:</span>
        </div>
        <div class="font-mono text-xs text-teal-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 overflow-x-auto">
          stackforge create {{ store.config.projectName }} --backend {{ store.config.backend }} --frontend {{ store.config.frontend }} --database {{ store.config.database }}
        </div>
      </div>
      <button 
        @click="copyCliCommand"
        class="self-start sm:self-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5 shrink-0"
      >
        <span>{{ copiedCli ? '✓' : '📋' }}</span>
        <span>{{ copiedCli ? 'Copied Command!' : 'Copy CLI Command' }}</span>
      </button>
    </div>

    <!-- Bottom Sticky Floating Bar -->
    <div class="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-3 sm:px-4 z-40 animate__animated animate__fadeInUp animate__faster">
      <div class="glass-panel rounded-2xl p-3.5 sm:p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 border border-slate-700/80">
        <!-- Specs Summary -->
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs font-mono">
          <span class="px-2 py-0.5 sm:py-1 rounded bg-slate-800/90 text-teal-300 border border-slate-700">
            {{ store.config.backend === 'dotnet' ? '.NET 8 C#' : 'NestJS' }}
          </span>
          <span class="text-slate-600 hidden xs:inline">+</span>
          <span class="px-2 py-0.5 sm:py-1 rounded bg-slate-800/90 text-teal-300 border border-slate-700">
            {{ store.config.frontend === 'vue' ? 'Vue 3' : 'React' }}
          </span>
          <span class="text-slate-600 hidden xs:inline">+</span>
          <span class="px-2 py-0.5 sm:py-1 rounded bg-slate-800/90 text-teal-300 border border-slate-700 uppercase">
            {{ store.config.database }}
          </span>
          <span class="text-slate-600 hidden xs:inline">+</span>
          <span class="px-2 py-0.5 sm:py-1 rounded bg-teal-950/80 text-teal-400 border border-teal-800">
            {{ store.config.entities.length }} Entities
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <button 
            @click="previewCode"
            :disabled="store.isGenerating"
            class="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{{ store.isGenerating ? '⏳' : '👁️' }}</span>
            <span>{{ store.isGenerating ? 'Generating...' : 'Live Preview Code' }}</span>
          </button>

          <button 
            @click="downloadProjectZip"
            :disabled="downloading"
            class="flex-1 md:flex-none px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-bold transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <span>{{ downloading ? '⏳' : '📦' }}</span>
            <span>{{ downloading ? 'Building ZIP...' : 'Download .ZIP' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplateStore } from '~/stores/templateStore'

const store = useTemplateStore()
const router = useRouter()
const activeTab = ref<'stack' | 'entities'>('stack')
const downloading = ref(false)
const copiedCli = ref(false)

const copyCliCommand = async () => {
  const cmd = `stackforge create ${store.config.projectName} --backend ${store.config.backend} --frontend ${store.config.frontend} --database ${store.config.database}`
  await navigator.clipboard.writeText(cmd)
  copiedCli.value = true
  setTimeout(() => {
    copiedCli.value = false
  }, 2500)
}

const previewCode = async () => {
  await store.fetchPreview()
  router.push('/preview')
}

const downloadProjectZip = async () => {
  downloading.value = true
  try {
    const response = await fetch('/api/generate/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store.config)
    })

    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${store.config.projectName.toLowerCase()}-template.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('Failed to generate and download ZIP. Please check your configuration.')
    console.error(err)
  } finally {
    downloading.value = false
  }
}
</script>
