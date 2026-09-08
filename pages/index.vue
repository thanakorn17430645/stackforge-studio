<template>
  <div class="space-y-16 pb-24 overflow-hidden">
    <!-- Hero Section -->
    <section class="relative overflow-hidden pt-12 sm:pt-20">
      <!-- Ambient Glow Orbs -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/15 via-emerald-500/10 to-transparent blur-3xl rounded-full pointer-events-none -z-10 animate-float"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <!-- Top Announcement Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-6 animate__animated animate__fadeInDown animate__faster shadow-lg shadow-teal-500/5">
          <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span>Next-Gen Full-Stack Scaffold Studio with AI Copilot & CLI</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none animate__animated animate__fadeInUp animate__faster">
          Create & Download Complete
          <span class="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent block sm:inline mt-2 sm:mt-0">
            Web Templates
          </span>
          in Seconds
        </h1>

        <p class="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
          Select your tech stack (.NET 8 / NestJS + Vue 3 / React + PostgreSQL), design your database entities, let AI draft realistic schemas, and generate fully functional CRUD apps ready to boot with <code class="text-teal-400 font-mono text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">docker compose up</code> or <code class="text-teal-400 font-mono text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">stackforge create</code>.
        </p>

        <!-- CTA Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate__animated animate__fadeInUp animate__delay-1s">
          <NuxtLink
            to="/create"
            class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-teal-500/25 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>⚡ Start Building Custom Template</span>
          </NuxtLink>

          <a 
            href="#presets" 
            class="w-full sm:w-auto px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm rounded-xl border border-slate-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Browse Ready-to-Use Presets</span>
            <span>↓</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Key Feature Highlights -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-panel-interactive rounded-2xl p-6 animate__animated animate__fadeInUp">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl mb-4">
            ⚡
          </div>
          <h4 class="text-base font-bold text-white">End-to-End CRUD</h4>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Generates backend controllers, DTOs, EF Core/Prisma schemas, and frontend Data Tables with modal forms.
          </p>
        </div>

        <div class="glass-panel-interactive rounded-2xl p-6 animate__animated animate__fadeInUp animate__delay-1s">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl mb-4">
            🎨
          </div>
          <h4 class="text-base font-bold text-white">Modern Dashboard UI</h4>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Equipped with KPI metric cards, interactive charts, dark mode, responsive sidebar, and clean typography.
          </p>
        </div>

        <div class="glass-panel-interactive rounded-2xl p-6 animate__animated animate__fadeInUp animate__delay-1s">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl mb-4">
            ✨
          </div>
          <h4 class="text-base font-bold text-white">AI Copilot Powered</h4>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Describe your business in plain Thai or English. AI automatically crafts complete entities, fields, and mock data.
          </p>
        </div>

        <div class="glass-panel-interactive rounded-2xl p-6 animate__animated animate__fadeInUp animate__delay-1s">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl mb-4">
            🐳
          </div>
          <h4 class="text-base font-bold text-white">Docker & CLI Ready</h4>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            Includes docker-compose.yml for one-command deploy, and `stackforge` CLI for instant terminal scaffolding.
          </p>
        </div>
      </div>
    </section>

    <!-- Presets Showcase Section -->
    <section id="presets" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span class="text-xs font-semibold text-teal-400 uppercase tracking-wider">Showcase Gallery</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-white mt-1">Pre-built Web Application Templates</h2>
          <p class="text-xs text-slate-400 mt-1">Ready to download in one click or clone directly into the visual builder.</p>
        </div>

        <!-- Filter Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="activeCategory = cat"
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            :class="activeCategory === cat ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Presets Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PresetCard 
          v-for="(preset, idx) in filteredPresets" 
          :key="preset.id" 
          :preset="preset"
          class="animate__animated animate__fadeInUp"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        />
      </div>
    </section>

    <!-- Custom Banner CTA -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-gradient-to-r from-teal-950/70 via-slate-900 to-slate-900 border border-teal-500/30 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden animate__animated animate__fadeIn">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white">Have a custom business domain?</h3>
          <p class="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
            Mix and match your backend, frontend, database, and custom entities. Our visual wizard and AI Copilot will generate your production scaffold in seconds.
          </p>
        </div>
        <NuxtLink
          to="/create"
          class="relative z-10 px-6 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-teal-500/20 shrink-0 transition-all transform hover:scale-105 active:scale-95"
        >
          Launch Custom Builder →
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PRESET_TEMPLATES } from '~/types/presets'

const categories = ['All', 'Popular', 'Enterprise', 'Healthcare', 'Content']
const activeCategory = ref('All')

const filteredPresets = computed(() => {
  if (activeCategory.value === 'All') return PRESET_TEMPLATES
  return PRESET_TEMPLATES.filter(p => p.badge === activeCategory.value)
})
</script>
