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

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import struct
import base64
import uuid
from functions import (
    generate_aes_key, 
    aes_encrypt, 
    aes_decrypt,
    generate_ecc_key_pair, 
    ecies_encrypt, 
    ecies_decrypt,
    embed_inverted_lsb, 
    extract_inverted_lsb,
    compress_to_webp,
    calculate_mse_psnr, 
    stegexpose
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Clean up old uploads periodically (optional)
def cleanup_uploads():
    for file in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, file)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except:
                pass

@app.route('/api/process', methods=['POST'])
def process():
    cleanup_uploads()  # Optional: prevent disk bloat

    try:
        if 'image' not in request.files or 'payload' not in request.form:
            return jsonify({'success': False, 'error': 'Missing image or payload'}), 400
        
        image = request.files['image']
        payload_text = request.form['payload']
        
        if not image.filename:
            return jsonify({'success': False, 'error': 'No image selected'}), 400

        # Save cover image with unique name
        cover_filename = f"cover_{uuid.uuid4().hex}{os.path.splitext(image.filename)[1]}"
        cover_path = os.path.join(UPLOAD_FOLDER, cover_filename)
        image.save(cover_path)

        # Pipeline
        aes_key = generate_aes_key()
        iv_data, encrypted_data = aes_encrypt(payload_text, aes_key)
        
        _, receiver_public_key = generate_ecc_key_pair()  # We don't need private key on sender
        
        ephemeral_pub_bytes, iv_key, encrypted_aes_key = ecies_encrypt(aes_key, receiver_public_key)
        
        payload = b''.join([
            struct.pack('>I', len(encrypted_data)) + encrypted_data,
            struct.pack('>I', len(iv_data)) + iv_data,
            struct.pack('>I', len(encrypted_aes_key)) + encrypted_aes_key,
            struct.pack('>I', len(iv_key)) + iv_key,
            struct.pack('>I', len(ephemeral_pub_bytes)) + ephemeral_pub_bytes
        ])
        
        stego_png_path = os.path.join(UPLOAD_FOLDER, f"stego_{uuid.uuid4().hex}.png")
        webp_path = os.path.join(UPLOAD_FOLDER, f"stego_{uuid.uuid4().hex}.webp")
        
        embed_inverted_lsb(cover_path, payload, stego_png_path)
        compress_to_webp(stego_png_path, webp_path)
        
        mse_png, psnr_png = calculate_mse_psnr(cover_path, stego_png_path)
        mse_webp, psnr_webp = calculate_mse_psnr(cover_path, webp_path)
        
        size_png = os.path.getsize(stego_png_path) / 1024
        size_webp = os.path.getsize(webp_path) / 1024
        savings = (size_png - size_webp) / size_png * 100 if size_png > 0 else 0
        
        detection = stegexpose(stego_png_path)

        # Read files as Base64
        with open(stego_png_path, "rb") as f:
            png_b64 = base64.b64encode(f.read()).decode('utf-8')
        with open(webp_path, "rb") as f:
            webp_b64 = base64.b64encode(f.read()).decode('utf-8')

        return jsonify({
            'success': True,
            'psnr_png': f"{psnr_png:.2f}",
            'psnr_webp': f"{psnr_webp:.2f}",
            'mse_png': f"{mse_png:.4f}",
            'mse_webp': f"{mse_webp:.4f}",
            'size_png': f"{size_png:.2f} KB",
            'size_webp': f"{size_webp:.2f} KB",
            'savings': f"{savings:.2f}%",
            'detection': f"{detection:.2f}%",
            'png_base64': f"data:image/png;base64,{png_b64}",
            'webp_base64': f"data:image/webp;base64,{webp_b64}"
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)