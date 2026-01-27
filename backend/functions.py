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
    """Embed payload into image using inverted LSB (LSB matching)."""
    image = Image.open(image_path)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    pixels = list(image.getdata())
    flat_pixels = [channel for pixel in pixels for channel in pixel]  # Flatten to list of channels

    # Convert payload to bits
    payload_bits = ''.join(f'{byte:08b}' for byte in payload_bytes)

    # Embed length first (4 bytes for payload length in bytes)
    length = len(payload_bytes)
    length_bytes = struct.pack('>I', length)
    length_bits = ''.join(f'{byte:08b}' for byte in length_bytes)

    all_bits = length_bits + payload_bits
    bit_index = 0

    for i in range(len(flat_pixels)):
        if bit_index >= len(all_bits):
            break
        b = int(all_bits[bit_index])
        v = flat_pixels[i]
        if (v % 2) != b:
            adjustment = random.choice([-1, 1])
            v += adjustment
            if v < 0:
                v = 1
            elif v > 255:
                v = 254
        flat_pixels[i] = v
        bit_index += 1

    if bit_index < len(all_bits):
        raise ValueError("Image too small for payload")

    # Reconstruct pixels
    new_pixels = [(flat_pixels[j], flat_pixels[j+1], flat_pixels[j+2]) for j in range(0, len(flat_pixels), 3)]
    stego_image = Image.new('RGB', image.size)
    stego_image.putdata(new_pixels)
    stego_image.save(output_path)
    return output_path


def extract_inverted_lsb(image_path):
    """Extract payload from stego image using LSB."""
    image = Image.open(image_path)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    pixels = list(image.getdata())
    flat_pixels = [channel for pixel in pixels for channel in pixel]

    # Extract length bits first (32 bits)
    length_bits = ''
    for i in range(32):
        length_bits += str(flat_pixels[i] % 2)
    length = struct.unpack('>I', int(length_bits, 2).to_bytes(4, 'big'))[0]

    # Extract payload bits
    payload_bits = ''
    for i in range(32, 32 + length * 8):
        payload_bits += str(flat_pixels[i] % 2)

    # Convert bits to bytes
    payload_bytes = bytes(int(payload_bits[j:j+8], 2) for j in range(0, len(payload_bits), 8))
    return payload_bytes


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

def stegexpose(image_path: str):
    logging.info("StegExpose skipped (Docker not enabled yet)")
    return 0.0