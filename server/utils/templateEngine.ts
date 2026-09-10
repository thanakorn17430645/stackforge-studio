import type { TemplateConfig, GeneratedFile } from '~/types/template'
import { generateDotnetBackend } from './generators/dotnetGenerator'
import { generateNestjsBackend } from './generators/nestjsGenerator'
import { generateFastapiBackend } from './generators/fastapiGenerator'
import { generateGoBackend } from './generators/goGenerator'
import { generateVueFrontend } from './generators/vueGenerator'
import { generateReactFrontend } from './generators/reactGenerator'
import { generateAngularFrontend } from './generators/angularGenerator'
import { generateDockerFiles } from './generators/dockerGenerator'
import { generateCicdFiles } from './generators/cicdGenerator'

export function generateFullTemplate(config: TemplateConfig): GeneratedFile[] {
  let files: GeneratedFile[] = []

  // 1. Generate Backend
  switch (config.backend) {
    case 'dotnet':
      files = files.concat(generateDotnetBackend(config))
      break
    case 'fastapi':
      files = files.concat(generateFastapiBackend(config))
      break
    case 'go':
      files = files.concat(generateGoBackend(config))
      break
    case 'nestjs':
    default:
      files = files.concat(generateNestjsBackend(config))
      break
  }

  // 2. Generate Frontend
  switch (config.frontend) {
    case 'vue':
      files = files.concat(generateVueFrontend(config))
      break
    case 'angular':
      files = files.concat(generateAngularFrontend(config))
      break
    case 'react':
    default:
      files = files.concat(generateReactFrontend(config))
      break
  }

  // 3. Generate Docker & Root configs
  files = files.concat(generateDockerFiles(config))

  // 4. Generate CI/CD Pipelines
  files = files.concat(generateCicdFiles(config))

  return files
}

