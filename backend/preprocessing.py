# === Single Image Preprocessing Script ===
# Purpose: Normalize and resize a single image to 512x512 RGB PNG

import os
import sys
from pathlib import Path
from PIL import Image

def preprocess_single_image(input_path, output_dir='./preprocessed_images'):
    """
    Preprocess a single image: convert to RGB, resize to 512x512, save as PNG
    
    Args:
        input_path: Path to the input image
        output_dir: Directory to save the preprocessed image
    
    Returns:
        output_path: Path to the saved preprocessed image, or None if failed
    """
    
    # Validate input
    if not os.path.exists(input_path):
        print(f"❌ Error: Image file not found: {input_path}")
        return None
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        print(f"\n Processing: {input_path}")
        
        # Open image
        img = Image.open(input_path)
        print(f"   Original size: {img.size}, mode: {img.mode}")
        
        # Convert to RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')
            print(f"   Converted to RGB")
        
        # Resize with aspect ratio preserved
        img.thumbnail((512, 512), Image.Resampling.LANCZOS)
        
        # Center crop or pad to exactly 512x512
        width, height = img.size
        if width < 512 or height < 512:
            # Pad with black if smaller
            new_img = Image.new('RGB', (512, 512), (0, 0, 0))
            new_img.paste(img, ((512 - width) // 2, (512 - height) // 2))
            img = new_img
            print(f"   Padded to 512x512")
        else:
            # Center crop if larger
            left = (width - 512) // 2
            top = (height - 512) // 2
            img = img.crop((left, top, left + 512, top + 512))
            print(f"   Cropped to 512x512")
        
        # Generate output filename
        base_name = Path(input_path).stem
        output_path = os.path.join(output_dir, f"{base_name}_preprocessed.png")
        
        # Save as PNG
        img.save(output_path, 'PNG')
        print(f"    Saved to: {output_path}")
        
        return output_path
        
    except Exception as e:
        print(f"   Error processing image: {e}")
        return None


# === Main execution ===
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python preprocess_single.py <image_path> [output_dir]")
        print("\nExample:")
        print("  python preprocess_single.py my_image.jpg")
        print("  python preprocess_single.py my_image.jpg ./output")
        sys.exit(1)
    
    input_image = sys.argv[1]
    output_directory = sys.argv[2] if len(sys.argv) > 2 else './preprocessed_images'
    
    result = preprocess_single_image(input_image, output_directory)
    
    if result:
        print(f"\n Success! Preprocessed image saved to: {result}")
    else:
        print(f"\n Failed to preprocess image")
        sys.exit(1)