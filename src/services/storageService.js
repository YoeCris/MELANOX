import { supabase } from '../config/supabase'

/**
 * Storage Service - Utilities for uploading images to Supabase Storage
 */

const BUCKET_NAME = 'analysis-images'

/**
 * Upload an image to Supabase Storage
 * @param {string} base64Image - Base64 encoded image data URL
 * @param {string} userId - User ID (or 'anonymous' for non-logged users)
 * @returns {Promise<{url: string, path: string}>} Public URL and storage path
 */
export async function uploadImage(base64Image, userId = 'anonymous') {
    try {
        // Convert base64 to blob
        const base64Data = base64Image.split(',')[1]
        const mimeType = base64Image.match(/data:([^;]+);/)[1]
        const extension = mimeType.split('/')[1]

        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType })

        // Generate unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(7)
        const fileName = `${userId}/${timestamp}-${randomId}.${extension}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, blob, {
                contentType: mimeType,
                cacheControl: '3600',
                upsert: false
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName)

        return {
            url: publicUrl,
            path: fileName
        }
    } catch (error) {
        console.error('Error uploading image:', error)
        throw new Error('Failed to upload image: ' + error.message)
    }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - Storage path of the file
 * @returns {Promise<void>}
 */
export async function deleteImage(filePath) {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath])

        if (error) throw error
    } catch (error) {
        console.error('Error deleting image:', error)
        throw new Error('Failed to delete image: ' + error.message)
    }
}

/**
 * Get public URL for an image
 * @param {string} filePath - Storage path of the file
 * @returns {string} Public URL
 */
export function getImageUrl(filePath) {
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

    return publicUrl
}
