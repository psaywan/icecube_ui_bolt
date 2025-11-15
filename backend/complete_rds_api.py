from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
import uuid
import os

load_dotenv()

app = FastAPI(
    title="IceCube Complete API",
    description="Complete API for IceCube platform using PostgreSQL RDS",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production-2024")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
    raise Exception("Database credentials missing in environment variables")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_token(credentials.credentials)
        if payload is None or payload.get("type") != "access":
            raise credentials_exception

        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except:
        raise credentials_exception

    result = db.execute(text("SELECT id, email, full_name, created_at FROM users WHERE id = :user_id"), {"user_id": user_id})
    user = result.fetchone()

    if user is None:
        raise credentials_exception

    return {
        "id": str(user[0]),
        "email": user[1],
        "full_name": user[2],
        "created_at": user[3]
    }

class UserSignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserSignInRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

@app.get("/")
async def root():
    return {
        "message": "🧊 IceCube Complete API",
        "status": "healthy",
        "version": "4.0.0",
        "database": "PostgreSQL RDS"
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database_status": db_status,
        "database_host": DB_HOST
    }

@app.post("/auth/signup")
async def signup_user(user_data: UserSignUpRequest, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": user_data.email})
        existing_user = result.fetchone()

        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        user_id = uuid.uuid4()
        hashed_password = hash_password(user_data.password)

        db.execute(
            text("""
                INSERT INTO users (id, email, password_hash, full_name, email_confirmed, created_at, updated_at)
                VALUES (:id, :email, :password_hash, :full_name, true, :created_at, :updated_at)
            """),
            {
                "id": user_id,
                "email": user_data.email,
                "password_hash": hashed_password,
                "full_name": user_data.full_name,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )

        account_id = uuid.uuid4()
        db.execute(
            text("""
                INSERT INTO accounts (id, account_name, account_type, created_at, updated_at)
                VALUES (:id, :account_name, 'individual', :created_at, :updated_at)
            """),
            {
                "id": account_id,
                "account_name": f"{user_data.full_name or user_data.email}'s Account",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )

        result = db.execute(text("SELECT account_id FROM accounts WHERE id = :id"), {"id": account_id})
        account_row = result.fetchone()
        account_number = account_row[0]

        db.execute(
            text("""
                INSERT INTO profiles (id, email, full_name, account_id, is_parent_account, created_at, updated_at)
                VALUES (:id, :email, :full_name, :account_id, true, :created_at, :updated_at)
            """),
            {
                "id": user_id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "account_id": account_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )

        db.execute(
            text("""
                INSERT INTO account_members (account_id, user_id, role, created_at)
                VALUES (:account_id, :user_id, 'owner', :created_at)
            """),
            {
                "account_id": account_id,
                "user_id": user_id,
                "created_at": datetime.utcnow()
            }
        )

        db.commit()

        token_data = {"user_id": str(user_id), "email": user_data.email, "full_name": user_data.full_name}
        access_token = create_access_token(token_data)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user_id),
                "email": user_data.email,
                "full_name": user_data.full_name,
                "account_id": account_number
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@app.post("/auth/signin")
async def signin_user(user_data: UserSignInRequest, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT id, email, password_hash, full_name FROM users WHERE email = :email"),
            {"email": user_data.email}
        )
        user = result.fetchone()

        if not user or not verify_password(user_data.password, user[2]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        result = db.execute(
            text("""
                SELECT a.account_id
                FROM profiles p
                JOIN accounts a ON p.account_id = a.id
                WHERE p.id = :user_id
            """),
            {"user_id": user[0]}
        )
        account_row = result.fetchone()
        account_number = account_row[0] if account_row else None

        token_data = {"user_id": str(user[0]), "email": user[1], "full_name": user[3]}
        access_token = create_access_token(token_data)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user[0]),
                "email": user[1],
                "full_name": user[3],
                "account_id": account_number
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during signin: {str(e)}")

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT u.id, u.email, u.full_name, a.account_id
            FROM users u
            LEFT JOIN profiles p ON u.id = p.id
            LEFT JOIN accounts a ON p.account_id = a.id
            WHERE u.id = :user_id
        """),
        {"user_id": current_user["id"]}
    )
    user_row = result.fetchone()

    return {
        "id": str(user_row[0]),
        "email": user_row[1],
        "full_name": user_row[2],
        "account_id": user_row[3]
    }

@app.get("/workspaces")
async def get_workspaces(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id, name, description, category, tags, icon, color, created_at, updated_at
            FROM workspaces WHERE user_id = :user_id ORDER BY created_at DESC
        """),
        {"user_id": current_user["id"]}
    )
    workspaces = []
    for row in result:
        workspaces.append({
            "id": str(row[0]),
            "name": row[1],
            "description": row[2],
            "category": row[3],
            "tags": row[4] or [],
            "icon": row[5],
            "color": row[6],
            "created_at": row[7].isoformat() if row[7] else None,
            "updated_at": row[8].isoformat() if row[8] else None
        })
    return workspaces

@app.post("/workspaces")
async def create_workspace(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspace_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO workspaces (id, user_id, name, description, category, tags, icon, color, created_at, updated_at)
            VALUES (:id, :user_id, :name, :description, :category, :tags, :icon, :color, :created_at, :updated_at)
        """),
        {
            "id": workspace_id,
            "user_id": current_user["id"],
            "name": data.get("name"),
            "description": data.get("description"),
            "category": data.get("category", "General"),
            "tags": data.get("tags", []),
            "icon": data.get("icon"),
            "color": data.get("color", "#06b6d4"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": str(workspace_id), **data}

@app.get("/data-sources")
async def get_data_sources(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id, name, type, config, status, description, created_at, updated_at
            FROM data_sources WHERE user_id = :user_id ORDER BY created_at DESC
        """),
        {"user_id": current_user["id"]}
    )
    sources = []
    for row in result:
        sources.append({
            "id": str(row[0]),
            "name": row[1],
            "type": row[2],
            "config": row[3],
            "status": row[4],
            "description": row[5],
            "created_at": row[6].isoformat() if row[6] else None,
            "updated_at": row[7].isoformat() if row[7] else None
        })
    return sources

@app.post("/data-sources")
async def create_data_source(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    source_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO data_sources (id, user_id, name, type, config, status, description, created_at, updated_at)
            VALUES (:id, :user_id, :name, :type, :config, :status, :description, :created_at, :updated_at)
        """),
        {
            "id": source_id,
            "user_id": current_user["id"],
            "name": data.get("name"),
            "type": data.get("type"),
            "config": data.get("config", {}),
            "status": "active",
            "description": data.get("description"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": str(source_id), **data}

@app.get("/pipelines")
async def get_pipelines(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id, workspace_id, name, description, cloud_provider, git_repo_url, git_branch,
                   workflow_yaml, pipeline_graph, status, created_at, updated_at
            FROM pipelines WHERE user_id = :user_id ORDER BY created_at DESC
        """),
        {"user_id": current_user["id"]}
    )
    pipelines = []
    for row in result:
        pipelines.append({
            "id": str(row[0]),
            "workspace_id": str(row[1]) if row[1] else None,
            "name": row[2],
            "description": row[3],
            "cloud_provider": row[4],
            "git_repo_url": row[5],
            "git_branch": row[6],
            "workflow_yaml": row[7],
            "pipeline_graph": row[8],
            "status": row[9],
            "created_at": row[10].isoformat() if row[10] else None,
            "updated_at": row[11].isoformat() if row[11] else None
        })
    return pipelines

