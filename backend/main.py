
# main.py - Complete IceCube Authentication API with all features
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import boto3
import os
from typing import Optional, List
import random
import string
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Integer, text
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from dotenv import load_dotenv
import json
import jwt
from jose import JWTError, jwt as jose_jwt
import hashlib
import hmac
import base64

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI(
    title="IceCube Authentication API",
    description="Complete Authentication API for IceCube platform using AWS Cognito + RDS + JWT",
    version="2.0.0"
)

# Security
security = HTTPBearer()

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# AWS Cognito Configuration
class CognitoConfig:
    USER_POOL_ID = 'ap-south-1_9u5InoI1l'
    CLIENT_ID = '4fc5emndpls0m5bjqrdbg58rat'
    CLIENT_SECRET = '8fosdmjn30038orbuecr5kdtegkrrmfdkmv47t4100g4i6c17qd'
    REGION = 'ap-south-1'
    DOMAIN = 'https://ap-south-19u5inoi1l.auth.ap-south-1.amazoncognito.com'
    REDIRECT_SIGN_IN = 'http://localhost:5173/auth/callback'
    REDIRECT_SIGN_OUT = 'http://localhost:5173/login'

# Database Configuration with fallback
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Try RDS first, fallback to SQLite
try:
    if DB_HOST and DB_USER and DB_PASSWORD and DB_NAME:
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        print(f"🔄 Trying to connect to RDS: {DB_HOST}")
        engine = create_engine(DATABASE_URL)
        # Test connection
        engine.connect()
        print("✅ RDS connection successful!")
        DB_TYPE = "PostgreSQL RDS"
    else:
        raise Exception("RDS credentials missing")
        
except Exception as e:
    print(f"❌ RDS connection failed: {e}")
    print("🔄 Falling back to SQLite for local development...")
    DATABASE_URL = "sqlite:///./icecube.db"
    engine = create_engine(DATABASE_URL)
    DB_TYPE = "SQLite (Local)"
    print("✅ SQLite connection successful!")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class IceCubeUserDB(Base):
    __tablename__ = "icecube_users"
    
    id = Column(Integer, primary_key=True, index=True)
    icecube_id = Column(String(12), unique=True, index=True, nullable=False)
    cognito_username = Column(String(150), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)
    email_verification_token = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BlacklistedTokenDB(Base):
    __tablename__ = "blacklisted_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
except Exception as e:
    print(f"❌ Database connection error: {e}")

