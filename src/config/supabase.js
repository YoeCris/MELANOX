/**
 * Supabase Configuration Template
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a: supabase.js
 * 2. Reemplaza las credenciales con las tuyas de Supabase
 * 3. El archivo supabase.js NO se subirá a git (está en .gitignore)
 */

import { createClient } from '@supabase/supabase-js'

// Obtener credenciales de variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Faltan credenciales de Supabase. Verifica tu archivo .env'
    )
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'  // Usa PKCE para URLs más limpias
    }
})

export default supabase