@app.post("/pipelines")
async def create_pipeline(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pipeline_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO pipelines (id, user_id, workspace_id, name, description, cloud_provider,
                                 git_repo_url, git_branch, workflow_yaml, pipeline_graph, status, created_at, updated_at)
            VALUES (:id, :user_id, :workspace_id, :name, :description, :cloud_provider,
                    :git_repo_url, :git_branch, :workflow_yaml, :pipeline_graph, :status, :created_at, :updated_at)
        """),
        {
            "id": pipeline_id,
            "user_id": current_user["id"],
            "workspace_id": data.get("workspace_id"),
            "name": data.get("name"),
            "description": data.get("description"),
            "cloud_provider": data.get("cloud_provider", "aws"),
            "git_repo_url": data.get("git_repo_url"),
            "git_branch": data.get("git_branch", "main"),
            "workflow_yaml": data.get("workflow_yaml"),
            "pipeline_graph": data.get("pipeline_graph", {"nodes": [], "edges": []}),
            "status": "draft",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": str(pipeline_id), **data}

@app.put("/pipelines/{pipeline_id}")
async def update_pipeline(
    pipeline_id: str,
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.execute(
        text("""
            UPDATE pipelines
            SET name = :name, description = :description, workflow_yaml = :workflow_yaml,
                pipeline_graph = :pipeline_graph, updated_at = :updated_at
            WHERE id = :id AND user_id = :user_id
        """),
        {
            "id": pipeline_id,
            "user_id": current_user["id"],
            "name": data.get("name"),
            "description": data.get("description"),
            "workflow_yaml": data.get("workflow_yaml"),
            "pipeline_graph": data.get("pipeline_graph"),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": pipeline_id, **data}

@app.get("/cloud-profiles")
async def get_cloud_profiles(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id, name, provider, region, external_id, custom_domain, status, created_at, updated_at
            FROM cloud_profiles WHERE user_id = :user_id ORDER BY created_at DESC
        """),
        {"user_id": current_user["id"]}
    )
    profiles = []
    for row in result:
        profiles.append({
            "id": str(row[0]),
            "name": row[1],
            "provider": row[2],
            "region": row[3],
            "external_id": row[4],
            "custom_domain": row[5],
            "status": row[6],
            "created_at": row[7].isoformat() if row[7] else None,
            "updated_at": row[8].isoformat() if row[8] else None
        })
    return profiles

