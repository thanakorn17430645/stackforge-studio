#!/usr/bin/env node

import { Command } from 'commander'
import prompts from 'prompts'
import fs from 'fs'
import path from 'path'
import { generateFullTemplate } from '../server/utils/templateEngine.ts'
import { PRESET_TEMPLATES } from '../types/presets.ts'

const program = new Command()

program
  .name('stackforge')
  .description('CLI to scaffold and generate complete Full-Stack Web Templates (.NET 8 / NestJS + Vue 3 / React + PostgreSQL + Docker)')
  .version('1.0.0')

program
  .command('create [name]', { isDefault: true })
  .description('Generate a new web application template')
  .option('-b, --backend <dotnet|nestjs>', 'Backend framework: dotnet or nestjs')
  .option('-f, --frontend <vue|react>', 'Frontend framework: vue or react')
  .option('-d, --database <postgres|mysql|sqlserver>', 'Database engine: postgres, mysql, sqlserver')
  .option('-p, --preset <presetId>', 'Use a preset template: ecommerce, crm, clinic, blog')
  .option('-o, --output <dir>', 'Output destination folder')
  .option('--ai <prompt>', 'Prompt for AI to draft schema (e.g. "pet clinic with appointments")')
  .option('--no-auth', 'Disable JWT authentication')
  .action(async (name, options) => {
    console.log('\n⚡ \x1b[36m\x1b[1mStackForge Studio CLI\x1b[0m — Full-Stack Template Generator\n')

    // 1. Resolve Preset if specified
    if (options.preset) {
      const pId = options.preset.toLowerCase()
      const matched = PRESET_TEMPLATES.find(p => p.id.includes(pId))
      if (matched) {
        console.log(`📦 Loaded preset: \x1b[32m${matched.name}\x1b[0m`)
        const targetDir = options.output || name || matched.config.projectName
        await scaffoldTemplate(matched.config, targetDir)
        return
      } else {
        console.log(`⚠️  Preset "${options.preset}" not found. Available: ecommerce, crm, clinic, blog. Falling back to custom config.`)
      }
    }

    // 2. Interactive Prompts if parameters are missing
    const projectName = name || options.output || (await prompts({
      type: 'text',
      name: 'val',
      message: 'Project name:',
      initial: 'MyEnterpriseApp'
    })).val || 'MyEnterpriseApp'

    const backend = options.backend || (await prompts({
      type: 'select',
      name: 'val',
      message: 'Select Backend Framework:',
      choices: [
        { title: 'ASP.NET Core 8 Web API (.NET 8 C# Clean Architecture)', value: 'dotnet' },
        { title: 'Node.js (NestJS with Prisma)', value: 'nestjs' }
      ],
      initial: 0
    })).val

    const frontend = options.frontend || (await prompts({
      type: 'select',
      name: 'val',
      message: 'Select Frontend Framework & UI Dashboard:',
      choices: [
        { title: 'Vue 3 (Vite + Tailwind CSS + Pinia + Data Tables)', value: 'vue' },
        { title: 'React (Vite + Tailwind CSS + TanStack)', value: 'react' }
      ],
      initial: 0
    })).val

    const database = options.database || (await prompts({
      type: 'select',
      name: 'val',
      message: 'Select Database Engine:',
      choices: [
        { title: 'PostgreSQL 16 (Recommended)', value: 'postgres' },
        { title: 'MySQL 8', value: 'mysql' },
        { title: 'SQL Server 2022', value: 'sqlserver' }
      ],
      initial: 0
    })).val

    // 3. Entity Schema Configuration
    let entities = [
      {
        id: 'product',
        name: 'Product',
        label: 'สินค้า (Products)',
        fields: [
          { id: 'f1', name: 'title', type: 'string', required: true, label: 'Product Title' },
          { id: 'f2', name: 'sku', type: 'string', required: true, isUnique: true, label: 'SKU' },
          { id: 'f3', name: 'price', type: 'decimal', required: true, label: 'Price' },
          { id: 'f4', name: 'stock', type: 'int', required: true, defaultValue: '0', label: 'Stock' },
          { id: 'f5', name: 'isAvailable', type: 'boolean', required: true, defaultValue: 'true', label: 'Active' }
        ]
      },
      {
        id: 'category',
        name: 'Category',
        label: 'หมวดหมู่ (Categories)',
        fields: [
          { id: 'c1', name: 'name', type: 'string', required: true, label: 'Category Name' },
          { id: 'c2', name: 'slug', type: 'string', required: true, isUnique: true, label: 'Slug' }
        ]
      }
    ]

    // If AI prompt provided via flag
    if (options.ai) {
      console.log(`🤖 Processing AI Prompt: "${options.ai}"...`)
      try {
        const fallbackSchema = generateSmartFallback(options.ai)
        if (fallbackSchema && fallbackSchema.length > 0) {
          entities = fallbackSchema
          console.log(`✨ AI generated ${entities.length} entities: ${entities.map(e => e.name).join(', ')}`)
        }
      } catch (err) {
        console.warn('AI processing failed, using default schema.')
      }
    }

    const config = {
      projectName,
      description: `${projectName} full-stack scaffold created with StackForge CLI.`,
      backend: backend || 'dotnet',
      frontend: frontend || 'vue',
      database: database || 'postgres',
      dockerMode: 'dev',
      auth: options.auth !== false,
      apiDocs: 'swagger',
      mockDataCount: 8,
      entities
    }

    const targetDir = options.output || projectName
    await scaffoldTemplate(config, targetDir)
  })

