import type { TemplateConfig, GeneratedFile } from '~/types/template'
import { generateDotnetBackend } from './generators/dotnetGenerator'
import { generateNestjsBackend } from './generators/nestjsGenerator'
import { generateVueFrontend } from './generators/vueGenerator'
import { generateReactFrontend } from './generators/reactGenerator'
import { generateDockerFiles } from './generators/dockerGenerator'

export function generateFullTemplate(config: TemplateConfig): GeneratedFile[] {
  let files: GeneratedFile[] = []

  // 1. Generate Backend
  if (config.backend === 'dotnet') {
    files = files.concat(generateDotnetBackend(config))
  } else {
    files = files.concat(generateNestjsBackend(config))
  }

  // 2. Generate Frontend
  if (config.frontend === 'vue') {
    files = files.concat(generateVueFrontend(config))
  } else {
    files = files.concat(generateReactFrontend(config))
  }

  // 3. Generate Docker & Root configs
  files = files.concat(generateDockerFiles(config))

  return files
}