@app.post("/cloud-profiles")
async def create_cloud_profile(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO cloud_profiles (id, user_id, name, provider, region, external_id, custom_domain, status, created_at, updated_at)
            VALUES (:id, :user_id, :name, :provider, :region, :external_id, :custom_domain, :status, :created_at, :updated_at)
        """),
        {
            "id": profile_id,
            "user_id": current_user["id"],
            "name": data.get("name"),
            "provider": data.get("provider"),
            "region": data.get("region"),
            "external_id": data.get("external_id"),
            "custom_domain": data.get("custom_domain"),
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": str(profile_id), **data}

@app.get("/compute-clusters")
async def get_compute_clusters(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT cc.id, cc.cloud_profile_id, cc.name, cc.compute_type, cc.node_type,
                   cc.num_workers, cc.auto_scaling, cc.status, cc.endpoint_url, cc.created_at, cc.updated_at
            FROM compute_clusters cc
            JOIN cloud_profiles cp ON cc.cloud_profile_id = cp.id
            WHERE cp.user_id = :user_id ORDER BY cc.created_at DESC
        """),
        {"user_id": current_user["id"]}
    )
    clusters = []
    for row in result:
        clusters.append({
            "id": str(row[0]),
            "cloud_profile_id": str(row[1]),
            "name": row[2],
            "compute_type": row[3],
            "node_type": row[4],
            "num_workers": row[5],
            "auto_scaling": row[6],
            "status": row[7],
            "endpoint_url": row[8],
            "created_at": row[9].isoformat() if row[9] else None,
            "updated_at": row[10].isoformat() if row[10] else None
        })
    return clusters

@app.post("/compute-clusters")
async def create_compute_cluster(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cluster_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO compute_clusters (id, cloud_profile_id, name, compute_type, node_type,
                                        num_workers, auto_scaling, status, created_at, updated_at)
            VALUES (:id, :cloud_profile_id, :name, :compute_type, :node_type,
                    :num_workers, :auto_scaling, :status, :created_at, :updated_at)
        """),
        {
            "id": cluster_id,
            "cloud_profile_id": data.get("cloud_profile_id"),
            "name": data.get("name"),
            "compute_type": data.get("compute_type"),
            "node_type": data.get("node_type"),
            "num_workers": data.get("num_workers", 2),
            "auto_scaling": data.get("auto_scaling", False),
            "status": "stopped",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": str(cluster_id), **data}

@app.get("/notebooks")
async def get_notebooks(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT n.id, n.workspace_id, n.name, n.language, n.content, n.cluster_id, n.created_at, n.updated_at
            FROM notebooks n
            JOIN workspaces w ON n.workspace_id = w.id
            WHERE w.user_id = :user_id ORDER BY n.created_at DESC
        """),
        {"user_id": current_user["id"]}
    )
    notebooks = []
    for row in result:
        notebooks.append({
            "id": str(row[0]),
            "workspace_id": str(row[1]),
            "name": row[2],
            "language": row[3],
            "content": row[4],
            "cluster_id": str(row[5]) if row[5] else None,
            "created_at": row[6].isoformat() if row[6] else None,
            "updated_at": row[7].isoformat() if row[7] else None
        })
    return notebooks

@app.post("/notebooks")
async def create_notebook(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notebook_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO notebooks (id, workspace_id, name, language, content, cluster_id, created_at, updated_at)
            VALUES (:id, :workspace_id, :name, :language, :content, :cluster_id, :created_at, :updated_at)
        """),
        {
            "id": notebook_id,
            "workspace_id": data.get("workspace_id"),
            "name": data.get("name"),
            "language": data.get("language", "python"),
            "content": data.get("content", {"cells": []}),
            "cluster_id": data.get("cluster_id"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": str(notebook_id), **data}

@app.get("/saved-queries")
async def get_saved_queries(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id, name, description, query_text, tags, is_favorite, created_at, updated_at
            FROM saved_queries WHERE user_id = :user_id ORDER BY created_at DESC
        """),
        {"user_id": current_user["id"]}
    )
    queries = []
    for row in result:
        queries.append({
            "id": str(row[0]),
            "name": row[1],
            "description": row[2],
            "query_text": row[3],
            "tags": row[4] or [],
            "is_favorite": row[5],
            "created_at": row[6].isoformat() if row[6] else None,
            "updated_at": row[7].isoformat() if row[7] else None
        })
    return queries

@app.post("/saved-queries")
async def create_saved_query(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query_id = uuid.uuid4()
    db.execute(
        text("""
            INSERT INTO saved_queries (id, user_id, name, description, query_text, tags, is_favorite, created_at, updated_at)
            VALUES (:id, :user_id, :name, :description, :query_text, :tags, :is_favorite, :created_at, :updated_at)
        """),
        {
            "id": query_id,
            "user_id": current_user["id"],
            "name": data.get("name"),
            "description": data.get("description"),
            "query_text": data.get("query_text"),
            "tags": data.get("tags", []),
            "is_favorite": data.get("is_favorite", False),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    )
    db.commit()
    return {"id": str(query_id), **data}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting IceCube Complete RDS API...")
    uvicorn.run("complete_rds_api:app", host="0.0.0.0", port=8000, reload=True)
