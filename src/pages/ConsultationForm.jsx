import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createConsultation } from '../services/consultationService'
import { User, Phone, Mail, MapPin, FileText, AlertCircle, Send } from 'lucide-react'

/**
 * ConsultationForm - Formulario para crear una nueva consulta médica
 * Requiere datos completos del paciente para historial médico
 */
function ConsultationForm() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const { doctor, analysis } = location.state || {}

    const [formData, setFormData] = useState({
        patient_full_name: '',
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

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!doctor || !analysis) {
            setError('Información de doctor o análisis no disponible')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const consultationData = {
                ...formData,
                patient_age: parseInt(formData.patient_age),
                analysis_id: analysis.id,
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

    if (!doctor || !analysis) {
        return (
            <div className="page-container">
                <div className="error-section">
                    <AlertCircle size={48} />
                    <h2>Información Incompleta</h2>
                    <p>No se encontró información del doctor o análisis</p>
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
                                    Dirección
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
                                Historial Médico
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
                                Medicamentos Actuales
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
                                Alergias
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
                                Notas Adicionales
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
                                disabled={loading}
                            >
                                {loading ? (
                                    <>Enviando...</>
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
