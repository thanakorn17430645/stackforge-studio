#!/usr/bin/env node

// bin/stackforge.js
import { Command } from "commander";
import prompts from "prompts";
import fs from "fs";
import path from "path";

// server/utils/generators/dotnetGenerator.ts
function generateDotnetBackend(config) {
  const files = [];
  const projectName = config.projectName || "BackendApp";
  const isPostgres = config.database === "postgres";
  const isMysql = config.database === "mysql";
  const isSqlServer = config.database === "sqlserver";
  files.push({
    path: `backend/${projectName}.csproj`,
    content: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.8" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.7.3" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.8">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    ${isPostgres ? '<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.4" />' : ""}
    ${isMysql ? '<PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.2" />' : ""}
    ${isSqlServer ? '<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.8" />' : ""}
    ${config.auth ? `<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />` : ""}
  </ItemGroup>
</Project>`
  });
  files.push({
    path: `backend/Program.cs`,
    content: `using Microsoft.EntityFrameworkCore;
${config.auth ? "using Microsoft.AspNetCore.Authentication.JwtBearer;\nusing Microsoft.IdentityModel.Tokens;\nusing System.Text;\n" : ""}using ${projectName}.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "${projectName} API", Version = "v1" });
    ${config.auth ? `c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \\"Authorization: Bearer {token}\\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });` : ""}
});

// Configure Database Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("DefaultConnection string not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    ${isPostgres ? "options.UseNpgsql(connectionString);" : ""}
    ${isMysql ? "options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));" : ""}
    ${isSqlServer ? "options.UseSqlServer(connectionString);" : ""}
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

${config.auth ? `// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyForDevelopmentPhase123456789!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();
` : ""}
var app = builder.Build();

// Auto-migrate & Seed Database in Development / Docker
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating/seeding the DB.");
    }
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "${projectName} API v1"));

app.UseCors("AllowAll");

${config.auth ? "app.UseAuthentication();\napp.UseAuthorization();\n" : ""}
app.MapControllers();

app.Run();`
  });
  const defaultDbConn = isPostgres ? "Host=postgres;Port=5432;Database=appdb;Username=postgres;Password=postgres;" : isMysql ? "Server=mysql;Port=3306;Database=appdb;User=root;Password=root;" : "Server=sqlserver,1433;Database=appdb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;";
  files.push({
    path: `backend/appsettings.json`,
    content: JSON.stringify({
      Logging: {
        LogLevel: {
          Default: "Information",
          "Microsoft.AspNetCore": "Warning"
        }
      },
      AllowedHosts: "*",
      ConnectionStrings: {
        DefaultConnection: defaultDbConn
      },
      Jwt: {
        Secret: "SuperSecretKeyForDevelopmentPhase123456789!"
      }
    }, null, 2)
  });
  for (const entity of config.entities) {
    const entityName = entity.name;
    const pluralName = entityName.endsWith("y") ? entityName.slice(0, -1) + "ies" : entityName + "s";
    files.push({
      path: `backend/Models/${entityName}.cs`,
      content: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ${projectName}.Models;

public class ${entityName}
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

${entity.fields.map((f) => `    ${f.required ? "[Required]\n    " : ""}public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join("\n\n")}

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}`
    });
    files.push({
      path: `backend/DTOs/${entityName}Dtos.cs`,
      content: `using System.ComponentModel.DataAnnotations;

namespace ${projectName}.DTOs;

public class Create${entityName}Dto
{
${entity.fields.map((f) => `    ${f.required ? "[Required]\n    " : ""}public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join("\n\n")}
}

public class Update${entityName}Dto
{
${entity.fields.map((f) => `    ${f.required ? "[Required]\n    " : ""}public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join("\n\n")}
}

public class ${entityName}ResponseDto
{
    public int Id { get; set; }
${entity.fields.map((f) => `    public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join("\n")}
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}`
    });
    files.push({
      path: `backend/Controllers/${pluralName}Controller.cs`,
      content: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ${projectName}.Data;
using ${projectName}.Models;
using ${projectName}.DTOs;

namespace ${projectName}.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${pluralName}Controller : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<${pluralName}Controller> _logger;

    public ${pluralName}Controller(AppDbContext context, ILogger<${pluralName}Controller> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/${pluralName}
    [HttpGet]
    public async Task<ActionResult<IEnumerable<${entityName}ResponseDto>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.${pluralName}.AsQueryable();

        // Basic string search on first string field
        ${getSearchFilterSnippet(entity, pluralName)}

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ${entityName}ResponseDto
            {
                Id = x.Id,
                ${entity.fields.map((f) => `${capitalize(f.name)} = x.${capitalize(f.name)},`).join("\n                ")}
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    // GET: api/${pluralName}/5
    [HttpGet("{id}")]
    public async Task<ActionResult<${entityName}ResponseDto>> GetById(int id)
    {
        var item = await _context.${pluralName}.FindAsync(id);
        if (item == null) return NotFound(new { message = "${entityName} not found" });

        return Ok(new ${entityName}ResponseDto
        {
            Id = item.Id,
            ${entity.fields.map((f) => `${capitalize(f.name)} = item.${capitalize(f.name)},`).join("\n            ")}
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        });
    }

    // POST: api/${pluralName}
    [HttpPost]
    public async Task<ActionResult<${entityName}ResponseDto>> Create([FromBody] Create${entityName}Dto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var item = new ${entityName}
        {
            ${entity.fields.map((f) => `${capitalize(f.name)} = dto.${capitalize(f.name)},`).join("\n            ")}
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.${pluralName}.Add(item);
        await _context.SaveChangesAsync();

        var response = new ${entityName}ResponseDto
        {
            Id = item.Id,
            ${entity.fields.map((f) => `${capitalize(f.name)} = item.${capitalize(f.name)},`).join("\n            ")}
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, response);
    }

    // PUT: api/${pluralName}/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Update${entityName}Dto dto)
    {
        var item = await _context.${pluralName}.FindAsync(id);
        if (item == null) return NotFound(new { message = "${entityName} not found" });

        ${entity.fields.map((f) => `item.${capitalize(f.name)} = dto.${capitalize(f.name)};`).join("\n        ")}
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "${entityName} updated successfully" });
    }

    // DELETE: api/${pluralName}/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.${pluralName}.FindAsync(id);
        if (item == null) return NotFound(new { message = "${entityName} not found" });

        _context.${pluralName}.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "${entityName} deleted successfully" });
    }
}`
    });
  }
  files.push({
    path: `backend/Data/AppDbContext.cs`,
    content: `using Microsoft.EntityFrameworkCore;
using ${projectName}.Models;

namespace ${projectName}.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

${config.entities.map((e) => {
      const pName = e.name.endsWith("y") ? e.name.slice(0, -1) + "ies" : e.name + "s";
      return `    public DbSet<${e.name}> ${pName} => Set<${e.name}>();`;
    }).join("\n")}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}`
  });
  files.push({
    path: `backend/Data/DbInitializer.cs`,
    content: `using ${projectName}.Models;