# Initialize Cognito client
cognito_client = boto3.client(
    'cognito-idp', 
    region_name=CognitoConfig.REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class UserSignUpRequest(BaseModel):
    username: str  # Should match email since Cognito uses email as username
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserSignInRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    confirmation_code: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    confirmation_code: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class IceCubeUserResponse(BaseModel):
    icecube_id: str
    username: str
    email: str
    full_name: Optional[str] = None
    is_verified: bool = False
    last_login: Optional[datetime] = None
    created_at: datetime

class SignUpResponse(BaseModel):
    message: str
    user: IceCubeUserResponse
    cognito_user_sub: str

class MessageResponse(BaseModel):
    message: str
    success: bool = True

# JWT Utility functions
def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def is_token_blacklisted(token: str, db: Session) -> bool:
    """Check if token is blacklisted"""
    blacklisted = db.query(BlacklistedTokenDB).filter(
        BlacklistedTokenDB.token == token,
        BlacklistedTokenDB.expires_at > datetime.utcnow()
    ).first()
    return blacklisted is not None

def blacklist_token(token: str, expires_at: datetime, db: Session):
    """Add token to blacklist"""
    blacklisted_token = BlacklistedTokenDB(
        token=token,
        expires_at=expires_at
    )
    db.add(blacklisted_token)
    db.commit()

# Cognito utility functions
def calculate_secret_hash(username: str, client_id: str, client_secret: str):
    """Calculate secret hash for Cognito authentication"""
    message = username + client_id
    dig = hmac.new(
        str(client_secret).encode('utf-8'), 
        msg=str(message).encode('utf-8'),
        digestmod=hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Check if token is blacklisted
        if is_token_blacklisted(credentials.credentials, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        if payload.get("type") != "access":
            raise credentials_exception
            
        icecube_id: str = payload.get("icecube_id")
        if icecube_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(IceCubeUserDB).filter(IceCubeUserDB.icecube_id == icecube_id).first()
    if user is None:
        raise credentials_exception
    
    return user

# Utility functions
def generate_icecube_id() -> str:
    """Generate a unique 12-digit IceCube ID"""
    return ''.join(random.choices(string.digits, k=12))

def check_icecube_id_exists(db: Session, icecube_id: str) -> bool:
    """Check if IceCube ID already exists"""
    return db.query(IceCubeUserDB).filter(IceCubeUserDB.icecube_id == icecube_id).first() is not None

def generate_unique_icecube_id(db: Session) -> str:
    """Generate a unique IceCube ID that doesn't exist in database"""
    while True:
        icecube_id = generate_icecube_id()
        if not check_icecube_id_exists(db, icecube_id):
            return icecube_id

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "🧊 IceCube Authentication API v2.0",
        "status": "healthy",
        "version": "2.0.0",
        "database_type": DB_TYPE,
        "database_host": DB_HOST if 'PostgreSQL' in DB_TYPE else "Local SQLite",
        "features": [
            "✅ User SignUp & SignIn",
            "✅ JWT Access & Refresh Tokens", 
            "✅ Protected Routes",
            "✅ Password Reset",
            "✅ Email Verification",
            "✅ Logout & Token Blacklisting",
            "✅ Profile Management",
            "✅ 12-digit IceCube ID System"
        ]
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "cognito_region": CognitoConfig.REGION,
        "user_pool_id": CognitoConfig.USER_POOL_ID,
        "database_type": DB_TYPE,
        "database_status": db_status,
        "rds_host": DB_HOST if DB_HOST else "Not configured"
    }

# ========== AUTHENTICATION ENDPOINTS ==========

# @app.post("/auth/signup", response_model=SignUpResponse)
# async def signup_user(user_data: UserSignUpRequest, db: Session = Depends(get_db)):
#     """Sign up a new user in AWS Cognito and store user info in RDS"""
#     try:
#         print(f"🔄 Starting signup process for user: {user_data.email}")
        
#         # Validate that username and email are the same
#         # if user_data.username != user_data.email:
#         #     raise HTTPException(
#         #         status_code=status.HTTP_400_BAD_REQUEST,
#         #         detail="Username must be the same as email since email is used as username in Cognito"
#         #     )
        
#         # Check if user already exists in our database
#         existing_user = db.query(IceCubeUserDB).filter(
#             IceCubeUserDB.email == user_data.email
#         ).first()
        
#         if existing_user:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="User with this email already exists"
#             )

#         # Generate unique IceCube ID
#         icecube_id = generate_unique_icecube_id(db)
#         print(f"✅ Generated IceCube ID: {icecube_id}")

#         # Create user in AWS Cognito
#         print("🔄 Creating user in AWS Cognito...")
#         cognito_response = cognito_client.admin_create_user(
#             UserPoolId=CognitoConfig.USER_POOL_ID,
#             # Username=user_data.email,
#             Username=str(uuid.uuid4())
#             UserAttributes=[
#                 {'Name': 'email', 'Value': user_data.email},
#                 {'Name': 'email_verified', 'Value': 'true'}  # Set to true for password reset functionality
#             ],
#             TemporaryPassword=user_data.password,
#             MessageAction='SUPPRESS'
#         )
#         print("✅ User created in Cognito")

#         # Set permanent password
#         print("🔄 Setting permanent password...")
#         # Note: admin_set_user_password doesn't require SECRET_HASH
#         cognito_client.admin_set_user_password(
#             UserPoolId=CognitoConfig.USER_POOL_ID,
#             Username=user_data.email,
#             Password=user_data.password,
#             Permanent=True
#         )
#         print("✅ Password set as permanent")

#         # Confirm the user if not already confirmed
#         try:
#             cognito_client.admin_confirm_sign_up(
#                 UserPoolId=CognitoConfig.USER_POOL_ID,
#                 Username=user_data.email
#             )
#             print("✅ User confirmed in Cognito")
#         except cognito_client.exceptions.NotAuthorizedException as e:
#             if "Current status is CONFIRMED" in str(e):
#                 print("✅ User already confirmed in Cognito")
#             else:
#                 raise e

#         # Save user info in our RDS database
#         print("🔄 Saving user to RDS database...")
#         db_user = IceCubeUserDB(
#             icecube_id=icecube_id,
#             cognito_username=user_data.email,
#             email=user_data.email,
#             full_name=user_data.full_name,
#             is_verified=False,
#             is_active=True
#         )
        
#         db.add(db_user)
#         db.commit()
#         db.refresh(db_user)
#         print("✅ User saved to RDS database")

#         # Prepare response
#         user_response = IceCubeUserResponse(
#             icecube_id=db_user.icecube_id,
#             username=db_user.cognito_username,
#             email=db_user.email,
#             full_name=db_user.full_name,
#             is_verified=db_user.is_verified,
#             created_at=db_user.created_at
#         )

#         print(f"🎉 User signup completed successfully! IceCube ID: {icecube_id}")
        
#         return SignUpResponse(
#             message="User created successfully! Please verify your email.",
#             user=user_response,
#             cognito_user_sub=cognito_response['User']['Username']
#         )

#     except cognito_client.exceptions.UsernameExistsException:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Username already exists in Cognito"
#         )
#     except cognito_client.exceptions.InvalidPasswordException:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Password does not meet requirements"
#         )
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error creating user: {str(e)}"
#         )

@app.post("/auth/signup", response_model=SignUpResponse)
async def signup_user(user_data: UserSignUpRequest, db: Session = Depends(get_db)):
    """Sign up a new user in AWS Cognito and store user info in RDS"""
    try:
        print(f"Starting signup process for user: {user_data.email}")
        
        # Check if user already exists in our database
        existing_user = db.query(IceCubeUserDB).filter(
            IceCubeUserDB.email == user_data.email
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Generate unique IceCube ID
        icecube_id = generate_unique_icecube_id(db)
        print(f"Generated IceCube ID: {icecube_id}")

        # Generate unique Cognito username (not email format)
        cognito_username = f"icecube_{icecube_id}"
        
        # Create user in AWS Cognito
        print("Creating user in AWS Cognito...")
        cognito_response = cognito_client.admin_create_user(
            UserPoolId=CognitoConfig.USER_POOL_ID,
            Username=cognito_username,  # Use generated username, not email
            UserAttributes=[
                {'Name': 'email', 'Value': user_data.email},
                {'Name': 'email_verified', 'Value': 'true'}
            ],
            TemporaryPassword=user_data.password,
            MessageAction='SUPPRESS'
        )
        print("User created in Cognito")

        # Set permanent password
        print("Setting permanent password...")
        cognito_client.admin_set_user_password(
            UserPoolId=CognitoConfig.USER_POOL_ID,
            Username=cognito_username,
            Password=user_data.password,
            Permanent=True
        )
        print("Password set as permanent")

        # Confirm the user if not already confirmed
        try:
            cognito_client.admin_confirm_sign_up(
                UserPoolId=CognitoConfig.USER_POOL_ID,
                Username=cognito_username
            )
            print("User confirmed in Cognito")
        except cognito_client.exceptions.NotAuthorizedException as e:
            if "Current status is CONFIRMED" in str(e):
                print("User already confirmed in Cognito")
            else:
                raise e

        # Save user info in our RDS database
        print("Saving user to RDS database...")
        db_user = IceCubeUserDB(
            icecube_id=icecube_id,
            cognito_username=cognito_username,  # Store generated username
            email=user_data.email,
            full_name=user_data.full_name,
            is_verified=True,  # Set to true since we confirmed
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print("User saved to RDS database")

        # Prepare response
        user_response = IceCubeUserResponse(
            icecube_id=db_user.icecube_id,
            username=db_user.cognito_username,
            email=db_user.email,
            full_name=db_user.full_name,
            is_verified=db_user.is_verified,
            created_at=db_user.created_at
        )

        print(f"User signup completed successfully! IceCube ID: {icecube_id}")
        
        return SignUpResponse(
            message="User created successfully!",
            user=user_response,
            cognito_user_sub=cognito_response['User']['Username']
        )

    except cognito_client.exceptions.UsernameExistsException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists in Cognito"
        )
    except cognito_client.exceptions.InvalidPasswordException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet requirements"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@app.post("/auth/signin", response_model=TokenResponse)
async def signin_user(user_data: UserSignInRequest, db: Session = Depends(get_db)):
    """Sign in user with email and password, return JWT tokens"""
    try:
        print(f"🔄 Starting signin process for user: {user_data.email}")

        # Get user from our database first
        db_user = db.query(IceCubeUserDB).filter(IceCubeUserDB.email == user_data.email).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not db_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is deactivated"
            )

        # Authenticate with AWS Cognito
        print("🔄 Authenticating with AWS Cognito...")
        try:
            auth_params = {
                'USERNAME': user_data.email,
                'PASSWORD': user_data.password
            }
            
            if CognitoConfig.CLIENT_SECRET:
                secret_hash = calculate_secret_hash(
                    user_data.email, 
                    CognitoConfig.CLIENT_ID, 
                    CognitoConfig.CLIENT_SECRET
                )
                auth_params['SECRET_HASH'] = secret_hash
            
            try:
                auth_response = cognito_client.admin_initiate_auth(
                    UserPoolId=CognitoConfig.USER_POOL_ID,
                    ClientId=CognitoConfig.CLIENT_ID,
                    AuthFlow='ADMIN_NO_SRP_AUTH',
                    AuthParameters=auth_params
                )
                print("✅ Cognito authentication successful (ADMIN_NO_SRP_AUTH)")
            except cognito_client.exceptions.InvalidParameterException as e:
                if "Auth flow not enabled" in str(e):
                    print("🔄 ADMIN_NO_SRP_AUTH not enabled, trying USER_PASSWORD_AUTH...")
                    auth_response = cognito_client.initiate_auth(
                        ClientId=CognitoConfig.CLIENT_ID,
                        AuthFlow='USER_PASSWORD_AUTH',
                        AuthParameters=auth_params
                    )
                    print("✅ Cognito authentication successful (USER_PASSWORD_AUTH)")
                else:
                    raise e
            
        except Exception as cognito_error:
            print(f"❌ Cognito authentication failed: {str(cognito_error)}")
            raise cognito_error

        # Update last login time
        db_user.last_login = datetime.utcnow()
        db.commit()

        # Create JWT tokens
        token_data = {
            "icecube_id": db_user.icecube_id,
            "email": db_user.email,
            "username": db_user.cognito_username,
            "full_name": db_user.full_name
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Prepare user data for response
        user_info = {
            "icecube_id": db_user.icecube_id,
            "username": db_user.cognito_username,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "is_verified": db_user.is_verified,
            "last_login": db_user.last_login.isoformat() if db_user.last_login else None
        }

        print(f"🎉 User signin completed successfully! IceCube ID: {db_user.icecube_id}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_info
        )

    except cognito_client.exceptions.NotAuthorizedException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    except cognito_client.exceptions.UserNotConfirmedException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account not verified. Please check your email."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during signin: {str(e)}"
        )

@app.post("/auth/logout", response_model=MessageResponse)
async def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Logout user and blacklist the token"""
    try:
        # Verify and blacklist the token
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get token expiration time
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            expires_at = datetime.fromtimestamp(exp_timestamp)
            # Blacklist the token
            blacklist_token(credentials.credentials, expires_at, db)
        
        print(f"✅ User logged out successfully")
        
        return MessageResponse(
            message="Logged out successfully",
            success=True
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during logout: {str(e)}"
        )

@app.post("/auth/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset code to user's email"""
    try:
        print(f"🔄 Sending password reset code to: {request.email}")
        
        forgot_params = {
            'ClientId': CognitoConfig.CLIENT_ID,
            'Username': request.email
        }
        
        if CognitoConfig.CLIENT_SECRET:
            secret_hash = calculate_secret_hash(
                request.email, 
                CognitoConfig.CLIENT_ID, 
                CognitoConfig.CLIENT_SECRET
            )
            forgot_params['SecretHash'] = secret_hash
        
        cognito_client.forgot_password(**forgot_params)
        
        print(f"✅ Password reset code sent to {request.email}")
        
        return MessageResponse(
            message=f"Password reset code sent to {request.email}. Please check your email.",
            success=True
        )
        
    except cognito_client.exceptions.UserNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending password reset code: {str(e)}"
        )

@app.post("/auth/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest):
    """Reset user password using confirmation code"""
    try:
        print(f"🔄 Resetting password for: {request.email}")
        
        confirm_params = {
            'ClientId': CognitoConfig.CLIENT_ID,
            'Username': request.email,
            'ConfirmationCode': request.confirmation_code,
            'Password': request.new_password
        }
        
        if CognitoConfig.CLIENT_SECRET:
            secret_hash = calculate_secret_hash(
                request.email, 
                CognitoConfig.CLIENT_ID, 
                CognitoConfig.CLIENT_SECRET
            )
            confirm_params['SecretHash'] = secret_hash
        
        cognito_client.confirm_forgot_password(**confirm_params)
        
        print(f"✅ Password reset successful for {request.email}")
        
        return MessageResponse(
            message="Password reset successful. You can now sign in with your new password.",
            success=True
        )
        
    except cognito_client.exceptions.CodeMismatchException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation code"
        )
    except cognito_client.exceptions.ExpiredCodeException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation code has expired"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting password: {str(e)}"
        )

