import { defineEventHandler, readBody, setHeader } from 'h3'
import JSZip from 'jszip'
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
  const zip = new JSZip()

  // Add all files to the ZIP
  const rootFolderName = config.projectName.toLowerCase()
  for (const file of files) {
    zip.file(`${rootFolderName}/${file.path}`, file.content)
  }

  // Generate binary buffer
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })

  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Disposition', `attachment; filename="${rootFolderName}-template.zip"`)
  setHeader(event, 'Content-Length', zipBuffer.length.toString())

  return zipBuffer
})
