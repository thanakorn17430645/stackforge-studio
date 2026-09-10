import type { TemplateConfig, GeneratedFile, EntityModel, EntityField } from '~/types/template'

export function generateGoBackend(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const projectName = config.projectName.toLowerCase() || 'goapp'

  // 1. go.mod
  files.push({
    path: 'backend/go.mod',
    content: `module ${projectName}-backend

go 1.22

require (
\tgithub.com/gin-contrib/cors v1.7.2
\tgithub.com/gin-gonic/gin v1.10.0
\tgorm.io/driver/postgres v1.5.9
\tgorm.io/driver/mysql v1.5.7
\tgorm.io/driver/sqlite v1.5.6
\tgorm.io/gorm v1.25.11
)
`
  })

  // 2. main.go
  files.push({
    path: 'backend/main.go',
    content: `package main

import (
\t"log"
\t"net/http"
\t"os"

\t"github.com/gin-contrib/cors"
\t"github.com/gin-gonic/gin"
\t"gorm.io/driver/postgres"
\t"gorm.io/driver/sqlite"
\t"gorm.io/gorm"
)

var DB *gorm.DB

func initDB() {
\tdsn := os.Getenv("DATABASE_URL")
\tvar err error
\tif dsn == "" {
\t\tDB, err = gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
\t} else {
\t\tDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
\t}
\tif err != nil {
\t\tlog.Fatalf("Failed to connect to database: %v", err)
\t}
\tlog.Println("Database connected successfully!")
}

func main() {
\tinitDB()

\tr := gin.Default()
\tr.Use(cors.Default())

\tr.GET("/health", func(c *gin.Context) {
\t\tc.JSON(http.StatusOK, gin.H{"status": "ok", "service": "${config.projectName} API"})
\t})

\t${config.entities.map(e => {
    const p = e.name.toLowerCase() + 's'
    return `register${e.name}Routes(r)`
  }).join('\n\t')}

\tport := os.Getenv("PORT")
\tif port == "" {
\t\tport = "8080"
\t}
\tr.Run(":" + port)
}
`
  })

  // 3. Entity Handlers & Models
  for (const entity of config.entities) {
    const eName = entity.name
    const pName = eName.toLowerCase() + 's'

    files.push({
      path: `backend/routes_${eName.toLowerCase()}.go`,
      content: `package main

import (
\t"net/http"
\t"time"

\t"github.com/gin-gonic/gin"
)

type ${eName} struct {
\tID        uint      \`gorm:"primaryKey" json:"id"\`
${entity.fields.map(f => `\t${capitalize(f.name)} ${getGoType(f.type)} \`json:"${f.name}"\``).join('\n')}
\tCreatedAt time.Time \`json:"createdAt"\`
\tUpdatedAt time.Time \`json:"updatedAt"\`
}

func register${eName}Routes(r *gin.Engine) {
\tDB.AutoMigrate(&${eName}{})

\tapi := r.Group("/api/${pName}")
\t{
\t\tapi.GET("", func(c *gin.Context) {
\t\t\tvar items []${eName}
\t\t\tDB.Order("id desc").Find(&items)
\t\t\tc.JSON(http.StatusOK, items)
\t\t})

\t\tapi.GET("/:id", func(c *gin.Context) {
\t\t\tvar item ${eName}
\t\t\tif err := DB.First(&item, c.Param("id")).Error; err != nil {
\t\t\t\tc.JSON(http.StatusNotFound, gin.H{"error": "${eName} not found"})
\t\t\t\treturn
\t\t\t}
\t\t\tc.JSON(http.StatusOK, item)
\t\t})

\t\tapi.POST("", func(c *gin.Context) {
\t\t\tvar item ${eName}
\t\t\tif err := c.ShouldBindJSON(&item); err != nil {
\t\t\t\tc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
\t\t\t\treturn
\t\t\t}
\t\t\tDB.Create(&item)
\t\t\tc.JSON(http.StatusCreated, item)
\t\t})

\t\tapi.PUT("/:id", func(c *gin.Context) {
\t\t\tvar item ${eName}
\t\t\tif err := DB.First(&item, c.Param("id")).Error; err != nil {
\t\t\t\tc.JSON(http.StatusNotFound, gin.H{"error": "${eName} not found"})
\t\t\t\treturn
\t\t\t}
\t\t\tc.ShouldBindJSON(&item)
\t\t\tDB.Save(&item)
\t\t\tc.JSON(http.StatusOK, item)
\t\t})

\t\tapi.DELETE("/:id", func(c *gin.Context) {
\t\t\tDB.Delete(&${eName}{}, c.Param("id"))
\t\t\tc.JSON(http.StatusOK, gin.H{"message": "${eName} deleted successfully"})
\t\t})
\t}
}
`
    })
  }

  // 4. Dockerfile
  files.push({
    path: 'backend/Dockerfile',
    content: `FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download || true

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
`
  })

  return files
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getGoType(type: EntityField['type']): string {
  switch (type) {
    case 'string':
    case 'text':
      return 'string'
    case 'int':
      return 'int'
    case 'decimal':
      return 'float64'
    case 'boolean':
      return 'bool'
    case 'datetime':
      return 'time.Time'
  }
}