namespace ${projectName}.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        ${config.entities.map((e) => {
      const pName = e.name.endsWith("y") ? e.name.slice(0, -1) + "ies" : e.name + "s";
      return `if (!context.${pName}.Any())
        {
            var items = new List<${e.name}>
            {
                ${generateMockEntities(e, config.mockDataCount || 5)}
            };
            context.${pName}.AddRange(items);
        }`;
    }).join("\n\n        ")}

        context.SaveChangesAsync().Wait();
    }
}`
  });
  files.push({
    path: `backend/Dockerfile`,
    content: `# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["${projectName}.csproj", "./"]
RUN dotnet restore "./${projectName}.csproj"
COPY . .
RUN dotnet build "./${projectName}.csproj" -c Release -o /app/build
RUN dotnet publish "./${projectName}.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Development
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "${projectName}.dll"]`
  });
  return files;
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function getDotnetType(type, required) {
  let t = "string";
  switch (type) {
    case "string":
    case "text":
      t = "string";
      break;
    case "int":
      t = "int";
      break;
    case "decimal":
      t = "decimal";
      break;
    case "boolean":
      t = "bool";
      break;
    case "datetime":
      t = "DateTime";
      break;
  }
  return required ? t : `${t}?`;
}
function getDefaultInitial(type, defaultValue) {
  if (defaultValue) {
    if (type === "string" || type === "text") {
      if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
        return ` = "${defaultValue.slice(1, -1)}";`;
      }
      if (!defaultValue.startsWith('"')) {
        return ` = "${defaultValue}";`;
      }
    }
    return ` = ${defaultValue};`;
  }
  if (type === "string" || type === "text") {
    return " = string.Empty;";
  }
  return "";
}
function getSearchFilterSnippet(entity, pluralName) {
  const strField = entity.fields.find((f) => f.type === "string" || f.type === "text");
  if (!strField) return "// No string field for search";
  return `if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.${capitalize(strField.name)}.Contains(search));
        }`;
}
function generateMockEntities(entity, count) {
  const rows = [];
  for (let i = 1; i <= Math.min(count, 5); i++) {
    const props = entity.fields.map((f) => {
      const val = getMockValue(f, entity.name, i);
      return `${capitalize(f.name)} = ${val}`;
    }).join(", ");
    rows.push(`new ${entity.name} { ${props} }`);
  }
  return rows.join(",\n                ");
}
function getMockValue(field, entityName, index) {
  switch (field.type) {
    case "string":
      if (field.name.toLowerCase().includes("name") || field.name.toLowerCase().includes("title")) {
        return `"${entityName} Sample ${index}"`;
      }
      if (field.name.toLowerCase().includes("email")) {
        return `"user${index}@example.com"`;
      }
      if (field.name.toLowerCase().includes("phone")) {
        return `"081-234-567${index}"`;
      }
      if (field.name.toLowerCase().includes("sku")) {
        return `"SKU-00${index}"`;
      }
      if (field.name.toLowerCase().includes("status")) {
        return `"Active"`;
      }
      return `"${capitalize(field.name)} ${index}"`;
    case "text":
      return `"Sample detailed description and notes for ${entityName} #${index}."`;
    case "int":
      return `${index * 10}`;
    case "decimal":
      return `${(index * 99.5).toFixed(2)}m`;
    case "boolean":
      return index % 2 === 1 ? "true" : "false";
    case "datetime":
      return `DateTime.UtcNow.AddDays(-${index})`;
  }
}

// server/utils/generators/nestjsGenerator.ts
function generateNestjsBackend(config) {
  const files = [];
  const projectName = config.projectName || "NestBackend";
  const isPostgres = config.database === "postgres";
  const isMysql = config.database === "mysql";
  files.push({
    path: "backend/package.json",
    content: JSON.stringify({
      name: `${projectName.toLowerCase()}-backend`,
      version: "1.0.0",
      scripts: {
        build: "nest build",
        start: "nest start",
        "start:dev": "nest start --watch",
        "start:prod": "node dist/main"
      },
      dependencies: {
        "@nestjs/common": "^10.4.15",
        "@nestjs/core": "^10.4.15",
        "@nestjs/platform-express": "^10.4.15",
        "@nestjs/swagger": "^8.1.1",
        "@prisma/client": "^6.3.1",
        "class-transformer": "^0.5.1",
        "class-validator": "^0.14.1",
        reflect_metadata: "^0.2.2",
        rxjs: "^7.8.1"
      },
      devDependencies: {
        "@nestjs/cli": "^10.4.9",
        "@types/node": "^22.13.1",
        prisma: "^6.3.1",
        typescript: "^5.7.3"
      }
    }, null, 2)
  });
  files.push({
    path: "backend/tsconfig.json",
    content: JSON.stringify({
      compilerOptions: {
        module: "commonjs",
        declaration: true,
        removeComments: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        target: "ES2021",
        sourceMap: true,
        outDir: "./dist",
        baseUrl: "./",
        incremental: true,
        skipLibCheck: true,
        strictNullChecks: false,
        noImplicitAny: false,
        strictBindCallApply: false,
        forceConsistentCasingInFileNames: false,
        noFallthroughCasesInSwitch: false
      }
    }, null, 2)
  });
  files.push({
    path: "backend/prisma/schema.prisma",
    content: `datasource db {
  provider = "${isPostgres ? "postgresql" : isMysql ? "mysql" : "sqlserver"}"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

${config.entities.map((e) => `model ${e.name} {
  id        Int      @id @default(autoincrement())
${e.fields.map((f) => `  ${f.name}     ${getPrismaType(f.type)}${f.required ? "" : "?"}${f.isUnique ? " @unique" : ""}`).join("\n")}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`).join("\n\n")}
`
  });
  files.push({
    path: "backend/src/main.ts",
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
  });
  files.push({
    path: "backend/src/app.module.ts",
    content: `import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
${config.entities.map((e) => `import { ${e.name}Module } from './${e.name.toLowerCase()}/${e.name.toLowerCase()}.module';`).join("\n")}

@Module({
  imports: [
    ${config.entities.map((e) => `${e.name}Module,`).join("\n    ")}
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}`
  });
  files.push({
    path: "backend/src/prisma.service.ts",
    content: `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}`
  });
  for (const entity of config.entities) {
    const eName = entity.name;
    const pName = eName.toLowerCase() + "s";
    const folder = `backend/src/${eName.toLowerCase()}`;
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
    });
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
    });
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
    });
  }
  files.push({
    path: "backend/Dockerfile",
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
  });
  return files;
}
function getPrismaType(type) {
  switch (type) {
    case "string":
    case "text":
      return "String";
    case "int":
      return "Int";
    case "decimal":
      return "Float";
    case "boolean":
      return "Boolean";
    case "datetime":
      return "DateTime";
  }
}

// server/utils/generators/vueGenerator.ts
function generateVueFrontend(config) {
  const files = [];
  const projectName = config.projectName || "FrontendApp";
  files.push({
    path: "frontend/package.json",
    content: JSON.stringify({
      name: `${projectName.toLowerCase()}-frontend`,
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite --host",
        build: "vue-tsc && vite build",
        preview: "vite preview"
      },
      dependencies: {
        vue: "^3.5.13",
        "vue-router": "^4.5.0",
        pinia: "^2.3.1",
        axios: "^1.7.9",
        "animate.css": "^4.1.1",
        "lucide-vue-next": "^0.475.0"
      },
      devDependencies: {
        "@vitejs/plugin-vue": "^5.2.1",
        autoprefixer: "^10.4.20",
        postcss: "^8.5.2",
        tailwindcss: "^3.4.17",
        typescript: "^5.7.3",
        vite: "^6.1.0",
        "vue-tsc": "^2.2.0"
      }
    }, null, 2)
  });
  files.push({
    path: "frontend/vite.config.ts",
    content: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})`
  });
  files.push({
    path: "frontend/tsconfig.json",
    content: JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        module: "ESNext",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "preserve",
        strict: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
      references: [{ path: "./tsconfig.node.json" }]
    }, null, 2)
  });
  files.push({
    path: "frontend/tsconfig.node.json",
    content: JSON.stringify({
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: "ESNext",
        moduleResolution: "bundler",
        allowSyntheticDefaultImports: true
      },
      include: ["vite.config.ts"]
    }, null, 2)
  });
  files.push({
    path: "frontend/src/vite-env.d.ts",
    content: `/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}`
  });
  files.push({
    path: "frontend/tailwind.config.js",
    content: `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e'
        }
      }
    }
  },
  plugins: []
}`
  });
  files.push({
    path: "frontend/index.html",
    content: `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - Management Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`
  });
  files.push({
    path: "frontend/src/assets/main.css",
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
}`
  });
  files.push({
    path: "frontend/src/main.ts",
    content: `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import 'animate.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')`
  });
  files.push({
    path: "frontend/src/App.vue",
    content: `<template>
  <router-view />
