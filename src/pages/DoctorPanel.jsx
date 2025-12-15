import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDoctorConsultations, updateConsultationStatus, provideDoctorResponse } from '../services/consultationService'
import { supabase } from '../config/supabase'
import { Loader, FileText, AlertTriangle, Clock, Eye } from 'lucide-react'

/**
 * DoctorPanel - Panel de casos para doctores
 * Muestra consultas asignadas y permite responder
 */
function DoctorPanel() {
    const { user } = useAuth()
    const [consultations, setConsultations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedConsultation, setSelectedConsultation] = useState(null)
    const [doctorId, setDoctorId] = useState(null)

    useEffect(() => {
        if (user) {
            fetchDoctorId()
        }
    }, [user])

    useEffect(() => {
        if (doctorId) {
            fetchConsultations()
        }
    }, [doctorId])

    const fetchDoctorId = async () => {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (error) throw error
            setDoctorId(data.id)
        } catch (err) {
            console.error('Error fetching doctor ID:', err)
            setError('No se encontró perfil de doctor')
        }
    }

    const fetchConsultations = async () => {
        try {
            setLoading(true)
            const data = await getDoctorConsultations(doctorId)
            setConsultations(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching consultations:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleViewCase = (consultation) => {
        setSelectedConsultation(consultation)
    }

    const handleStatusChange = async (consultationId, newStatus) => {
        try {
            await updateConsultationStatus(consultationId, newStatus)
            fetchConsultations()
        } catch (err) {
            console.error('Error updating status:', err)
            alert('Error al actualizar estado')
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-section">
                    <Loader className="spinner" size={48} />
                    <p>Cargando casos...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-section">
                    <AlertTriangle size={48} className="error-icon" />
                    <h2>Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    if (selectedConsultation) {
        return (
            <CaseDetail
                consultation={selectedConsultation}
                onBack={() => setSelectedConsultation(null)}
                onUpdate={fetchConsultations}
            />
        )
    }

    return (
        <div className="doctor-panel-page">
            <div className="container">
                <section className="page-header">
                    <h1 className="page-title">Panel de Casos</h1>
                    <p className="page-subtitle">
                        Consultas médicas asignadas
                    </p>
                </section>

                {consultations.length === 0 ? (
                    <div className="empty-state cyber-card">
                        <FileText size={64} />
                        <h3>No hay casos asignados</h3>
                        <p>No tienes consultas pendientes en este momento</p>
                    </div>
                ) : (
                    <div className="cases-list">
                        {consultations.map(consultation => (
                            <div key={consultation.id} className="case-card cyber-card">
                                <div className="case-header">
                                    <div className="case-info">
                                        <h3>{consultation.patient_full_name}</h3>
                                        <p>{consultation.patient_age} años - {consultation.patient_gender === 'male' ? 'Masculino' : consultation.patient_gender === 'female' ? 'Femenino' : 'Otro'}</p>
                                    </div>
                                    <div className="case-status">
                                        <select
                                            value={consultation.status}
                                            onChange={(e) => handleStatusChange(consultation.id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="in_progress">En Progreso</option>
                                            <option value="completed">Completada</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="case-body">
                                    <div className="case-detail">
                                        <span className="label">Fecha:</span>
                                        <span>{new Date(consultation.created_at).toLocaleDateString('es-ES')}</span>
                                    </div>

                                    {consultation.analyses && (
                                        <div className="case-detail">
                                            <span className="label">Análisis IA:</span>
                                            <span className={`prediction ${consultation.analyses.prediction.toLowerCase()}`}>
                                                {consultation.analyses.prediction} ({consultation.analyses.confidence}%)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="case-actions">
                                    <button
                                        className="cyber-button"
                                        onClick={() => handleViewCase(consultation)}
                                    >
                                        <Eye size={18} />
                                        Ver Caso Completo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * CaseDetail - Vista detallada de un caso con formulario de respuesta
 */
function CaseDetail({ consultation, onBack, onUpdate }) {
    const [response, setResponse] = useState({
        diagnosis: consultation.doctor_diagnosis || '',
        recommendations: consultation.doctor_recommendations || '',
        notes: consultation.doctor_notes || ''
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSubmitting(true)
            await provideDoctorResponse(consultation.id, response)
            alert('Respuesta enviada exitosamente')
            onUpdate()
            onBack()
        } catch (err) {
            console.error('Error submitting response:', err)
            alert('Error al enviar respuesta')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="case-detail-page">
            <div className="container">
                <button className="cyber-button secondary" onClick={onBack}>
                    ← Volver a Casos
                </button>

                <div className="case-detail-container">
                    <div className="case-detail-grid">
                        {/* Información del Paciente */}
                        <div className="cyber-card">
                            <h3>Información del Paciente</h3>
                            <div className="detail-grid">
                                <div><strong>Nombre:</strong> {consultation.patient_full_name}</div>
                                <div><strong>Edad:</strong> {consultation.patient_age} años</div>
                                <div><strong>Género:</strong> {consultation.patient_gender}</div>
                                <div><strong>Teléfono:</strong> {consultation.patient_phone}</div>
                                <div><strong>Email:</strong> {consultation.patient_email}</div>
                                {consultation.patient_address && (
                                    <div><strong>Dirección:</strong> {consultation.patient_address}</div>
                                )}
                            </div>
                        </div>

                        {/* Historial Médico */}
                        <div className="cyber-card">
                            <h3>Historial Médico</h3>
                            {consultation.medical_history && (
                                <div className="medical-section">
                                    <h4>Historial:</h4>
                                    <p>{consultation.medical_history}</p>
                                </div>
                            )}
                            {consultation.current_medications && (
                                <div className="medical-section">
                                    <h4>Medicamentos Actuales:</h4>
                                    <p>{consultation.current_medications}</p>
                                </div>
                            )}
                            {consultation.allergies && (
                                <div className="medical-section">
                                    <h4>Alergias:</h4>
                                    <p>{consultation.allergies}</p>
                                </div>
                            )}
                            {consultation.additional_notes && (
                                <div className="medical-section">
                                    <h4>Notas Adicionales:</h4>
                                    <p>{consultation.additional_notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Análisis IA */}
                        {consultation.analyses && (
                            <div className="cyber-card">
                                <h3>Análisis de IA</h3>
                                <div className="analysis-info">
                                    <div className="analysis-result">
                                        <span className={`prediction ${consultation.analyses.prediction.toLowerCase()}`}>
                                            {consultation.analyses.prediction}
                                        </span>
                                        <span className="confidence">{consultation.analyses.confidence}% confianza</span>
                                    </div>
                                    {consultation.analyses.image_url && (
                                        <img
                                            src={consultation.analyses.image_url}
                                            alt="Imagen del análisis"
                                            className="analysis-image"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Formulario de Respuesta */}
                        <div className="cyber-card full-width">
                            <h3>Respuesta Médica</h3>
                            <form onSubmit={handleSubmit} className="doctor-response-form">
                                <div className="form-group">
                                    <label htmlFor="diagnosis">Diagnóstico *</label>
                                    <textarea
                                        id="diagnosis"
                                        value={response.diagnosis}
                                        onChange={(e) => setResponse({ ...response, diagnosis: e.target.value })}
                                        required
                                        rows="5"
                                        className="cyber-input"
                                        placeholder="Proporcione su diagnóstico profesional..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="recommendations">Recomendaciones *</label>
                                    <textarea
                                        id="recommendations"
                                        value={response.recommendations}
                                        onChange={(e) => setResponse({ ...response, recommendations: e.target.value })}
                                        required
                                        rows="5"
                                        className="cyber-input"
                                        placeholder="Proporcione recomendaciones y tratamiento..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="notes">Notas Privadas</label>
                                    <textarea
                                        id="notes"
                                        value={response.notes}
                                        onChange={(e) => setResponse({ ...response, notes: e.target.value })}
                                        rows="3"
                                        className="cyber-input"
                                        placeholder="Notas privadas (no visibles para el paciente)..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="cyber-button primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Enviando...' : 'Enviar Respuesta'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorPanel
