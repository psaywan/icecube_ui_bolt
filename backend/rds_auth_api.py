from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
import uuid

load_dotenv()

app = FastAPI(
    title="IceCube RDS Authentication API",
    description="Complete Authentication API for IceCube platform using PostgreSQL RDS",
    version="3.0.0"
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
REFRESH_TOKEN_EXPIRE_DAYS = 30

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
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class BlacklistedTokenDB(Base):
    __tablename__ = "blacklisted_tokens"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserSignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserSignInRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

class MessageResponse(BaseModel):
    message: str
    success: bool = True

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except:
        return None

def is_token_blacklisted(token: str, db: Session) -> bool:
    blacklisted = db.query(BlacklistedTokenDB).filter(
        BlacklistedTokenDB.token == token,
        BlacklistedTokenDB.expires_at > datetime.utcnow()
    ).first()
    return blacklisted is not None

def blacklist_token(token: str, expires_at: datetime, db: Session):
    blacklisted_token = BlacklistedTokenDB(
        token=token,
        expires_at=expires_at
    )
    db.add(blacklisted_token)
    db.commit()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        if is_token_blacklisted(credentials.credentials, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )

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

@app.get("/")
async def root():
    return {
        "message": "🧊 IceCube RDS Authentication API",
        "status": "healthy",
        "version": "3.0.0",
        "database": "PostgreSQL RDS",
        "features": [
            "✅ User SignUp & SignIn with RDS",
            "✅ JWT Access & Refresh Tokens",
            "✅ Password Hashing with Bcrypt",
            "✅ Protected Routes",
            "✅ Token Blacklisting"
        ]
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
        "database_type": "PostgreSQL RDS",
        "database_status": db_status,
        "database_host": DB_HOST
    }

@app.post("/auth/signup", response_model=UserResponse)
async def signup_user(user_data: UserSignUpRequest, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": user_data.email}
        )
        existing_user = result.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        user_id = uuid.uuid4()
        hashed_password = hash_password(user_data.password)

        db.execute(
            text("""
                INSERT INTO users (id, email, password_hash, full_name, email_confirmed, created_at, updated_at)
                VALUES (:id, :email, :password_hash, :full_name, :email_confirmed, :created_at, :updated_at)
            """),
            {
                "id": user_id,
                "email": user_data.email,
                "password_hash": hashed_password,
                "full_name": user_data.full_name,
                "email_confirmed": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )

        account_id = uuid.uuid4()
        db.execute(
            text("""
                INSERT INTO accounts (id, account_name, account_type, created_at, updated_at)
                VALUES (:id, :account_name, :account_type, :created_at, :updated_at)
            """),
            {
                "id": account_id,
                "account_name": user_data.full_name or user_data.email,
                "account_type": "individual",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )

        db.execute(
            text("""
                INSERT INTO account_members (account_id, user_id, role, created_at)
                VALUES (:account_id, :user_id, :role, :created_at)
            """),
            {
                "account_id": account_id,
                "user_id": user_id,
                "role": "owner",
                "created_at": datetime.utcnow()
            }
        )

        db.execute(
            text("""
                INSERT INTO profiles (id, email, full_name, account_id, is_parent_account, created_at, updated_at)
                VALUES (:id, :email, :full_name, :account_id, :is_parent_account, :created_at, :updated_at)
            """),
            {
                "id": user_id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "account_id": account_id,
                "is_parent_account": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )

        db.commit()

        return UserResponse(
            id=str(user_id),
            email=user_data.email,
            full_name=user_data.full_name,
            created_at=datetime.utcnow()
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@app.post("/auth/signin", response_model=TokenResponse)
async def signin_user(user_data: UserSignInRequest, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT id, email, password_hash, full_name FROM users WHERE email = :email"),
            {"email": user_data.email}
        )
        user = result.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not verify_password(user_data.password, user[2]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token_data = {
            "user_id": str(user[0]),
            "email": user[1],
            "full_name": user[3]
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_info = {
            "id": str(user[0]),
            "email": user[1],
            "full_name": user[3]
        }

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_info
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during signin: {str(e)}"
        )

@app.post("/auth/logout", response_model=MessageResponse)
async def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            expires_at = datetime.fromtimestamp(exp_timestamp)
            blacklist_token(credentials.credentials, expires_at, db)

        return MessageResponse(
            message="Logged out successfully",
            success=True
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during logout: {str(e)}"
        )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=current_user["created_at"]
    )

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_access_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = verify_token(credentials.credentials)
        if payload is None or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        user_id = payload.get("user_id")
        result = db.execute(
            text("SELECT id, email, full_name FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        )
        user = result.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        token_data = {
            "user_id": str(user[0]),
            "email": user[1],
            "full_name": user[2]
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_info = {
            "id": str(user[0]),
            "email": user[1],
            "full_name": user[2]
        }

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_info
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting IceCube RDS Authentication API...")
    uvicorn.run("rds_auth_api:app", host="0.0.0.0", port=8000, reload=True)