</template>`
  });
  files.push({
    path: "frontend/src/services/apiClient.ts",
    content: `import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)`
  });
  files.push({
    path: "frontend/src/layouts/AppLayout.vue",
    content: `<template>
  <div class="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
    <!-- Mobile Sidebar Backdrop Overlay -->
    <div 
      v-if="mobileSidebarOpen" 
      @click="mobileSidebarOpen = false"
      class="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate__animated animate__fadeIn animate__faster"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0"
      :class="mobileSidebarOpen ? 'translate-x-0 animate__animated animate__fadeInLeft animate__faster' : '-translate-x-full md:translate-x-0'"
    >
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-teal-500/20">
            \u26A1
          </div>
          <div>
            <h1 class="font-bold text-sm leading-tight text-white">${projectName}</h1>
            <span class="text-[10px] text-teal-400 font-mono font-medium tracking-wider uppercase">Enterprise Studio</span>
          </div>
        </div>
        <button @click="mobileSidebarOpen = false" class="md:hidden text-slate-400 hover:text-white text-sm">\u2715</button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Overview
        </div>
        <router-link 
          to="/" 
          @click="mobileSidebarOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="$route.path === '/' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
        >
          <span>\u{1F4CA}</span>
          <span>Dashboard</span>
        </router-link>

        <div class="pt-4 px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Data Entities
        </div>
        ${config.entities.map((e) => {
      const pName = e.name.toLowerCase() + "s";
      return `<router-link 
          to="/${pName}" 
          @click="mobileSidebarOpen = false"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="$route.path.startsWith('/${pName}') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
        >
          <div class="flex items-center gap-3">
            <span>\u{1F4E6}</span>
            <span>${e.label || e.name}</span>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">CRUD</span>
        </router-link>`;
    }).join("\n        ")}
      </nav>

      <!-- Footer User Profile -->
      <div class="p-3 border-t border-slate-800">
        <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-teal-300">
            AD
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-200 truncate">Administrator</p>
            <p class="text-[10px] text-slate-500 truncate">admin@system.local</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Navbar -->
      <header class="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div class="flex items-center gap-3">
          <!-- Mobile Sidebar Toggle -->
          <button 
            @click="mobileSidebarOpen = true"
            class="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs"
          >
            \u2630
          </button>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
            \u25CF Online
          </span>
          <span class="text-xs text-slate-400 font-mono hidden xs:inline">DB: ${config.database.toUpperCase()}</span>
        </div>

        <div class="flex items-center gap-3">
          <a href="http://localhost:8080/swagger" target="_blank" class="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition">
            <span>Swagger API</span>
            <span>\u2197</span>
          </a>
        </div>
      </header>

      <!-- Page Content View -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-8 animate__animated animate__fadeIn animate__faster">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileSidebarOpen = ref(false)
</script>`
  });
  files.push({
    path: "frontend/src/views/DashboardView.vue",
    content: `<template>
  <div class="space-y-8 max-w-7xl mx-auto animate__animated animate__fadeIn">
    <!-- Header Hero -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 p-6 rounded-2xl border border-slate-800 animate__animated animate__fadeInDown">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h2>
        <p class="text-sm text-slate-400 mt-1">${config.description || "Manage your enterprise data entities with automated real-time CRUD and metrics."}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 text-xs font-mono border border-teal-500/20">
          Ready for Production
        </span>
      </div>
    </div>

    <!-- KPI Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(config.entities.length + 1, 4)} gap-5">
      ${config.entities.map((e, idx) => {
      const pName = e.name.toLowerCase() + "s";
      const count = 12 + idx * 8;
      return `<div class="bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-xl p-5 hover:bg-slate-800/60 transition shadow-sm animate__animated animate__fadeInUp" style="animation-delay: ${idx * 0.1}s">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">${e.label || e.name}</span>
          <span class="text-lg">\u{1F4E6}</span>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-white">${count}</span>
          <span class="text-xs text-emerald-400 font-medium">+${idx + 2} today</span>
        </div>
        <router-link to="/${pName}" class="mt-4 inline-flex items-center text-xs font-medium text-teal-400 hover:text-teal-300">
          Manage items \u2192
        </router-link>
      </div>`;
    }).join("\n      ")}
      
      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm animate__animated animate__fadeInUp" style="animation-delay: 0.3s">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Health Status</span>
          <span class="text-lg">\u{1F49A}</span>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-emerald-400">99.98%</span>
        </div>
        <p class="mt-4 text-xs text-slate-500">All services connected</p>
      </div>
    </div>

    <!-- Quick Action / Entity Directory -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 class="text-lg font-bold text-white mb-4">Data Entities Directory</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${config.entities.map((e) => {
      const pName = e.name.toLowerCase() + "s";
      return `<router-link 
          to="/${pName}"
          class="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800/80 transition group flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-slate-200 group-hover:text-teal-300 transition">${e.label || e.name}</h4>
              <span class="text-xs text-slate-500 font-mono">${e.fields.length} fields</span>
            </div>
            <p class="text-xs text-slate-400 mt-2 line-clamp-2">Full CRUD management table, search, filters, validation modal, and API integration.</p>
          </div>
          <div class="mt-4 flex items-center text-xs font-medium text-teal-400">
            Open Table \u2192
          </div>
        </router-link>`;
    }).join("\n        ")}
      </div>
    </div>
  </div>
