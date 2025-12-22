"""
Flask API Server for Melanoma Detection
Provides endpoints for image analysis using the trained model and computer vision
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import base64
from io import BytesIO
import traceback

from config import Config
from model_loader import ModelLoader
# from image_processor import ImageProcessor  # Commented out for now

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize model (singleton pattern)
try:
    model_loader = ModelLoader()
except Exception as e:
    print(f"Error initializing model: {str(e)}")
    raise

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Melanoma Detection API is running',
        'model_loaded': model_loader._model is not None
    })

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    info = model_loader.get_model_info()
    if info:
        return jsonify(info)
    else:
        return jsonify({'error': 'Model not loaded'}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """
    Main endpoint for melanoma detection analysis
    
    Expected request body:
    {
        "image": "data:image/png;base64,..."
    }
    
    Returns:
    {
        "success": true,
        "prediction": "Benigno" | "Maligno",
        "confidence": 85.5,
        "details": {
            "type": "Nevus Melanocítico" | "Melanoma",
            "risk": "Bajo" | "Medio" | "Alto",
            "recommendation": "...",
            "characteristics": {
                "asymmetry": "Análisis pendiente",
                "border": "Análisis pendiente",
                "color": "Análisis pendiente",
                "diameter": "Análisis pendiente"
            }
        }
    }
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        # Parse base64 image
        image_data = data['image']
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Invalid image data: {str(e)}'
            }), 400
        
        # Validate image size
        if len(image_bytes) > Config.MAX_IMAGE_SIZE:
            return jsonify({
                'success': False,
                'error': 'Image too large (max 10MB)'
            }), 400
        
        # Run model prediction
        prediction_result = model_loader.predict(image)
        
        # Determine if malignant
        is_malignant = prediction_result['prediction'] == 'Maligno'
        confidence = prediction_result['confidence']
        
        # Determine lesion type based on prediction
        lesion_type = 'Melanoma' if is_malignant else 'Nevus Melanocítico'
        
        # Determine risk level based on confidence
        if is_malignant:
            if confidence >= 85:
                risk_level = 'Alto'
            elif confidence >= 70:
                risk_level = 'Medio'
            else:
                risk_level = 'Bajo'
        else:
            risk_level = 'Bajo'
        
        # Generate recommendation
        if is_malignant and risk_level == 'Alto':
            recommendation = 'Consulta URGENTE con un dermatólogo certificado. Se recomienda evaluación inmediata.'
        elif is_malignant:
            recommendation = 'Consulta con un dermatólogo certificado lo antes posible para evaluación profesional.'
        elif risk_level == 'Medio':
            recommendation = 'Se recomienda monitoreo regular y consulta con dermatólogo para seguimiento.'
        else:
            recommendation = 'Consulta con un dermatólogo para evaluación profesional y monitoreo rutinario.'
        
        # ---------------------------------------------------------
        # GENERATE GRAD-CAM HEATMAP (Lesion Detection)
        # ---------------------------------------------------------
        processed_image_b64 = None
        try:
            # Import local module here to avoid circular imports or startup errors
            import sys
            import os
            
            # Ensure backend directory is in path
            current_dir = os.path.dirname(os.path.abspath(__file__))
            if current_dir not in sys.path:
                sys.path.append(current_dir)
                
            from gradcam import make_gradcam_heatmap, save_and_display_gradcam, get_last_conv_layer_name
            
            # Get underlying model
            model = model_loader.get_model()
            
            # Identify last conv layer
            last_conv_layer_name = get_last_conv_layer_name(model)
            
            if last_conv_layer_name:
                # Preprocess for Grad-CAM
                img_array = model_loader.preprocess_image(image)
                
                # Generate heatmap
                heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name)
                
                # Overlay on original image
                processed_image_b64, _ = save_and_display_gradcam(image, heatmap, alpha=0.4)
                
        except Exception as e:
            pass  # Silently fail Grad-CAM generation
        # ---------------------------------------------------------
        
        # Build response
        response = {
            'success': True,
            'prediction': prediction_result['prediction'],
            'confidence': prediction_result['confidence'],
            'details': {
                'type': lesion_type,
                'risk': risk_level,
                'recommendation': recommendation
            },
            'lesion_detected': True,
            'processed_image': processed_image_b64 if processed_image_b64 else None,
            'lesion_location': None,
            'lesion_metrics': None,
            'abcde_analysis': None
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Analysis failed'
        }), 500

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print(f"\n{'='*60}")
    print(f"🔬 Melanoma Detection API Server")
    print(f"{'='*60}")
    print(f"Model: {Config.MODEL_PATH}")
    print(f"Server: http://{Config.API_HOST}:{Config.API_PORT}")
    print(f"Endpoints:")
    print(f"  - GET  /api/health")
    print(f"  - GET  /api/model-info")
    print(f"  - POST /api/analyze")
    print(f"{'='*60}\n")
    
    app.run(
        host=Config.API_HOST,
        port=Config.API_PORT,
        debug=Config.DEBUG
    )
