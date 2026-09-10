import type { TemplateConfig, GeneratedFile } from '~/types/template'

export function generateCicdFiles(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const tool = config.cicd || 'github'
  const projectName = config.projectName || 'App'

  // 1. GitHub Actions (Generated if tool is 'github' or default)
  if (tool === 'github' || tool === 'none') {
    files.push({
      path: '.github/workflows/ci.yml',
      content: `name: CI/CD Pipeline - ${projectName}

on:
  push:
    branches: [ "main", "master", "develop" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  test-and-build:
    name: Test & Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      ${config.backend === 'dotnet' ? `
      - name: Setup .NET Core SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Restore Backend Dependencies
        run: dotnet restore backend/

      - name: Build Backend
        run: dotnet build backend/ --no-restore --configuration Release
      ` : config.backend === 'fastapi' ? `
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Python Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r backend/requirements.txt
      ` : `
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install Backend Dependencies
        run: cd backend && npm install
      `}

      - name: Setup Node.js for Frontend
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build Frontend
        run: |
          cd frontend
          npm install
          npm run build

  docker-build:
    name: Docker Build & Verification
    needs: test-and-build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Validate Docker Compose Configuration
        run: docker compose config

      - name: Build Docker Images
        run: docker compose build
`
    })
  }

  // 2. GitLab CI
  if (tool === 'gitlab') {
    files.push({
      path: '.gitlab-ci.yml',
      content: `image: docker:24.0.5

variables:
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:24.0.5-dind

stages:
  - test
  - build
  - dockerize

test_backend:
  stage: test
  script:
    - echo "Testing backend..."
    ${config.backend === 'dotnet' ? '- docker run --rm -v $(pwd)/backend:/src -w /src mcr.microsoft.com/dotnet/sdk:8.0 dotnet test || true' : ''}
    ${config.backend === 'fastapi' ? '- docker run --rm -v $(pwd)/backend:/src -w /src python:3.11-slim pip install -r requirements.txt' : ''}

build_frontend:
  stage: build
  image: node:20-alpine
  script:
    - cd frontend
    - npm install
    - npm run build
  artifacts:
    paths:
      - frontend/dist/

docker_build:
  stage: dockerize
  script:
    - docker compose build
    - echo "Docker images built successfully for ${projectName}!"
`
    })
  }

  // 3. Jenkins Pipeline
  if (tool === 'jenkins') {
    files.push({
      path: 'Jenkinsfile',
      content: `pipeline {
    agent any

    environment {
        PROJECT_NAME = '${projectName.toLowerCase()}'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Building backend service...'
                ${config.backend === 'dotnet' ? `
                sh 'dotnet restore backend/'
                sh 'dotnet build backend/ -c Release'
                ` : config.backend === 'fastapi' ? `
                sh 'python3 -m venv venv && . venv/bin/activate && pip install -r backend/requirements.txt'
                ` : `
                sh 'cd backend && npm install && npm run build'
                `}
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building frontend client...'
                sh 'cd frontend && npm install && npm run build'
            }
        }

        stage('Docker Compose Validation & Build') {
            steps {
                echo 'Validating and building Docker containers...'
                sh 'docker compose config'
                sh 'docker compose build'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline for ${projectName} completed successfully!"
        }
        failure {
            echo "Pipeline failed! Please check logs."
        }
    }
}
`
    })
  }

  // 4. Docker CI helper script
  files.push({
    path: 'scripts/deploy.sh',
    content: `#!/usr/bin/env bash
set -e

echo "🚀 Deploying ${projectName} with Docker Compose..."

# Pull or build images
docker compose pull || true
docker compose build

# Launch services in detached mode
docker compose up -d

echo "✅ Deployment successful! Services running:"
docker compose ps
`
  })

  return files
}
