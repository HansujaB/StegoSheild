from flask import Flask, request, jsonify, g
from flask_cors import CORS
import os
import struct
import base64
import uuid

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

from config import Config
from database import db
from models import Operation
from auth import require_auth
from key_manager import get_or_create_user, get_or_create_keypair, load_user_private_key

# Import stego / crypto functions
from functions import (
    generate_aes_key,
    aes_encrypt,
    aes_decrypt,
    ecies_encrypt,
    ecies_decrypt,
    embed_inverted_lsb,
    extract_inverted_lsb,
    compress_to_webp,
    calculate_mse_psnr,
    stegexpose,
)


app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
# CORS configuration: Allow production Vercel URL and optional localhost for dev
allowed_origins = [
    "https://stego-sheild.vercel.app",
    "http://localhost:5173",
]
CORS(app, resources={r"/api/*": {
    "origins": allowed_origins,
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Clean up old files on startup
for file in os.listdir(UPLOAD_FOLDER):
    try:
        os.remove(os.path.join(UPLOAD_FOLDER, file))
    except Exception:  # noqa: BLE001
        pass


@app.route("/api/process", methods=["POST"])
@require_auth
def process():
    cover_path = stego_png_path = webp_path = None
    try:
        if "image" not in request.files or "payload" not in request.form:
            return jsonify({"success": False, "error": "Missing image or payload"}), 400

        image = request.files["image"]
        payload_text = request.form["payload"].strip()

        if not image.filename:
            return jsonify({"success": False, "error": "No image selected"}), 400
        if not payload_text:
            return jsonify({"success": False, "error": "Secret message is empty"}), 400

        # Resolve user + keypair based on Clerk identity
        user = get_or_create_user(g.auth_sub, g.email, g.name)
        keypair = get_or_create_keypair(user)

        receiver_public_key = serialization.load_pem_public_key(
            keypair.public_key_pem.encode("utf-8"),
            backend=default_backend(),
        )

        # Save cover image with unique name
        cover_ext = os.path.splitext(image.filename)[1].lower()
        if cover_ext not in [".png", ".jpg", ".jpeg"]:
            cover_ext = ".png"
        cover_path = os.path.join(UPLOAD_FOLDER, f"cover_{uuid.uuid4().hex}{cover_ext}")
        image.save(cover_path)

        # Steganography Pipeline
        aes_key = generate_aes_key()
        iv_data, encrypted_data = aes_encrypt(payload_text, aes_key)

        # Encrypt AES key for this user using ECIES with their stored public key
        ephemeral_pub_bytes, iv_key, encrypted_aes_key = ecies_encrypt(aes_key, receiver_public_key)

        # Pack payload with length prefixes
        payload = b"".join(
            [
                struct.pack(">I", len(encrypted_data)) + encrypted_data,
                struct.pack(">I", len(iv_data)) + iv_data,
                struct.pack(">I", len(encrypted_aes_key)) + encrypted_aes_key,
                struct.pack(">I", len(iv_key)) + iv_key,
                struct.pack(">I", len(ephemeral_pub_bytes)) + ephemeral_pub_bytes,
            ]
        )

        # Output paths
        stego_png_path = os.path.join(UPLOAD_FOLDER, f"stego_{uuid.uuid4().hex}.png")
        webp_path = os.path.join(UPLOAD_FOLDER, f"stego_{uuid.uuid4().hex}.webp")

        # Embed + compress
        embed_inverted_lsb(cover_path, payload, stego_png_path)
        compress_to_webp(stego_png_path, webp_path)

        # Calculate metrics
        mse_png, psnr_png = calculate_mse_psnr(cover_path, stego_png_path)
        mse_webp, psnr_webp = calculate_mse_psnr(cover_path, webp_path)

        size_png = os.path.getsize(stego_png_path) / 1024
        size_webp = os.path.getsize(webp_path) / 1024
        savings = round((size_png - size_webp) / size_png * 100, 2) if size_png > 0 else 0
        detection = round(stegexpose(stego_png_path), 2)

        # Convert to Base64
        with open(stego_png_path, "rb") as f:
            png_b64 = base64.b64encode(f.read()).decode("utf-8")
        with open(webp_path, "rb") as f:
            webp_b64 = base64.b64encode(f.read()).decode("utf-8")

        # Record operation
        op = Operation(user_id=user.id, op_type="encode")
        db.session.add(op)
        db.session.commit()

        # === RETURN WHAT REACT EXPECTS ===
        return jsonify(
            {
                "success": True,
                "psnr_png": f"{psnr_png:.2f}",
                "psnr_webp": f"{psnr_webp:.2f}",
                "mse_png": f"{mse_png:.4f}",
                "mse_webp": f"{mse_webp:.4f}",
                "size_png": f"{size_png:.2f} KB",
                "size_webp": f"{size_webp:.2f} KB",
                "savings": f"{savings:.2f}",
                "detection": f"{detection:.2f}",
                "png_base64": f"data:image/png;base64,{png_b64}",
                "webp_base64": f"data:image/webp;base64,{webp_b64}",
            }
        )

    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        # Optional: Clean up temp files
        for path in [cover_path, stego_png_path, webp_path]:
            try:
                if path and os.path.exists(path):
                    os.remove(path)
            except Exception:  # noqa: BLE001
                pass


@app.route("/api/recover", methods=["POST"])
@require_auth
def recover():
    stego_path = None
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "Missing image"}), 400

        image = request.files["image"]
        if not image.filename:
            return jsonify({"success": False, "error": "No image selected"}), 400

        # Persist stego image temporarily
        stego_ext = os.path.splitext(image.filename)[1].lower() or ".png"
        # Allow WebP because the app recommends downloading WebP outputs.
        if stego_ext not in [".png", ".jpg", ".jpeg", ".webp"]:
            stego_ext = ".png"
        stego_path = os.path.join(UPLOAD_FOLDER, f"recover_{uuid.uuid4().hex}{stego_ext}")
        image.save(stego_path)

        # Extract payload bytes from stego
        payload = extract_inverted_lsb(stego_path)

        # Unpack chunks in exactly the same order used during embedding
        offset = 0

        def read_chunk(buf):
            nonlocal offset
            if offset + 4 > len(buf):
                raise ValueError("Corrupted payload: missing length")
            length = struct.unpack(">I", buf[offset : offset + 4])[0]
            offset += 4
            if offset + length > len(buf):
                raise ValueError("Corrupted payload: truncated data")
            data = buf[offset : offset + length]
            offset += length
            return data

        encrypted_data = read_chunk(payload)
        iv_data = read_chunk(payload)
        encrypted_aes_key = read_chunk(payload)
        iv_key = read_chunk(payload)
        ephemeral_pub_bytes = read_chunk(payload)

        # Resolve user's private key
        user = get_or_create_user(g.auth_sub, g.email, g.name)
        receiver_private_key = load_user_private_key(user)

        # Decrypt AES key then plaintext
        aes_key = ecies_decrypt(ephemeral_pub_bytes, iv_key, encrypted_aes_key, receiver_private_key)
        plain_text = aes_decrypt(iv_data, encrypted_data, aes_key)

        op = Operation(user_id=user.id, op_type="decode")
        db.session.add(op)
        db.session.commit()

        return jsonify({"success": True, "message": plain_text})

    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        if stego_path:
            try:
                if os.path.exists(stego_path):
                    os.remove(stego_path)
            except Exception:  # noqa: BLE001
                pass


# Port for deployment (Render/Railway injects PORT env var)
port = int(os.environ.get("PORT", 5000))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    print(f"StegoShield Backend Running on http://localhost:{port}")
    app.run(debug=True, port=port)
else:
    # This runs when imported by gunicorn in production
    with app.app_context():
        # Ensure tables are created if using a SQL database
        if not app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite'):
            db.create_all()