@app.post("/auth/verify-email", response_model=MessageResponse)
async def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify user email using confirmation code"""
    try:
        print(f"🔄 Verifying email for: {request.email}")
        
        confirm_params = {
            'ClientId': CognitoConfig.CLIENT_ID,
            'Username': request.email,
            'ConfirmationCode': request.confirmation_code
        }
        
        if CognitoConfig.CLIENT_SECRET:
            secret_hash = calculate_secret_hash(
                request.email, 
                CognitoConfig.CLIENT_ID, 
                CognitoConfig.CLIENT_SECRET
            )
            confirm_params['SecretHash'] = secret_hash
        
        cognito_client.confirm_sign_up(**confirm_params)
        
        # Update user verification status in our database
        db_user = db.query(IceCubeUserDB).filter(IceCubeUserDB.email == request.email).first()
        if db_user:
            db_user.is_verified = True
            db.commit()
        
        print(f"✅ Email verified successfully for {request.email}")
        
        return MessageResponse(
            message="Email verified successfully!",
            success=True
        )
        
    except cognito_client.exceptions.CodeMismatchException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation code"
        )
    except cognito_client.exceptions.ExpiredCodeException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation code has expired"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying email: {str(e)}"
        )

@app.post("/auth/change-password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest, 
    current_user: IceCubeUserDB = Depends(get_current_user)
):
    """Change user password (requires authentication)"""
    try:
        print(f"🔄 Changing password for user: {current_user.email}")
        
        # First verify current password by attempting to authenticate
        auth_params = {
            'USERNAME': current_user.email,
            'PASSWORD': request.current_password
        }
        
        if CognitoConfig.CLIENT_SECRET:
            secret_hash = calculate_secret_hash(
                current_user.email, 
                CognitoConfig.CLIENT_ID, 
                CognitoConfig.CLIENT_SECRET
            )
            auth_params['SECRET_HASH'] = secret_hash
        
        # Verify current password
        try:
            cognito_client.admin_initiate_auth(
                UserPoolId=CognitoConfig.USER_POOL_ID,
                ClientId=CognitoConfig.CLIENT_ID,
                AuthFlow='ADMIN_NO_SRP_AUTH',
                AuthParameters=auth_params
            )
        except cognito_client.exceptions.InvalidParameterException:
            # Try alternative flow
            cognito_client.initiate_auth(
                ClientId=CognitoConfig.CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters=auth_params
            )
        
        # Set new password
        # Note: admin_set_user_password doesn't require SECRET_HASH
        cognito_client.admin_set_user_password(
            UserPoolId=CognitoConfig.USER_POOL_ID,
            Username=current_user.email,
            Password=request.new_password,
            Permanent=True
        )
        
        print(f"✅ Password changed successfully for {current_user.email}")
        
        return MessageResponse(
            message="Password changed successfully!",
            success=True
        )
        
    except cognito_client.exceptions.NotAuthorizedException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error changing password: {str(e)}"
        )

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_access_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        payload = verify_token(credentials.credentials)
        if payload is None or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        icecube_id = payload.get("icecube_id")
        user = db.query(IceCubeUserDB).filter(IceCubeUserDB.icecube_id == icecube_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Create new tokens
        token_data = {
            "icecube_id": user.icecube_id,
            "email": user.email,
            "username": user.cognito_username,
            "full_name": user.full_name
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        user_info = {
            "icecube_id": user.icecube_id,
            "username": user.cognito_username,
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": user.is_verified,
            "last_login": user.last_login.isoformat() if user.last_login else None
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

# ========== PROTECTED ROUTES ==========

@app.get("/auth/me", response_model=IceCubeUserResponse)
async def get_current_user_info(current_user: IceCubeUserDB = Depends(get_current_user)):
    """Get current authenticated user information (Protected Route)"""
    return IceCubeUserResponse(
        icecube_id=current_user.icecube_id,
        username=current_user.cognito_username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_verified=current_user.is_verified,
        last_login=current_user.last_login,
        created_at=current_user.created_at
    )

@app.put("/auth/profile", response_model=IceCubeUserResponse)
async def update_user_profile(
    request: UpdateProfileRequest,
    current_user: IceCubeUserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile (Protected Route)"""
    try:
        if request.full_name is not None:
            current_user.full_name = request.full_name
            current_user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(current_user)
        
        return IceCubeUserResponse(
            icecube_id=current_user.icecube_id,
            username=current_user.cognito_username,
            email=current_user.email,
            full_name=current_user.full_name,
            is_verified=current_user.is_verified,
            last_login=current_user.last_login,
            created_at=current_user.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

@app.get("/users")
async def get_all_users(current_user: IceCubeUserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all users (Protected Route - requires authentication)"""
    users = db.query(IceCubeUserDB).all()
    return {
        "total_users": len(users),
        "requested_by": current_user.email,
        "users": [
            {
                "icecube_id": user.icecube_id,
                "username": user.cognito_username,
                "email": user.email,
                "full_name": user.full_name,
                "is_verified": user.is_verified,
                "last_login": user.last_login,
                "created_at": user.created_at
            }
            for user in users
        ]
    }

@app.get("/users/{icecube_id}", response_model=IceCubeUserResponse)
async def get_user_by_icecube_id(icecube_id: str, db: Session = Depends(get_db)):
    """Get user information by IceCube ID"""
    user = db.query(IceCubeUserDB).filter(IceCubeUserDB.icecube_id == icecube_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return IceCubeUserResponse(
        icecube_id=user.icecube_id,
        username=user.cognito_username,
        email=user.email,
        full_name=user.full_name,
        is_verified=user.is_verified,
        last_login=user.last_login,
        created_at=user.created_at
    )

# ========== ADMIN ENDPOINTS ==========

@app.get("/debug/cognito-user/{email}")
async def debug_cognito_user(email: str):
    """Debug Cognito user status"""
    try:
        user_response = cognito_client.admin_get_user(
            UserPoolId=CognitoConfig.USER_POOL_ID,
            Username=email
        )
        
        return {
            "username": user_response['Username'],
            "user_status": user_response['UserStatus'],
            "enabled": user_response['Enabled'],
            "user_attributes": user_response['UserAttributes'],
            "created_date": user_response['UserCreateDate'].isoformat(),
            "modified_date": user_response['UserLastModifiedDate'].isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/admin/verify-user-email/{email}")
async def admin_verify_user_email(email: str):
    """Admin endpoint to manually verify user email in Cognito"""
    try:
        # Update user attributes to mark email as verified
        cognito_client.admin_update_user_attributes(
            UserPoolId=CognitoConfig.USER_POOL_ID,
            Username=email,
            UserAttributes=[
                {'Name': 'email_verified', 'Value': 'true'}
            ]
        )
        
        return {
            "message": f"✅ Email verified for user: {email}",
            "success": True
        }
    except Exception as e:
        return {
            "message": f"❌ Error verifying email: {str(e)}",
            "success": False
        }

@app.post("/admin/migrate-db")
async def migrate_database(db: Session = Depends(get_db)):
    """Migrate database - Add missing columns"""
    try:
        # Add missing columns if they don't exist
        if 'postgresql' in DATABASE_URL.lower():
            # PostgreSQL
            db.execute(text("ALTER TABLE icecube_users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP"))
            db.execute(text("ALTER TABLE icecube_users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255)"))
            db.execute(text("ALTER TABLE icecube_users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP"))
            db.execute(text("ALTER TABLE icecube_users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)"))
        else:
            # SQLite
            try:
                db.execute(text("ALTER TABLE icecube_users ADD COLUMN last_login DATETIME"))
            except: pass
            try:
                db.execute(text("ALTER TABLE icecube_users ADD COLUMN password_reset_token TEXT"))
            except: pass
            try:
                db.execute(text("ALTER TABLE icecube_users ADD COLUMN password_reset_expires DATETIME"))
            except: pass
            try:
                db.execute(text("ALTER TABLE icecube_users ADD COLUMN email_verification_token TEXT"))
            except: pass
        
        db.commit()
        return {"message": "✅ Database migration completed successfully!"}
        
    except Exception as e:
        db.rollback()
        return {"message": f"❌ Migration failed: {str(e)}"}

@app.get("/debug/rds")
async def debug_rds():
    """Debug RDS connection issues"""
    return {
        "rds_host": DB_HOST,
        "rds_port": DB_PORT,
        "rds_database": DB_NAME,
        "rds_user": DB_USER,
        "rds_password_set": "Yes" if DB_PASSWORD else "No",
        "current_database": DB_TYPE,
        "jwt_secret_set": "Yes" if JWT_SECRET_KEY else "No",
        "cognito_client_secret_set": "Yes" if CognitoConfig.CLIENT_SECRET else "No"
    }

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting IceCube Authentication API v2.0 with {DB_TYPE}...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)