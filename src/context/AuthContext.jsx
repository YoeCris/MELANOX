import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

/**
 * AuthContext - Manejo global de autenticación con Supabase
 * 
 * Provee:
 * - user: Datos del usuario actual
 * - loading: Estado de carga
 * - loginWithGoogle: Función para login con Google
 * - logout: Función para cerrar sesión
 * - isAuthenticated: Boolean si está autenticado
 */

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Escuchar cambios en autenticación
    useEffect(() => {
        // Obtener sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Escuchar cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    /**
     * Login con Google OAuth
     */
    const loginWithGoogle = async () => {
        try {
            setLoading(true)

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/analisis`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            })

            if (error) throw error

            // Supabase redirigirá automáticamente a Google
            // Cuando regrese, el usuario estará autenticado
            return { success: true }
        } catch (error) {
            console.error('Error en login:', error)
            setLoading(false)
            return { success: false, error: error.message }
        }
    }

    /**
     * Login con Magic Link (email sin contraseña)
     */
    const loginWithEmail = async (email) => {
        try {
            setLoading(true)

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/analisis`,
                    shouldCreateUser: true
                }
            })

            if (error) throw error

            setLoading(false)
            return { success: true }
        } catch (error) {
            console.error('Error en login con email:', error)
            setLoading(false)
            return { success: false, error: error.message }
        }
    }

    /**
     * Cerrar sesión
     */
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            setUser(null)
            return { success: true }
        } catch (error) {
            console.error('Error en logout:', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Guardar/actualizar usuario en la base de datos
     */
    const saveUserToDatabase = async (userData) => {
        try {
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: userData.id,
                    email: userData.email,
                    full_name: userData.user_metadata?.full_name,
                    avatar_url: userData.user_metadata?.avatar_url,
                    last_login: new Date().toISOString(),
                }, {
                    onConflict: 'id'
                })

            if (error) throw error
        } catch (error) {
            console.error('Error guardando usuario:', error)
        }
    }

    // Guardar usuario en BD cuando se autentica
    useEffect(() => {
        if (user) {
            saveUserToDatabase(user)
        }
    }, [user])

    const value = {
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