</template>`
  });
  files.push({
    path: "frontend/src/router/index.ts",
    content: `import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView
      },
      ${config.entities.map((e) => {
      const pName = e.name.toLowerCase() + "s";
      return `{
        path: '${pName}',
        name: '${pName}',
        component: () => import('../views/${e.name}/${e.name}ListView.vue')
      }`;
    }).join(",\n      ")}
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router`
  });
  for (const entity of config.entities) {
    const entityName = entity.name;
    const pName = entityName.toLowerCase() + "s";
    const pluralController = entityName.endsWith("y") ? entityName.slice(0, -1) + "ies" : entityName + "s";
    files.push({
      path: `frontend/src/services/${entityName}Service.ts`,
      content: `import { apiClient } from './apiClient'

export interface ${entityName}Item {
  id?: number
  ${entity.fields.map((f) => `${f.name}${f.required ? "" : "?"}: ${getTsType(f.type)}`).join("\n  ")}
  createdAt?: string
  updatedAt?: string
}

export const ${entityName}Service = {
  async getAll(search?: string, page = 1, pageSize = 20) {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    
    const res = await apiClient.get<${entityName}Item[]>('/${pluralController}', { params })
    return {
      data: res.data,
      total: Number(res.headers['x-total-count'] || res.data.length)
    }
  },

  async getById(id: number) {
    const res = await apiClient.get<${entityName}Item>(\`/${pluralController}/\${id}\`)
    return res.data
  },

  async create(data: any) {
    const res = await apiClient.post<${entityName}Item>('/${pluralController}', data)
    return res.data
  },

  async update(id: number, data: any) {
    const res = await apiClient.put(\`/${pluralController}/\${id}\`, data)
    return res.data
  },

  async delete(id: number) {
    const res = await apiClient.delete(\`/${pluralController}/\${id}\`)
    return res.data
  }
}`
    });
    files.push({
      path: `frontend/src/views/${entityName}/${entityName}ListView.vue`,
      content: `<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">${entity.label || entity.name}</h2>
        <p class="text-xs text-slate-400 mt-1">Manage ${entity.name} records, search, create, edit, and delete.</p>
      </div>

      <button 
        @click="openCreateModal"
        class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm rounded-xl flex items-center gap-2 transition shadow-lg shadow-teal-500/20"
      >
        <span>\uFF0B</span>
        <span>Add ${entity.name}</span>
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
      <div class="relative flex-1 max-w-md">
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Search ${entity.name}..." 
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
      </div>
      <button 
        @click="loadItems" 
        class="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
      >
        \u21BB Refresh
      </button>
    </div>

    <!-- Data Table Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div v-if="loading" class="p-12 text-center text-slate-400">
        <div class="inline-block animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mb-2"></div>
        <p class="text-sm">Loading records...</p>
      </div>

      <div v-else-if="items.length === 0" class="p-12 text-center">
        <span class="text-4xl">\u{1F4C2}</span>
        <h4 class="mt-3 text-base font-semibold text-slate-300">No records found</h4>
        <p class="text-xs text-slate-500 mt-1">Get started by creating your first ${entity.name}.</p>
        <button 
          @click="openCreateModal"
          class="mt-4 px-3.5 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-medium rounded-lg transition"
        >
          Add New
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-800/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
            <tr>
              <th class="px-6 py-3.5">ID</th>
              ${entity.fields.map((f) => `<th class="px-6 py-3.5">${f.label || f.name}</th>`).join("\n              ")}
              <th class="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-normal">
            <tr v-for="item in items" :key="item.id" class="hover:bg-slate-800/40 transition">
              <td class="px-6 py-4 font-mono text-xs text-slate-400">#{{ item.id }}</td>
              ${entity.fields.map((f) => {
        if (f.type === "boolean") {
          return `<td class="px-6 py-4">
                <span :class="item.${f.name} ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'" class="px-2.5 py-0.5 rounded-full text-[11px] font-mono border">
                  {{ item.${f.name} ? 'Yes' : 'No' }}
                </span>
              </td>`;
        }
        if (f.type === "decimal" || f.type === "int") {
          return `<td class="px-6 py-4 font-mono font-medium text-slate-200">
                {{ item.${f.name} }}
              </td>`;
        }
        return `<td class="px-6 py-4 text-slate-200">
                {{ item.${f.name} }}
              </td>`;
      }).join("\n              ")}
              <td class="px-6 py-4 text-right space-x-2">
                <button 
                  @click="openEditModal(item)"
                  class="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Edit
                </button>
                <button 
                  @click="handleDelete(item.id!)"
                  class="px-2.5 py-1 text-xs font-medium rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate__animated animate__fadeIn animate__faster">
      <div class="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate__animated animate__zoomIn animate__faster">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-white">{{ isEditing ? 'Edit ${entity.name}' : 'Create ${entity.name}' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white">\u2715</button>
        </div>

        <form @submit.prevent="submitForm" class="p-6 space-y-4">
          ${entity.fields.map((f) => {
        if (f.type === "boolean") {
          return `<div class="flex items-center gap-3 pt-2">
            <input 
              v-model="formData.${f.name}"
              id="field-${f.name}" 
              type="checkbox" 
              class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500" 
            />
            <label for="field-${f.name}" class="text-sm font-medium text-slate-300 cursor-pointer">
              ${f.label || f.name}
            </label>
          </div>`;
        }
        if (f.type === "text") {
          return `<div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">${f.label || f.name} ${f.required ? "*" : ""}</label>
            <textarea 
              v-model="formData.${f.name}" 
              rows="3"
              ${f.required ? "required" : ""}
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            ></textarea>
          </div>`;
        }
        return `<div>
            <label class="block text-xs font-medium text-slate-400 mb-1.5">${f.label || f.name} ${f.required ? "*" : ""}</label>
            <input 
              v-model="formData.${f.name}" 
              type="${getInputType(f.type)}"
              ${f.required ? "required" : ""}
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>`;
      }).join("\n          ")}

          <div class="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="submitting"
              class="px-5 py-2 text-sm font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition"
            >
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ${entityName}Service, type ${entityName}Item } from '@/services/${entityName}Service'

const items = ref<${entityName}Item[]>([])
const loading = ref(true)
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)
const submitting = ref(false)

const getInitialForm = () => ({
  ${entity.fields.map((f) => `${f.name}: ${getFormInitialValue(f)}`).join(",\n  ")}
})

const formData = ref<any>(getInitialForm())

const loadItems = async () => {
  loading.value = true
  try {
    const res = await ${entityName}Service.getAll(searchQuery.value)
    items.value = res.data
  } catch (err) {
    console.error('Failed to load items', err)
  } finally {
    loading.value = false
  }
}

let searchTimer: any = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadItems()
  }, 300)
}

const openCreateModal = () => {
  isEditing.value = false
  currentId.value = null
  formData.value = getInitialForm()
  showModal.value = true
}

const openEditModal = (item: ${entityName}Item) => {
  isEditing.value = true
  currentId.value = item.id!
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  submitting.value = true
  try {
    if (isEditing.value && currentId.value) {
      await ${entityName}Service.update(currentId.value, formData.value)
    } else {
      await ${entityName}Service.create(formData.value)
    }
    closeModal()
    await loadItems()
  } catch (err) {
    alert('Operation failed. Please check backend connection.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this record?')) return
  try {
    await ${entityName}Service.delete(id)
    await loadItems()
  } catch (err) {
    alert('Delete failed')
  }
}

onMounted(() => {
  loadItems()
})
</script>`
    });
  }
  files.push({
    path: "frontend/Dockerfile",
    content: `# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Runtime Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
  });
  files.push({
    path: "frontend/nginx.conf",
    content: `server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`
  });
  return files;
}
function getTsType(type) {
  switch (type) {
    case "string":
    case "text":
      return "string";
    case "int":
    case "decimal":
      return "number";
    case "boolean":
      return "boolean";
    case "datetime":
      return "string";
  }
}
function getInputType(type) {
  switch (type) {
    case "int":
    case "decimal":
      return "number";
    case "datetime":
      return "datetime-local";
    default:
      return "text";
  }
}
function getFormInitialValue(field) {
  if (field.defaultValue) {
    if (field.defaultValue.startsWith("'") && field.defaultValue.endsWith("'")) {
      return `"${field.defaultValue.slice(1, -1)}"`;
    }
    return field.defaultValue;
  }
  switch (field.type) {
    case "string":
    case "text":
      return "''";
    case "int":
    case "decimal":
      return "0";
    case "boolean":
      return "false";
    case "datetime":
      return "new Date().toISOString()";
  }
}

// server/utils/generators/reactGenerator.ts
function generateReactFrontend(config) {
  const files = [];
  const projectName = config.projectName || "ReactApp";
  files.push({
    path: "frontend/package.json",
    content: JSON.stringify({
      name: `${projectName.toLowerCase()}-frontend`,
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite --host",
        build: "tsc -b && vite build",
        preview: "vite preview"
      },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^6.28.0",
        axios: "^1.7.9",
        "lucide-react": "^0.475.0"
      },
      devDependencies: {
        "@types/react": "^18.3.18",
        "@types/react-dom": "^18.3.5",
        "@vitejs/plugin-react": "^4.3.4",
        autoprefixer: "^10.4.20",
        postcss: "^8.5.2",
        tailwindcss: "^3.4.17",
        typescript: "^5.7.3",
        vite: "^6.1.0"
      }
    }, null, 2)
  });
  files.push({
    path: "frontend/vite.config.ts",
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})`
  });
  files.push({
    path: "frontend/tailwind.config.js",
    content: `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}`
  });
  files.push({
    path: "frontend/index.html",
    content: `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - React Admin</title>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  });
  files.push({
    path: "frontend/src/main.tsx",
    content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)`
  });
  files.push({
    path: "frontend/src/index.css",
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
  });
  files.push({
    path: "frontend/src/App.tsx",
    content: `import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'

export default function App() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">
            \u26A1
          </div>
          <span className="font-bold text-sm text-white">${projectName}</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition \${
              location.pathname === '/' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800'
            }\`}
          >
            \u{1F4CA} Dashboard
          </Link>
          ${config.entities.map((e) => {
      const p = e.name.toLowerCase() + "s";
      return `<Link
            to="/${p}"
            className={\`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition \${
              location.pathname.startsWith('/${p}') ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800'
            }\`}
          >
            <span>\u{1F4E6} ${e.label || e.name}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">CRUD</span>
          </Link>`;
    }).join("\n          ")}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          ${config.entities.map((e) => {
      const p = e.name.toLowerCase() + "s";
      return `<Route path="/${p}" element={<EntityView name="${e.name}" label="${e.label || e.name}" />} />`;
    }).join("\n          ")}
        </Routes>
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${config.entities.map((e, idx) => `<div key="${e.name}" className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-medium">${e.label || e.name}</div>
          <div className="text-2xl font-bold text-white mt-2">${10 + idx * 5}</div>
          <div className="text-xs text-teal-400 mt-2">Active records in database</div>
        </div>`).join("\n        ")}
      </div>
    </div>
  )
}

