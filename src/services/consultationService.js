import { supabase } from '../config/supabase'

/**
 * Consultation Service - Gestión de consultas médicas
 */

/**
 * Crear una nueva consulta
 * @param {Object} consultationData - Datos de la consulta
 * @returns {Promise<Object>} Consulta creada
 */
export async function createConsultation(consultationData) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .insert({
                analysis_id: consultationData.analysis_id,
                user_id: consultationData.user_id,
                doctor_id: consultationData.doctor_id,
                patient_full_name: consultationData.patient_full_name,
                patient_age: consultationData.patient_age,
                patient_gender: consultationData.patient_gender,
                patient_phone: consultationData.patient_phone,
                patient_email: consultationData.patient_email,
                patient_address: consultationData.patient_address || null,
                medical_history: consultationData.medical_history || null,
                current_medications: consultationData.current_medications || null,
                allergies: consultationData.allergies || null,
                additional_notes: consultationData.additional_notes || null
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error creating consultation:', error)
        throw new Error('Failed to create consultation: ' + error.message)
    }
}

/**
 * Obtener consultas del usuario actual
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de consultas del usuario
 */
export async function getUserConsultations(userId) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .select(`
                *,
                doctors (
                    full_name,
                    specialization,
                    workplace,
                    profile_image_url
                ),
                analyses (
                    prediction,
                    confidence,
                    image_url
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching user consultations:', error)
        throw new Error('Failed to fetch consultations: ' + error.message)
    }
}

/**
 * Obtener consultas asignadas a un doctor
 * @param {string} doctorId - ID del doctor
 * @returns {Promise<Array>} Lista de consultas del doctor
 */
export async function getDoctorConsultations(doctorId) {
    try {
        console.log(`[consultationService] ========== DOCTOR CONSULTATIONS DEBUG ==========`)
        console.log(`[consultationService] Fetching consultations for doctorId: ${doctorId}`)

        // PASO 1: Verificar TODAS las consultas en la base de datos (sin filtro)
        const { data: allConsultations, error: allError } = await supabase
            .from('consultations')
            .select('id, doctor_id, patient_full_name, created_at')
            .limit(10)

        console.log(`[consultationService] TODAS las consultas en DB (primeras 10):`, allConsultations)
        if (allError) console.error('[consultationService] Error fetching all consultations:', allError)

        // PASO 2: Verificar consultas específicas para este doctor
        const { count, error: countError } = await supabase
            .from('consultations')
            .select('*', { count: 'exact', head: true })
            .eq('doctor_id', doctorId)

        if (countError) console.error('[consultationService] Error checking consultation count:', countError)
        console.log(`[consultationService] Consultas para doctor ${doctorId}: ${count}`)

        // PASO 3: Obtener las consultas SIN el JOIN (que está fallando)
        const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[consultationService] ERROR en query principal:', error)
            throw error
        }

        console.log(`[consultationService] Consultas obtenidas:`, data)

        // PASO 4: Para cada consulta, obtener su análisis por separado
        if (data && data.length > 0) {
            const consultationsWithAnalyses = await Promise.all(
                data.map(async (consultation) => {
                    if (consultation.analysis_id) {
                        // Intentar obtener el análisis
                        const { data: analysisData, error: analysisError } = await supabase
                            .from('analyses')
                            .select('*')
                            .eq('id', consultation.analysis_id)
                            .maybeSingle() // Usar maybeSingle en lugar de single para evitar error si no existe

                        if (analysisError) {
                            console.error(`[consultationService] Error fetching analysis ${consultation.analysis_id}:`, analysisError)
                        }

                        if (!analysisData) {
                            console.warn(`[consultationService] ⚠️ Analysis ${consultation.analysis_id} NOT FOUND in database`)
                            console.warn(`[consultationService] Esto puede ser un problema de RLS o el análisis no se guardó`)
                        } else {
                            console.log(`[consultationService] ✅ Analysis fetched for consultation ${consultation.id}:`, analysisData)
                        }

                        return { ...consultation, analyses: analysisData }
                    }
                    return { ...consultation, analyses: null }
                })
            )

            console.log('[consultationService] Primera consulta con análisis:', consultationsWithAnalyses[0])
            console.log(`[consultationService] ========== FIN DEBUG ==========`)
            return consultationsWithAnalyses
        }

        console.log(`[consultationService] ========== FIN DEBUG ==========`)
        return data || []
    } catch (error) {
        console.error('[consultationService] Error fetching doctor consultations:', error)
        throw new Error('Failed to fetch consultations: ' + error.message)
    }
}

/**
 * Obtener todas las consultas (admin only)
 * @returns {Promise<Array>} Lista de todas las consultas
 */
export async function getAllConsultations() {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .select(`
                *,
                doctors (
                    full_name,
                    specialization
                ),
                analyses (
                    prediction,
                    confidence
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching all consultations:', error)
        throw new Error('Failed to fetch consultations: ' + error.message)
    }
}

