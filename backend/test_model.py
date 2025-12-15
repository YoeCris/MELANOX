"""
Test script to debug model predictions
Run this to see what the model is actually outputting
"""
import numpy as np
from PIL import Image
from tensorflow import keras
import sys

# Load model
print("Loading model...")
model = keras.models.load_model('../best_model.h5')
print(f"Model loaded!")
print(f"Input shape: {model.input_shape}")
print(f"Output shape: {model.output_shape}")

# Load a test image
if len(sys.argv) > 1:
    image_path = sys.argv[1]
else:
    print("Usage: python test_model.py <image_path>")
    sys.exit(1)

print(f"\nLoading image: {image_path}")
image = Image.open(image_path)
print(f"Original size: {image.size}")

# Resize to model input
image = image.resize((224, 224))
if image.mode != 'RGB':
    image = image.convert('RGB')

img_array = np.array(image, dtype=np.float32)
print(f"Image array shape: {img_array.shape}")
print(f"Pixel value range: {img_array.min():.2f} - {img_array.max():.2f}")

# Test with different normalizations
print("\n" + "="*60)
print("TESTING DIFFERENT NORMALIZATIONS")
print("="*60)

# 1. No normalization (raw pixels 0-255)
print("\n1. NO NORMALIZATION (0-255):")
img_raw = np.expand_dims(img_array, axis=0)
pred_raw = model.predict(img_raw, verbose=0)
print(f"   Raw prediction: {pred_raw[0][0]:.6f}")
print(f"   Interpretation: {'MALIGNO' if pred_raw[0][0] > 0.5 else 'BENIGNO'} ({pred_raw[0][0]*100:.2f}%)")

# 2. Normalization 0-1
print("\n2. NORMALIZATION 0-1:")
img_01 = img_array / 255.0
img_01 = np.expand_dims(img_01, axis=0)
pred_01 = model.predict(img_01, verbose=0)
print(f"   Raw prediction: {pred_01[0][0]:.6f}")
print(f"   Interpretation: {'MALIGNO' if pred_01[0][0] > 0.5 else 'BENIGNO'} ({pred_01[0][0]*100:.2f}%)")

# 3. Normalization -1 to 1
print("\n3. NORMALIZATION -1 to 1:")
img_11 = (img_array / 127.5) - 1.0
img_11 = np.expand_dims(img_11, axis=0)
pred_11 = model.predict(img_11, verbose=0)
print(f"   Raw prediction: {pred_11[0][0]:.6f}")
print(f"   Interpretation: {'MALIGNO' if pred_11[0][0] > 0.5 else 'BENIGNO'} ({pred_11[0][0]*100:.2f}%)")

# 4. ImageNet normalization
print("\n4. IMAGENET NORMALIZATION:")
img_imagenet = keras.applications.imagenet_utils.preprocess_input(img_array.copy(), mode='tf')
img_imagenet = np.expand_dims(img_imagenet, axis=0)
pred_imagenet = model.predict(img_imagenet, verbose=0)
print(f"   Raw prediction: {pred_imagenet[0][0]:.6f}")
print(f"   Interpretation: {'MALIGNO' if pred_imagenet[0][0] > 0.5 else 'BENIGNO'} ({pred_imagenet[0][0]*100:.2f}%)")

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print(f"All predictions should be DIFFERENT if the model is working.")
print(f"If they're all the same (~0.94), the model might be broken.")
print("\nWhich normalization gave the most reasonable result?")
print("That's the one you should use in config.py")
