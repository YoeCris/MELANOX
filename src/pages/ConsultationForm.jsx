import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createConsultation, getLastConsultation } from '../services/consultationService'
import { getUserAnalyses } from '../services/analysisService'
import { User, Phone, Mail, MapPin, FileText, AlertCircle, Send, Stethoscope, Image as ImageIcon } from 'lucide-react'

/**
 * ConsultationForm - Formulario para crear una nueva consulta médica
 * Requiere datos completos del paciente para historial médico
 */
function ConsultationForm() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const { doctor, analysis: preSelectedAnalysis } = location.state || {}

    // State for analyses selection
    const [userAnalyses, setUserAnalyses] = useState([])
    const [selectedAnalysisId, setSelectedAnalysisId] = useState(preSelectedAnalysis?.id || '')
    const [loadingAnalyses, setLoadingAnalyses] = useState(false)

    const [formData, setFormData] = useState({
        patient_full_name: user?.user_metadata?.full_name || '',
        patient_age: '',
        patient_gender: '',
        patient_phone: '',
        patient_email: user?.email || '',
        patient_address: '',
        medical_history: '',
        current_medications: '',
        allergies: '',
        additional_notes: ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [dataLoaded, setDataLoaded] = useState(false)

    // Load user analyses and previous consultation data
    useEffect(() => {
        if (user) {
            if (!preSelectedAnalysis) {
                fetchUserAnalyses()
            }

            // Only fetch previous data if we haven't loaded it yet
            if (!dataLoaded) {
                fetchPreviousData()
            }
        }
    }, [user, preSelectedAnalysis, dataLoaded])

    // Debugging: Verificar Doctor ID
    useEffect(() => {
        if (doctor) {
            console.log('[ConsultationForm] Selected Doctor:', doctor)
            console.log('[ConsultationForm] Target Doctor ID:', doctor.id)
        }
    }, [doctor])

    const fetchPreviousData = async () => {
        try {
            const lastConsultation = await getLastConsultation(user.id)
            if (lastConsultation) {
                console.log('Autocompleting data from previous consultation:', lastConsultation)
                setFormData(prev => ({
                    ...prev,
                    patient_full_name: lastConsultation.patient_full_name || prev.patient_full_name,
                    patient_age: lastConsultation.patient_age || prev.patient_age,
                    patient_gender: lastConsultation.patient_gender || prev.patient_gender,
                    patient_phone: lastConsultation.patient_phone || prev.patient_phone,
                    patient_address: lastConsultation.patient_address || prev.patient_address,
                    // Optional medical fields
                    medical_history: lastConsultation.medical_history || '',
                    current_medications: lastConsultation.current_medications || '',
                    allergies: lastConsultation.allergies || '',
                }))
            }
            setDataLoaded(true)
        } catch (err) {
            console.error('Error fetching previous data:', err)
        }
    }

    const fetchUserAnalyses = async () => {
        try {
            setLoadingAnalyses(true)
            const analyses = await getUserAnalyses(user.id)
            setUserAnalyses(analyses)
            // Pre-select the most recent one if available
            if (analyses.length > 0) {
                setSelectedAnalysisId(analyses[0].id)
            }
        } catch (err) {
            console.error('Error fetching analyses:', err)
        } finally {
            setLoadingAnalyses(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!doctor) {
            setError('Información de doctor no disponible')
            return
        }

        if (!selectedAnalysisId) {
            setError('Por favor seleccione un análisis para la consulta')
            return
        }

        try {
            setLoading(true)
            setError(null)

            console.log('[ConsultationForm] Submitting consultation for Doctor ID:', doctor.id)

            const consultationData = {
                ...formData,
                patient_age: parseInt(formData.patient_age),
                analysis_id: selectedAnalysisId,
                user_id: user.id,
                doctor_id: doctor.id
            }

            await createConsultation(consultationData)

            // Redirigir a mis consultas
            navigate('/mis-consultas', {
                state: { message: 'Consulta enviada exitosamente' }
            })
        } catch (err) {
            console.error('Error creating consultation:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // If no doctor is selected, redirect
    if (!doctor) {
        return (
            <div className="page-container">
                <div className="error-section">
                    <AlertCircle size={48} />
                    <h2>Información Incompleta</h2>
                    <p>No se seleccionó ningún doctor para la consulta</p>
                    <button className="cyber-button" onClick={() => navigate('/consultar-doctor')}>
                        Volver a Doctores
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="consultation-form-page">
            <div className="container">
                <section className="page-header">
                    <h1 className="page-title">Nueva Consulta Médica</h1>
                    <p className="page-subtitle">
                        Consulta con Dr. {doctor.full_name} - {doctor.specialization}
                    </p>
                </section>

                <div className="form-container cyber-card">
                    <form onSubmit={handleSubmit} className="consultation-form">

                        {/* Analysis Selection Section */}
                        <div className="form-section">
                            <h3 className="form-section-title">
                                <ImageIcon size={24} />
                                Selección de Análisis
                            </h3>

                            {preSelectedAnalysis ? (
                                <div className="selected-analysis-card">
                                    <div className="analysis-info">
                                        <h4>Análisis Pre-seleccionado</h4>
                                        <p>Predicción: {preSelectedAnalysis.prediction}</p>
                                        <p>Confianza: {preSelectedAnalysis.confidence}%</p>
                                    </div>
                                    <input type="hidden" name="analysis_id" value={preSelectedAnalysis.id} />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label htmlFor="analysis_select">Seleccionar Análisis *</label>
                                    {loadingAnalyses ? (
                                        <div className="loading-text">Cargando sus análisis...</div>
                                    ) : userAnalyses.length > 0 ? (
                                        <select
                                            id="analysis_select"
                                            value={selectedAnalysisId}
                                            onChange={(e) => setSelectedAnalysisId(e.target.value)}
                                            className="cyber-input"
                                            required
                                        >
                                            <option value="">-- Seleccione un análisis --</option>
                                            {userAnalyses.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    {new Date(a.created_at).toLocaleDateString()} - {a.prediction} ({a.confidence}%)
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="no-analyses-warning">
                                            <p>No tienes análisis registrados. Debes realizar un análisis antes de consultar.</p>
                                            <button
                                                type="button"
                                                className="cyber-button secondary small"
                                                onClick={() => navigate('/analisis')}
                                            >
                                                Ir a realizar análisis
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <h3 className="form-section-title">
                            <User size={24} />
                            Información Personal
                        </h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="patient_full_name">Nombre Completo *</label>
                                <input
                                    type="text"
                                    id="patient_full_name"
                                    name="patient_full_name"
                                    value={formData.patient_full_name}
                                    onChange={handleChange}
                                    required
                                    className="cyber-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="patient_age">Edad *</label>
                                <input
                                    type="number"
                                    id="patient_age"
                                    name="patient_age"
                                    value={formData.patient_age}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="150"
                                    className="cyber-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="patient_gender">Género *</label>
                                <select
                                    id="patient_gender"
                                    name="patient_gender"
                                    value={formData.patient_gender}
                                    onChange={handleChange}
                                    required
                                    className="cyber-input"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="patient_phone">
                                    <Phone size={18} />
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    id="patient_phone"
                                    name="patient_phone"
                                    value={formData.patient_phone}
                                    onChange={handleChange}
                                    required
                                    className="cyber-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="patient_email">
                                    <Mail size={18} />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="patient_email"
                                    name="patient_email"
                                    value={formData.patient_email}
                                    onChange={handleChange}
                                    required
                                    className="cyber-input"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="patient_address">
                                    <MapPin size={18} />
                                    Dirección (Opcional)
                                </label>
                                <input
                                    type="text"
                                    id="patient_address"
                                    name="patient_address"
                                    value={formData.patient_address}
                                    onChange={handleChange}
                                    className="cyber-input"
                                />
                            </div>
                        </div>

                        <h3 className="form-section-title">
                            <FileText size={24} />
                            Historial Médico
                        </h3>

                        <div className="form-group">
                            <label htmlFor="medical_history">
                                Historial Médico (Opcional)
                                <span className="label-hint">(Enfermedades previas, cirugías, etc.)</span>
                            </label>
                            <textarea
                                id="medical_history"
                                name="medical_history"
                                value={formData.medical_history}
                                onChange={handleChange}
                                rows="4"
                                className="cyber-input"
                                placeholder="Describa su historial médico relevante..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="current_medications">
                                Medicamentos Actuales (Opcional)
                                <span className="label-hint">(Medicamentos que está tomando actualmente)</span>
                            </label>
                            <textarea
                                id="current_medications"
                                name="current_medications"
                                value={formData.current_medications}
                                onChange={handleChange}
                                rows="3"
                                className="cyber-input"
                                placeholder="Liste los medicamentos que toma actualmente..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="allergies">
                                Alergias (Opcional)
                                <span className="label-hint">(Alergias conocidas a medicamentos, alimentos, etc.)</span>
                            </label>
                            <textarea
                                id="allergies"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                rows="3"
                                className="cyber-input"
                                placeholder="Liste sus alergias conocidas..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="additional_notes">
                                Notas Adicionales (Opcional)
                                <span className="label-hint">(Información adicional que considere relevante)</span>
                            </label>
                            <textarea
                                id="additional_notes"
                                name="additional_notes"
                                value={formData.additional_notes}
                                onChange={handleChange}
                                rows="4"
                                className="cyber-input"
                                placeholder="Agregue cualquier información adicional..."
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cyber-button secondary"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="cyber-button primary"
                                disabled={loading || (!selectedAnalysisId && !preSelectedAnalysis)}
                            >
                                {loading ? (
                                    <>
                                        <Send size={20} />
                                        Enviar Consulta
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Enviar Consulta
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConsultationForm
