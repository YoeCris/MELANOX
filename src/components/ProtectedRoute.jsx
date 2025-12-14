import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute - Componente para proteger rutas
 * 
 * Redirige a /login si el usuario no está autenticado
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        )
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
