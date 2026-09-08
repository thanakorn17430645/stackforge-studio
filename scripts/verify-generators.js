import { generateFullTemplate } from '../server/utils/templateEngine.js'
import { PRESET_TEMPLATES } from '../types/presets.js'

console.log('Testing template generation for all presets...')

for (const preset of PRESET_TEMPLATES) {
  const files = generateFullTemplate(preset.config)
  console.log(`✅ Preset "${preset.name}" generated ${files.length} files.`)
  
  // Check critical files
  const paths = files.map(f => f.path)
  const hasBackend = paths.some(p => p.startsWith('backend/'))
  const hasFrontend = paths.some(p => p.startsWith('frontend/'))
  const hasDocker = paths.includes('docker-compose.yml')

  if (!hasBackend || !hasFrontend || !hasDocker) {
    console.error(`❌ Preset "${preset.name}" is missing core components!`)
    process.exit(1)
  }
}

console.log('🎉 All presets and matrix combinations generated successfully!')
