<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl animate__animated animate__fadeInDown animate__faster">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
          <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-extrabold text-teal-400 text-lg">
            ⚡
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-base tracking-tight text-white group-hover:text-teal-300 transition">StackForge</span>
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">Studio</span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium hidden xs:block">Full-Stack Template & Code Scaffold</p>
        </div>
      </NuxtLink>

      <!-- Desktop Nav Links -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink 
          to="/" 
          class="px-3.5 py-2 rounded-lg text-sm font-medium transition duration-200"
          :class="$route.path === '/' ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20 shadow-sm shadow-teal-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-900'"
        >
          Templates Showcase
        </NuxtLink>
        <NuxtLink 
          to="/create" 
          class="px-3.5 py-2 rounded-lg text-sm font-medium transition duration-200"
          :class="$route.path.startsWith('/create') ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20 shadow-sm shadow-teal-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-900'"
        >
          Custom Builder Wizard
        </NuxtLink>
        <NuxtLink 
          to="/preview" 
          class="px-3.5 py-2 rounded-lg text-sm font-medium transition duration-200"
          :class="$route.path === '/preview' ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20 shadow-sm shadow-teal-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-900'"
        >
          Code Preview
        </NuxtLink>
      </nav>

      <!-- Desktop Action & Mobile Toggle -->
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/create"
          class="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
        >
          <span>✨ Build Template</span>
        </NuxtLink>

        <!-- Mobile Menu Toggle Button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <span v-if="!mobileMenuOpen" class="text-xl leading-none">☰</span>
          <span v-else class="text-xl leading-none">✕</span>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer / Menu -->
    <div 
      v-if="mobileMenuOpen"
      class="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate__animated animate__fadeInDown animate__faster shadow-2xl"
    >
      <NuxtLink 
        to="/" 
        @click="mobileMenuOpen = false"
        class="block px-4 py-2.5 rounded-xl text-sm font-medium transition"
        :class="$route.path === '/' ? 'text-teal-400 bg-teal-500/10 font-semibold' : 'text-slate-300 hover:bg-slate-900'"
      >
        Templates Showcase
      </NuxtLink>
      <NuxtLink 
        to="/create" 
        @click="mobileMenuOpen = false"
        class="block px-4 py-2.5 rounded-xl text-sm font-medium transition"
        :class="$route.path.startsWith('/create') ? 'text-teal-400 bg-teal-500/10 font-semibold' : 'text-slate-300 hover:bg-slate-900'"
      >
        Custom Builder Wizard
      </NuxtLink>
      <NuxtLink 
        to="/preview" 
        @click="mobileMenuOpen = false"
        class="block px-4 py-2.5 rounded-xl text-sm font-medium transition"
        :class="$route.path === '/preview' ? 'text-teal-400 bg-teal-500/10 font-semibold' : 'text-slate-300 hover:bg-slate-900'"
      >
        Code Preview
      </NuxtLink>
      <div class="pt-2">
        <NuxtLink
          to="/create"
          @click="mobileMenuOpen = false"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl shadow-lg shadow-teal-500/20"
        >
          <span>✨ Build New Template</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
</script>
