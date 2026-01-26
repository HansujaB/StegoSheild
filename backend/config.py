import os

from dotenv import load_dotenv


load_dotenv()


class Config:
    """Basic configuration for Flask + SQLAlchemy in dev."""

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///stegoshield.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

