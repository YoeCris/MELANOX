/**
 * Constantes globales de la aplicación MELANOX
 * 
 * Centraliza valores de configuración para facilitar mantenimiento
 * y garantizar consistencia en toda la aplicación.
 */

// ============================================
// COLORES DEL TEMA
// ============================================
// Sincronizado con CSS variables en index.css

export const THEME_COLORS = {
    primaryBlue: '#00d9ff',
    secondaryBlue: '#4a90e2',
    accentTeal: '#00bfa5',
    darkBg: '#0a0e27',
    darkerBg: '#050811',
    cardBg: '#131829',
    white: '#ffffff',
    darkText: '#e4e9f0',
    lightText: '#8b95a8',
    borderColor: '#1e2842',
    successGreen: '#00e676',
    warningOrange: '#ff9800',
    dangerRed: '#ff5252',
}

// ============================================
// CONFIGURACIÓN DE ANÁLISIS
// ============================================

export const ANALYSIS_CONFIG = {
    // Duración del análisis simulado (ms)
    durationMs: 3500,

    // Rango de confianza del resultado (%)
    minConfidence: 75,
    maxConfidence: 98,

    // Rango de diámetro de lesión (mm)
    minDiameterMm: 2,
    maxDiameterMm: 12,
}

// ============================================
// CONFIGURACIÓN DE SCANNER
// ============================================

export const SCANNER_CONFIG = {
    // Duración total de la animación (ms)
    totalDurationMs: 3200,

    // Fases del análisis con timing
    phases: [
        { name: 'Preprocesamiento', delay: 500, progress: 25 },
        { name: 'Extracción de características', delay: 1500, progress: 50 },
        { name: 'Clasificación neural', delay: 2500, progress: 75 },
        { name: 'Generación de resultados', delay: 3200, progress: 100 }
    ],

    // Etiquetas de las fases
    phaseLabels: [
        'Preprocesamiento',
        'Extracción de características',
        'Clasificación neural',
        'Generación de resultados'
    ]
}

// ============================================
// CONFIGURACIÓN DE MATRIX RAIN
// ============================================

export const MATRIX_CONFIG = {
    fontSize: 16,                    // Tamaño de cada carácter (px)
    fps: 40,                         // Frames por segundo (más bajo = más lento)
    fadeAlpha: 0.08,                 // Transparencia del fade effect
    resetProbability: 0.98,          // Probabilidad de reset de gota (más alto = menos resets)
    dropSpeed: 0.6,                  // Velocidad de caída (0.6 = 60% de velocidad original)
    color: '#00d9ff',                // Color cyan tech
    chars: 'アイウエオカキクケコサシスセソタチツテト' // Caracteres japoneses
}

// ============================================
// FORMATOS DE IMAGEN
// ============================================

export const ACCEPTED_IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg']
export const ACCEPTED_IMAGE_EXTENSIONS = ['PNG', 'JPG', 'JPEG']

// ============================================
// RUTAS DE LA APLICACIÓN
// ============================================

export const ROUTES = {
    home: '/',
    analysis: '/analisis',
}

// ============================================
// TIPOS DE PREDICCIÓN
// ============================================

export const PREDICTION_TYPES = {
    benign: 'Benigno',
    malignant: 'Maligno',
}

// ============================================
// NIVELES DE RIESGO
// ============================================

export const RISK_LEVELS = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
}

// ============================================
// TIPOS DE LESIÓN
// ============================================

export const LESION_TYPES = {
    nevusMelanocytic: 'Nevus Melanocítico',
    melanoma: 'Melanoma Superficial',
}

// ============================================
// CARACTERÍSTICAS ABCDE
// ============================================

export const ABCDE_CHARACTERISTICS = {
    asymmetry: {
        detected: 'Detectada',
        notDetected: 'No detectada',
    },
    border: {
        irregular: 'Irregular',
        regular: 'Regular',
    },
    color: {
        uniform: 'Uniforme',
        varied: 'Variado',
    },
}
