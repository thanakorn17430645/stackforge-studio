import type { TemplateConfig, GeneratedFile, EntityModel, EntityField } from '~/types/template'

export function generateFastapiBackend(config: TemplateConfig): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const projectName = config.projectName || 'FastAPIApp'
  const isPostgres = config.database === 'postgres'
  const isMysql = config.database === 'mysql'
  const isSqlite = config.database === 'sqlite'
  const isMongo = config.database === 'mongodb'

  // 1. requirements.txt
  const reqs = [
    'fastapi>=0.115.0',
    'uvicorn[standard]>=0.30.0',
    'pydantic>=2.8.0',
    'pydantic-settings>=2.4.0',
    'python-multipart>=0.0.9'
  ]

  if (isMongo) {
    reqs.push('motor>=3.5.0', 'pymongo>=4.8.0')
  } else {
    reqs.push('sqlalchemy>=2.0.32', 'alembic>=1.13.2')
    if (isPostgres) reqs.push('psycopg2-binary>=2.9.9')
    if (isMysql) reqs.push('pymysql>=1.1.1', 'cryptography>=43.0.0')
    if (config.database === 'sqlserver') reqs.push('pyodbc>=5.1.0')
  }

  if (config.auth) {
    reqs.push('python-jose[cryptography]>=3.3.0', 'passlib[bcrypt]>=1.7.4')
  }

  files.push({
    path: 'backend/requirements.txt',
    content: reqs.join('\n') + '\n'
  })

  // 2. database.py
  if (isMongo) {
    files.push({
      path: 'backend/database.py',
      content: `import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("DATABASE_URL", "mongodb://mongodb:27017/appdb")
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database("appdb")
`
    })
  } else {
    let dbUrl = 'sqlite:///./app.db'
    if (isPostgres) dbUrl = 'postgresql://postgres:postgrespassword@postgres:5432/appdb'
    if (isMysql) dbUrl = 'mysql+pymysql://root:rootpassword@mysql:3306/appdb'
    if (config.database === 'sqlserver') dbUrl = 'mssql+pyodbc://sa:YourStrong@Passw0rd@sqlserver:1433/appdb?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes'

    files.push({
      path: 'backend/database.py',
      content: `import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "${dbUrl}")

# Connect args for SQLite if needed
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`
    })
  }

  // 3. Models and Schemas and Routers for each Entity
  for (const entity of config.entities) {
    const eName = entity.name
    const pName = eName.toLowerCase() + 's'

    // SQLAlchemy Model
    if (!isMongo) {
      files.push({
        path: `backend/models/${eName.toLowerCase()}.py`,
        content: `from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from database import Base

class ${eName}(Base):
    __tablename__ = "${pName}"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
${entity.fields.map(f => `    ${f.name} = Column(${getSqlAlchemyType(f.type)}, nullable=${!f.required}${f.isUnique ? ', unique=True' : ''})`).join('\n')}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
`
      })
    }

    // Pydantic Schema
    files.push({
      path: `backend/schemas/${eName.toLowerCase()}.py`,
      content: `from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ${eName}Base(BaseModel):
${entity.fields.map(f => `    ${f.name}: ${getPythonType(f.type, f.required)}`).join('\n')}

class ${eName}Create(${eName}Base):
    pass

class ${eName}Update(BaseModel):
${entity.fields.map(f => `    ${f.name}: Optional[${getPythonType(f.type, true)}] = None`).join('\n')}

class ${eName}Response(${eName}Base):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
`
    })

    // Router
    files.push({
      path: `backend/routers/${eName.toLowerCase()}.py`,
      content: `from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
${isMongo ? `from database import db
from schemas.${eName.toLowerCase()} import ${eName}Create, ${eName}Update, ${eName}Response` : `from sqlalchemy.orm import Session
from database import get_db
from models.${eName.toLowerCase()} import ${eName}
from schemas.${eName.toLowerCase()} import ${eName}Create, ${eName}Update, ${eName}Response`}

router = APIRouter(prefix="/api/${pName}", tags=["${pName}"])

@router.get("", response_model=List[${eName}Response])
def get_all(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(${eName})
    if search:
        # filter by first string field if available
        pass
    total = query.count()
    items = query.order_by(${eName}.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return items

@router.get("/{item_id}", response_model=${eName}Response)
def get_by_id(item_id: int, db: Session = Depends(get_db)):
    item = db.query(${eName}).filter(${eName}.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="${eName} not found")
    return item

@router.post("", response_model=${eName}Response, status_code=201)
def create(dto: ${eName}Create, db: Session = Depends(get_db)):
    new_item = ${eName}(**dto.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=${eName}Response)
def update(item_id: int, dto: ${eName}Update, db: Session = Depends(get_db)):
    item = db.query(${eName}).filter(${eName}.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="${eName} not found")
    
    update_data = dto.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db)):
    item = db.query(${eName}).filter(${eName}.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="${eName} not found")
    db.delete(item)
    db.commit()
    return {"message": "${eName} deleted successfully"}
`
    })
  }

  // 4. main.py
  files.push({
    path: 'backend/main.py',
    content: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
${config.entities.map(e => `from models.${e.name.toLowerCase()} import ${e.name}`).join('\n')}
${config.entities.map(e => `from routers.${e.name.toLowerCase()} import router as ${e.name.toLowerCase()}_router`).join('\n')}

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="${projectName} API",
    description="High-performance RESTful API built with Python FastAPI & SQLAlchemy",
    version="1.0.0"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
${config.entities.map(e => `app.include_router(${e.name.toLowerCase()}_router)`).join('\n')}

@app.get("/")
def read_root():
    return {
        "message": "Welcome to ${projectName} API",
        "docs": "/docs",
        "health": "OK"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
`
  })

  // 5. Dockerfile
  files.push({
    path: 'backend/Dockerfile',
    content: `FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
`
  })

  return files
}

function getSqlAlchemyType(type: EntityField['type']): string {
  switch (type) {
    case 'string':
      return 'String(255)'
    case 'text':
      return 'Text'
    case 'int':
      return 'Integer'
    case 'decimal':
      return 'Float'
    case 'boolean':
      return 'Boolean'
    case 'datetime':
      return 'DateTime'
  }
}

function getPythonType(type: EntityField['type'], required: boolean): string {
  let t = 'str'
  switch (type) {
    case 'string':
    case 'text':
      t = 'str'
      break
    case 'int':
      t = 'int'
      break
    case 'decimal':
      t = 'float'
      break
    case 'boolean':
      t = 'bool'
      break
    case 'datetime':
      t = 'datetime'
      break
  }
  return required ? t : `Optional[${t}] = None`
}