/**
 * Obtener la última consulta del usuario para autocompletar datos
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} Última consulta o null
 */
export async function getLastConsultation(userId) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching last consultation:', error)
        return null
    }
}

/**
 * Obtener una consulta por ID
 * @param {string} consultationId - ID de la consulta
 * @returns {Promise<Object>} Datos de la consulta
 */
export async function getConsultationById(consultationId) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .select(`
                *,
                doctors (
                    full_name,
                    specialization,
                    workplace,
                    position,
                    profile_image_url
                ),
                analyses (
                    prediction,
                    confidence,
                    image_url,
                    processed_image_url,
                    lesion_type,
                    risk_level,
                    asymmetry,
                    border,
                    created_at
                )
            `)
            .eq('id', consultationId)
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching consultation:', error)
        throw new Error('Failed to fetch consultation: ' + error.message)
    }
}

/**
 * Actualizar estado de consulta
 * @param {string} consultationId - ID de la consulta
 * @param {string} status - Nuevo estado
 * @returns {Promise<Object>} Consulta actualizada
 */
export async function updateConsultationStatus(consultationId, status) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .update({ status })
            .eq('id', consultationId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating consultation status:', error)
        throw new Error('Failed to update consultation status: ' + error.message)
    }
}

/**
 * Doctor proporciona respuesta a consulta
 * @param {string} consultationId - ID de la consulta
 * @param {Object} responseData - Respuesta del doctor
 * @returns {Promise<Object>} Consulta actualizada
 */
export async function provideDoctorResponse(consultationId, responseData) {
    try {
        console.log('[provideDoctorResponse] Saving response:', responseData)

        const { data, error } = await supabase
            .from('consultations')
            .update({
                actual_diagnosis: responseData.actual_diagnosis,
                actual_lesion_type: responseData.actual_lesion_type,
                doctor_diagnosis: responseData.diagnosis,
                doctor_recommendations: responseData.recommendations,
                doctor_notes: responseData.notes || null,
                doctor_response_date: new Date().toISOString(),
                status: 'completed'
            })
            .eq('id', consultationId)
            .select()
            .single()

        if (error) {
            console.error('[provideDoctorResponse] Error:', error)
            throw error
        }

        console.log('[provideDoctorResponse] Response saved successfully:', data)
        return data
    } catch (error) {
        console.error('Error providing doctor response:', error)
        throw new Error('Failed to provide response: ' + error.message)
    }
}

/**
 * Calificar una consulta
 * @param {string} consultationId - ID de la consulta
 * @param {number} rating - Calificación (1-5)
 * @returns {Promise<Object>} Consulta actualizada
 */
export async function rateConsultation(consultationId, rating) {
    try {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5')
        }

        const { data, error } = await supabase
            .from('consultations')
            .update({ rating })
            .eq('id', consultationId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error rating consultation:', error)
        throw new Error('Failed to rate consultation: ' + error.message)
    }
}

/**
 * Cancelar consulta
 * @param {string} consultationId - ID de la consulta
 * @returns {Promise<Object>} Consulta cancelada
 */
export async function cancelConsultation(consultationId) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .update({ status: 'cancelled' })
            .eq('id', consultationId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error cancelling consultation:', error)
        throw new Error('Failed to cancel consultation: ' + error.message)
    }
}
