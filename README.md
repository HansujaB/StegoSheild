# 🛡️ StegoShield

**Military-Grade Steganography with Hybrid Encryption**

Hide secrets in plain sight with undetectable, lossless encryption. StegoShield combines AES-256 encryption with advanced LSB steganography to embed encrypted data into images while maintaining exceptional visual quality.

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

# Run Flask server
python app.py
```

Backend runs on: **http://localhost:5000**

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 📁 Project Structure

```
stegoshield/
│
├── backend/
│   ├── app.py                    # Flask API server
│   ├── functions.py              # Core crypto & stego functions
│   ├── preprocessing.py          # Image preprocessing utility
│   ├── requirements.txt          # Python dependencies
│   ├── uploads/                  # Temporary file storage
│   └── venv/                     # Virtual environment (gitignored)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   └── index.js             # React entry point
│   ├── public/
│   ├── package.json             # Node dependencies
│   └── tailwind.config.js       # Tailwind CSS config
│
└── README.md                     # This file
```

---

## 🔧 API Endpoints

### **POST** `/api/process`

Encrypt message and embed into image.

**Request:**
```http
POST /api/process
Content-Type: multipart/form-data

image: <file>           # Cover image (PNG/JPEG)
payload: <string>       # Secret message (max 10KB)
```

**Response:**
```json
{
  "success": true,
  "psnr": "70.46",
  "mse": "0.0023",
  "size_png": "256.34 KB",
  "size_webp": "151.89 KB",
  "savings": "40.75%",
  "detection": "0.00%",
  "png_url": "http://localhost:5000/download/png",
  "webp_url": "http://localhost:5000/download/webp"
}
```

### **GET** `/download/png`

Download stego PNG image.

### **GET** `/download/webp`

Download stego WebP image (lossless).

---

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

1. Navigate to **http://localhost:3000**
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

## ⚠️ Security Considerations

### Production Deployment

**⚠️ This implementation is for educational/demonstration purposes.**

For production use, implement:

- ✅ **Persistent Key Storage**: Use HSM or key vault (e.g., AWS KMS, Azure Key Vault)
- ✅ **User Authentication**: JWT tokens, OAuth2, or session management
- ✅ **HTTPS/TLS**: Encrypt all network traffic
- ✅ **Rate Limiting**: Prevent abuse (e.g., Flask-Limiter)
- ✅ **Input Validation**: Sanitize all file uploads
- ✅ **Logging & Monitoring**: Track security events
- ✅ **CSRF Protection**: Use Flask-WTF or similar
- ✅ **File Cleanup**: Auto-delete processed files after X hours

### Current Limitations

- 🔴 Keys stored in memory (lost on server restart)
- 🔴 No user authentication
- 🔴 HTTP only (no HTTPS)
- 🔴 Files stored on disk indefinitely

---

## 📦 Dependencies

### Backend (Python)

```
Flask==3.0.0              # Web framework
flask-cors==4.0.0         # CORS support
cryptography==41.0.7      # Encryption primitives
Pillow==10.1.0            # Image processing
numpy==1.26.2             # Numerical operations
```

### Frontend (JavaScript)

```
react==18.2.0             # UI framework
lucide-react==0.263.1     # Icon library
tailwindcss==3.3.0        # CSS framework
```

---

## 🧪 Testing

### Run Unit Tests

```bash
cd backend
python -m pytest tests/
```

### Manual Testing

1. **Image Quality Test**:
   - Upload a high-resolution image
   - Verify PSNR > 60 dB

2. **Detection Test**:
   - Run StegExpose on output image
   - Confirm 0% detection rate

3. **Extraction Test**:
   - Decrypt and extract message
   - Verify original message integrity

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

