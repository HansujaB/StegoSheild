# 🛡️ StegoShield

**Military-Grade Steganography with Hybrid Encryption**

Hide secrets in plain sight with undetectable, lossless encryption. StegoShield combines AES-256 encryption with advanced LSB steganography to embed encrypted data into images while maintaining exceptional visual quality.
Based on research paper backend accepted at WcCST 2026 

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Key Features

- 🔐 **Hybrid Encryption**: AES-256 + ECIES (Elliptic Curve Integrated Encryption Scheme)
- 🎨 **Inverted LSB Steganography**: Advanced LSB matching for undetectable embedding
- 📊 **70+ dB PSNR**: Exceptional image quality preservation
- 🗜️ **40% Compression**: WebP lossless compression for smaller file sizes
- 🔍 **0% Detection Rate**: Passes StegExpose analysis
- 🌐 **Modern Web Interface**: Beautiful React frontend with dark mode

---

## 📊 Performance Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| **PSNR** | 70.46 dB | Peak Signal-to-Noise Ratio (image quality) |
| **Detection** | 0.00% | StegExpose steganography detection |
| **Compression** | 40.9% | File size reduction with WebP |
| **Avalanche Effect** | 99.6% | Encryption strength indicator |
| **Max Payload** | 10KB+ | Maximum hidden data size |

---

## 🏗️ Architecture

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
│  1. Generate AES-256 Key                                │
│  2. Encrypt Message with AES                            │
│  3. Generate ECC Key Pair (SECP256R1)                   │
│  4. Encrypt AES Key with ECIES                          │
│  5. Embed Encrypted Data using LSB Matching             │
│  6. Compress to WebP (Lossless)                         │
│  7. Calculate Quality Metrics (PSNR, MSE)               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** (for React frontend)
- **pip** (Python package manager)
- **npm** (Node package manager)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/stegoshield.git
cd stegoshield
```

### 2️⃣ Backend Setup

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

# Create a dev env file (required for Clerk + key encryption)
# Create: backend/.env
# Then set values (example below in "Environment Variables" section)

# Run Flask server
python app.py
```

Backend runs on: **http://localhost:5000**

### 3️⃣ Frontend Setup

```bash
cd stegoSheild

# Install dependencies
npm install

# Create frontend env (required for Clerk)
# Create: stegoSheild/.env.local
# Then set VITE_CLERK_PUBLISHABLE_KEY=...

# Start React app
npm run dev
```

Frontend runs on: **http://localhost:5173** (Vite default)


---

## 📁 Project Structure

```
stegoshield/
│
├── backend/
│   ├── app.py                    # Flask API server & endpoint routing
│   ├── auth.py                   # Clerk JWT authentication middleware
│   ├── config.py                 # App configuration & env loading
│   ├── database.py               # SQLAlchemy instance initialization
│   ├── models.py                 # Database schemas (User, KeyPair, Operation)
│   ├── key_manager.py            # ECC key generation & AES-GCM encryption
│   ├── functions.py              # Core crypto & stego logic
│   ├── preprocessing.py          # Image normalization utility
│   ├── requirements.txt          # Python dependencies
│   ├── uploads/                  # Temporary file processing storage
│   └── instance/                 # SQLite database storage
│
├── stegoSheild/          # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   └── main.jsx             # React entry point
│   ├── public/
│   ├── package.json             # Node dependencies
│   └── tailwind.config.js       # Tailwind CSS config
│
└── README.md                     # This file
```

---

## 🔧 API Endpoints

### **POST** `/api/process`

Encrypt message and embed into image. Requires Clerk authentication.

**Request:**
```http
POST /api/process
Content-Type: multipart/form-data
Authorization: Bearer <clerk_token>

image: <file>           # Cover image (PNG/JPEG)
payload: <string>       # Secret message (max 10KB)
```

