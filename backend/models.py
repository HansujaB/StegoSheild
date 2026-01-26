from datetime import datetime

from database import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    auth_sub = db.Column(db.String(255), unique=True, nullable=False)  # Clerk user id (sub)
    email = db.Column(db.String(255))
    name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)


class KeyPair(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    public_key_pem = db.Column(db.Text, nullable=False)
    private_key_ciphertext = db.Column(db.LargeBinary, nullable=False)
    nonce = db.Column(db.LargeBinary, nullable=False)
    tag = db.Column(db.LargeBinary, nullable=True)  # kept for future extensibility
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_used = db.Column(db.DateTime, default=datetime.utcnow)


class Operation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    op_type = db.Column(db.String(16), nullable=False)  # "encode" or "decode"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    image_hash = db.Column(db.String(64), nullable=True)

