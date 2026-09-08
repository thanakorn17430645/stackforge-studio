// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  ignore: ['**/test-*/**', '**/test-*'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  css: [
    'animate.css/animate.min.css',
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    public: {
      appName: 'StackForge AI - Full-Stack Template Studio'
    }
  },
  app: {
    head: {
      title: 'StackForge - Full-Stack Web Template & App Generator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Generate production-ready Full-Stack Web Templates (.NET 8, Vue 3, NestJS, React, PostgreSQL) with CRUD, Docker & AI Copilot in seconds.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap' }
      ]
    }
  }
})