**Response:**
```json
{
  "success": true,
  "psnr_png": "70.46",
  "psnr_webp": "70.82",
  "mse_png": "0.0023",
  "mse_webp": "0.0021",
  "size_png": "256.34 KB",
  "size_webp": "151.89 KB",
  "savings": "40.75",
  "detection": "0.00",
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

## 🔐 Clerk + .env Setup (Dev)

### Step 1: Create a Clerk project
- Go to Clerk dashboard and create a new application.
- Enable **Google** (or any provider you want) under **User & Authentication → Social connections**.
- Copy your **Publishable key**.

### Step 2: Frontend env file
Create `stegoSheild/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
```

Restart the Vite dev server after changing env files.

### Step 3: Backend env file
Create `backend/.env`:

```env
FLASK_ENV=development
FLASK_SECRET_KEY=dev-secret
DATABASE_URL=sqlite:///stegoshield.db

# 32-byte key base64. Generate with:
# python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"
MASTER_KEY=REPLACE_WITH_BASE64_32_BYTE_KEY

# Clerk JWKS (required so backend can verify Clerk session tokens)
# Find your Clerk domain/issuer in Clerk dashboard. If unsure:
# - Use your app's Frontend API domain and build:
#   https://<your-frontend-api>/.well-known/jwks.json
CLERK_JWKS_URL=https://YOUR-CLERK-DOMAIN/.well-known/jwks.json

# Optional in dev (backend will skip if unset):
# CLERK_ISS=https://YOUR-CLERK-DOMAIN
# CLERK_AUDIENCE=YOUR_AUDIENCE
```

### Step 4: Run
- Backend: `cd backend` then `.\venv\Scripts\python.exe app.py`
- Frontend: `cd stegoSheild` then `npm run dev`

### Notes
- SQLite file DB will be created automatically: `backend/instance/stegoshield.db`
- Each Clerk user gets their own ECC keypair stored in SQLite.
- Private keys are encrypted using AES-GCM with the `MASTER_KEY` before being saved to the database.

---

## 🗄️ Database & Storage

StegoShield uses **SQLAlchemy** with **SQLite** for managing users, security keys, and operation logs.

### **Schema Overview**

1.  **Users Table**: Maps Clerk authentication IDs (`auth_sub`) to local user profiles.
2.  **KeyPairs Table**: Stores per-user Elliptic Curve (SECP256R1) keys.
    *   **Public Key**: Stored in PEM format for encryption.
    *   **Private Key**: Encrypted with `MASTER_KEY` (AES-GCM) + unique nonce for security at rest.
3.  **Operations Table**: Audit log of all encryption and decryption events (type, timestamp, user).

### **Data Security**
*   **Zero-Knowledge (almost)**: The server never stores secret messages. They exist only in memory during processing and are embedded into images.
*   **Key Protection**: Even if the database is compromised, private keys cannot be used without the `MASTER_KEY` defined in the environment variables.

## 🔐 Encryption Pipeline

### 1. **AES-256 Encryption**
- Generates 256-bit random key
- Encrypts message using AES-CBC mode
- PKCS7 padding for block alignment

### 2. **ECIES Key Encryption**
- Generates ephemeral ECC key pair (SECP256R1)
- Encrypts AES key using receiver's public key
- Secure key exchange without pre-shared secrets

### 3. **LSB Steganography**
- Inverted LSB matching algorithm
- Random ±1 adjustment to pixel values
- Embeds encrypted payload + metadata

### 4. **WebP Compression**
- Lossless compression (90% quality)
- Preserves embedded data integrity
- 35-40% file size reduction

---

## 📸 Image Preprocessing

Normalize images before processing:

```bash
python preprocessing.py input_image.jpg output_directory
```

**Features:**
- Converts to RGB color space
- Resizes to 512×512 pixels
- Saves as PNG format
- Centers or pads smaller images

---

## 🧪 Usage Example

### Python Backend (Programmatic)

```python
from functions import (
    generate_aes_key,
    aes_encrypt,
    generate_ecc_key_pair,
    ecies_encrypt,
    embed_inverted_lsb
)

