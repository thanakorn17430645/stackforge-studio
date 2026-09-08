import { defineEventHandler, readBody } from 'h3'
import type { TemplateConfig } from '~/types/template'
import { generateFullTemplate } from '~/server/utils/templateEngine'

export default defineEventHandler(async (event) => {
  const config = await readBody<TemplateConfig>(event)

  if (!config || !config.projectName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid template configuration'
    })
  }

  const files = generateFullTemplate(config)

  return {
    success: true,
    totalFiles: files.length,
    files: files.map(f => ({
      path: f.path,
      size: f.content.length,
      content: f.content
    }))
  }
})
