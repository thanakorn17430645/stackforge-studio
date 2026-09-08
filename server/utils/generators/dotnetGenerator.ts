import type { TemplateConfig, GeneratedFile, EntityModel, EntityField } from '~/types/template'

export function generateDotnetBackend(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const projectName = config.projectName || 'BackendApp'
  const isPostgres = config.database === 'postgres'
  const isMysql = config.database === 'mysql'
  const isSqlServer = config.database === 'sqlserver'

  // 1. Project .csproj
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
    ${isPostgres ? '<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.4" />' : ''}
    ${isMysql ? '<PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.2" />' : ''}
    ${isSqlServer ? '<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.8" />' : ''}
    ${config.auth ? `<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />` : ''}
  </ItemGroup>
</Project>`
  })

  // 2. Program.cs
  files.push({
    path: `backend/Program.cs`,
    content: `using Microsoft.EntityFrameworkCore;
${config.auth ? 'using Microsoft.AspNetCore.Authentication.JwtBearer;\nusing Microsoft.IdentityModel.Tokens;\nusing System.Text;\n' : ''}using ${projectName}.Data;

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
    });` : ''}
});

// Configure Database Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("DefaultConnection string not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    ${isPostgres ? 'options.UseNpgsql(connectionString);' : ''}
    ${isMysql ? 'options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));' : ''}
    ${isSqlServer ? 'options.UseSqlServer(connectionString);' : ''}
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
` : ''}
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

${config.auth ? 'app.UseAuthentication();\napp.UseAuthorization();\n' : ''}
app.MapControllers();

app.Run();`
  })

  // 3. appsettings.json
  const defaultDbConn = isPostgres 
    ? 'Host=postgres;Port=5432;Database=appdb;Username=postgres;Password=postgres;'
    : isMysql 
      ? 'Server=mysql;Port=3306;Database=appdb;User=root;Password=root;'
      : 'Server=sqlserver,1433;Database=appdb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;'

  files.push({
    path: `backend/appsettings.json`,
    content: JSON.stringify({
      Logging: {
        LogLevel: {
          Default: 'Information',
          'Microsoft.AspNetCore': 'Warning'
        }
      },
      AllowedHosts: '*',
      ConnectionStrings: {
        DefaultConnection: defaultDbConn
      },
      Jwt: {
        Secret: 'SuperSecretKeyForDevelopmentPhase123456789!'
      }
    }, null, 2)
  })

  // 4. Models and DTOs and Controllers for each Entity
  for (const entity of config.entities) {
    const entityName = entity.name
    const pluralName = entityName.endsWith('y') ? entityName.slice(0, -1) + 'ies' : entityName + 's'

    // Model
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

${entity.fields.map(f => `    ${f.required ? '[Required]\n    ' : ''}public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join('\n\n')}

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}`
    })

    // DTOs
    files.push({
      path: `backend/DTOs/${entityName}Dtos.cs`,
      content: `using System.ComponentModel.DataAnnotations;

namespace ${projectName}.DTOs;

