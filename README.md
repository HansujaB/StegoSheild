# StegoShield

**Hybrid Steganography & Cryptography Framework**

A secure communication framework integrating AES-128-CBC payload encryption, Elliptic Curve Cryptography (ECC) via SECP256R1 for key exchange, inverted Least Significant Bit (LSB) embedding in the RGB color space, and lossless WebP compression for efficient transmission.

**Research paper accepted at WcCST 2026.** [Read on IEEE Xplore →](https://ieeexplore.ieee.org/document/11496298)

Experimentally validated on the USC-SIPI dataset (840 stego PNG images, payload sizes 50 B – 10 KB).

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Performance Metrics

| Metric | Value | Description |
|---|---|---|
| **PSNR** | 61.32 dB (mean), σ = 0.02 dB | Peak Signal-to-Noise Ratio at 10 KB payload |
| **Detection** | 0.00% | StegExpose detection rate across 840 stego PNGs |
| **Compression** | 35–40% | File size reduction (PNG → lossless WebP) |
| **Avalanche Effect** | 99.6% | Both AES and ECC layers |
| **Payload Recovery** | 100% | After WebP compression |
| **Max Payload** | 10 KB | Maximum hidden data size per image |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  (Upload Image + Secret Message → Display Results)      │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP API
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    Flask Backend                         │
├─────────────────────────────────────────────────────────┤
│  1. Generate AES-128 Key (128-bit)                      │
│  2. Encrypt Message with AES-128-CBC + PKCS7 Padding    │
│  3. Generate ECC Key Pair (SECP256R1)                   │
│  4. Encrypt AES Key with ECIES (ECDH + HKDF-SHA256)    │
│  5. Embed Encrypted Data using Inverted LSB Matching    │
│  6. Compress to WebP (Lossless)                         │
│  7. Calculate Quality Metrics (PSNR, MSE)               │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** (for React frontend)
- **pip** (Python package manager)
- **npm** (Node package manager)

### 1. Clone Repository

```bash
git clone https://github.com/HansujaB/StegoSheild.git
cd StegoSheild
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
.\venv\Scripts\Activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create backend/.env (see "Environment Variables" section below)

# Run Flask server
python app.py
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd stegoSheild

# Install dependencies
npm install

# Create stegoSheild/.env.local (see "Environment Variables" section below)

# Start React app
npm run dev
```

Frontend runs on: **http://localhost:5173** (Vite default)

---

## Project Structure

```
StegoSheild/
│
├── backend/
│   ├── app.py                    # Flask API server & endpoint routing
│   ├── auth.py                   # Clerk JWT authentication middleware
│   ├── config.py                 # App configuration & env loading
│   ├── database.py               # SQLAlchemy instance initialization
│   ├── models.py                 # Database schemas (User, KeyPair, Operation)
│   ├── key_manager.py            # ECC key generation & AES-GCM key-at-rest encryption
│   ├── functions.py              # Core crypto & steganography logic
│   ├── preprocessing.py          # Image normalization utility (512×512, RGB, PNG)
│   ├── requirements.txt          # Python dependencies
│   ├── uploads/                  # Temporary file processing storage
│   └── instance/                 # SQLite database storage (dev)
│
├── stegoSheild/                  # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx              # React entry point with Clerk provider
│   │   ├── App.jsx               # Root component & page routing
│   │   ├── api.js                # Authenticated API helper hook
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── EncryptPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── RecoverPage.jsx
│   │   │   └── Footer.jsx
│   │   └── styles/
│   │       └── index.css         # Global design system
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## API Endpoints

### **POST** `/api/process`

Encrypt message and embed into image. Requires Clerk authentication.

**Request:**
```http
POST /api/process
Content-Type: multipart/form-data
Authorization: Bearer <clerk_token>

image: <file>           # Cover image (PNG/JPEG)
payload: <string>       # Secret message (max 10 KB)
```

**Response:**
```json
{
  "success": true,
  "psnr_png": "61.32",
  "psnr_webp": "61.45",
  "mse_png": "0.0479",
  "mse_webp": "0.0466",
  "size_png": "256.34 KB",
  "size_webp": "161.89 KB",
  "savings": "36.85",
  "png_base64": "data:image/png;base64,...",
  "webp_base64": "data:image/webp;base64,..."
}
```

### **POST** `/api/recover`

Extract and decrypt message from a stego image. Requires Clerk authentication.

**Request:**
```http
POST /api/recover
Content-Type: multipart/form-data
Authorization: Bearer <clerk_token>

image: <file>           # Stego image (PNG/WebP)
```

**Response:**
```json
{
  "success": true,
  "message": "The original secret message"
}
```

---

## Environment Variables

### Frontend `stegoSheild/.env.local`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
```

### Backend `backend/.env`

```env
FLASK_ENV=development
FLASK_SECRET_KEY=dev-secret
DATABASE_URL=sqlite:///stegoshield.db

# 32-byte key base64. Generate with:
# python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"
MASTER_KEY=REPLACE_WITH_BASE64_32_BYTE_KEY

# Clerk JWKS (required so backend can verify Clerk session tokens)
# Find your Clerk domain in the Clerk dashboard, then build:
#   https://<your-frontend-api>/.well-known/jwks.json
CLERK_JWKS_URL=https://YOUR-CLERK-DOMAIN/.well-known/jwks.json
```

### Running

- Backend: `cd backend && .\venv\Scripts\python.exe app.py`
- Frontend: `cd stegoSheild && npm run dev`

---

## Encryption Pipeline

### 1. AES-128-CBC Encryption

- Generates a **128-bit** random key (`os.urandom(16)`)
- Encrypts the plaintext message using **AES in CBC mode**
- **PKCS7 padding** for block alignment (128-bit block size)

### 2. ECIES Key Encryption

- Generates an **ephemeral ECC key pair** (SECP256R1 / P-256)
- Performs **ECDH** key exchange with the receiver's stored public key
- Derives a **256-bit symmetric key** via **HKDF-SHA256**
- Encrypts the AES-128 key using AES-256-CBC with the derived key
- Serializes the ephemeral public key as a compressed X9.62 point

### 3. Inverted LSB Steganography

- Operates on **RGB color space** across all three channels
- For each bit to embed, checks if the pixel value's LSB already matches
- If not, randomly adjusts the pixel value by **±1** (LSB matching)
- Parity-preserving boundary handling (0→1, 255→254)
- Prevents sequential patterns detectable by chi-square analysis

### 4. Lossless WebP Compression

- Saves as **lossless WebP** (`lossless=True, quality=100`)
- Preserves all embedded data with **100% payload recovery**
- Achieves **35–40% file size reduction** vs. the stego PNG

---

## Payload Structure

```
[4 bytes: encrypted_data_length] + encrypted_data +
[4 bytes: iv_data_length] + iv_data +
[4 bytes: encrypted_key_length] + encrypted_key +
[4 bytes: iv_key_length] + iv_key +
[4 bytes: ephemeral_pub_length] + ephemeral_pub
```

All lengths are encoded as big-endian 32-bit unsigned integers.

---

## Database & Storage

StegoShield uses **SQLAlchemy** with **SQLite** (dev) or **PostgreSQL** (production via Neon).

### Schema

1. **Users**: Maps Clerk authentication IDs (`auth_sub`) to local user profiles.
2. **KeyPairs**: Stores per-user ECC (SECP256R1) keys.
   - **Public Key**: PEM format, used for ECIES encryption.
   - **Private Key**: Encrypted at rest with `MASTER_KEY` via AES-256-GCM + unique nonce.
3. **Operations**: Audit log of all encode/decode events (type, timestamp, user).

### Data Security

- **Zero-knowledge**: The server never stores secret messages. They exist only in memory during processing.
- **Key protection**: Even if the database is compromised, private keys cannot be decrypted without the `MASTER_KEY`.

---

## Security Features

### Encryption Strength

- **AES-128-CBC**: 128-bit symmetric encryption with PKCS7 padding
- **SECP256R1**: NIST P-256 elliptic curve for key exchange
- **HKDF-SHA256**: Key derivation from ECDH shared secret
- **99.6% Avalanche Effect**: Strong diffusion in both AES and ECC layers

### Steganography Detection Resistance

- **Inverted LSB Matching**: Random ±1 pixel adjustment avoids detectable patterns
- **0% StegExpose Detection**: Tested across 840 stego PNGs (50 B – 10 KB payloads)
- **RGB Color Space**: Embeds across all three channels for maximum capacity

### Data Integrity

- **PKCS7 Padding**: Proper 128-bit block alignment
- **Length Prefixes**: Payload boundary verification via big-endian `uint32`
- **Lossless WebP**: No data corruption during compression

---

## Image Preprocessing

Normalize images before processing:

```bash
python preprocessing.py input_image.jpg output_directory
```

- Converts to RGB color space
- Resizes to 512×512 pixels
- Saves as PNG format
- Centers or pads smaller images

---

## Production Deployment

- **PostgreSQL**: Integrated `psycopg2` and dynamic URI handling for Neon/Render.
- **Secure CORS**: Restricted API access to production domains.
- **Dynamic Port**: Support for cloud-injected `PORT` variable.
- **User Authentication**: Clerk for identity and session management.
- **File Cleanup**: Auto-delete processed files after every request.

---

## Troubleshooting

### Backend

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'flask'` | `pip install -r requirements.txt` |
| CORS error in browser console | Ensure `flask-cors` is installed and origin is allowed |
| `Image too small for payload` | Use larger images (min 512×512) or reduce message size |

### Frontend

| Problem | Solution |
|---|---|
| Cannot connect to backend | Ensure Flask is running on port 5000 |
| Styles not loading | Run `npm install` and restart dev server |

---

## Usage Example (Programmatic)

```python
from functions import (
    generate_aes_key,
    aes_encrypt,
    generate_ecc_key_pair,
    ecies_encrypt,
    embed_inverted_lsb
)

# 1. Encrypt message with AES-128-CBC
aes_key = generate_aes_key()           # 128-bit key
iv, ciphertext = aes_encrypt("Secret message", aes_key)

# 2. Encrypt AES key with ECIES (SECP256R1)
private_key, public_key = generate_ecc_key_pair()
eph_pub, iv_key, enc_key = ecies_encrypt(aes_key, public_key)

# 3. Embed into image using inverted LSB
embed_inverted_lsb("cover.png", ciphertext, "stego.png")
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint
- **Commits**: Use conventional commits format

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

---

## Author

**Hansuja**

- GitHub: [@HansujaB](https://github.com/HansujaB)

---

## Research Paper

📄 **IEEE Xplore**: [https://ieeexplore.ieee.org/document/11496298](https://ieeexplore.ieee.org/document/11496298)

---

## Acknowledgments

- **Cryptography Library**: Python `cryptography` team
- **Pillow**: Python Imaging Library
- **Flask**: Pallets Projects
- **React**: Meta Open Source
- **Tailwind CSS**: Tailwind Labs
- **StegExpose**: Academic steganography research
- **USC-SIPI**: Image database for experimental evaluation
