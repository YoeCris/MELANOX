import numpy as np
import tensorflow as tf
import cv2
from io import BytesIO
from PIL import Image
import base64

def get_last_conv_layer_name(model):
    """
    Busca automáticamente el nombre de la última capa convolucional 4D
    compatible con Grad-CAM.
    """
    for layer in reversed(model.layers):
        # Para EfficientNet, buscamos 'top_activation' o 'top_conv'
        if 'top_activation' in layer.name or 'top_conv' in layer.name:
            return layer.name
        # Generico: última capa Conv2D que tenga 4 dimensiones de salida
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
        # Si es un modelo anidado (Functional), busca dentro
        if isinstance(layer, tf.keras.Model):
            return get_last_conv_layer_name(layer)
            
    # Fallback para modelos comunes si no se encuentra explícitamente
    return None

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    """
    Genera el mapa de calor Grad-CAM para una imagen y modelo dados.
    """
    # 1. Crear modelo que mapee input -> (activaciones, predicciones)
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )

    # 2. Registrar operaciones para calcular gradientes
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        
        # Dependiendo de si la salida es sigmoide (1 nodo) o softmax (>1 nodo)
        if preds.shape[-1] == 1:
            class_channel = preds[:, 0]
        else:
            class_channel = preds[:, pred_index]

    # 3. Calcular gradientes de la clase predicha respecto a los mapas de características
    grads = tape.gradient(class_channel, last_conv_layer_output)

    # 4. Global Average Pooling de los gradientes
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # 5. Multiplicar cada canal por su "importancia" (gradiente promedio)
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # 6. Normalizar el heatmap entre 0 y 1
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def save_and_display_gradcam(img_pil, heatmap, alpha=0.4):
    """
    Superpone el heatmap sobre la imagen original y retorna la imagen resultante en base64.
    """
    # Convertir PIL a array
    img = np.array(img_pil)
    
    # Rescalar heatmap al tamaño de la imagen original
    heatmap = np.uint8(255 * heatmap)
    
    # Usar mapa de colores JET
    jet = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    # Convertir a RGB (OpenCV usa BGR por defecto)
    jet = cv2.cvtColor(jet, cv2.COLOR_BGR2RGB)
    
    # Redimensionar jet a las dimensiones de la imagen
    jet = cv2.resize(jet, (img.shape[1], img.shape[0]))
    
    # Superponer
    superimposed_img = jet * alpha + img * (1 - alpha)
    superimposed_img = np.uint8(superimposed_img)
    
    # Convertir de nuevo a PIL para facilitar conversión a base64
    result_img = Image.fromarray(superimposed_img)
    
    # Convertir a base64 string
    buffered = BytesIO()
    result_img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    # Agregar prefijo Data URL para compatibilidad con frontend y almacenamiento
    img_data_url = f"data:image/jpeg;base64,{img_str}"
    
    return img_data_url, result_img
