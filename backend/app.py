# from flask import Flask, request, send_file, jsonify
# from flask_cors import CORS
# import os
# import struct
# from functions import (
#     generate_aes_key, 
#     aes_encrypt, 
#     aes_decrypt,
#     generate_ecc_key_pair, 
#     ecies_encrypt, 
#     ecies_decrypt,
#     embed_inverted_lsb, 
#     extract_inverted_lsb,
#     compress_to_webp,
#     calculate_mse_psnr, 
#     stegexpose
# )

# app = Flask(__name__)
# CORS(app)  # Enable CORS for React frontend

# UPLOAD_FOLDER = 'uploads'
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # Store keys in memory
# receiver_private_key = None
# receiver_public_key = None


# @app.route('/api/process', methods=['POST'])
# def process():
#     global receiver_private_key, receiver_public_key
    
#     try:
#         # Validate request
#         if 'image' not in request.files or 'payload' not in request.form:
#             return jsonify({'success': False, 'error': 'Missing image or payload'}), 400
        
#         image = request.files['image']
#         payload_text = request.form['payload']
        
#         if not image.filename:
#             return jsonify({'success': False, 'error': 'No image selected'}), 400
        
#         # Save cover image
#         cover_path = os.path.join(UPLOAD_FOLDER, image.filename)
#         image.save(cover_path)
        
#         # Run pipeline
#         aes_key = generate_aes_key()
#         iv_data, encrypted_data = aes_encrypt(payload_text, aes_key)
        
#         receiver_private_key, receiver_public_key = generate_ecc_key_pair()
        
#         ephemeral_pub_bytes, iv_key, encrypted_aes_key = ecies_encrypt(aes_key, receiver_public_key)
        
#         payload = b''.join([
#             struct.pack('>I', len(encrypted_data)) + encrypted_data,
#             struct.pack('>I', len(iv_data)) + iv_data,
#             struct.pack('>I', len(encrypted_aes_key)) + encrypted_aes_key,
#             struct.pack('>I', len(iv_key)) + iv_key,
#             struct.pack('>I', len(ephemeral_pub_bytes)) + ephemeral_pub_bytes
#         ])
        
#         stego_png_path = os.path.join(UPLOAD_FOLDER, 'stego.png')
#         webp_path = os.path.join(UPLOAD_FOLDER, 'stego.webp')
        
#         embed_inverted_lsb(cover_path, payload, stego_png_path)
#         compress_to_webp(stego_png_path, webp_path)
        
#         mse_png, psnr_png = calculate_mse_psnr(cover_path, stego_png_path)
#         mse_webp, psnr_webp = calculate_mse_psnr(cover_path, webp_path)
        
#         size_png = os.path.getsize(stego_png_path) / 1024
#         size_webp = os.path.getsize(webp_path) / 1024
#         savings = (size_png - size_webp) / size_png * 100 if size_png > 0 else 0
        
#         detection = stegexpose(stego_png_path)
        
#         return jsonify({
#             'success': True,
#             'psnr': f"{psnr_png:.2f}",
#             'mse': f"{mse_png:.4f}",
#             'size_png': f"{size_png:.2f} KB",
#             'size_webp': f"{size_webp:.2f} KB",
#             'savings': f"{savings:.2f}%",
#             'detection': f"{detection:.2f}%",
#             'png_url': 'http://localhost:5000/download/png',
#             'webp_url': 'http://localhost:5000/download/webp'
#         })
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500


# @app.route('/download/png')
# def download_png():
#     return send_file(
#         os.path.join(UPLOAD_FOLDER, 'stego.png'),
#         mimetype='image/png',
#         as_attachment=True,
#         download_name='stego_output.png'
#     )


# @app.route('/download/webp')
# def download_webp():
#     return send_file(
#         os.path.join(UPLOAD_FOLDER, 'stego.webp'),
#         mimetype='image/webp',
#         as_attachment=True,
#         download_name='stego_output.webp'
#     )


# if __name__ == '__main__':
#     app.run(debug=True, port=5000)

# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import struct
import base64
import uuid

# Import your functions (make sure functions.py is in the same folder)
from functions import (
    generate_aes_key,
    aes_encrypt,
    generate_ecc_key_pair,
    ecies_encrypt,
    embed_inverted_lsb,
    compress_to_webp,
    calculate_mse_psnr,
    stegexpose
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Optional: Clean up old files on startup
for file in os.listdir(UPLOAD_FOLDER):
    try:
        os.remove(os.path.join(UPLOAD_FOLDER, file))
    except:
        pass

@app.route('/api/process', methods=['POST'])
def process():
    try:
        if 'image' not in request.files or 'payload' not in request.form:
            return jsonify({'success': False, 'error': 'Missing image or payload'}), 400

        image = request.files['image']
        payload_text = request.form['payload'].strip()

        if not image.filename:
            return jsonify({'success': False, 'error': 'No image selected'}), 400
        if not payload_text:
            return jsonify({'success': False, 'error': 'Secret message is empty'}), 400

        # Save cover image with unique name
        cover_ext = os.path.splitext(image.filename)[1].lower()
        if cover_ext not in ['.png', '.jpg', '.jpeg']:
            cover_ext = '.png'
        cover_path = os.path.join(UPLOAD_FOLDER, f"cover_{uuid.uuid4().hex}{cover_ext}")
        image.save(cover_path)

        # === Steganography Pipeline ===
        aes_key = generate_aes_key()
        iv_data, encrypted_data = aes_encrypt(payload_text, aes_key)

        _, receiver_public_key = generate_ecc_key_pair()
        ephemeral_pub_bytes, iv_key, encrypted_aes_key = ecies_encrypt(aes_key, receiver_public_key)

        # Pack payload with length prefixes
        payload = b''.join([
            struct.pack('>I', len(encrypted_data)) + encrypted_data,
            struct.pack('>I', len(iv_data)) + iv_data,
            struct.pack('>I', len(encrypted_aes_key)) + encrypted_aes_key,
            struct.pack('>I', len(iv_key)) + iv_key,
            struct.pack('>I', len(ephemeral_pub_bytes)) + ephemeral_pub_bytes
        ])

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
            png_b64 = base64.b64encode(f.read()).decode('utf-8')
        with open(webp_path, "rb") as f:
            webp_b64 = base64.b64encode(f.read()).decode('utf-8')

        # === RETURN EXACTLY WHAT REACT EXPECTS ===
        return jsonify({
            'success': True,
            'psnr_png': f"{psnr_png:.2f}",
            'psnr_webp': f"{psnr_webp:.2f}",
            'mse_png': f"{mse_png:.4f}",
            'mse_webp': f"{mse_webp:.4f}",
            'size_png': f"{size_png:.2f} KB",
            'size_webp': f"{size_webp:.2f} KB",
            'savings': f"{savings:.2f}",
            'detection': f"{detection:.2f}",
            'png_base64': f"data:image/png;base64,{png_b64}",
            'webp_base64': f"data:image/webp;base64,{webp_b64}"
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        # Optional: Clean up temp files
        for path in [cover_path, stego_png_path, webp_path]:
            try:
                if 'path' in locals() and os.path.exists(path):
                    os.remove(path)
            except:
                pass

if __name__ == '__main__':
    print("StegoShield Backend Running on http://localhost:5000")
    app.run(debug=True, port=5000)