import type { TemplateConfig, GeneratedFile, EntityModel } from '~/types/template'

export function generateReactFrontend(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const projectName = config.projectName || 'ReactApp'

  // package.json
  files.push({
    path: 'frontend/package.json',
    content: JSON.stringify({
      name: `${projectName.toLowerCase()}-frontend`,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite --host',
        build: 'tsc -b && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^6.28.0',
        axios: '^1.7.9',
        'lucide-react': '^0.475.0'
      },
      devDependencies: {
        '@types/react': '^18.3.18',
        '@types/react-dom': '^18.3.5',
        '@vitejs/plugin-react': '^4.3.4',
        autoprefixer: '^10.4.20',
        postcss: '^8.5.2',
        tailwindcss: '^3.4.17',
        typescript: '^5.7.3',
        vite: '^6.1.0'
      }
    }, null, 2)
  })

  // vite.config.ts
  files.push({
    path: 'frontend/vite.config.ts',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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

  // tailwind.config.js & index.html
  files.push({
    path: 'frontend/tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
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
    <title>${projectName} - React Admin</title>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  })

  // src/main.tsx
  files.push({
    path: 'frontend/src/main.tsx',
    content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)`
  })

  // src/index.css
  files.push({
    path: 'frontend/src/index.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
  })

  // src/App.tsx
  files.push({
    path: 'frontend/src/App.tsx',
    content: `import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'

export default function App() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">
            ⚡
          </div>
          <span className="font-bold text-sm text-white">${projectName}</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition \${
              location.pathname === '/' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800'
            }\`}
          >
            📊 Dashboard
          </Link>
          ${config.entities.map(e => {
            const p = e.name.toLowerCase() + 's'
            return `<Link
            to="/${p}"
            className={\`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition \${
              location.pathname.startsWith('/${p}') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800'
            }\`}
          >
            <span>📦 ${e.label || e.name}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">CRUD</span>
          </Link>`
          }).join('\n          ')}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          ${config.entities.map(e => {
            const p = e.name.toLowerCase() + 's'
            return `<Route path="/${p}" element={<EntityView name="${e.name}" label="${e.label || e.name}" />} />`
          }).join('\n          ')}
        </Routes>
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${config.entities.map((e, idx) => `<div key="${e.name}" className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-medium">${e.label || e.name}</div>
          <div className="text-2xl font-bold text-white mt-2">${10 + idx * 5}</div>
          <div className="text-xs text-teal-400 mt-2">Active records in database</div>
        </div>`).join('\n        ')}
      </div>
    </div>
  )
}

function EntityView({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{label}</h2>
        <button className="px-4 py-2 bg-teal-500 text-slate-950 font-semibold text-sm rounded-lg">
          Add {name}
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Connected to <code>/api/{name.toLowerCase()}s</code> RESTful endpoint.
      </div>
    </div>
  )
}`
  })

  // Dockerfile & nginx.conf
  files.push({
    path: 'frontend/Dockerfile',
    content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
  })

  return files
}
