import { useState } from 'react'
import { X, MessageSquare } from 'lucide-react'
import { supabase } from '../config/supabase'

/**
 * MedicalFeedbackModal - Modal para que usuarios reporten diagnóstico médico real
 * 
 * Permite al usuario agregar:
 * - Diagnóstico real del médico (Benigno/Maligno)
 * - Comentarios adicionales
 */
function MedicalFeedbackModal({ isOpen, onClose, analysisId, currentPrediction }) {
    const [medicalDiagnosis, setMedicalDiagnosis] = useState('')
    const [feedback, setFeedback] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!medicalDiagnosis) {
            setError('Por favor selecciona el diagnóstico médico')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const { error: updateError } = await supabase
                .from('analyses')
                .update({
                    medical_diagnosis: medicalDiagnosis,
                    medical_feedback: feedback || null,
                    feedback_date: new Date().toISOString()
                })
                .eq('id', analysisId)

            if (updateError) throw updateError

            // Cerrar modal y recargar
            onClose(true) // true indica que se guardó exitosamente
        } catch (err) {
            console.error('Error saving feedback:', err)
            setError('Error al guardar el feedback. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="modal-close" onClick={() => onClose(false)}>
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="modal-header">
                    <MessageSquare size={48} className="modal-icon" />
                    <h2>Feedback Médico</h2>
                    <p className="modal-subtitle">
                        ¿Fuiste al médico? Ayúdanos a mejorar reportando el diagnóstico real
                    </p>
                </div>

                {/* Form */}
                <form className="feedback-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Nuestro Análisis: <strong>{currentPrediction}</strong></label>
                    </div>

                    <div className="form-group">
                        <label>Diagnóstico del Médico *</label>
                        <div className="feedback-diagnosis-options">
                            <div
                                className={`diagnosis-option ${medicalDiagnosis === 'Benigno' ? 'selected' : ''}`}
                                onClick={() => setMedicalDiagnosis('Benigno')}
                            >
                                ✓ Benigno
                            </div>
                            <div
                                className={`diagnosis-option ${medicalDiagnosis === 'Maligno' ? 'selected malignant' : ''}`}
                                onClick={() => setMedicalDiagnosis('Maligno')}
                            >
                                ⚠ Maligno
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="feedback">Comentarios Adicionales (Opcional)</label>
                        <textarea
                            id="feedback"
                            placeholder="Ej: El doctor confirmó que es un nevus benigno, me recomendó revisión anual..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="cyber-button submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Enviar Feedback'}
                    </button>

                    <p className="form-note">
                        Tu feedback nos ayuda a mejorar la precisión del modelo de IA
                    </p>
                </form>
            </div>
        </div>
    )
}

export default MedicalFeedbackModal
