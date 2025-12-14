import { createContext, useContext, useState, useEffect } from 'react'
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../config/firebase'

/**
 * AuthContext - Manejo global de autenticación
 * 
 * Provee:
 * - user: Datos del usuario actual
 * - loading: Estado de carga
 * - loginWithGoogle: Función para login
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Usuario autenticado
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    ...userDoc.data()
                })
            } else {
                // No autenticado
                setUser(null)
            }
            setLoading(false)
        })

        return unsubscribe
    }, [])

    /**
     * Login con Google OAuth
     */
    const loginWithGoogle = async () => {
        try {
            setLoading(true)
            const result = await signInWithPopup(auth, googleProvider)

            // Guardar/actualizar usuario en Firestore
            const userRef = doc(db, 'users', result.user.uid)
            const userDoc = await getDoc(userRef)

            const userData = {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                lastLogin: serverTimestamp(),
            }

            if (!userDoc.exists()) {
                // Nuevo usuario
                await setDoc(userRef, {
                    ...userData,
                    createdAt: serverTimestamp(),
                    consentGiven: false,
                    totalAnalysis: 0
                })
            } else {
                // Usuario existente - solo actualizar lastLogin
                await setDoc(userRef, userData, { merge: true })
            }

            return { success: true, isNewUser: !userDoc.exists() }
        } catch (error) {
            console.error('Error en login:', error)
            setLoading(false)
            return { success: false, error: error.message }
        }
    }

    /**
     * Cerrar sesión
     */
    const logout = async () => {
        try {
            await signOut(auth)
            setUser(null)
            return { success: true }
        } catch (error) {
            console.error('Error en logout:', error)
            return { success: false, error: error.message }
        }
    }

    const value = {
        user,
        loading,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
