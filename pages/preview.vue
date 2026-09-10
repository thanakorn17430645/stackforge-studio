<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/create" class="text-xs text-slate-500 hover:text-teal-400">← Back to Builder Wizard</NuxtLink>
        </div>
        <div class="flex items-center gap-3 mt-1">
          <h1 class="text-2xl font-extrabold text-white">Live Code Preview</h1>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
            {{ store.config.projectName }}
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Review the generated project files below before downloading. Every file is structured for production standards.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Preview Mode Tabs -->
        <div class="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
          <button 
            @click="previewTab = 'web'"
            class="px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
            :class="previewTab === 'web' ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-400 hover:text-white'"
          >
            <span>🌐</span>
            <span>Interactive Web App</span>
          </button>
          <button 
            @click="previewTab = 'code'"
            class="px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
            :class="previewTab === 'code' ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-400 hover:text-white'"
          >
            <span>📁</span>
            <span>Source Code Explorer</span>
          </button>
        </div>

        <button 
          @click="regenerate" 
          :disabled="store.isGenerating"
          class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2"
        >
          <span>{{ store.isGenerating ? '⏳' : '↻' }}</span>
          <span>Regenerate</span>
        </button>
      </div>
    </div>

    <!-- 1. Interactive Live Web UI Preview -->
    <div v-show="previewTab === 'web'">
      <TemplateWebPreview :config="store.config" />
    </div>

    <!-- 2. Source Code Explorer Component -->
    <div v-show="previewTab === 'code'">
      <CodeViewer />
    </div>

    <!-- Docker Instructions Banner -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="font-bold text-sm text-white flex items-center gap-2">
          <span>🐳</span>
          <span>How to run this generated template</span>
        </h4>
        <p class="text-xs text-slate-400 mt-1">
          Download the ZIP, extract it to a folder, and run this single command in your terminal:
        </p>
      </div>
      <div class="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs text-teal-400 flex items-center gap-3">
        <span>docker compose up --build</span>
        <button @click="copyCommand" class="text-slate-400 hover:text-white text-xs">
          {{ copiedCmd ? '✓' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTemplateStore } from '~/stores/templateStore'

const store = useTemplateStore()
const copiedCmd = ref(false)
const previewTab = ref<'web' | 'code'>('web')

const regenerate = async () => {
  await store.fetchPreview()
}

const copyCommand = async () => {
  await navigator.clipboard.writeText('docker compose up --build')
  copiedCmd.value = true
  setTimeout(() => {
    copiedCmd.value = false
  }, 2000)
}

onMounted(() => {
  if (store.previewFiles.length === 0) {
    store.fetchPreview()
  }
})
</script>
