import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDoctorConsultations, provideDoctorResponse } from '../services/consultationService'
import { supabase } from '../config/supabase'
import { Loader, FileText, Clock, CheckCircle, User, Phone, Mail, MapPin, Activity, AlertTriangle, Eye } from 'lucide-react'

/**
 * DoctorPanel - Panel de casos para doctores
 * Muestra consultas asignadas y permite responder
 */
function DoctorPanel() {
    const { user, userRole } = useAuth()
    const [consultations, setConsultations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedConsultation, setSelectedConsultation] = useState(null)
    const [doctorId, setDoctorId] = useState(null)

    useEffect(() => {
        if (user && userRole === 'doctor') {
            fetchDoctorId()
        } else if (user && userRole && userRole !== 'doctor') {
            setLoading(false)
            setError('Este usuario no tiene permisos de doctor.')
        }
    }, [user, userRole])

    useEffect(() => {
        if (doctorId) {
            fetchConsultations()
        }
    }, [doctorId])

    const fetchDoctorId = async () => {
        try {
            console.log('[DoctorPanel] Checking doctor profile for user:', user?.id)

            // 1. Intentar buscar por user_id
            let { data, error } = await supabase
                .from('doctors')
                .select('id, full_name, user_id')
                .eq('user_id', user.id)
                .maybeSingle()

            // 2. Si no se encuentra, intentar buscar por email (Fallback robusto)
            if (!data) {
                console.log('[DoctorPanel] Not found by ID, trying by email:', user.email)
                const { data: dataEmail, error: errorEmail } = await supabase
                    .from('doctors')
                    .select('id, full_name, user_id')
                    .eq('email', user.email)
                    .maybeSingle()

                if (dataEmail) {
                    data = dataEmail
                    // Si encontramos el doctor por email pero no tiene el user_id vinculado correctamente
                    if (dataEmail.user_id !== user.id) {
                        console.warn('[DoctorPanel] Doctor linked by email but ID mismatch. Updating link...')
                        const { error: updateError } = await supabase
                            .from('doctors')
                            .update({ user_id: user.id })
                            .eq('id', dataEmail.id)

                        if (updateError) {
                            console.error('[DoctorPanel] FAILED to update doctor link. RLS might be blocking this:', updateError)
                        } else {
                            console.log('[DoctorPanel] Doctor link updated successfully. User is now owner.')
                        }
                    }
                } else if (errorEmail) {
                    console.error('[DoctorPanel] Error fetching by email:', errorEmail)
                }
            }

            if (error && !data) throw error

            if (data) {
                console.log('[DoctorPanel] Doctor identified:', data)
                setDoctorId(data.id)
            } else {
                console.warn('[DoctorPanel] No doctor profile found for this user.')
                setError('No se encontro perfil de doctor asociado a esta cuenta.')
            }
        } catch (err) {
            console.error('[DoctorPanel] Error fetching doctor ID:', err)
            setError('Error al verificar perfil de doctor')
        }
    }

    const fetchConsultations = async () => {
        if (!doctorId) return

        try {
            setLoading(true)
            console.log('[DoctorPanel] Fetching consultations for doctorId:', doctorId)
            const data = await getDoctorConsultations(doctorId)
            console.log('[DoctorPanel] Consultations loaded:', data)
            setConsultations(data)
            setError(null)
        } catch (err) {
            console.error('[DoctorPanel] Error fetching consultations:', err)
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
            <div className="loading-overlay">
                <div className="loading-gears">
                    <div className="gear gear-large">⚙</div>
                    <div className="gear gear-medium">⚙</div>
                    <div className="gear gear-small">⚙</div>
                </div>
                <div className="loading-text">Cargando casos...</div>
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
                                        <Eye size={20} /> Ver Caso Completo
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
        actual_diagnosis: consultation.actual_diagnosis || '',
        actual_lesion_type: consultation.actual_lesion_type || ''
    })
    const [submitting, setSubmitting] = useState(false)

    // Update form ONLY when viewing a different consultation
    useEffect(() => {
        setResponse({
            actual_diagnosis: consultation.actual_diagnosis || '',
            actual_lesion_type: consultation.actual_lesion_type || ''
        })
    }, [consultation.id]) // Solo cuando cambia el ID de la consulta

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


                        {/* Imagen del Análisis */}
                        {console.log('[CaseDetail] Consultation data:', consultation)}
                        {console.log('[CaseDetail] Analyses:', consultation.analyses)}
                        {console.log('[CaseDetail] Image URL:', consultation.analyses?.image_url)}

                        {consultation.analyses?.image_url ? (
                            <div className="cyber-card">
                                <h3>Imagen del Lunar Analizado</h3>
                                <div className="analysis-image-container">
                                    <img
                                        src={consultation.analyses.image_url}
                                        alt="Imagen del lunar"
                                        className="analysis-image clickable"
                                        onClick={() => window.open(consultation.analyses.image_url, '_blank')}
                                        title="Click para ampliar"
                                    />
                                    <p className="image-hint">Click en la imagen para ampliar</p>
                                </div>
                            </div>
                        ) : (
                            <div className="cyber-card">
                                <h3>⚠️ Imagen No Disponible</h3>
                                <div className="no-image-message">
                                    <p><strong>La imagen del análisis no está disponible.</strong></p>
                                    <p className="hint-text">
                                        Esta consulta no tiene un análisis válido asociado.
                                        Por favor, solicite al paciente que proporcione la imagen del lunar
                                        o cree una nueva consulta desde la página de análisis.
                                    </p>
                                    <p className="hint-text" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                                        <strong>Nota:</strong> Para futuras consultas, el paciente debe primero realizar
                                        un análisis en la página de "Análisis" y luego crear la consulta seleccionando ese análisis.
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* Formulario de Validación del Modelo */}
                        <div className="cyber-card full-width">
                            <h3>Validación del Modelo IA</h3>
                            <p className="validation-description">
                                Complete estos campos con el diagnóstico real para mejorar el modelo de IA.
                            </p>
                            <form onSubmit={handleSubmit} className="doctor-response-form">
                                <div className="form-group">
                                    <label htmlFor="actual_diagnosis">Diagnóstico Real *</label>
                                    <select
                                        id="actual_diagnosis"
                                        value={response.actual_diagnosis || ''}
                                        onChange={(e) => setResponse({ ...response, actual_diagnosis: e.target.value })}
                                        required
                                        className="cyber-input"
                                    >
                                        <option value="">-- Seleccione --</option>
                                        <option value="Benigno">Benigno</option>
                                        <option value="Maligno">Maligno</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="actual_lesion_type">Tipo de Lesión Real *</label>
                                    <select
                                        id="actual_lesion_type"
                                        value={response.actual_lesion_type || ''}
                                        onChange={(e) => setResponse({ ...response, actual_lesion_type: e.target.value })}
                                        required
                                        className="cyber-input"
                                    >
                                        <option value="">-- Seleccione --</option>
                                        <option value="Queratosis Actínica">Queratosis Actínica (Actinic Keratosis)</option>
                                        <option value="Carcinoma Basocelular">Carcinoma Basocelular (Basal Cell Carcinoma)</option>
                                        <option value="Dermatofibroma">Dermatofibroma</option>
                                        <option value="Melanoma">Melanoma</option>
                                        <option value="Nevus">Nevus</option>
                                        <option value="Queratosis Benigna Pigmentada">Queratosis Benigna Pigmentada (Pigmented Benign Keratosis)</option>
                                        <option value="Queratosis Seborreica">Queratosis Seborreica (Seborrheic Keratosis)</option>
                                        <option value="Carcinoma de Células Escamosas">Carcinoma de Células Escamosas (Squamous Cell Carcinoma)</option>
                                        <option value="Lesión Vascular">Lesión Vascular (Vascular Lesion)</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="cyber-button primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Guardando...' : 'Guardar Validación'}
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