public class Create${entityName}Dto
{
${entity.fields.map(f => `    ${f.required ? '[Required]\n    ' : ''}public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join('\n\n')}
}

public class Update${entityName}Dto
{
${entity.fields.map(f => `    ${f.required ? '[Required]\n    ' : ''}public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join('\n\n')}
}

public class ${entityName}ResponseDto
{
    public int Id { get; set; }
${entity.fields.map(f => `    public ${getDotnetType(f.type, f.required)} ${capitalize(f.name)} { get; set; }${getDefaultInitial(f.type, f.defaultValue)}`).join('\n')}
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}`
    })

    // Controller
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
                ${entity.fields.map(f => `${capitalize(f.name)} = x.${capitalize(f.name)},`).join('\n                ')}
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
            ${entity.fields.map(f => `${capitalize(f.name)} = item.${capitalize(f.name)},`).join('\n            ')}
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
            ${entity.fields.map(f => `${capitalize(f.name)} = dto.${capitalize(f.name)},`).join('\n            ')}
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.${pluralName}.Add(item);
        await _context.SaveChangesAsync();

        var response = new ${entityName}ResponseDto
        {
            Id = item.Id,
            ${entity.fields.map(f => `${capitalize(f.name)} = item.${capitalize(f.name)},`).join('\n            ')}
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

        ${entity.fields.map(f => `item.${capitalize(f.name)} = dto.${capitalize(f.name)};`).join('\n        ')}
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
    })
  }

  // 5. AppDbContext.cs
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

${config.entities.map(e => {
  const pName = e.name.endsWith('y') ? e.name.slice(0, -1) + 'ies' : e.name + 's'
  return `    public DbSet<${e.name}> ${pName} => Set<${e.name}>();`
}).join('\n')}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}`
  })

  // 6. DbInitializer.cs (Mock Data Seed)
  files.push({
    path: `backend/Data/DbInitializer.cs`,
    content: `using ${projectName}.Models;

namespace ${projectName}.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        ${config.entities.map(e => {
          const pName = e.name.endsWith('y') ? e.name.slice(0, -1) + 'ies' : e.name + 's'
          return `if (!context.${pName}.Any())
        {
            var items = new List<${e.name}>
            {
                ${generateMockEntities(e, config.mockDataCount || 5)}
            };
            context.${pName}.AddRange(items);
        }`
        }).join('\n\n        ')}

        context.SaveChangesAsync().Wait();
    }
}`
  })

  // 7. Backend Dockerfile
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
  })

  return files
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getDotnetType(type: FieldType, required: boolean): string {
  let t = 'string'
  switch (type) {
    case 'string':
    case 'text':
      t = 'string'
      break
    case 'int':
      t = 'int'
      break
    case 'decimal':
      t = 'decimal'
      break
    case 'boolean':
      t = 'bool'
      break
    case 'datetime':
      t = 'DateTime'
      break
  }
  return required ? t : `${t}?`
}

function getDefaultInitial(type: FieldType, defaultValue?: string): string {
  if (defaultValue) {
    if (type === 'string' || type === 'text') {
      if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
        return ` = "${defaultValue.slice(1, -1)}";`
      }
      if (!defaultValue.startsWith('"')) {
        return ` = "${defaultValue}";`
      }
    }
    return ` = ${defaultValue};`
  }
  if (type === 'string' || type === 'text') {
    return ' = string.Empty;'
  }
  return ''
}

function getSearchFilterSnippet(entity: EntityModel, pluralName: string): string {
  const strField = entity.fields.find(f => f.type === 'string' || f.type === 'text')
  if (!strField) return '// No string field for search'
  return `if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.${capitalize(strField.name)}.Contains(search));
        }`
}

function generateMockEntities(entity: EntityModel, count: number): string {
  const rows: string[] = []
  for (let i = 1; i <= Math.min(count, 5); i++) {
    const props = entity.fields.map(f => {
      const val = getMockValue(f, entity.name, i)
      return `${capitalize(f.name)} = ${val}`
    }).join(', ')
    rows.push(`new ${entity.name} { ${props} }`)
  }
  return rows.join(',\n                ')
}

function getMockValue(field: EntityField, entityName: string, index: number): string {
  switch (field.type) {
    case 'string':
      if (field.name.toLowerCase().includes('name') || field.name.toLowerCase().includes('title')) {
        return `"${entityName} Sample ${index}"`
      }
      if (field.name.toLowerCase().includes('email')) {
        return `"user${index}@example.com"`
      }
      if (field.name.toLowerCase().includes('phone')) {
        return `"081-234-567${index}"`
      }
      if (field.name.toLowerCase().includes('sku')) {
        return `"SKU-00${index}"`
      }
      if (field.name.toLowerCase().includes('status')) {
        return `"Active"`
      }
      return `"${capitalize(field.name)} ${index}"`
    case 'text':
      return `"Sample detailed description and notes for ${entityName} #${index}."`
    case 'int':
      return `${index * 10}`
    case 'decimal':
      return `${(index * 99.5).toFixed(2)}m`
    case 'boolean':
      return index % 2 === 1 ? 'true' : 'false'
    case 'datetime':
      return `DateTime.UtcNow.AddDays(-${index})`
  }
}
