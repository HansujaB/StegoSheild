import os

from dotenv import load_dotenv


load_dotenv()


class Config:
    """Basic configuration for Flask + SQLAlchemy in dev."""

    uri = os.getenv("DATABASE_URL", "sqlite:///stegoshield.db")
    if uri and uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

