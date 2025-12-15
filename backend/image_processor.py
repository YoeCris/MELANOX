"""
Image Processor Module - Computer vision analysis for lesion detection and characterization
"""
import cv2
import numpy as np
from PIL import Image
import base64
from io import BytesIO
from config import Config

class ImageProcessor:
    """Handles computer vision processing for melanoma detection"""
    
    def __init__(self):
        """Initialize the image processor"""
        pass
    
    def process_image(self, image):
        """
        Complete image processing pipeline
        
        Args:
            image: PIL Image object
            
        Returns:
            dict with all analysis results and processed image
        """
        # Convert PIL to OpenCV format
        cv_image = self._pil_to_cv(image)
        
        # Detect lesion and get contour
        lesion_data = self.detect_lesion(cv_image)
        
        # Extract ABCDE characteristics
        abcde = self.analyze_abcde(cv_image, lesion_data)
        
        # Create overlay image with border
        overlay_image = self.create_border_overlay(cv_image, lesion_data)
        
        # Convert overlay back to base64 for frontend
        overlay_base64 = self._cv_to_base64(overlay_image)
        
        return {
            'lesion_detected': lesion_data['detected'],
            'lesion_location': lesion_data['location'],
            'lesion_metrics': lesion_data['metrics'],
            'abcde_analysis': abcde,
            'processed_image': overlay_base64
        }
    
    def detect_lesion(self, cv_image):
        """
        Detect lesion in the image using contour detection
        
        Args:
            cv_image: OpenCV image (BGR format)
            
        Returns:
            dict with lesion detection results
        """
        # Convert to grayscale
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Morphological operations to clean up
        kernel = np.ones((5, 5), np.uint8)
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        morph = cv2.morphologyEx(morph, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return {
                'detected': False,
                'location': None,
                'metrics': None,
                'contour': None
            }
        
        # Find the largest contour (assumed to be the lesion)
        largest_contour = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_contour)
        
        # Check if contour is large enough
        if area < Config.MIN_LESION_AREA:
            return {
                'detected': False,
                'location': None,
                'metrics': None,
                'contour': None
            }
        
        # Get bounding box
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Calculate metrics
        perimeter = cv2.arcLength(largest_contour, True)
        
        # Calculate diameter (maximum distance across contour)
        # Use bounding box diagonal as approximation
        diameter_pixels = np.sqrt(w**2 + h**2)
        diameter_mm = diameter_pixels * Config.PIXEL_TO_MM_RATIO
        
        # Calculate circularity (4π * area / perimeter²)
        # Perfect circle = 1.0, irregular shape < 1.0
        circularity = (4 * np.pi * area) / (perimeter ** 2) if perimeter > 0 else 0
        
        # Get center point
        M = cv2.moments(largest_contour)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
        else:
            cx, cy = x + w // 2, y + h // 2
        
        return {
            'detected': True,
            'location': {
                'x': int(x),
                'y': int(y),
                'width': int(w),
                'height': int(h),
                'center_x': int(cx),
                'center_y': int(cy)
            },
            'metrics': {
                'area_pixels': int(area),
                'perimeter_pixels': round(perimeter, 2),
                'diameter_mm': round(diameter_mm, 2),
                'circularity': round(circularity, 3)
            },
            'contour': largest_contour
        }
    
    def analyze_abcde(self, cv_image, lesion_data):
        """
        Analyze ABCDE characteristics of the lesion
        
        Args:
            cv_image: OpenCV image (BGR format)
            lesion_data: Lesion detection results
            
        Returns:
            dict with ABCDE analysis
        """
        if not lesion_data['detected']:
            return None
        
        contour = lesion_data['contour']
        location = lesion_data['location']
        
        # A - Asymmetry
        asymmetry_score = self._calculate_asymmetry(contour)
        asymmetry_detected = asymmetry_score > Config.ASYMMETRY_THRESHOLD
        
        # B - Border irregularity
        border_score = self._calculate_border_irregularity(contour)
        border_irregular = border_score > Config.BORDER_IRREGULARITY_THRESHOLD
        
        # C - Color analysis
        color_data = self._analyze_color(cv_image, contour)
        color_varied = color_data['variance'] > Config.COLOR_VARIANCE_THRESHOLD
        
        # D - Diameter
        diameter_mm = lesion_data['metrics']['diameter_mm']
        diameter_warning = diameter_mm > Config.DIAMETER_WARNING_MM
        
        return {
            'asymmetry': {
                'detected': asymmetry_detected,
                'score': round(asymmetry_score, 3),
                'description': 'Detectada' if asymmetry_detected else 'No detectada'
            },
            'border': {
                'irregular': border_irregular,
                'score': round(border_score, 3),
                'description': 'Irregular' if border_irregular else 'Regular'
            },
            'color': {
                'varied': color_varied,
                'variance': round(color_data['variance'], 2),
                'dominant_colors': color_data['dominant_colors'],
                'description': 'Variado' if color_varied else 'Uniforme'
            },
            'diameter': {
                'value_mm': diameter_mm,
                'warning': diameter_warning,
                'description': f'{diameter_mm}mm'
            }
        }
    
    def create_border_overlay(self, cv_image, lesion_data):
        """
        Create image with lesion border overlay
        
        Args:
            cv_image: OpenCV image (BGR format)
            lesion_data: Lesion detection results
            
        Returns:
            OpenCV image with border overlay
        """
        overlay = cv_image.copy()
        
        if not lesion_data['detected']:
            return overlay
        
        contour = lesion_data['contour']
        location = lesion_data['location']
        
        # Draw contour in cyan color
        cv2.drawContours(overlay, [contour], -1, (255, 255, 0), Config.BORDER_THICKNESS)
        
        # Draw bounding box in green
        cv2.rectangle(
            overlay,
            (location['x'], location['y']),
            (location['x'] + location['width'], location['y'] + location['height']),
            (0, 255, 0),
            2
        )
        
        # Draw center point
        cv2.circle(overlay, (location['center_x'], location['center_y']), 5, (0, 0, 255), -1)
        
        # Add label
        label = f"Lesion: {lesion_data['metrics']['diameter_mm']}mm"
        cv2.putText(
            overlay, label,
            (location['x'], location['y'] - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
        )
        
        return overlay
    
    def _calculate_asymmetry(self, contour):
        """Calculate asymmetry score using image moments"""
        moments = cv2.moments(contour)
        
        # Use Hu moments for shape comparison
        hu_moments = cv2.HuMoments(moments)
        
        # Simple asymmetry metric based on central moments
        if moments['m00'] == 0:
            return 0.0
        
        # Normalized central moments
        mu20 = moments['mu20'] / moments['m00']
        mu02 = moments['mu02'] / moments['m00']
        
        # Asymmetry score (difference between principal axes)
        asymmetry = abs(mu20 - mu02) / (mu20 + mu02 + 1e-7)
        
        return asymmetry
    
    def _calculate_border_irregularity(self, contour):
        """Calculate border irregularity score"""
        # Approximate contour to polygon
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        # More vertices = more irregular
        num_vertices = len(approx)
        
        # Calculate convexity defects
        hull = cv2.convexHull(contour, returnPoints=False)
        
        try:
            defects = cv2.convexityDefects(contour, hull)
            if defects is not None:
                # Average defect depth normalized by contour size
                avg_defect = np.mean(defects[:, 0, 3]) / 256.0
            else:
                avg_defect = 0.0
        except:
            avg_defect = 0.0
        
        # Combine metrics
        irregularity = min(1.0, (num_vertices / 50.0) + avg_defect)
        
        return irregularity
    
    def _analyze_color(self, cv_image, contour):
        """Analyze color characteristics within the lesion"""
        # Create mask from contour
        mask = np.zeros(cv_image.shape[:2], dtype=np.uint8)
        cv2.drawContours(mask, [contour], -1, 255, -1)
        
        # Extract colors within mask
        masked_image = cv2.bitwise_and(cv_image, cv_image, mask=mask)
        
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(masked_image, cv2.COLOR_BGR2HSV)
        
        # Get pixels within lesion
        lesion_pixels = hsv[mask > 0]
        
        if len(lesion_pixels) == 0:
            return {'variance': 0, 'dominant_colors': []}
        
        # Calculate color variance
        h_variance = np.var(lesion_pixels[:, 0])
        s_variance = np.var(lesion_pixels[:, 1])
        v_variance = np.var(lesion_pixels[:, 2])
        
        total_variance = (h_variance + s_variance + v_variance) / 3
        
        # Find dominant colors using k-means (simplified)
        bgr_pixels = cv_image[mask > 0]
        
        # Sample pixels if too many
        if len(bgr_pixels) > 1000:
            indices = np.random.choice(len(bgr_pixels), 1000, replace=False)
            bgr_pixels = bgr_pixels[indices]
        
        # Get mean color
        mean_color = np.mean(bgr_pixels, axis=0).astype(int)
        dominant_colors = [f"rgb({mean_color[2]}, {mean_color[1]}, {mean_color[0]})"]
        
        return {
            'variance': float(total_variance),
            'dominant_colors': dominant_colors
        }
    
    def _pil_to_cv(self, pil_image):
        """Convert PIL Image to OpenCV format"""
        # Convert to RGB if needed
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert to numpy array
        numpy_image = np.array(pil_image)
        
        # Convert RGB to BGR (OpenCV format)
        cv_image = cv2.cvtColor(numpy_image, cv2.COLOR_RGB2BGR)
        
        return cv_image
    
    def _cv_to_base64(self, cv_image):
        """Convert OpenCV image to base64 string"""
        # Convert BGR to RGB
        rgb_image = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
        
        # Convert to PIL Image
        pil_image = Image.fromarray(rgb_image)
        
        # Convert to base64
        buffered = BytesIO()
        pil_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