# 1. Encrypt message
aes_key = generate_aes_key()
iv, ciphertext = aes_encrypt("Secret message", aes_key)

# 2. Encrypt AES key
private_key, public_key = generate_ecc_key_pair()
eph_pub, iv_key, enc_key = ecies_encrypt(aes_key, public_key)

# 3. Embed into image
embed_inverted_lsb("cover.png", ciphertext, "stego.png")
```

### Web Interface

1. Navigate to **http://localhost:5173**
2. Click **"Shield It Now"**
3. Upload a cover image (PNG/JPEG, max 5MB)
4. Enter your secret message (max 10KB)
5. Click **"Encrypt & Embed"**
6. Download stego PNG or WebP

---

## 🛡️ Security Features

### Encryption Strength
- **AES-256**: Industry-standard symmetric encryption
- **SECP256R1**: NIST-approved elliptic curve
- **HKDF**: Key derivation with SHA-256
- **99.6% Avalanche Effect**: Strong diffusion properties

### Steganography Detection Resistance
- **LSB Matching**: Avoids sequential LSB patterns
- **Random Adjustments**: Prevents statistical analysis
- **0% StegExpose Detection**: Passes automated detection

### Data Integrity
- **PKCS7 Padding**: Proper block alignment
- **Length Prefixes**: Payload boundary verification
- **Lossless WebP**: No data corruption

---
- ✅ **Persistent Key Storage**: Use HSM or key vault (e.g., AWS KMS, Azure Key Vault)
- ✅ **User Authentication**: Clerk for user authentication
- ✅ **HTTPS/TLS**: Encrypt all network traffic
- ✅ **Rate Limiting**: Prevent abuse (e.g., Flask-Limiter)
- ✅ **Input Validation**: Sanitize all file uploads
- ✅ **Logging & Monitoring**: Track security events
- ✅ **CSRF Protection**: Use Flask-WTF or similar
- ✅ **File Cleanup**: Auto-delete processed files after X hours
---



## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'flask'`  
**Solution:**
```bash
pip install -r requirements.txt
```

**Problem:** `CORS error` in browser console  
**Solution:**
```bash
pip install flask-cors
```

**Problem:** `Image too small for payload`  
**Solution:** Use larger images (min 512×512) or reduce message length

### Frontend Issues

**Problem:** `Cannot connect to backend`  
**Solution:** Ensure Flask is running on port 5000

**Problem:** CSS not working  
**Solution:** Run `npm install tailwindcss` and rebuild

---

## 📚 Technical Documentation

### LSB Matching Algorithm

Instead of directly replacing LSBs, the algorithm:
1. Reads the pixel value `v`
2. Checks if `v % 2 == bit_to_embed`
3. If not, randomly adjusts `v` by ±1
4. Prevents sequential patterns detectable by chi-square analysis

### Payload Structure

```
[4 bytes: encrypted_data_length] + encrypted_data +
[4 bytes: iv_data_length] + iv_data +
[4 bytes: encrypted_key_length] + encrypted_key +
[4 bytes: iv_key_length] + iv_key +
[4 bytes: ephemeral_pub_length] + ephemeral_pub
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint + Prettier
- **Commits**: Use conventional commits format

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Hansuja**

- GitHub: [@hansuja](https://github.com/HansujaB)
- Made with ❤️ for secure communication 

---

## 🙏 Acknowledgments

- **Cryptography Library**: Python cryptography team
- **Pillow**: Python Imaging Library
- **Flask**: Pallets Projects
- **React**: Meta Open Source
- **Tailwind CSS**: Tailwind Labs
- **StegExpose**: Academic steganography research

---

## 🔮 Future Roadmap

- [ ] Multi-user support with authentication
- [ ] Batch image processing
- [ ] Mobile app (React Native)
- [ ] Audio/video steganography
- [ ] Cloud deployment templates (Docker, K8s)
- [ ] End-to-end encrypted file sharing
- [ ] Browser extension
- [ ] CLI tool for automated workflows

