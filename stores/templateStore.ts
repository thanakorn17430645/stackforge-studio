import { defineStore } from 'pinia'
import type { TemplateConfig, EntityModel, EntityField, BackendFramework, FrontendFramework, DatabaseType, DockerMode, ApiDocsType, CicdTool } from '~/types/template'
import { PRESET_TEMPLATES } from '~/types/presets'

export const useTemplateStore = defineStore('template', {
  state: (): {
    config: TemplateConfig
    isGenerating: boolean
    previewFiles: { path: string; size: number; content: string }[]
    selectedFileIndex: number
  } => ({
    config: {
      projectName: 'MyModernApp',
      description: 'Production-ready full-stack web application with End-to-End CRUD and Docker.',
      backend: 'dotnet',
      frontend: 'vue',
      database: 'postgres',
      dockerMode: 'dev',
      auth: true,
      apiDocs: 'swagger',
      cicd: 'github',
      mockDataCount: 8,
      entities: [
        {
          id: 'item',
          name: 'Product',
          label: 'สินค้า (Products)',
          fields: [
            { id: 'f1', name: 'title', type: 'string', required: true, label: 'ชื่อสินค้า' },
            { id: 'f2', name: 'sku', type: 'string', required: true, isUnique: true, label: 'รหัส SKU' },
            { id: 'f3', name: 'price', type: 'decimal', required: true, label: 'ราคา (บาท)' },
            { id: 'f4', name: 'stock', type: 'int', required: true, defaultValue: '0', label: 'จำนวนในคลัง' },
            { id: 'f5', name: 'isAvailable', type: 'boolean', required: true, defaultValue: 'true', label: 'พร้อมขาย' },
            { id: 'f6', name: 'description', type: 'text', required: false, label: 'รายละเอียด' }
          ]
        },
        {
          id: 'category',
          name: 'Category',
          label: 'หมวดหมู่ (Categories)',
          fields: [
            { id: 'c1', name: 'name', type: 'string', required: true, label: 'ชื่อหมวดหมู่' },
            { id: 'c2', name: 'slug', type: 'string', required: true, isUnique: true, label: 'Slug' }
          ]
        }
      ]
    },
    isGenerating: false,
    previewFiles: [],
    selectedFileIndex: 0
  }),

  getters: {
    selectedFile(state) {
      return state.previewFiles[state.selectedFileIndex] || null
    }
  },

  actions: {
    loadPreset(presetId: string) {
      const preset = PRESET_TEMPLATES.find(p => p.id === presetId)
      if (preset) {
        this.config = JSON.parse(JSON.stringify(preset.config))
      }
    },

    setBackend(backend: BackendFramework) {
      this.config.backend = backend
    },

    setFrontend(frontend: FrontendFramework) {
      this.config.frontend = frontend
    },

    setDatabase(database: DatabaseType) {
      this.config.database = database
    },

    setCicd(cicd: CicdTool) {
      this.config.cicd = cicd
    },

    addEntity(entity: EntityModel) {
      this.config.entities.push(entity)
    },

    removeEntity(entityId: string) {
      this.config.entities = this.config.entities.filter(e => e.id !== entityId)
    },

    setEntitiesFromAI(entities: EntityModel[]) {
      this.config.entities = entities
    },

    addField(entityId: string, field: EntityField) {
      const entity = this.config.entities.find(e => e.id === entityId)
      if (entity) {
        entity.fields.push(field)
      }
    },

    removeField(entityId: string, fieldId: string) {
      const entity = this.config.entities.find(e => e.id === entityId)
      if (entity) {
        entity.fields = entity.fields.filter(f => f.id !== fieldId)
      }
    },

    async fetchPreview() {
      this.isGenerating = true
      try {
        const res = await $fetch<{ success: boolean; files: any[] }>('/api/generate/preview', {
          method: 'POST',
          body: this.config
        })
        if (res.success) {
          this.previewFiles = res.files
          this.selectedFileIndex = 0
        }
      } catch (err) {
        console.error('Failed to generate preview', err)
      } finally {
        this.isGenerating = false
      }
    }
  }
})
