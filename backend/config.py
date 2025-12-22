"""
Configuration settings for the Melanoma Detection Backend API
"""
import os

class Config:
    """Application configuration"""
    
    # Model Configuration
    MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'best_model.h5')
    MODEL_INPUT_SIZE = (224, 224)  # Standard size for medical imaging models
    MODEL_NORMALIZATION = 'none'  # Options: 'imagenet', '0-1', '-1-1', 'none'
    
    # API Configuration
    API_HOST = '0.0.0.0'
    API_PORT = 5000
    DEBUG = True
    
    # CORS Configuration - Updated for production
    CORS_ORIGINS = [
        'http://localhost:5173',  # Vite dev server
        'http://localhost:3000',  # Alternative React dev server
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'https://melanox-dev.vercel.app',  # Production Vercel
        'https://*.vercel.app',  # All Vercel deployments
    ]
    
    # Image Processing Configuration
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # Computer Vision Parameters
    PIXEL_TO_MM_RATIO = 0.1  # Approximate conversion (adjust based on image source)
    MIN_LESION_AREA = 100  # Minimum contour area to consider as lesion
    BORDER_THICKNESS = 3  # Thickness of border overlay in pixels
    
    # Confidence Thresholds
    HIGH_CONFIDENCE_THRESHOLD = 0.85
    MEDIUM_CONFIDENCE_THRESHOLD = 0.60
    
    # ABCDE Analysis Thresholds
    ASYMMETRY_THRESHOLD = 0.15  # Threshold for asymmetry detection
    BORDER_IRREGULARITY_THRESHOLD = 0.25  # Threshold for irregular borders
    COLOR_VARIANCE_THRESHOLD = 30  # Threshold for color variation
    DIAMETER_WARNING_MM = 6.0  # Warning threshold in millimeters
    
    @staticmethod
    def get_confidence_level(confidence):
        """Get confidence level label based on threshold"""
        if confidence >= Config.HIGH_CONFIDENCE_THRESHOLD:
            return 'High'
        elif confidence >= Config.MEDIUM_CONFIDENCE_THRESHOLD:
            return 'Medium'
        else:
            return 'Low'
