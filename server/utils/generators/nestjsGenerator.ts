import type { TemplateConfig, GeneratedFile, EntityModel, EntityField } from '~/types/template'

export function generateNestjsBackend(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const projectName = config.projectName || 'NestBackend'
  const isPostgres = config.database === 'postgres'
  const isMysql = config.database === 'mysql'

  // package.json
  files.push({
    path: 'backend/package.json',
    content: JSON.stringify({
      name: `${projectName.toLowerCase()}-backend`,
      version: '1.0.0',
      scripts: {
        build: 'nest build',
        start: 'nest start',
        'start:dev': 'nest start --watch',
        'start:prod': 'node dist/main'
      },
      dependencies: {
        '@nestjs/common': '^10.4.15',
        '@nestjs/core': '^10.4.15',
        '@nestjs/platform-express': '^10.4.15',
        '@nestjs/swagger': '^8.1.1',
        '@prisma/client': '^6.3.1',
        'class-transformer': '^0.5.1',
        'class-validator': '^0.14.1',
        reflect_metadata: '^0.2.2',
        rxjs: '^7.8.1'
      },
      devDependencies: {
        '@nestjs/cli': '^10.4.9',
        '@types/node': '^22.13.1',
        prisma: '^6.3.1',
        typescript: '^5.7.3'
      }
    }, null, 2)
  })

  // tsconfig.json
  files.push({
    path: 'backend/tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        module: 'commonjs',
        declaration: true,
        removeComments: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        target: 'ES2021',
        sourceMap: true,
        outDir: './dist',
        baseUrl: './',
        incremental: true,
        skipLibCheck: true,
        strictNullChecks: false,
        noImplicitAny: false,
        strictBindCallApply: false,
        forceConsistentCasingInFileNames: false,
        noFallthroughCasesInSwitch: false
      }
    }, null, 2)
  })

  // prisma/schema.prisma
  files.push({
    path: 'backend/prisma/schema.prisma',
    content: `datasource db {
  provider = "${isPostgres ? 'postgresql' : isMysql ? 'mysql' : 'sqlserver'}"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

${config.entities.map(e => `model ${e.name} {
  id        Int      @id @default(autoincrement())
${e.fields.map(f => `  ${f.name}     ${getPrismaType(f.type)}${f.required ? '' : '?'}${f.isUnique ? ' @unique' : ''}`).join('\n')}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`).join('\n\n')}
`
  })

  // src/main.ts
  files.push({
    path: 'backend/src/main.ts',
    content: `import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('${projectName} API')
    .setDescription('NestJS Backend REST API with Prisma & Swagger')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(\`Backend running on http://localhost:\${port}/swagger\`);
}
bootstrap();`
  })

  // src/app.module.ts
  files.push({
    path: 'backend/src/app.module.ts',
    content: `import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
${config.entities.map(e => `import { ${e.name}Module } from './${e.name.toLowerCase()}/${e.name.toLowerCase()}.module';`).join('\n')}

@Module({
  imports: [
    ${config.entities.map(e => `${e.name}Module,`).join('\n    ')}
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}`
  })

  // src/prisma.service.ts
  files.push({
    path: 'backend/src/prisma.service.ts',
    content: `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}`
  })

  // Entity Modules, Controllers, Services
  for (const entity of config.entities) {
    const eName = entity.name
    const pName = eName.toLowerCase() + 's'
    const folder = `backend/src/${eName.toLowerCase()}`

    // Controller
    files.push({
      path: `${folder}/${eName.toLowerCase()}.controller.ts`,
      content: `import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ${eName}Service } from './${eName.toLowerCase()}.service';

@ApiTags('${pName}')
@Controller('api/${pName}')
export class ${eName}Controller {
  constructor(private readonly service: ${eName}Service) {}

  @Get()
  @ApiOperation({ summary: 'Get all ${pName}' })
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${eName} by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new ${eName}' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ${eName}' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ${eName}' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}`
    })

    // Service
    files.push({
      path: `${folder}/${eName.toLowerCase()}.service.ts`,
      content: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ${eName}Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    return (this.prisma as any).${eName.toLowerCase()}.findMany({
      orderBy: { id: 'desc' }
    });
  }

  async findOne(id: number) {
    return (this.prisma as any).${eName.toLowerCase()}.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (this.prisma as any).${eName.toLowerCase()}.create({ data });
  }

  async update(id: number, data: any) {
    return (this.prisma as any).${eName.toLowerCase()}.update({ where: { id }, data });
  }

  async remove(id: number) {
    return (this.prisma as any).${eName.toLowerCase()}.delete({ where: { id } });
  }
}`
    })

    // Module
    files.push({
      path: `${folder}/${eName.toLowerCase()}.module.ts`,
      content: `import { Module } from '@nestjs/common';
import { ${eName}Controller } from './${eName.toLowerCase()}.controller';
import { ${eName}Service } from './${eName.toLowerCase()}.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [${eName}Controller],
  providers: [${eName}Service, PrismaService],
})
export class ${eName}Module {}`
    })
  }

  // Dockerfile
  files.push({
    path: 'backend/Dockerfile',
    content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "run", "start:prod"]`
  })

  return files
}

function getPrismaType(type: EntityField['type']): string {
  switch (type) {
    case 'string':
    case 'text':
      return 'String'
    case 'int':
      return 'Int'
    case 'decimal':
      return 'Float'
    case 'boolean':
      return 'Boolean'
    case 'datetime':
      return 'DateTime'
  }
}
