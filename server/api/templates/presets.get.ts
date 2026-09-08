import { defineEventHandler } from 'h3'
import { PRESET_TEMPLATES } from '~/types/presets'

export default defineEventHandler(() => {
  return {
    success: true,
    presets: PRESET_TEMPLATES
  }
})
