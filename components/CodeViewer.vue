<template>
  <div class="h-[750px] glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl animate__animated animate__fadeIn">
    <!-- Top Bar -->
    <div class="h-14 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 gap-2">
      <div class="flex items-center gap-3 overflow-hidden">
        <!-- Mobile File Tree Toggle -->
        <button 
          @click="showMobileTree = !showMobileTree"
          class="sm:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 shrink-0"
        >
          <span>📁</span>
          <span>Files</span>
        </button>

        <div class="hidden xs:flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
        </div>

        <span class="text-xs font-mono text-teal-300/90 truncate max-w-[200px] sm:max-w-md">
          {{ selectedFile ? selectedFile.path : 'No file selected' }}
        </span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <button 
          v-if="selectedFile"
          @click="copyCode"
          class="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition border border-slate-700 flex items-center gap-1.5 active:scale-95"
          :class="{ 'animate__animated animate__pulse bg-teal-950 text-teal-300 border-teal-600': copied }"
        >
          <span>{{ copied ? '✓' : '📋' }}</span>
          <span class="hidden xs:inline">{{ copied ? 'Copied' : 'Copy File' }}</span>
        </button>

        <button 
          @click="downloadProjectZip"
          :disabled="downloading"
          class="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-bold transition shadow-md shadow-teal-500/20 flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
        >
          <span>{{ downloading ? '⏳' : '📦' }}</span>
          <span>{{ downloading ? 'Building...' : 'Download .ZIP' }}</span>
        </button>
      </div>
    </div>

    <!-- Body: Explorer & Viewer -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Left: File Tree Explorer (Responsive Sidebar) -->
      <div 
        class="bg-slate-950/90 sm:bg-slate-950/70 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 z-20"
        :class="showMobileTree ? 'absolute inset-y-0 left-0 w-72 sm:static shadow-2xl sm:shadow-none' : 'hidden sm:flex sm:w-64 md:w-72'"
      >
        <div class="p-3 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span class="flex items-center gap-1.5">
            <span>Files</span>
            <span class="px-1.5 py-0.2 rounded bg-slate-800 text-teal-400 font-mono">{{ store.previewFiles.length }}</span>
          </span>
          <button @click="showMobileTree = false" class="sm:hidden text-slate-400 hover:text-white text-xs">✕ Close</button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
          <div 
            v-for="(file, idx) in store.previewFiles" 
            :key="file.path"
            @click="selectFile(idx)"
            class="px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2.5 transition text-left truncate"
            :class="store.selectedFileIndex === idx ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'"
          >
            <span>{{ getFileIcon(file.path) }}</span>
            <span class="truncate">{{ file.path }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Code Content Display -->
      <div class="flex-1 bg-slate-950 flex flex-col overflow-hidden">
        <div v-if="selectedFile" class="flex-1 overflow-auto p-4 sm:p-6 font-mono text-xs leading-relaxed text-slate-300 select-text animate__animated animate__fadeIn animate__faster">
          <pre class="whitespace-pre"><code>{{ selectedFile.content }}</code></pre>
        </div>
        <div v-else class="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Select a file from the explorer to preview
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplateStore } from '~/stores/templateStore'

const store = useTemplateStore()
const copied = ref(false)
const downloading = ref(false)
const showMobileTree = ref(false)

const selectedFile = computed(() => store.selectedFile)

const selectFile = (idx: number) => {
  store.selectedFileIndex = idx
  showMobileTree.value = false
}

const getFileIcon = (path: string) => {
  if (path.endsWith('.cs')) return '🟣'
  if (path.endsWith('.vue')) return '🟢'
  if (path.endsWith('.tsx') || path.endsWith('.ts')) return '🔵'
  if (path.endsWith('.json')) return '🟡'
  if (path.endsWith('.yml') || path.endsWith('.yaml')) return '🐳'
  if (path.endsWith('Dockerfile')) return '🐳'
  if (path.endsWith('.md')) return '📝'
  return '📄'
}

const copyCode = async () => {
  if (!selectedFile.value) return
  await navigator.clipboard.writeText(selectedFile.value.content)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
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
    alert('Failed to download ZIP.')
    console.error(err)
  } finally {
    downloading.value = false
  }
}
</script>
