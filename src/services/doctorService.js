import { supabase } from '../config/supabase'

/**
 * Doctor Service - Gestión de doctores
 */

/**
 * Obtener todos los doctores activos
 * @returns {Promise<Array>} Lista de doctores activos
 */
export async function getActiveDoctors() {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('is_active', true)
            .order('full_name', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching active doctors:', error)
        throw new Error('Failed to fetch doctors: ' + error.message)
    }
}

/**
 * Obtener todos los doctores (admin only)
 * @returns {Promise<Array>} Lista de todos los doctores
 */
export async function getAllDoctors() {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching all doctors:', error)
        throw new Error('Failed to fetch doctors: ' + error.message)
    }
}

/**
 * Obtener un doctor por ID
 * @param {string} doctorId - ID del doctor
 * @returns {Promise<Object>} Datos del doctor
 */
export async function getDoctorById(doctorId) {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', doctorId)
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching doctor:', error)
        throw new Error('Failed to fetch doctor: ' + error.message)
    }
}

/**
 * Crear un nuevo doctor (admin only)
 * @param {Object} doctorData - Datos del doctor
 * @returns {Promise<Object>} Doctor creado
 */
export async function createDoctor(doctorData) {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .insert({
                email: doctorData.email,
                user_id: doctorData.user_id || null,
                full_name: doctorData.full_name,
                specialization: doctorData.specialization,
                workplace: doctorData.workplace,
                position: doctorData.position,
                profile_image_url: doctorData.profile_image_url || null,
                is_active: doctorData.is_active !== undefined ? doctorData.is_active : true
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error creating doctor:', error)
        throw new Error('Failed to create doctor: ' + error.message)
    }
}

/**
 * Actualizar un doctor (admin only)
 * @param {string} doctorId - ID del doctor
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Doctor actualizado
 */
export async function updateDoctor(doctorId, updates) {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .update(updates)
            .eq('id', doctorId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating doctor:', error)
        throw new Error('Failed to update doctor: ' + error.message)
    }
}

/**
 * Eliminar un doctor (admin only)
 * @param {string} doctorId - ID del doctor
 * @returns {Promise<void>}
 */
export async function deleteDoctor(doctorId) {
    try {
        const { error } = await supabase
            .from('doctors')
            .delete()
            .eq('id', doctorId)

        if (error) throw error
    } catch (error) {
        console.error('Error deleting doctor:', error)
        throw new Error('Failed to delete doctor: ' + error.message)
    }
}

/**
 * Activar/Desactivar un doctor (admin only)
 * @param {string} doctorId - ID del doctor
 * @param {boolean} isActive - Estado activo
 * @returns {Promise<Object>} Doctor actualizado
 */
export async function toggleDoctorStatus(doctorId, isActive) {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .update({ is_active: isActive })
            .eq('id', doctorId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error toggling doctor status:', error)
        throw new Error('Failed to toggle doctor status: ' + error.message)
    }
}
