import type { TemplateConfig, GeneratedFile, EntityModel, EntityField } from '~/types/template'

export function generateAngularFrontend(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const projectName = config.projectName.toLowerCase() || 'angularapp'

  // 1. package.json
  files.push({
    path: 'frontend/package.json',
    content: JSON.stringify({
      name: `${projectName}-frontend`,
      version: '1.0.0',
      scripts: {
        ng: 'ng',
        start: 'ng serve --host 0.0.0.0 --port 3000',
        build: 'ng build --configuration production',
        watch: 'ng build --watch --configuration development'
      },
      private: true,
      dependencies: {
        '@angular/animations': '^18.2.0',
        '@angular/common': '^18.2.0',
        '@angular/compiler': '^18.2.0',
        '@angular/core': '^18.2.0',
        '@angular/forms': '^18.2.0',
        '@angular/platform-browser': '^18.2.0',
        '@angular/platform-browser-dynamic': '^18.2.0',
        '@angular/router': '^18.2.0',
        'animate.css': '^4.1.1',
        rxjs: '~7.8.0',
        tslib: '^2.3.0',
        'zone.js': '~0.14.10'
      },
      devDependencies: {
        '@angular-devkit/build-angular': '^18.2.0',
        '@angular/cli': '^18.2.0',
        '@angular/compiler-cli': '^18.2.0',
        autoprefixer: '^10.4.20',
        postcss: '^8.4.47',
        tailwindcss: '^3.4.13',
        typescript: '~5.5.2'
      }
    }, null, 2)
  })

  // 2. angular.json
  files.push({
    path: 'frontend/angular.json',
    content: JSON.stringify({
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      newProjectRoot: 'projects',
      projects: {
        [projectName]: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          prefix: 'app',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:application',
              options: {
                outputPath: 'dist/app',
                index: 'src/index.html',
                browser: 'src/main.ts',
                polyfills: ['zone.js'],
                tsConfig: 'tsconfig.app.json',
                assets: [{ glob: '**/*', input: 'public' }],
                styles: ['src/styles.css', 'node_modules/animate.css/animate.min.css'],
                scripts: []
              }
            },
            serve: {
              builder: '@angular-devkit/build-angular:dev-server',
              configurations: {
                production: { buildTarget: `${projectName}:build:production` },
                development: { buildTarget: `${projectName}:build:development` }
              },
              defaultConfiguration: 'development'
            }
          }
        }
      }
    }, null, 2)
  })

  // 3. tsconfig.json & tsconfig.app.json
  files.push({
    path: 'frontend/tsconfig.json',
    content: JSON.stringify({
      compileOnSave: false,
      compilerOptions: {
        outDir: './dist/out-tsc',
        strict: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        skipLibCheck: true,
        isolatedModules: true,
        esModuleInterop: true,
        sourceMap: true,
        declaration: false,
        experimentalDecorators: true,
        moduleResolution: 'bundler',
        importHelpers: true,
        target: 'ES2022',
        module: 'ES2022',
        useDefineForClassFields: false
      }
    }, null, 2)
  })

  files.push({
    path: 'frontend/tsconfig.app.json',
    content: JSON.stringify({
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: './dist/out-tsc/app',
        types: []
      },
      files: ['src/main.ts'],
      include: ['src/**/*.d.ts']
    }, null, 2)
  })

  // 4. tailwind.config.js & src/styles.css
  files.push({
    path: 'frontend/tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
  })

  files.push({
    path: 'frontend/src/styles.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #020617;
  color: #f8fafc;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
`
  })

  // 5. src/index.html & src/main.ts
  files.push({
    path: 'frontend/src/index.html',
    content: `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <title>${config.projectName} - Angular Enterprise</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen">
  <app-root></app-root>
</body>
</html>
`
  })

  files.push({
    path: 'frontend/src/main.ts',
    content: `import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
`
  })

  // 6. src/app/app.routes.ts
  files.push({
    path: 'frontend/src/app/app.routes.ts',
    content: `import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  ${config.entities.map(e => {
    const p = e.name.toLowerCase() + 's'
    return `{ 
    path: '${p}', 
    loadComponent: () => import('./pages/${e.name.toLowerCase()}/${e.name.toLowerCase()}-list.component').then(m => m.${e.name}ListComponent) 
  }`
  }).join(',\n  ')}
];
`
  })

  // 7. src/app/app.component.ts (Dashboard Shell)
  files.push({
    path: 'frontend/src/app/app.component.ts',
    content: `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: \`
  <div class="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div class="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500 to-rose-400 flex items-center justify-center font-bold text-white shadow-lg">
          ▲
        </div>
        <div>
          <h1 class="font-bold text-sm text-white">${config.projectName}</h1>
          <span class="text-[10px] text-red-400 font-mono uppercase">Angular 18</span>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overview</div>
        <a routerLink="/" routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/30" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 transition">
          📊 Dashboard
        </a>

        <div class="pt-4 px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Entities</div>
        ${config.entities.map(e => {
          const p = e.name.toLowerCase() + 's'
          return `<a routerLink="/${p}" routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/30" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 transition">
          <span>📦 ${e.label || e.name}</span>
          <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">CRUD</span>
        </a>`
        }).join('\n        ')}
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
        <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">● System Ready</span>
        <a href="http://localhost:8080/docs" target="_blank" class="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">API Docs ↗</a>
      </header>
      <main class="flex-1 overflow-y-auto p-8 animate__animated animate__fadeIn">
        <router-outlet></router-outlet>
      </main>
    </div>
  </div>
  \`
})
export class AppComponent {}
`
  })

  // 8. src/app/pages/dashboard/dashboard.component.ts
  files.push({
    path: 'frontend/src/app/pages/dashboard/dashboard.component.ts',
    content: `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: \`
  <div class="space-y-8 max-w-7xl mx-auto">
    <div class="bg-gradient-to-r from-slate-900 to-rose-950/40 p-6 rounded-2xl border border-slate-800">
      <h2 class="text-2xl font-bold text-white">Overview Dashboard</h2>
      <p class="text-xs text-slate-400 mt-1">${config.description}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      ${config.entities.map((e, idx) => `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl animate__animated animate__fadeInUp" style="animation-delay: ${idx * 0.1}s">
        <div class="text-xs text-slate-400 uppercase font-semibold">${e.label || e.name}</div>
        <div class="text-2xl font-bold text-white mt-2">${10 + idx * 6}</div>
        <a routerLink="/${e.name.toLowerCase()}s" class="text-xs text-red-400 hover:underline mt-4 inline-block">Manage records →</a>
      </div>`).join('')}
    </div>
  </div>
  \`
})
export class DashboardComponent {}
`
  })

  // 9. For each entity, generate Service and Component
  for (const entity of config.entities) {
    const eName = entity.name
    const pName = eName.toLowerCase() + 's'

    // Service
    files.push({
      path: `frontend/src/app/services/${eName.toLowerCase()}.service.ts`,
      content: `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ${eName} {
  id?: number;
${entity.fields.map(f => `  ${f.name}${f.required ? '' : '?'}: any;`).join('\n')}
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ${eName}Service {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/${pName}';

  getAll(): Observable<${eName}[]> {
    return this.http.get<${eName}[]>(this.apiUrl);
  }

  getById(id: number): Observable<${eName}> {
    return this.http.get<${eName}>(\`\${this.apiUrl}/\${id}\`);
  }

  create(item: ${eName}): Observable<${eName}> {
    return this.http.post<${eName}>(this.apiUrl, item);
  }

  update(id: number, item: ${eName}): Observable<${eName}> {
    return this.http.put<${eName}>(\`\${this.apiUrl}/\${id}\`, item);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(\`\${this.apiUrl}/\${id}\`);
  }
}
`
    })

    // List Component
    files.push({
      path: `frontend/src/app/pages/${eName.toLowerCase()}/${eName.toLowerCase()}-list.component.ts`,
      content: `import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ${eName}Service, ${eName} } from '../../services/${eName.toLowerCase()}.service';

@Component({
  selector: 'app-${eName.toLowerCase()}-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
  <div class="space-y-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">${entity.label || entity.name}</h2>
      <button (click)="openCreateModal()" class="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-semibold text-xs rounded-xl shadow-lg transition">
        ＋ Add ${eName}
      </button>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
      <table class="w-full text-left text-xs text-slate-300">
        <thead class="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
          <tr>
            <th class="px-6 py-3.5">ID</th>
            ${entity.fields.map(f => `<th class="px-6 py-3.5">${f.label || f.name}</th>`).join('')}
            <th class="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr *ngFor="let item of items" class="hover:bg-slate-800/30 transition">
            <td class="px-6 py-4 font-mono text-slate-400">#{{ item.id }}</td>
            ${entity.fields.map(f => `<td class="px-6 py-4">{{ item.${f.name} }}</td>`).join('')}
            <td class="px-6 py-4 text-right space-x-2">
              <button (click)="deleteItem(item.id!)" class="text-rose-400 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate__animated animate__fadeIn">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate__animated animate__zoomIn animate__faster">
        <h3 class="font-bold text-white text-base">Add New ${eName}</h3>
        <form (ngSubmit)="saveItem()" class="space-y-3">
          ${entity.fields.map(f => `
          <div>
            <label class="block text-xs text-slate-400 mb-1">${f.label || f.name}</label>
            <input [(ngModel)]="formData.${f.name}" name="${f.name}" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
          </div>`).join('')}
          <div class="flex justify-end gap-2 pt-4">
            <button type="button" (click)="showModal = false" class="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-red-500 text-white font-semibold text-xs rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  \`
})
export class ${eName}ListComponent implements OnInit {
  private service = inject(${eName}Service);
  items: ${eName}[] = [];
  showModal = false;
  formData: any = {};

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getAll().subscribe({
      next: (data) => this.items = data,
      error: (err) => console.error(err)
    });
  }

  openCreateModal() {
    this.formData = {};
    this.showModal = true;
  }

  saveItem() {
    this.service.create(this.formData).subscribe({
      next: () => {
        this.showModal = false;
        this.loadData();
      }
    });
  }

  deleteItem(id: number) {
    if (!confirm('Delete item?')) return;
    this.service.delete(id).subscribe({
      next: () => this.loadData()
    });
  }
}
`
    })
  }

  // 10. Dockerfile & nginx.conf
  files.push({
    path: 'frontend/Dockerfile',
    content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`
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
    }
}
`
  })

  return files
}
