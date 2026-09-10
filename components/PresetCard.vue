<template>
  <div class="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden">
    <!-- Ambient Card Highlight -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-300 pointer-events-none"></div>

    <div>
      <!-- Top Badges -->
      <div class="flex items-center justify-between gap-2 mb-4">
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm shadow-teal-500/10">
          {{ preset.badge }}
        </span>
        <span class="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
          {{ preset.config.entities.length }} Entities
        </span>
      </div>

      <!-- Title & Description -->
      <h3 class="text-lg font-bold text-white group-hover:text-teal-300 transition-colors flex items-center gap-2">
        <span>{{ preset.name }}</span>
      </h3>
      <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
        {{ preset.description }}
      </p>

      <!-- Tech Stack Badges -->
      <div class="mt-4 flex flex-wrap gap-1.5">
        <span class="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          {{ preset.config.backend === 'dotnet' ? '.NET 8 C#' : 'NestJS' }}
        </span>
        <span class="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60">
          {{ preset.config.frontend === 'vue' ? 'Vue 3' : 'React' }}
        </span>
        <span class="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60 uppercase">
          {{ preset.config.database }}
        </span>
        <span class="text-[11px] font-mono px-2 py-1 rounded-md bg-teal-950/80 text-teal-300 border border-teal-800/60">
          Docker
        </span>
      </div>

      <!-- Entities Included -->
      <div class="mt-4 pt-3 border-t border-slate-800/80">
        <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Entities Included:</span>
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="e in preset.config.entities" 
            :key="e.name"
            class="text-[11px] px-2 py-0.5 rounded bg-slate-800/50 text-slate-300 border border-slate-800 group-hover:border-slate-700 transition"
          >
            {{ e.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2">
      <button 
        @click="previewPreset"
        class="py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold transition border border-teal-500/30 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
        title="Live Interactive Web Preview"
      >
        <span>👁️</span>
        <span>Preview</span>
      </button>

      <button 
        @click="customizePreset"
        class="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700/60 flex items-center justify-center gap-1 hover:border-slate-500 active:scale-95"
        title="Customize in Visual Studio"
      >
        <span>⚙️</span>
        <span class="hidden xs:inline">Edit</span>
      </button>

      <button 
        @click="copyCliCommand"
        class="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-300 text-xs font-semibold transition border border-slate-700/60 flex items-center justify-center gap-1 active:scale-95"
        :class="{ 'animate__animated animate__rubberBand bg-teal-950 border-teal-500': copiedCli }"
        title="Copy Terminal / PowerShell Command"
      >
        <span>{{ copiedCli ? '✓' : '💻' }}</span>
        <span>{{ copiedCli ? 'Copied' : 'CLI' }}</span>
      </button>

      <button 
        @click="downloadZip"
        :disabled="downloading"
        class="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-bold transition shadow-md shadow-teal-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
      >
        <span>{{ downloading ? '⏳' : '📥' }}</span>
        <span>{{ downloading ? 'Building...' : 'ZIP' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PresetTemplate } from '~/types/presets'
import { useTemplateStore } from '~/stores/templateStore'

const props = defineProps<{
  preset: PresetTemplate
}>()

const router = useRouter()
const store = useTemplateStore()
const downloading = ref(false)
const copiedCli = ref(false)

const copyCliCommand = async () => {
  const cmd = `stackforge create ${props.preset.config.projectName} --preset ${props.preset.id}`
  await navigator.clipboard.writeText(cmd)
  copiedCli.value = true
  setTimeout(() => {
    copiedCli.value = false
  }, 2500)
}

const previewPreset = () => {
  store.loadPreset(props.preset.id)
  router.push('/preview')
}

const customizePreset = () => {
  store.loadPreset(props.preset.id)
  router.push('/create')
}

const downloadZip = async () => {
  downloading.value = true
  try {
    const response = await fetch('/api/generate/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(props.preset.config)
    })

    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.preset.config.projectName.toLowerCase()}-template.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('Failed to download template. Please try again.')
    console.error(err)
  } finally {
    downloading.value = false
  }
}
</script>
