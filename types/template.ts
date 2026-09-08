export type BackendFramework = 'dotnet' | 'nestjs'
export type FrontendFramework = 'vue' | 'react'
export type DatabaseType = 'postgres' | 'mysql' | 'sqlserver'
export type DockerMode = 'dev' | 'prod'
export type ApiDocsType = 'swagger' | 'scalar'

export type FieldType = 'string' | 'int' | 'decimal' | 'boolean' | 'datetime' | 'text'

export interface EntityField {
  id: string
  name: string
  type: FieldType
  required: boolean
  isUnique?: boolean
  defaultValue?: string
  label?: string
}

export interface EntityModel {
  id: string
  name: string
  label: string
  description?: string
  fields: EntityField[]
}

export interface TemplateConfig {
  projectName: string
  description: string
  backend: BackendFramework
  frontend: FrontendFramework
  database: DatabaseType
  dockerMode: DockerMode
  auth: boolean
  apiDocs: ApiDocsType
  entities: EntityModel[]
  mockDataCount?: number
}

export interface GeneratedFile {
  path: string
  content: string
}

export interface PresetTemplate {
  id: string
  name: string
  description: string
  badge: string
  icon: string
  config: TemplateConfig
}
