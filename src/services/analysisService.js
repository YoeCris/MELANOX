import { supabase } from '../config/supabase'
import { uploadImage } from './storageService'

/**
 * Analysis Service - Handles saving and retrieving analysis data
 */

/**
 * Save analysis to database
 * @param {Object} analysisData - Analysis data from API
 * @param {string} imageDataUrl - Original image data URL
 * @param {string|null} userId - User ID (null for anonymous)
 * @returns {Promise<{id: string}>} Analysis ID
 */
export async function saveAnalysis(analysisData, imageDataUrl, userId = null) {
    try {
        // Upload original image to storage
        const userIdForStorage = userId || 'anonymous'
        const { url: imageUrl } = await uploadImage(imageDataUrl, userIdForStorage)

        // Upload processed image if available
        let processedImageUrl = null
        if (analysisData.processed_image) {
            const { url } = await uploadImage(analysisData.processed_image, userIdForStorage)
            processedImageUrl = url
        }

        // Prepare analysis record (SOLO CAMPOS ESENCIALES)
        const record = {
            user_id: userId,
            image_url: imageUrl,
            processed_image_url: processedImageUrl,

            // Main results
            prediction: analysisData.prediction,
            confidence: analysisData.confidence,

            // Details (SOLO LOS ESENCIALES)
            lesion_type: analysisData.details?.type,
            risk_level: analysisData.details?.risk,
            asymmetry: analysisData.details?.characteristics?.asymmetry,
            border: analysisData.details?.characteristics?.border
        }

        // Insert into database
        const { data, error } = await supabase
            .from('analyses')
            .insert(record)
            .select()
            .single()

        if (error) throw error

        return { id: data.id }
    } catch (error) {
        console.error('Error saving analysis:', error)
        throw new Error('Failed to save analysis: ' + error.message)
    }
}

/**
 * Get user's analyses
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of analyses
 */
export async function getUserAnalyses(userId) {
    try {
        const { data, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching user analyses:', error)
        throw new Error('Failed to fetch analyses: ' + error.message)
    }
}

/**
 * Get all analyses (admin only)
 * @returns {Promise<Array>} List of all analyses with user info
 */
export async function getAllAnalyses() {
    try {
        const { data, error } = await supabase
            .from('analyses')
            .select(`
        *,
        users (
          email,
          full_name,
          avatar_url
        )
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching all analyses:', error)
        throw new Error('Failed to fetch analyses: ' + error.message)
    }
}

/**
 * Get single analysis by ID
 * @param {string} analysisId - Analysis ID
 * @returns {Promise<Object>} Analysis data
 */
export async function getAnalysisById(analysisId) {
    try {
        const { data, error } = await supabase
            .from('analyses')
            .select(`
        *,
        users (
          email,
          full_name,
          avatar_url
        )
      `)
            .eq('id', analysisId)
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching analysis:', error)
        throw new Error('Failed to fetch analysis: ' + error.message)
    }
}

/**
 * Delete analysis
 * @param {string} analysisId - Analysis ID
 * @returns {Promise<void>}
 */
export async function deleteAnalysis(analysisId) {
    try {
        const { error } = await supabase
            .from('analyses')
            .delete()
            .eq('id', analysisId)

        if (error) throw error
    } catch (error) {
        console.error('Error deleting analysis:', error)
        throw new Error('Failed to delete analysis: ' + error.message)
    }
}
