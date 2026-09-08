# ⚡ StackForge Studio — Full-Stack Web Template & Code Generator Platform

> A production-grade web template generator & scaffold platform built with **Nuxt 3 (Vue 3)**, **Tailwind CSS**, **Pinia**, **Prisma ORM**, and **Animate.css**, supercharged with **AI Copilot (Google Gemini API)** and a standalone **CLI (`stackforge`)**.

---

## 🌟 Key Features

- 🖥️ **Full-Stack Target Generation (Matrix Combinations)**:
  - **Backend**: ASP.NET Core 8 Web API (.NET 8 C# Clean Architecture) or Node.js (NestJS + Prisma)
  - **Frontend**: Vue 3 (Vite + Tailwind + Pinia) or React (Vite + Tailwind)
  - **Database**: PostgreSQL 16, MySQL 8, SQL Server 2022
  - **DevOps**: Docker Compose (Hot-reload Dev / Production multi-stage)
  - **Add-on Toggles**: JWT Authentication, Swagger OpenAPI, Realistic Mock Seed Data
- 🗃️ **Visual Database Entity & CRUD Designer**:
  - Define custom entities, fields (string, int, decimal, boolean, datetime, text), constraints, and labels.
  - Automatically creates models, DTOs, controllers, services, migrations, and frontend Data Tables with modal forms.
- ✨ **AI Copilot (Prompt-to-Schema & Mock Data)**:
  - Describe your business in plain Thai or English (e.g. *"ระบบคลินิกสัตว์เลี้ยง มีนัดหมายและประวัติการรักษา"*).
  - AI generates complete entities, fields, data types, and realistic seed data in one click.
- 📦 **Pre-built Presets Showcase**:
  - E-Commerce Core, SaaS CRM & Leads, Pet / Medical Clinic, Modern Blog & CMS.
- 👁️ **Live Code Preview & Instant ZIP Export**:
  - In-browser file tree explorer and syntax-highlighted code viewer before downloading.
- 💻 **StackForge CLI Tool (`stackforge`)**:
  - Scaffold projects directly from PowerShell, CMD, or Terminal like `dotnet new` or `npm create`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 22)
- npm or pnpm
- Optional for running generated templates: .NET 8 SDK, Docker Desktop

### 1. Installation
\`\`\`bash
git clone https://github.com/thanakorn17430645/stackforge-studio.git
cd stackforge-studio
npm install
\`\`\`

### 2. Setup Database
\`\`\`bash
npx prisma db push
\`\`\`

### 3. Start Development Server
\`\`\`bash
npm run dev
\`\`\`
Open your browser at **http://localhost:3000** (or http://localhost:3001).

---

## 💻 CLI Usage (`stackforge`)

Link the CLI locally:
\`\`\`bash
npm link
\`\`\`

Now run it anywhere in PowerShell or CMD:

\`\`\`powershell
# 1. Interactive wizard in terminal
stackforge

# 2. Specify stack with flags
stackforge create MyStore --backend dotnet --frontend vue --database postgres

# 3. Create from a preset
stackforge create MyClinic --preset clinic-care

# 4. Generate with AI Prompt
stackforge create VetApp --backend dotnet --frontend vue --database postgres --ai "คลินิกสัตว์เลี้ยง มีการนัดหมายและประวัติการรักษา"

# 5. List all presets
stackforge list
\`\`\`

---

## 🐳 Running Generated Templates

Once you download or generate a template:
\`\`\`bash
cd YourProjectName
docker compose up --build
\`\`\`
- 🌐 **Web App & Dashboard**: http://localhost:3000
- 🔌 **Swagger REST API**: http://localhost:8080/swagger

---

## 📜 License
MIT License. Created with ❤️ by Thanakorn.
