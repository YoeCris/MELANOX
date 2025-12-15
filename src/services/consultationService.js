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
        const { data, error } = await supabase
            .from('consultations')
            .select(`
                *,
                analyses (
                    prediction,
                    confidence,
                    image_url,
                    processed_image_url,
                    lesion_type,
                    risk_level,
                    asymmetry,
                    border
                )
            `)
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching doctor consultations:', error)
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
 * @param {Object} response - Respuesta del doctor
 * @returns {Promise<Object>} Consulta actualizada
 */
export async function provideDoctorResponse(consultationId, response) {
    try {
        const { data, error } = await supabase
            .from('consultations')
            .update({
                doctor_diagnosis: response.diagnosis,
                doctor_recommendations: response.recommendations,
                doctor_notes: response.notes || null,
                doctor_response_date: new Date().toISOString(),
                status: 'completed'
            })
            .eq('id', consultationId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error providing doctor response:', error)
        throw new Error('Failed to provide response: ' + error.message)
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
