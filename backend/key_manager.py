import base64
import os
from typing import Tuple

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from database import db
from models import User, KeyPair
from functions import generate_ecc_key_pair


def _get_master_key() -> bytes:
    """
    MASTER_KEY should be a 32‑byte key, stored as base64 in the environment.
    For dev you can generate one with:
        python -c \"import os,base64; print(base64.b64encode(os.urandom(32)).decode())\"
    """
    key_b64 = os.getenv("MASTER_KEY")
    if not key_b64:
        raise RuntimeError("MASTER_KEY environment variable is not set")
    key = base64.b64decode(key_b64)
    if len(key) != 32:
        raise RuntimeError("MASTER_KEY must decode to 32 bytes")
    return key


def _encrypt_private_key(private_key) -> Tuple[bytes, bytes, bytes]:
    master_key = _get_master_key()
    aesgcm = AESGCM(master_key)
    nonce = os.urandom(12)

    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    ciphertext = aesgcm.encrypt(nonce, pem, None)
    # AESGCM includes the tag inside ciphertext; tag kept as placeholder for schema
    tag = b""
    return ciphertext, nonce, tag


def _decrypt_private_key(ciphertext: bytes, nonce: bytes, tag: bytes):
    master_key = _get_master_key()
    aesgcm = AESGCM(master_key)
    pem = aesgcm.decrypt(nonce, ciphertext, None)
    private_key = serialization.load_pem_private_key(
        pem,
        password=None,
        backend=default_backend(),
    )
    return private_key


def get_or_create_user(auth_sub: str, email: str | None, name: str | None) -> User:
    user = User.query.filter_by(auth_sub=auth_sub).first()
    if not user:
        user = User(auth_sub=auth_sub, email=email, name=name)
        db.session.add(user)
        db.session.commit()
    return user


def get_or_create_keypair(user: User) -> KeyPair:
    keypair = KeyPair.query.filter_by(user_id=user.id).first()
    if keypair:
        return keypair

    private_key, public_key = generate_ecc_key_pair()
    ciphertext, nonce, tag = _encrypt_private_key(private_key)

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    keypair = KeyPair(
        user_id=user.id,
        public_key_pem=public_pem,
        private_key_ciphertext=ciphertext,
        nonce=nonce,
        tag=tag,
    )
    db.session.add(keypair)
    db.session.commit()
    return keypair


def load_user_private_key(user: User):
    keypair = get_or_create_keypair(user)
    return _decrypt_private_key(
        keypair.private_key_ciphertext,
        keypair.nonce,
        keypair.tag,
    )

