import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserConsultations } from '../services/consultationService'
import { Loader, FileText, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'

/**
 * MyConsultations - Página que muestra las consultas del usuario
 */
function MyConsultations() {
    const { user } = useAuth()
    const [consultations, setConsultations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user) {
            fetchConsultations()
        }
    }, [user])

    const fetchConsultations = async () => {
        try {
            setLoading(true)
            const data = await getUserConsultations(user.id)
            setConsultations(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching consultations:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={20} className="status-icon pending" />
            case 'in_progress':
                return <FileText size={20} className="status-icon in-progress" />
            case 'completed':
                return <CheckCircle size={20} className="status-icon completed" />
            case 'cancelled':
                return <XCircle size={20} className="status-icon cancelled" />
            default:
                return null
        }
    }

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Pendiente',
            'in_progress': 'En Progreso',
            'completed': 'Completada',
            'cancelled': 'Cancelada'
        }
        return statusMap[status] || status
    }

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-text">Cargando consultas...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-section">
                    <AlertTriangle size={48} className="error-icon" />
                    <h2>Error al cargar consultas</h2>
                    <p>{error}</p>
                    <button className="cyber-button" onClick={fetchConsultations}>
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="my-consultations-page">
            <div className="container">
                <section className="page-header">
                    <h1 className="page-title">Mis Consultas</h1>
                    <p className="page-subtitle">
                        Historial de consultas médicas realizadas
                    </p>
                </section>

                {consultations.length === 0 ? (
                    <div className="empty-state cyber-card">
                        <FileText size={64} />
                        <h3>No tienes consultas</h3>
                        <p>Aún no has realizado ninguna consulta médica</p>
                    </div>
                ) : (
                    <div className="consultations-list">
                        {consultations.map(consultation => (
                            <div key={consultation.id} className="consultation-card cyber-card">
                                <div className="consultation-header">
                                    <div className="consultation-doctor">
                                        {consultation.doctors?.profile_image_url && (
                                            <img
                                                src={consultation.doctors.profile_image_url}
                                                alt={consultation.doctors.full_name}
                                                className="doctor-avatar"
                                            />
                                        )}
                                        <div>
                                            <h3>{consultation.doctors?.full_name}</h3>
                                            <p className="doctor-spec">{consultation.doctors?.specialization}</p>
                                        </div>
                                    </div>
                                    <div className="consultation-status">
                                        {getStatusIcon(consultation.status)}
                                        <span>{getStatusText(consultation.status)}</span>
                                    </div>
                                </div>

                                <div className="consultation-body">
                                    <div className="consultation-info">
                                        <span className="label">Fecha:</span>
                                        <span>{new Date(consultation.created_at).toLocaleDateString('es-ES')}</span>
                                    </div>

                                    {consultation.analyses && (
                                        <div className="consultation-analysis">
                                            <span className="label">Análisis:</span>
                                            <span className={`prediction ${consultation.analyses.prediction.toLowerCase()}`}>
                                                {consultation.analyses.prediction}
                                            </span>
                                            <span className="confidence">
                                                {consultation.analyses.confidence}% confianza
                                            </span>
                                        </div>
                                    )}

                                    {consultation.status === 'completed' && consultation.doctor_diagnosis && (
                                        <div className="doctor-response">
                                            <h4>Diagnóstico del Doctor:</h4>
                                            <p>{consultation.doctor_diagnosis}</p>

                                            {consultation.doctor_recommendations && (
                                                <>
                                                    <h4>Recomendaciones:</h4>
                                                    <p>{consultation.doctor_recommendations}</p>
                                                </>
                                            )}

                                            <p className="response-date">
                                                Respondido el {new Date(consultation.doctor_response_date).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyConsultations
