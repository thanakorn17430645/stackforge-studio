<template>
  <div class="space-y-8 animate__animated animate__fadeIn">
    <!-- Project Meta Info -->
    <div class="glass-panel rounded-2xl p-6 space-y-4 shadow-xl">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <span class="text-teal-400">⚙️</span>
        <span>General Project Details</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1.5">Project Name (PascalCase)</label>
          <input 
            v-model="store.config.projectName"
            type="text" 
            placeholder="e.g. MyEnterpriseApp" 
            class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
          <input 
            v-model="store.config.description"
            type="text" 
            placeholder="Brief description of your web template" 
            class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>
      </div>
    </div>

    <!-- 1. Backend Selection -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label class="text-sm font-bold text-white flex items-center gap-2">
          <span>🖥️</span>
          <span>1. Backend Framework</span>
        </label>
        <span class="text-xs text-teal-400 font-mono">RESTful API + Entity Framework / Prisma</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- .NET 8 -->
        <div 
          @click="store.setBackend('dotnet')"
          class="cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative glass-panel-interactive select-none"
          :class="store.config.backend === 'dotnet' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🟣</span>
              <div>
                <h4 class="font-bold text-sm text-white">ASP.NET Core 8</h4>
                <p class="text-xs text-slate-400 mt-0.5">.NET 8 C#, Clean Arch & EF Core</p>
              </div>
            </div>
            <div v-if="store.config.backend === 'dotnet'" class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster shadow-md shadow-teal-500/30">
              ✓
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">High Perf</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Enterprise</span>
          </div>
        </div>

        <!-- Python FastAPI -->
        <div 
          @click="store.setBackend('fastapi')"
          class="cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative glass-panel-interactive select-none"
          :class="store.config.backend === 'fastapi' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🐍</span>
              <div>
                <h4 class="font-bold text-sm text-white">Python (FastAPI)</h4>
                <p class="text-xs text-slate-400 mt-0.5">FastAPI, SQLAlchemy & Pydantic</p>
              </div>
            </div>
            <div v-if="store.config.backend === 'fastapi'" class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster shadow-md shadow-teal-500/30">
              ✓
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Async Python</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">AI-Ready</span>
          </div>
        </div>

        <!-- NestJS -->
        <div 
          @click="store.setBackend('nestjs')"
          class="cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative glass-panel-interactive select-none"
          :class="store.config.backend === 'nestjs' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🔴</span>
              <div>
                <h4 class="font-bold text-sm text-white">Node.js (NestJS)</h4>
                <p class="text-xs text-slate-400 mt-0.5">TypeScript, Prisma ORM, Modules</p>
              </div>
            </div>
            <div v-if="store.config.backend === 'nestjs'" class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster shadow-md shadow-teal-500/30">
              ✓
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">TypeScript</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Prisma ORM</span>
          </div>
        </div>

        <!-- Go Gin -->
        <div 
          @click="store.setBackend('go')"
          class="cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative glass-panel-interactive select-none"
          :class="store.config.backend === 'go' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🦫</span>
              <div>
                <h4 class="font-bold text-sm text-white">Go (Gin Engine)</h4>
                <p class="text-xs text-slate-400 mt-0.5">Ultra-fast microservice & GORM</p>
              </div>
            </div>
            <div v-if="store.config.backend === 'go'" class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster shadow-md shadow-teal-500/30">
              ✓
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Sub-ms Latency</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Lightweight</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Frontend Selection -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label class="text-sm font-bold text-white flex items-center gap-2">
          <span>🎨</span>
          <span>2. Frontend Framework & Dashboard UI</span>
        </label>
        <span class="text-xs text-teal-400 font-mono">Tailwind CSS + Dynamic Data Tables</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Vue 3 -->
        <div 
          @click="store.setFrontend('vue')"
          class="cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative glass-panel-interactive select-none"
          :class="store.config.frontend === 'vue' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🟢</span>
              <div>
                <h4 class="font-bold text-sm text-white">Vue 3 (Vite + Tailwind)</h4>
                <p class="text-xs text-slate-400 mt-0.5">Composition API, Pinia, Modern KPI Dashboard & CRUD</p>
              </div>
            </div>
            <div v-if="store.config.frontend === 'vue'" class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster shadow-md shadow-teal-500/30">
              ✓
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Pinia State</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Animate.css UI</span>
          </div>
        </div>

        <!-- React -->
        <div 
          @click="store.setFrontend('react')"
          class="cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative glass-panel-interactive select-none"
          :class="store.config.frontend === 'react' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🔵</span>
              <div>
                <h4 class="font-bold text-sm text-white">React (Vite + Tailwind)</h4>
                <p class="text-xs text-slate-400 mt-0.5">React 18, React Router, Hooks & Clean Components</p>
              </div>
            </div>
            <div v-if="store.config.frontend === 'react'" class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster shadow-md shadow-teal-500/30">
              ✓
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">React Router</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Modern Layout</span>
          </div>
        </div>

        <!-- Angular -->
        <div 
          @click="store.setFrontend('angular')"
          class="cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative glass-panel-interactive select-none"
          :class="store.config.frontend === 'angular' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🅰️</span>
              <div>
                <h4 class="font-bold text-sm text-white">Angular 18+ (Standalone)</h4>
                <p class="text-xs text-slate-400 mt-0.5">Standalone Components, HttpClient, Signals & Tailwind</p>
              </div>
            </div>
            <div v-if="store.config.frontend === 'angular'" class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster shadow-md shadow-teal-500/30">
              ✓
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Enterprise Ready</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">Signals & RxJS</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Database Selection -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label class="text-sm font-bold text-white flex items-center gap-2">
          <span>🗄️</span>
          <span>3. Database Engine</span>
        </label>
        <span class="text-xs text-teal-400 font-mono">Dockerized Database Service or Embedded Engine</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <!-- PostgreSQL -->
        <div 
          @click="store.setDatabase('postgres')"
          class="cursor-pointer p-5 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.database === 'postgres' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.database === 'postgres'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster">
            ✓
          </div>
          <span class="text-3xl block mb-2">🐘</span>
          <h4 class="font-bold text-sm text-white">PostgreSQL 16</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">Standard & Robust</p>
        </div>

        <!-- MySQL -->
        <div 
          @click="store.setDatabase('mysql')"
          class="cursor-pointer p-5 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.database === 'mysql' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.database === 'mysql'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster">
            ✓
          </div>
          <span class="text-3xl block mb-2">🐬</span>
          <h4 class="font-bold text-sm text-white">MySQL 8</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">Widely Supported</p>
        </div>

        <!-- SQL Server -->
        <div 
          @click="store.setDatabase('sqlserver')"
          class="cursor-pointer p-5 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.database === 'sqlserver' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.database === 'sqlserver'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster">
            ✓
          </div>
          <span class="text-3xl block mb-2">🪟</span>
          <h4 class="font-bold text-sm text-white">SQL Server 2022</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">Microsoft Ecosystem</p>
        </div>

        <!-- MongoDB -->
        <div 
          @click="store.setDatabase('mongodb')"
          class="cursor-pointer p-5 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.database === 'mongodb' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.database === 'mongodb'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster">
            ✓
          </div>
          <span class="text-3xl block mb-2">🍃</span>
          <h4 class="font-bold text-sm text-white">MongoDB 7</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">NoSQL & Document</p>
        </div>

        <!-- SQLite -->
        <div 
          @click="store.setDatabase('sqlite')"
          class="cursor-pointer p-5 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.database === 'sqlite' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.database === 'sqlite'" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs animate__animated animate__zoomIn animate__faster">
            ✓
          </div>
          <span class="text-3xl block mb-2">🪶</span>
          <h4 class="font-bold text-sm text-white">SQLite 3</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">Zero Config & File-based</p>
        </div>
      </div>
    </div>

    <!-- 4. CI/CD Pipeline Selection -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label class="text-sm font-bold text-white flex items-center gap-2">
          <span>🚀</span>
          <span>4. CI/CD & Automation Pipeline</span>
        </label>
        <span class="text-xs text-teal-400 font-mono">Automated Lint, Test, & Docker Build</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- GitHub Actions -->
        <div 
          @click="store.setCicd('github')"
          class="cursor-pointer p-4 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="(store.config.cicd === 'github' || !store.config.cicd) ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.cicd === 'github' || !store.config.cicd" class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">✓</div>
          <span class="text-2xl block mb-1">🐙</span>
          <h4 class="font-bold text-xs text-white">GitHub Actions</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">.github/workflows</p>
        </div>

        <!-- GitLab CI -->
        <div 
          @click="store.setCicd('gitlab')"
          class="cursor-pointer p-4 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.cicd === 'gitlab' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.cicd === 'gitlab'" class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">✓</div>
          <span class="text-2xl block mb-1">🦊</span>
          <h4 class="font-bold text-xs text-white">GitLab CI</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">.gitlab-ci.yml</p>
        </div>

        <!-- Jenkins -->
        <div 
          @click="store.setCicd('jenkins')"
          class="cursor-pointer p-4 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.cicd === 'jenkins' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.cicd === 'jenkins'" class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">✓</div>
          <span class="text-2xl block mb-1">👨‍✈️</span>
          <h4 class="font-bold text-xs text-white">Jenkins</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">Jenkinsfile Declarative</p>
        </div>

        <!-- Docker Script -->
        <div 
          @click="store.setCicd('docker')"
          class="cursor-pointer p-4 rounded-2xl border text-center transition-all duration-200 glass-panel-interactive select-none relative"
          :class="store.config.cicd === 'docker' ? 'border-teal-500 bg-teal-950/20 ring-2 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'"
        >
          <div v-if="store.config.cicd === 'docker'" class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">✓</div>
          <span class="text-2xl block mb-1">🐳</span>
          <h4 class="font-bold text-xs text-white">Docker CI</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">build-and-test.sh</p>
        </div>
      </div>
    </div>

    <!-- 5. Add-ons & Features Toggles -->
    <div class="glass-panel rounded-2xl p-6 space-y-4 shadow-xl">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <span class="text-teal-400">⚡</span>
        <span>5. Add-on Features & DevOps</span>
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- JWT Auth -->
        <label class="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 cursor-pointer transition">
          <input 
            v-model="store.config.auth"
            type="checkbox" 
            class="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500 cursor-pointer" 
          />
          <div>
            <h5 class="text-sm font-semibold text-white">JWT Authentication Module</h5>
            <p class="text-xs text-slate-400">User entity, Login/Register endpoints, token guard</p>
          </div>
        </label>

        <!-- Swagger UI -->
        <label class="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 cursor-not-allowed opacity-90">
          <input 
            type="checkbox" 
            checked 
            disabled 
            class="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500" 
          />
          <div>
            <h5 class="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>Swagger / OpenAPI Docs</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">Built-in</span>
            </h5>
            <p class="text-xs text-slate-400">Interactive API documentation at /swagger</p>
          </div>
        </label>

        <!-- Docker Compose -->
        <label class="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 cursor-not-allowed opacity-90">
          <input 
            type="checkbox" 
            checked 
            disabled 
            class="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500" 
          />
          <div>
            <h5 class="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>Docker Compose Stack</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono">Built-in</span>
            </h5>
            <p class="text-xs text-slate-400">One-command boot (docker compose up --build)</p>
          </div>
        </label>

        <!-- Mock Seed Data -->
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <h5 class="text-sm font-semibold text-white">Initial Seed Mock Data</h5>
            <p class="text-xs text-slate-400">Sample records in database on first run</p>
          </div>
          <select 
            v-model.number="store.config.mockDataCount"
            class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 transition"
          >
            <option :value="5">5 records / entity</option>
            <option :value="10">10 records / entity</option>
            <option :value="20">20 records / entity</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateStore } from '~/stores/templateStore'

const store = useTemplateStore()
</script>
