import os
import struct
import random
import math
import logging
import subprocess
from typing import Tuple
from PIL import Image
import numpy as np

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.padding import PKCS7


# ---------------------------------------------------------------------------
# AES Encryption/Decryption Functions
# ---------------------------------------------------------------------------
def generate_aes_key():
    """Generate a 128-bit AES key."""
    return os.urandom(16)


def aes_encrypt(plain_text, key):
    """Encrypt plain text using AES-128-CBC with PKCS7 padding."""
    iv = os.urandom(16)
    padder = PKCS7(algorithms.AES.block_size).padder()
    padded_data = padder.update(plain_text.encode('utf-8')) + padder.finalize()
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    return iv, ciphertext


def aes_decrypt(iv, ciphertext, key):
    """Decrypt ciphertext using AES-128-CBC with PKCS7 unpadding."""
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(ciphertext) + decryptor.finalize()
    unpadder = PKCS7(algorithms.AES.block_size).unpadder()
    plain_text = unpadder.update(padded_data) + unpadder.finalize()
    return plain_text.decode('utf-8')


# ---------------------------------------------------------------------------
# ECC Key Generation and ECIES for Encrypting/Decrypting AES Key
# ---------------------------------------------------------------------------
def generate_ecc_key_pair():
    """Generate ECC key pair using SECP256R1."""
    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    public_key = private_key.public_key()
    return private_key, public_key


def ecies_encrypt(payload, receiver_public_key):
    ephemeral_private = ec.generate_private_key(ec.SECP256R1(), default_backend())
    ephemeral_public = ephemeral_private.public_key()
    shared = ephemeral_private.exchange(ec.ECDH(), receiver_public_key)
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b'handshake data',
        backend=default_backend()
    ).derive(shared)

    iv = os.urandom(16)
    padder = PKCS7(algorithms.AES.block_size).padder()
    padded_payload = padder.update(payload) + padder.finalize()

    cipher = Cipher(algorithms.AES(derived_key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_payload) + encryptor.finalize()

    ephemeral_public_bytes = ephemeral_public.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.CompressedPoint
    )
    return ephemeral_public_bytes, iv, ciphertext


def ecies_decrypt(ephemeral_public_bytes, iv, ciphertext, receiver_private_key):
    ephemeral_public = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), ephemeral_public_bytes)
    shared = receiver_private_key.exchange(ec.ECDH(), ephemeral_public)
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b'handshake data',
        backend=default_backend()
    ).derive(shared)

    cipher = Cipher(algorithms.AES(derived_key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_payload = decryptor.update(ciphertext) + decryptor.finalize()

    unpadder = PKCS7(algorithms.AES.block_size).unpadder()
    payload = unpadder.update(padded_payload) + unpadder.finalize()
    return payload


# ---------------------------------------------------------------------------
# Inverted LSB (LSB Matching) Steganography Functions
# ---------------------------------------------------------------------------
def embed_inverted_lsb(image_path, payload_bytes, output_path):
    """Embed payload into image using inverted LSB (LSB matching) - NumPy Optimized."""
    img = Image.open(image_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Convert image to NumPy array for memory efficiency
    data = np.array(img)
    shape = data.shape
    flat_pixels = data.flatten()

    # Prepare bits: 32 bits for length + the payload
    length = len(payload_bytes)
    length_bytes = struct.pack('>I', length)
    all_bytes = length_bytes + payload_bytes
    
    # Efficiently convert bytes to bit array
    # We use a bitmask approach to avoid slow string manipulation
    payload_bits = np.unpackbits(np.frombuffer(all_bytes, dtype=np.uint8))
    
    if len(payload_bits) > len(flat_pixels):
        raise ValueError(f"Image too small. Need {len(payload_bits)} bits, have {len(flat_pixels)} capacity.")

    # Apply LSB Matching (Inverted LSB)
    # We only iterate over the part of the image we need
    # Convert to int16 to avoid overflow during adjustment
    target_part = flat_pixels[:len(payload_bits)].astype(np.int16)
    lsb_mask = target_part % 2
    
    # Where image LSB doesn't match payload bit, adjust by +/- 1
    mismatch = (lsb_mask != payload_bits)
    if np.any(mismatch):
        # Generate random -1 or 1 for each mismatch
        adjustments = np.random.choice([-1, 1], size=np.count_nonzero(mismatch))
        target_part[mismatch] += adjustments
        
        # Parity-preserving boundary handling (matching original logic)
        # If we went below 0 (0-1), force to 1. If above 255 (255+1), force to 254.
        target_part[target_part < 0] = 1
        target_part[target_part > 255] = 254

    flat_pixels[:len(payload_bits)] = target_part.astype(np.uint8)
    
    # Reconstruct and save
    new_data = flat_pixels.reshape(shape)
    stego_image = Image.fromarray(new_data)
    stego_image.save(output_path)
    return output_path


def extract_inverted_lsb(image_path):
    """Extract payload from stego image using LSB - NumPy Optimized."""
    img = Image.open(image_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    data = np.array(img)
    flat_pixels = data.flatten()

    # Extract length first (32 bits)
    length_bits = flat_pixels[:32] % 2
    length_bytes = np.packbits(length_bits.astype(np.uint8))
    length = struct.unpack('>I', length_bytes.tobytes())[0]

    # Extract payload
    total_bits = 32 + (length * 8)
    if total_bits > len(flat_pixels):
        raise ValueError("Invalid stego image or corrupted data.")
        
    payload_bits = flat_pixels[32:total_bits] % 2
    payload_bytes = np.packbits(payload_bits.astype(np.uint8))
    
    return payload_bytes.tobytes()


# ---------------------------------------------------------------------------
# WebP Compression Function
# ---------------------------------------------------------------------------
def compress_to_webp(input_path, output_path, quality=100):
    """Compress image to WebP format."""
    image = Image.open(input_path)
    image.save(output_path, 'WEBP', lossless=True, quality=100)
    return output_path


# ---------------------------------------------------------------------------
# Quality metrics and detection helpers
# ---------------------------------------------------------------------------
def calculate_mse_psnr(original_path: str, stego_path: str) -> Tuple[float, float]:
    """Calculate MSE and PSNR between two RGB images."""
    original = Image.open(original_path).convert("RGB")
    stego = Image.open(stego_path).convert("RGB")

    if original.size != stego.size:
        stego = stego.resize(original.size, Image.Resampling.LANCZOS)

    orig_arr = np.asarray(original, dtype=np.float32)
    stego_arr = np.asarray(stego, dtype=np.float32)
    mse = float(np.mean((orig_arr - stego_arr) ** 2))
    if mse == 0:
        psnr = float("inf")
    else:
        psnr = 20 * math.log10(255.0 / math.sqrt(mse))
    return mse, psnr


# def stegexpose(image_path: str) -> float:
#     """
#     Run StegExpose CLI if available and return detection score (0-100%).
#     Falls back to 0.0 if the command is missing.
#     """
#     try:
#         result = subprocess.run(
#             ["stegexpose", image_path],
#             capture_output=True,
#             text=True,
#             check=True,
#         )
#         for line in result.stdout.splitlines():
#             if "%" in line:
#                 digits = "".join(ch for ch in line if ch.isdigit() or ch == ".")
#                 if digits:
#                     return float(digits)
#     except FileNotFoundError:
#         logging.warning("StegExpose CLI not found; returning 0.0%% detection probability.")
#     except subprocess.CalledProcessError as exc:
#         logging.error("StegExpose failed: %s", exc)
#     return 0.0
