# API Documentation

## Base URL

```
http://localhost:5000
```

## Endpoints

### 1. Health Check

Check if the API server is running and the model is loaded.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "message": "Melanoma Detection API is running",
  "model_loaded": true
}
```

---

### 2. Model Information

Get information about the loaded model.

**Endpoint:** `GET /api/model-info`

**Response:**
```json
{
  "input_shape": "(None, 224, 224, 3)",
  "output_shape": "(None, 2)",
  "total_params": 23587712,
  "model_path": "/path/to/best_model.h5"
}
```

---

### 3. Analyze Image

Analyze a skin lesion image for melanoma detection.

**Endpoint:** `POST /api/analyze`

**Request Body:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (Success):**
```json
{
  "success": true,
  "prediction": "Benigno",
  "confidence": 87.5,
  "confidence_level": "High",
  "probabilities": {
    "benign": 87.5,
    "malignant": 12.5
  },
  "details": {
    "type": "Nevus Melanocítico",
    "risk": "Bajo",
    "recommendation": "Consulta con un dermatólogo para evaluación profesional y monitoreo rutinario.",
    "characteristics": {
      "asymmetry": "No detectada",
      "border": "Regular",
      "color": "Uniforme",
      "diameter": "4.2mm"
    }
  },
  "lesion_detected": true,
  "lesion_location": {
    "x": 120,
    "y": 85,
    "width": 180,
    "height": 175,
    "center_x": 210,
    "center_y": 172
  },
  "lesion_metrics": {
    "area_pixels": 24850,
    "perimeter_pixels": 562.3,
    "diameter_mm": 4.2,
    "circularity": 0.785
  },
  "abcde_analysis": {
    "asymmetry": {
      "detected": false,
      "score": 0.082,
      "description": "No detectada"
    },
    "border": {
      "irregular": false,
      "score": 0.156,
      "description": "Regular"
    },
    "color": {
      "varied": false,
      "variance": 18.5,
      "dominant_colors": ["rgb(145, 98, 72)"],
      "description": "Uniforme"
    },
    "diameter": {
      "value_mm": 4.2,
      "warning": false,
      "description": "4.2mm"
    }
  },
  "processed_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid image data: cannot identify image file"
}
```

**Error Codes:**

- `400 Bad Request` - Invalid request (missing image, invalid format)
- `500 Internal Server Error` - Server error during analysis

---

## Data Types

### Prediction
- `"Benigno"` - Benign lesion
- `"Maligno"` - Malignant lesion (melanoma)

### Confidence Level
- `"High"` - Confidence ≥ 85%
- `"Medium"` - Confidence ≥ 60%
- `"Low"` - Confidence < 60%

### Risk Level
- `"Bajo"` - Low risk
- `"Medio"` - Medium risk
- `"Alto"` - High risk

### Lesion Type
- `"Nevus Melanocítico"` - Melanocytic nevus (benign)
- `"Melanoma"` - Melanoma (malignant)

---

## Example Usage

### JavaScript (Fetch API)

```javascript
const analyzeImage = async (imageDataUrl) => {
  const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageDataUrl
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Usage
const imageFile = document.querySelector('input[type="file"]').files[0];
const reader = new FileReader();

reader.onload = async (e) => {
  const result = await analyzeImage(e.target.result);
  console.log('Analysis result:', result);
};

reader.readAsDataURL(imageFile);
```

### cURL

```bash
# Analyze an image
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
  }'

# Health check
curl http://localhost:5000/api/health

# Model info
curl http://localhost:5000/api/model-info
```

### Python (requests)

```python
import requests
import base64

# Read and encode image
with open('lesion.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')
    image_url = f'data:image/jpeg;base64,{image_data}'

# Make request
response = requests.post(
    'http://localhost:5000/api/analyze',
    json={'image': image_url}
)

result = response.json()
print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']}%")
```

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

For production deployment, update `CORS_ORIGINS` in `backend/config.py`.

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production deployment, consider adding rate limiting to prevent abuse.

---

## Image Requirements

- **Format:** PNG, JPG, JPEG
- **Max Size:** 10MB
- **Recommended:** Clear, well-lit images of skin lesions
- **Best Results:** Images with lesion centered and in focus

---

## Notes

- The `processed_image` field contains a base64-encoded PNG image with the lesion border overlay
- All measurements are approximate and depend on the `PIXEL_TO_MM_RATIO` configuration
- This API is for research/educational purposes and should not replace professional medical diagnosis