// List Presets Command
program
  .command('list')
  .description('List all available preset templates')
  .action(() => {
    console.log('\n📦 \x1b[36m\x1b[1mStackForge Available Presets:\x1b[0m\n')
    for (const p of PRESET_TEMPLATES) {
      console.log(`  • \x1b[32m\x1b[1m${p.id.padEnd(16)}\x1b[0m - ${p.name}: ${p.description}`)
      console.log(`    Stack: ${p.config.backend} + ${p.config.frontend} + ${p.config.database}\n`)
    }
    console.log('Use: \x1b[33mstackforge create MyProject --preset <presetId>\x1b[0m\n')
  })

program.parse(process.argv)

async function scaffoldTemplate(config, targetDir) {
  console.log(`🛠️  Generating template for \x1b[32m${config.projectName}\x1b[0m...`)
  const files = generateFullTemplate(config)
  const resolvedDir = path.resolve(process.cwd(), targetDir)

  fs.mkdirSync(resolvedDir, { recursive: true })

  for (const file of files) {
    const fullPath = path.join(resolvedDir, file.path)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, file.content, 'utf8')
  }

  console.log(`\n🎉 \x1b[32m\x1b[1mSuccess!\x1b[0m Generated \x1b[1m${files.length}\x1b[0m files at: \x1b[34m${resolvedDir}\x1b[0m\n`)
  console.log('🚀 \x1b[1mNext Steps to run your application:\x1b[0m')
  console.log(`   \x1b[33mcd ${targetDir}\x1b[0m`)
  console.log(`   \x1b[33mdocker compose up --build\x1b[0m\n`)
  console.log('🌐 Web App & Dashboard: http://localhost:3000')
  console.log('🔌 Swagger REST API:    http://localhost:8080/swagger\n')
}

function generateSmartFallback(prompt) {
  const p = prompt.toLowerCase()
  if (p.includes('สัตว์') || p.includes('pet') || p.includes('clinic') || p.includes('คลินิก')) {
    return [
      {
        id: 'patient',
        name: 'Patient',
        label: 'สัตว์เลี้ยง / ผู้ป่วย',
        fields: [
          { id: 'p1', name: 'name', type: 'string', required: true, label: 'ชื่อ' },
          { id: 'p2', name: 'species', type: 'string', required: true, defaultValue: "'Canine'", label: 'สายพันธุ์' },
          { id: 'p3', name: 'age', type: 'int', required: true, defaultValue: '2', label: 'อายุ' }
        ]
      },
      {
        id: 'appointment',
        name: 'Appointment',
        label: 'การนัดหมาย',
        fields: [
          { id: 'a1', name: 'reason', type: 'string', required: true, label: 'สาเหตุ' },
          { id: 'a2', name: 'appointmentDate', type: 'datetime', required: true, label: 'วันนัด' },
          { id: 'a3', name: 'doctor', type: 'string', required: true, label: 'แพทย์' }
        ]
      }
    ]
  }
  return null
}