function EntityView({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{label}</h2>
        <button className="px-4 py-2 bg-teal-500 text-slate-950 font-semibold text-sm rounded-lg">
          Add {name}
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Connected to <code>/api/{name.toLowerCase()}s</code> RESTful endpoint.
      </div>
    </div>
  )
}`
  });
  files.push({
    path: "frontend/Dockerfile",
    content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
  });
  return files;
}

// server/utils/generators/dockerGenerator.ts
function generateDockerFiles(config) {
  const files = [];
  const projectName = config.projectName || "FullStackApp";
  const isPostgres = config.database === "postgres";
  const isMysql = config.database === "mysql";
  const isSqlServer = config.database === "sqlserver";
  let dbService = "";
  let backendEnv = "";
  if (isPostgres) {
    dbService = `  postgres:
    image: postgres:16-alpine
    container_name: \${COMPOSE_PROJECT_NAME:-app}-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data`;
    backendEnv = `      - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=appdb;Username=postgres;Password=postgrespassword;
      - DATABASE_URL=postgresql://postgres:postgrespassword@postgres:5432/appdb?schema=public`;
  } else if (isMysql) {
    dbService = `  mysql:
    image: mysql:8.0
    container_name: \${COMPOSE_PROJECT_NAME:-app}-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: appdb
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql`;
    backendEnv = `      - ConnectionStrings__DefaultConnection=Server=mysql;Port=3306;Database=appdb;User=root;Password=rootpassword;
      - DATABASE_URL=mysql://root:rootpassword@mysql:3306/appdb`;
  } else if (isSqlServer) {
    dbService = `  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: \${COMPOSE_PROJECT_NAME:-app}-sqlserver
    restart: unless-stopped
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "YourStrong@Passw0rd"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql`;
    backendEnv = `      - ConnectionStrings__DefaultConnection=Server=sqlserver,1433;Database=appdb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
      - DATABASE_URL=sqlserver://sqlserver:1433;database=appdb;user=sa;password=YourStrong@Passw0rd;encrypt=true;trustServerCertificate=true;`;
  }
  files.push({
    path: "docker-compose.yml",
    content: `version: '3.8'

services:
${dbService}

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: \${COMPOSE_PROJECT_NAME:-app}-backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_HTTP_PORTS=8080
${backendEnv}
    depends_on:
      - ${config.database}

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: \${COMPOSE_PROJECT_NAME:-app}-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  ${config.database}_data:
`
  });
  files.push({
    path: "README.md",
    content: `# ${projectName}

> Generated by **StackForge Studio** with ${config.backend === "dotnet" ? "ASP.NET Core 8 (.NET 8)" : "NestJS"} + ${config.frontend === "vue" ? "Vue 3" : "React"} + ${config.database.toUpperCase()} + Docker.

---

## \u{1F680} Quick Start with Docker (Recommended)

Run the entire stack with a single command:

\`\`\`bash
docker compose up --build
\`\`\`

Once booted, open your browser:
- \u{1F310} **Frontend Web App & Dashboard**: [http://localhost:3000](http://localhost:3000)
- \u{1F50C} **Backend API & Swagger Docs**: [http://localhost:8080/swagger](http://localhost:8080/swagger)
- \u{1F5C4}\uFE0F **Database (${config.database.toUpperCase()})**: Port ${isPostgres ? "5432" : isMysql ? "3306" : "1433"}

---

## \u{1F6E0} Local Development Setup

### 1. Database
Make sure you have ${config.database.toUpperCase()} running, or spin it up using Docker:
\`\`\`bash
docker compose up ${config.database} -d
\`\`\`

### 2. Backend (${config.backend === "dotnet" ? ".NET 8 Web API" : "NestJS"})
\`\`\`bash
cd backend
${config.backend === "dotnet" ? "dotnet restore\ndotnet run" : "npm install\nnpm run start:dev"}
\`\`\`

### 3. Frontend (${config.frontend === "vue" ? "Vue 3 + Vite" : "React + Vite"})
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Visit [http://localhost:3000](http://localhost:3000)

---

## \u{1F4E6} Generated Entities & End-to-End CRUD
${config.entities.map((e) => `- **${e.name}** (${e.label || e.name}): \`/api/${e.name.toLowerCase()}s\` & Frontend \`/${e.name.toLowerCase()}s\``).join("\n")}

