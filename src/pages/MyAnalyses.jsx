import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserAnalyses } from '../services/analysisService'
import { FileText, Calendar, TrendingUp, AlertTriangle, CheckCircle, Loader } from 'lucide-react'
import { PREDICTION_TYPES } from '../constants'

/**
 * MyAnalyses - Página de historial de análisis del usuario
 * 
 * Muestra todos los análisis realizados por el usuario actual
 * con preview de imagen, predicción, confianza y fecha
 */
function MyAnalyses() {
    const { user, isAuthenticated } = useAuth()
    const [analyses, setAnalyses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchAnalyses()
        }
    }, [isAuthenticated, user])

    const fetchAnalyses = async () => {
        try {
            setLoading(true)
            const data = await getUserAnalyses(user.id)
            setAnalyses(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching analyses:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!isAuthenticated) {
        return (
            <div className="analysis-page">
                <div className="container">
                    <div className="error-section">
                        <div className="error-card cyber-card">
                            <AlertTriangle size={60} className="error-icon" />
                            <h2>Acceso Restringido</h2>
                            <p className="error-message">
                                Debes iniciar sesión para ver tu historial de análisis
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="analysis-page">
                <div className="container">
                    <div className="loading-section">
                        <Loader size={48} className="loading-spinner" />
                        <p>Cargando análisis...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="analysis-page">
                <div className="container">
                    <div className="error-section">
                        <div className="error-card cyber-card">
                            <AlertTriangle size={60} className="error-icon" />
                            <h2>Error al Cargar</h2>
                            <p className="error-message">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="analysis-page">
            <div className="container">
                <section className="analysis-header">
                    <h1 className="page-title">
                        <FileText size={36} />
                        Mis Análisis
                    </h1>
                    <p className="page-subtitle">
                        Historial completo de tus análisis de melanoma
                    </p>
                </section>

                {analyses.length === 0 ? (
                    <div className="empty-state cyber-card">
                        <FileText size={64} className="empty-icon" />
                        <h2>No hay análisis aún</h2>
                        <p>Realiza tu primer análisis para verlo aquí</p>
                        <a href="/analisis" className="cyber-button">
                            Realizar Análisis
                        </a>
                    </div>
                ) : (
                    <div className="analyses-grid">
                        {analyses.map((analysis) => {
                            const isBenign = analysis.prediction === PREDICTION_TYPES.benign

                            return (
                                <div key={analysis.id} className="analysis-card cyber-card">
                                    {/* Image Preview */}
                                    <div className="analysis-card-image">
                                        <img
                                            src={analysis.processed_image_url || analysis.image_url}
                                            alt="Análisis"
                                        />
                                    </div>

                                    {/* Analysis Info */}
                                    <div className="analysis-card-content">
                                        {/* Prediction Badge */}
                                        <div className={`prediction-badge ${isBenign ? 'benign' : 'malignant'}`}>
                                            {isBenign ? (
                                                <CheckCircle size={20} />
                                            ) : (
                                                <AlertTriangle size={20} />
                                            )}
                                            <span>{analysis.prediction}</span>
                                        </div>

                                        {/* Details */}
                                        <div className="analysis-card-details">
                                            <div className="detail-row">
                                                <TrendingUp size={18} />
                                                <span>Confianza: {analysis.confidence}%</span>
                                            </div>

                                            <div className="detail-row">
                                                <Calendar size={18} />
                                                <span>{formatDate(analysis.created_at)}</span>
                                            </div>

                                            {analysis.lesion_type && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Tipo:</span>
                                                    <span>{analysis.lesion_type}</span>
                                                </div>
                                            )}

                                            {analysis.risk_level && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Riesgo:</span>
                                                    <span className={`risk-badge risk-${analysis.risk_level.toLowerCase()}`}>
                                                        {analysis.risk_level}
                                                    </span>
                                                </div>
                                            )}

                                            {analysis.asymmetry && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Asimetría:</span>
                                                    <span>{analysis.asymmetry}</span>
                                                </div>
                                            )}

                                            {analysis.border && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Bordes:</span>
                                                    <span>{analysis.border}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyAnalyses
