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
print("Initializing Melanoma Detection API...")
try:
    model_loader = ModelLoader()
    # image_processor = ImageProcessor()  # Commented out for now
    print("✓ Model initialized successfully")
except Exception as e:
    print(f"✗ Error initializing: {str(e)}")
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
        
        print(f"Processing image: {image.size}, mode: {image.mode}")
        
        # Run model prediction
        print("Running model prediction...")
        prediction_result = model_loader.predict(image)
        print(f"Prediction: {prediction_result['prediction']} ({prediction_result['confidence']}%)")
        
        # Determine if malignant
        is_malignant = prediction_result['prediction'] == 'Maligno'
        
        # Determine lesion type based on prediction
        lesion_type = 'Melanoma' if is_malignant else 'Nevus Melanocítico'
        
        # Determine risk level based on confidence
        confidence = prediction_result['confidence']
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
        
        # Build simplified response (only classification, no CV features yet)
        response = {
            'success': True,
            'prediction': prediction_result['prediction'],
            'confidence': prediction_result['confidence'],
            'confidence_level': prediction_result['confidence_level'],
            'probabilities': prediction_result['probabilities'],
            'details': {
                'type': lesion_type,
                'risk': risk_level,
                'recommendation': recommendation,
                'characteristics': {
                    'asymmetry': 'Análisis pendiente',
                    'border': 'Análisis pendiente'
                }
            }
        }
        
        print("Analysis completed successfully")
        return jsonify(response)
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
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