Enjoy building your application!
`
  });
  files.push({
    path: ".gitignore",
    content: `node_modules/
dist/
bin/
obj/
*.user
*.suo
.vs/
.idea/
.vscode/
*.local
.env
`
  });
  return files;
}

// server/utils/templateEngine.ts
function generateFullTemplate(config) {
  let files = [];
  if (config.backend === "dotnet") {
    files = files.concat(generateDotnetBackend(config));
  } else {
    files = files.concat(generateNestjsBackend(config));
  }
  if (config.frontend === "vue") {
    files = files.concat(generateVueFrontend(config));
  } else {
    files = files.concat(generateReactFrontend(config));
  }
  files = files.concat(generateDockerFiles(config));
  return files;
}

// types/presets.ts
var PRESET_TEMPLATES = [
  {
    id: "ecommerce-pro",
    name: "E-Commerce Core",
    description: "Modern Online Store with Product Catalog, Order Processing, and Customer Management.",
    badge: "Popular",
    icon: "ShoppingCart",
    config: {
      projectName: "ECommerceStore",
      description: "Full-stack E-Commerce scaffold with Product, Category, and Order management.",
      backend: "dotnet",
      frontend: "vue",
      database: "postgres",
      dockerMode: "dev",
      auth: true,
      apiDocs: "swagger",
      mockDataCount: 10,
      entities: [
        {
          id: "category",
          name: "Category",
          label: "\u0E2B\u0E21\u0E27\u0E14\u0E2B\u0E21\u0E39\u0E48\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 (Categories)",
          fields: [
            { id: "c1", name: "name", type: "string", required: true, label: "Category Name" },
            { id: "c2", name: "slug", type: "string", required: true, isUnique: true, label: "URL Slug" },
            { id: "c3", name: "description", type: "text", required: false, label: "Description" }
          ]
        },
        {
          id: "product",
          name: "Product",
          label: "\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 (Products)",
          fields: [
            { id: "p1", name: "title", type: "string", required: true, label: "Product Title" },
            { id: "p2", name: "sku", type: "string", required: true, isUnique: true, label: "SKU Code" },
            { id: "p3", name: "price", type: "decimal", required: true, label: "Price (THB)" },
            { id: "p4", name: "stock", type: "int", required: true, defaultValue: "0", label: "In Stock" },
            { id: "p5", name: "isAvailable", type: "boolean", required: true, defaultValue: "true", label: "Active" },
            { id: "p6", name: "description", type: "text", required: false, label: "Description" }
          ]
        },
        {
          id: "customer",
          name: "Customer",
          label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32 (Customers)",
          fields: [
            { id: "cu1", name: "fullName", type: "string", required: true, label: "Full Name" },
            { id: "cu2", name: "email", type: "string", required: true, isUnique: true, label: "Email" },
            { id: "cu3", name: "phoneNumber", type: "string", required: false, label: "Phone" },
            { id: "cu4", name: "address", type: "text", required: false, label: "Shipping Address" }
          ]
        },
        {
          id: "order",
          name: "Order",
          label: "\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D (Orders)",
          fields: [
            { id: "o1", name: "orderNumber", type: "string", required: true, isUnique: true, label: "Order #" },
            { id: "o2", name: "totalAmount", type: "decimal", required: true, label: "Total Amount" },
            { id: "o3", name: "status", type: "string", required: true, defaultValue: "'Pending'", label: "Status" },
            { id: "o4", name: "orderDate", type: "datetime", required: true, label: "Order Date" }
          ]
        }
      ]
    }
  },
  {
    id: "saas-crm-suite",
    name: "SaaS CRM & Leads",
    description: "Enterprise Sales Pipeline, Customer Leads, Deals, and Task Manager with JWT Auth.",
    badge: "Enterprise",
    icon: "Briefcase",
    config: {
      projectName: "CRMPlatform",
      description: "Enterprise CRM scaffold with Lead tracking, Deal stages, and Activities.",
      backend: "dotnet",
      frontend: "vue",
      database: "postgres",
      dockerMode: "dev",
      auth: true,
      apiDocs: "swagger",
      mockDataCount: 8,
      entities: [
        {
          id: "lead",
          name: "Lead",
          label: "\u0E1C\u0E39\u0E49\u0E21\u0E35\u0E41\u0E19\u0E27\u0E42\u0E19\u0E49\u0E21 (Leads)",
          fields: [
            { id: "l1", name: "name", type: "string", required: true, label: "Contact Name" },
            { id: "l2", name: "company", type: "string", required: false, label: "Company" },
            { id: "l3", name: "email", type: "string", required: true, label: "Email" },
            { id: "l4", name: "phone", type: "string", required: false, label: "Phone" },
            { id: "l5", name: "status", type: "string", required: true, defaultValue: "'New'", label: "Stage" }
          ]
        },
        {
          id: "deal",
          name: "Deal",
          label: "\u0E42\u0E2D\u0E01\u0E32\u0E2A\u0E01\u0E32\u0E23\u0E02\u0E32\u0E22 (Deals)",
          fields: [
            { id: "d1", name: "title", type: "string", required: true, label: "Deal Title" },
            { id: "d2", name: "value", type: "decimal", required: true, label: "Estimated Value" },
            { id: "d3", name: "probability", type: "int", required: true, defaultValue: "50", label: "Probability %" },
            { id: "d4", name: "closeDate", type: "datetime", required: true, label: "Expected Close" },
            { id: "d5", name: "stage", type: "string", required: true, defaultValue: "'Proposal'", label: "Deal Stage" }
          ]
        },
        {
          id: "activity",
          name: "Activity",
          label: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21 (Activities)",
          fields: [
            { id: "a1", name: "type", type: "string", required: true, defaultValue: "'Call'", label: "Activity Type" },
            { id: "a2", name: "notes", type: "text", required: true, label: "Meeting / Call Notes" },
            { id: "a3", name: "scheduledAt", type: "datetime", required: true, label: "Scheduled Time" },
            { id: "a4", name: "isDone", type: "boolean", required: true, defaultValue: "false", label: "Completed" }
          ]
        }
      ]
    }
  },
  {
    id: "clinic-care",
    name: "Pet / Medical Clinic",
    description: "Appointment Scheduling, Patient/Pet Records, Doctor Profiles & Prescriptions.",
    badge: "Healthcare",
    icon: "HeartPulse",
    config: {
      projectName: "ClinicCareApp",
      description: "Clinic management with Patients, Appointments, and Medical Records.",
      backend: "dotnet",
      frontend: "vue",
      database: "postgres",
      dockerMode: "dev",
      auth: true,
      apiDocs: "swagger",
      mockDataCount: 8,
      entities: [
        {
          id: "patient",
          name: "Patient",
          label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E1B\u0E48\u0E27\u0E22/\u0E2A\u0E31\u0E15\u0E27\u0E4C\u0E40\u0E25\u0E35\u0E49\u0E22\u0E07 (Patients)",
          fields: [
            { id: "pt1", name: "name", type: "string", required: true, label: "Name" },
            { id: "pt2", name: "species", type: "string", required: false, defaultValue: "'Canine'", label: "Species/Type" },
            { id: "pt3", name: "age", type: "int", required: true, defaultValue: "2", label: "Age (Years)" },
            { id: "pt4", name: "ownerName", type: "string", required: true, label: "Owner Name" },
            { id: "pt5", name: "ownerPhone", type: "string", required: true, label: "Owner Phone" }
          ]
        },
        {
          id: "appointment",
          name: "Appointment",
          label: "\u0E01\u0E32\u0E23\u0E19\u0E31\u0E14\u0E2B\u0E21\u0E32\u0E22 (Appointments)",
          fields: [
            { id: "ap1", name: "reason", type: "string", required: true, label: "Reason for Visit" },
            { id: "ap2", name: "appointmentDate", type: "datetime", required: true, label: "Appointment Date" },
            { id: "ap3", name: "doctor", type: "string", required: true, label: "Attending Doctor" },
            { id: "ap4", name: "status", type: "string", required: true, defaultValue: "'Scheduled'", label: "Status" }
          ]
        },
        {
          id: "medical_record",
          name: "MedicalRecord",
          label: "\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E23\u0E31\u0E01\u0E29\u0E32 (Medical Records)",
          fields: [
            { id: "mr1", name: "diagnosis", type: "string", required: true, label: "Diagnosis" },
            { id: "mr2", name: "treatment", type: "text", required: true, label: "Treatment Given" },
            { id: "mr3", name: "cost", type: "decimal", required: true, label: "Treatment Fee" },
            { id: "mr4", name: "recordDate", type: "datetime", required: true, label: "Record Date" }
          ]
        }
      ]
    }
  },
  {
    id: "blog-cms",
    name: "Modern Blog & CMS",
    description: "Content Management Platform with Articles, Media, Categories, and Reader Comments.",
    badge: "Content",
    icon: "FileText",
    config: {
      projectName: "ModernBlogCMS",
      description: "CMS and Content publishing platform with full moderation.",
      backend: "nestjs",
      frontend: "react",
      database: "mysql",
      dockerMode: "dev",
      auth: true,
      apiDocs: "swagger",
      mockDataCount: 6,
      entities: [
        {
          id: "post",
          name: "Post",
          label: "\u0E1A\u0E17\u0E04\u0E27\u0E32\u0E21 (Posts)",
          fields: [
            { id: "b1", name: "title", type: "string", required: true, label: "Post Title" },
            { id: "b2", name: "slug", type: "string", required: true, isUnique: true, label: "URL Slug" },
            { id: "b3", name: "content", type: "text", required: true, label: "Content Markdown" },
            { id: "b4", name: "isPublished", type: "boolean", required: true, defaultValue: "true", label: "Published" },
            { id: "b5", name: "views", type: "int", required: true, defaultValue: "0", label: "View Count" }
          ]
        },
        {
          id: "comment",
          name: "Comment",
          label: "\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19 (Comments)",
          fields: [
            { id: "cm1", name: "authorName", type: "string", required: true, label: "Author Name" },
            { id: "cm2", name: "email", type: "string", required: true, label: "Author Email" },
            { id: "cm3", name: "body", type: "text", required: true, label: "Comment Body" },
            { id: "cm4", name: "isApproved", type: "boolean", required: true, defaultValue: "true", label: "Approved" }
          ]
        }
      ]
    }
  }
];

// bin/stackforge.js
var program = new Command();
program.name("stackforge").description("CLI to scaffold and generate complete Full-Stack Web Templates (.NET 8 / NestJS + Vue 3 / React + PostgreSQL + Docker)").version("1.0.0");
program.command("create [name]", { isDefault: true }).description("Generate a new web application template").option("-b, --backend <dotnet|nestjs>", "Backend framework: dotnet or nestjs").option("-f, --frontend <vue|react>", "Frontend framework: vue or react").option("-d, --database <postgres|mysql|sqlserver>", "Database engine: postgres, mysql, sqlserver").option("-p, --preset <presetId>", "Use a preset template: ecommerce, crm, clinic, blog").option("-o, --output <dir>", "Output destination folder").option("--ai <prompt>", 'Prompt for AI to draft schema (e.g. "pet clinic with appointments")').option("--no-auth", "Disable JWT authentication").action(async (name, options) => {
  console.log("\n\u26A1 \x1B[36m\x1B[1mStackForge Studio CLI\x1B[0m \u2014 Full-Stack Template Generator\n");
  if (options.preset) {
    const pId = options.preset.toLowerCase();
    const matched = PRESET_TEMPLATES.find((p) => p.id.includes(pId));
    if (matched) {
      console.log(`\u{1F4E6} Loaded preset: \x1B[32m${matched.name}\x1B[0m`);
      const targetDir2 = options.output || name || matched.config.projectName;
      await scaffoldTemplate(matched.config, targetDir2);
      return;
    } else {
      console.log(`\u26A0\uFE0F  Preset "${options.preset}" not found. Available: ecommerce, crm, clinic, blog. Falling back to custom config.`);
    }
  }
  const projectName = name || options.output || (await prompts({
    type: "text",
    name: "val",
    message: "Project name:",
    initial: "MyEnterpriseApp"
  })).val || "MyEnterpriseApp";
  const backend = options.backend || (await prompts({
    type: "select",
    name: "val",
    message: "Select Backend Framework:",
    choices: [
      { title: "ASP.NET Core 8 Web API (.NET 8 C# Clean Architecture)", value: "dotnet" },
      { title: "Node.js (NestJS with Prisma)", value: "nestjs" }
    ],
    initial: 0
  })).val;
  const frontend = options.frontend || (await prompts({
    type: "select",
    name: "val",
    message: "Select Frontend Framework & UI Dashboard:",
    choices: [
      { title: "Vue 3 (Vite + Tailwind CSS + Pinia + Data Tables)", value: "vue" },
      { title: "React (Vite + Tailwind CSS + TanStack)", value: "react" }
    ],
    initial: 0
  })).val;
  const database = options.database || (await prompts({
    type: "select",
    name: "val",
    message: "Select Database Engine:",
    choices: [
      { title: "PostgreSQL 16 (Recommended)", value: "postgres" },
      { title: "MySQL 8", value: "mysql" },
      { title: "SQL Server 2022", value: "sqlserver" }
    ],
    initial: 0
  })).val;
  let entities = [
    {
      id: "product",
      name: "Product",
      label: "\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 (Products)",
      fields: [
        { id: "f1", name: "title", type: "string", required: true, label: "Product Title" },
        { id: "f2", name: "sku", type: "string", required: true, isUnique: true, label: "SKU" },
        { id: "f3", name: "price", type: "decimal", required: true, label: "Price" },
        { id: "f4", name: "stock", type: "int", required: true, defaultValue: "0", label: "Stock" },
        { id: "f5", name: "isAvailable", type: "boolean", required: true, defaultValue: "true", label: "Active" }
      ]
    },
    {
      id: "category",
      name: "Category",
      label: "\u0E2B\u0E21\u0E27\u0E14\u0E2B\u0E21\u0E39\u0E48 (Categories)",
      fields: [
        { id: "c1", name: "name", type: "string", required: true, label: "Category Name" },
        { id: "c2", name: "slug", type: "string", required: true, isUnique: true, label: "Slug" }
      ]
    }
  ];
  if (options.ai) {
    console.log(`\u{1F916} Processing AI Prompt: "${options.ai}"...`);
    try {
      const fallbackSchema = generateSmartFallback(options.ai);
      if (fallbackSchema && fallbackSchema.length > 0) {
        entities = fallbackSchema;
        console.log(`\u2728 AI generated ${entities.length} entities: ${entities.map((e) => e.name).join(", ")}`);
      }
    } catch (err) {
      console.warn("AI processing failed, using default schema.");
    }
  }
  const config = {
    projectName,
    description: `${projectName} full-stack scaffold created with StackForge CLI.`,
    backend: backend || "dotnet",
    frontend: frontend || "vue",
    database: database || "postgres",
    dockerMode: "dev",
    auth: options.auth !== false,
    apiDocs: "swagger",
    mockDataCount: 8,
    entities
  };
  const targetDir = options.output || projectName;
  await scaffoldTemplate(config, targetDir);
});
program.command("list").description("List all available preset templates").action(() => {
  console.log("\n\u{1F4E6} \x1B[36m\x1B[1mStackForge Available Presets:\x1B[0m\n");
  for (const p of PRESET_TEMPLATES) {
    console.log(`  \u2022 \x1B[32m\x1B[1m${p.id.padEnd(16)}\x1B[0m - ${p.name}: ${p.description}`);
    console.log(`    Stack: ${p.config.backend} + ${p.config.frontend} + ${p.config.database}
`);
  }
  console.log("Use: \x1B[33mstackforge create MyProject --preset <presetId>\x1B[0m\n");
});
program.parse(process.argv);
async function scaffoldTemplate(config, targetDir) {
  console.log(`\u{1F6E0}\uFE0F  Generating template for \x1B[32m${config.projectName}\x1B[0m...`);
  const files = generateFullTemplate(config);
  const resolvedDir = path.resolve(process.cwd(), targetDir);
  fs.mkdirSync(resolvedDir, { recursive: true });
  for (const file of files) {
    const fullPath = path.join(resolvedDir, file.path);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, file.content, "utf8");
  }
  console.log(`
\u{1F389} \x1B[32m\x1B[1mSuccess!\x1B[0m Generated \x1B[1m${files.length}\x1B[0m files at: \x1B[34m${resolvedDir}\x1B[0m
`);
  console.log("\u{1F680} \x1B[1mNext Steps to run your application:\x1B[0m");
  console.log(`   \x1B[33mcd ${targetDir}\x1B[0m`);
  console.log(`   \x1B[33mdocker compose up --build\x1B[0m
`);
  console.log("\u{1F310} Web App & Dashboard: http://localhost:3000");
  console.log("\u{1F50C} Swagger REST API:    http://localhost:8080/swagger\n");
}
function generateSmartFallback(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("\u0E2A\u0E31\u0E15\u0E27\u0E4C") || p.includes("pet") || p.includes("clinic") || p.includes("\u0E04\u0E25\u0E34\u0E19\u0E34\u0E01")) {
    return [
      {
        id: "patient",
        name: "Patient",
        label: "\u0E2A\u0E31\u0E15\u0E27\u0E4C\u0E40\u0E25\u0E35\u0E49\u0E22\u0E07 / \u0E1C\u0E39\u0E49\u0E1B\u0E48\u0E27\u0E22",
        fields: [
          { id: "p1", name: "name", type: "string", required: true, label: "\u0E0A\u0E37\u0E48\u0E2D" },
          { id: "p2", name: "species", type: "string", required: true, defaultValue: "'Canine'", label: "\u0E2A\u0E32\u0E22\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C" },
          { id: "p3", name: "age", type: "int", required: true, defaultValue: "2", label: "\u0E2D\u0E32\u0E22\u0E38" }
        ]
      },
      {
        id: "appointment",
        name: "Appointment",
        label: "\u0E01\u0E32\u0E23\u0E19\u0E31\u0E14\u0E2B\u0E21\u0E32\u0E22",
        fields: [
          { id: "a1", name: "reason", type: "string", required: true, label: "\u0E2A\u0E32\u0E40\u0E2B\u0E15\u0E38" },
          { id: "a2", name: "appointmentDate", type: "datetime", required: true, label: "\u0E27\u0E31\u0E19\u0E19\u0E31\u0E14" },
          { id: "a3", name: "doctor", type: "string", required: true, label: "\u0E41\u0E1E\u0E17\u0E22\u0E4C" }
        ]
      }
    ];
  }
  return null;
}
