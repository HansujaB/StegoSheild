from flask import Flask, request, render_template, send_file
from io import BytesIO
import os
from functions.py import generate_aes_key, aes_encrypt, generate_ecc_key_pair, ecies_encrypt, embed_inverted_lsb, compress_to_webp, calculate_mse_psnr, extract_inverted_lsb, ecies_decrypt, aes_decrypt, struct, stegexpose  # Import all your functions

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    # Get user input
    image = request.files['image']
    payload_text = request.form['payload']
    
    # Save cover image
    cover_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(cover_path)
    
    # Run pipeline
    aes_key = generate_aes_key()
    iv_data, encrypted_data = aes_encrypt(payload_text, aes_key)
    _, receiver_public = generate_ecc_key_pair()
    ephemeral_pub_bytes, iv_key, encrypted_aes_key = ecies_encrypt(aes_key, receiver_public)
    
    payload = b''.join([
        struct.pack('>I', len(encrypted_data)) + encrypted_data,
        struct.pack('>I', len(iv_data)) + iv_data,
        struct.pack('>I', len(encrypted_aes_key)) + encrypted_aes_key,
        struct.pack('>I', len(iv_key)) + iv_key,
        struct.pack('>I', len(ephemeral_pub_bytes)) + ephemeral_pub_bytes
    ])
    
    stego_png_path = 'stego.png'
    webp_path = 'stego.webp'
    
    embed_inverted_lsb(cover_path, payload, stego_png_path)
    compress_to_webp(stego_png_path, webp_path)
    
    mse_png, psnr_png = calculate_mse_psnr(cover_path, stego_png_path)
    mse_webp, psnr_webp = calculate_mse_psnr(cover_path, webp_path)  # Should be same as PNG
    
    size_png = os.path.getsize(stego_png_path) / 1024
    size_webp = os.path.getsize(webp_path) / 1024
    savings = (size_png - size_webp) / size_png * 100 if size_png > 0 else 0
    
    # StegExpose on PNG
    detection = stegexpose(stego_png_path)  # 0% expected
    
    # Clean temp files (optional, for security)
    os.remove(cover_path)
    
    # Return metrics + files
    return render_template('results.html', 
                           psnr_png=psnr_png, mse_png=mse_png,
                           psnr_webp=psnr_webp, mse_webp=mse_webp,
                           size_png=size_png, size_webp=size_webp,
                           savings=savings, detection=detection,
                           png_url='/download/png', webp_url='/download/webp',
                           psnr_hist='psnr_hist.png', mse_hist='mse_hist.png')  # Generate histograms on backend if needed

@app.route('/download/png')
def download_png():
    return send_file('stego.png', as_attachment=True, download_name='stego.png')

@app.route('/download/webp')
def download_webp():
    return send_file('stego.webp', as_attachment=True, download_name='stego.webp')

if __name__ == '__main__':
    app.run(debug=True)