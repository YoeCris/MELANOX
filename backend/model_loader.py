"""
Model Loader Module - Handles loading and inference with the Keras .h5 model
"""
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from config import Config

class ModelLoader:
    """Singleton class for loading and managing the melanoma detection model"""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        """Ensure only one instance of ModelLoader exists"""
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the model loader"""
        if self._model is None:
            self.load_model()
    
    def load_model(self):
        """Load the Keras model from disk"""
        try:
            if not os.path.exists(Config.MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at {Config.MODEL_PATH}")
            
            self._model = keras.models.load_model(Config.MODEL_PATH)
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise
    
    def preprocess_image(self, image):
        """
        Preprocess image for model input
        
        Args:
            image: PIL Image object
            
        Returns:
            numpy array ready for model prediction
        """
        # Resize to model input size
        img_resized = image.resize(Config.MODEL_INPUT_SIZE, Image.Resampling.LANCZOS)
        
        # Convert to RGB if needed
        if img_resized.mode != 'RGB':
            img_resized = img_resized.convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(img_resized, dtype=np.float32)
        
        # Normalize based on configuration
        if Config.MODEL_NORMALIZATION == 'none':
            # No normalization - keep raw pixel values (0-255)
            # Model was trained with raw pixels
            pass
        elif Config.MODEL_NORMALIZATION == 'imagenet':
            # ImageNet normalization (mean subtraction and std division)
            img_array = keras.applications.imagenet_utils.preprocess_input(
                img_array, mode='tf'
            )
        elif Config.MODEL_NORMALIZATION == '0-1':
            # Normalize to [0, 1]
            img_array = img_array / 255.0
        elif Config.MODEL_NORMALIZATION == '-1-1':
            # Normalize to [-1, 1]
            img_array = (img_array / 127.5) - 1.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def predict(self, image):
        """
        Make prediction on an image
        
        Args:
            image: PIL Image object
            
        Returns:
            dict with prediction results
        """
        if self._model is None:
            raise RuntimeError("Model not loaded")
        
        # Preprocess image
        processed_image = self.preprocess_image(image)
        
        # Make prediction
        prediction = self._model.predict(processed_image, verbose=0)
        
        # Parse prediction results
        # Model output shape is (None, 1) - single sigmoid output
        if prediction.shape[-1] == 1:
            # Single output (sigmoid) - probability of malignant
            malignant_prob = float(prediction[0][0])
            benign_prob = 1.0 - malignant_prob
            
            # Debug logging
            print(f"Raw prediction value: {prediction[0][0]}")
            print(f"Malignant probability: {malignant_prob:.4f}")
            print(f"Benign probability: {benign_prob:.4f}")
        else:
            # Multiple outputs (softmax) - [benign, malignant]
            benign_prob = float(prediction[0][0])
            malignant_prob = float(prediction[0][1])
            print(f"Benign prob: {benign_prob:.4f}, Malignant prob: {malignant_prob:.4f}")
        
        # Determine prediction class using 0.5 threshold for sigmoid
        is_malignant = malignant_prob > 0.5
        confidence = max(benign_prob, malignant_prob)
        
        return {
            'prediction': 'Maligno' if is_malignant else 'Benigno',
            'confidence': round(confidence * 100, 2),
            'probabilities': {
                'benign': round(benign_prob * 100, 2),
                'malignant': round(malignant_prob * 100, 2)
            },
            'confidence_level': Config.get_confidence_level(confidence)
        }
    
    def get_model_info(self):
        """Get information about the loaded model"""
        if self._model is None:
            return None
        
        return {
            'input_shape': str(self._model.input_shape),
            'output_shape': str(self._model.output_shape),
            'total_params': self._model.count_params(),
            'model_path': Config.MODEL_PATH
        }

    def get_model(self):
        """Return the underlying Keras model instance"""
        return self._model
