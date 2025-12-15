import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllAnalyses } from '../services/analysisService'
import { Shield, Calendar, TrendingUp, AlertTriangle, CheckCircle, Loader, Filter, User } from 'lucide-react'
import { PREDICTION_TYPES } from '../constants'

/**
 * AdminDashboard - Vista de administrador para ver todos los análisis
 * 
 * Solo accesible para usuarios administradores (hardcoded por email)
 * Muestra todos los análisis de todos los usuarios con filtros
 */

// CONFIGURACIÓN: Emails de administradores
const ADMIN_EMAILS = [
    'yoelcriscatacora@gmail.com', // Reemplazar con tu email
    'admin@melanox.com'
]

function AdminDashboard() {
    const { user, isAuthenticated } = useAuth()
    const [analyses, setAnalyses] = useState([])
    const [filteredAnalyses, setFilteredAnalyses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filtros
    const [filters, setFilters] = useState({
        prediction: '',
        riskLevel: '',
        dateFrom: '',
        dateTo: '',
        userEmail: ''
    })

    const isAdmin = isAuthenticated && user && ADMIN_EMAILS.includes(user.email)

    useEffect(() => {
        if (isAdmin) {
            fetchAllAnalyses()
        }
    }, [isAdmin])

    useEffect(() => {
        applyFilters()
    }, [analyses, filters])

    const fetchAllAnalyses = async () => {
        try {
            setLoading(true)
            const data = await getAllAnalyses()
            setAnalyses(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching analyses:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...analyses]

        // Filter by prediction
        if (filters.prediction) {
            filtered = filtered.filter(a => a.prediction === filters.prediction)
        }

        // Filter by risk level
        if (filters.riskLevel) {
            filtered = filtered.filter(a => a.risk_level === filters.riskLevel)
        }

        // Filter by user email
        if (filters.userEmail) {
            filtered = filtered.filter(a =>
                a.users?.email?.toLowerCase().includes(filters.userEmail.toLowerCase())
            )
        }

        // Filter by date range
        if (filters.dateFrom) {
            filtered = filtered.filter(a =>
                new Date(a.created_at) >= new Date(filters.dateFrom)
            )
        }

        if (filters.dateTo) {
            filtered = filtered.filter(a =>
                new Date(a.created_at) <= new Date(filters.dateTo)
            )
        }

        setFilteredAnalyses(filtered)
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            prediction: '',
            riskLevel: '',
            dateFrom: '',
            dateTo: '',
            userEmail: ''
        })
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Stats
    const stats = {
        total: analyses.length,
        benign: analyses.filter(a => a.prediction === PREDICTION_TYPES.benign).length,
        malignant: analyses.filter(a => a.prediction === PREDICTION_TYPES.malignant).length,
        uniqueUsers: new Set(analyses.map(a => a.user_id).filter(Boolean)).size
    }

    if (!isAuthenticated) {
        return (
            <div className="analysis-page">
                <div className="container">
                    <div className="error-section">
                        <div className="error-card cyber-card">
                            <AlertTriangle size={60} className="error-icon" />
                            <h2>Acceso Restringido</h2>
                            <p className="error-message">
                                Debes iniciar sesión para acceder al panel de administración
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="analysis-page">
                <div className="container">
                    <div className="error-section">
                        <div className="error-card cyber-card">
                            <Shield size={60} className="error-icon" />
                            <h2>Acceso Denegado</h2>
                            <p className="error-message">
                                No tienes permisos de administrador para acceder a esta página
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="analysis-page">
                <div className="container">
                    <div className="loading-section">
                        <Loader size={48} className="loading-spinner" />
                        <p>Cargando análisis...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="analysis-page">
                <div className="container">
                    <div className="error-section">
                        <div className="error-card cyber-card">
                            <AlertTriangle size={60} className="error-icon" />
                            <h2>Error al Cargar</h2>
                            <p className="error-message">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="analysis-page admin-dashboard">
            <div className="container">
                {/* Header */}
                <section className="analysis-header">
                    <h1 className="page-title">
                        <Shield size={36} />
                        Panel de Administración
                    </h1>
                    <p className="page-subtitle">
                        Vista completa de todos los análisis del sistema
                    </p>
                </section>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card cyber-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Análisis</div>
                        </div>
                    </div>

                    <div className="stat-card cyber-card benign">
                        <div className="stat-icon"><CheckCircle size={32} /></div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.benign}</div>
                            <div className="stat-label">Benignos</div>
                        </div>
                    </div>

                    <div className="stat-card cyber-card malignant">
                        <div className="stat-icon"><AlertTriangle size={32} /></div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.malignant}</div>
                            <div className="stat-label">Malignos</div>
                        </div>
                    </div>

                    <div className="stat-card cyber-card">
                        <div className="stat-icon"><User size={32} /></div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.uniqueUsers}</div>
                            <div className="stat-label">Usuarios</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section cyber-card">
                    <h3>
                        <Filter size={20} />
                        Filtros
                    </h3>

                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Predicción</label>
                            <select
                                value={filters.prediction}
                                onChange={(e) => handleFilterChange('prediction', e.target.value)}
                            >
                                <option value="">Todas</option>
                                <option value={PREDICTION_TYPES.benign}>Benigno</option>
                                <option value={PREDICTION_TYPES.malignant}>Maligno</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Nivel de Riesgo</label>
                            <select
                                value={filters.riskLevel}
                                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Alto">Alto</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Email Usuario</label>
                            <input
                                type="text"
                                placeholder="Buscar por email..."
                                value={filters.userEmail}
                                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Desde</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Hasta</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            />
                        </div>

                        <div className="filter-actions">
                            <button className="cyber-button" onClick={clearFilters}>
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>

                    <div className="filter-results">
                        Mostrando {filteredAnalyses.length} de {analyses.length} análisis
                    </div>
                </div>

                {/* Analyses Table */}
                <div className="admin-table-container cyber-card">
                    {filteredAnalyses.length === 0 ? (
                        <div className="empty-state">
                            <p>No se encontraron análisis con los filtros seleccionados</p>
                        </div>
                    ) : (
                        <div className="admin-table">
                            {filteredAnalyses.map((analysis) => {
                                const isBenign = analysis.prediction === PREDICTION_TYPES.benign

                                return (
                                    <div key={analysis.id} className="admin-analysis-row">
                                        {/* Image */}
                                        <div className="admin-row-image">
                                            <img
                                                src={analysis.processed_image_url || analysis.image_url}
                                                alt="Análisis"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="admin-row-info">
                                            <div className="admin-row-header">
                                                <div className={`prediction-badge ${isBenign ? 'benign' : 'malignant'}`}>
                                                    {isBenign ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                                    <span>{analysis.prediction}</span>
                                                </div>
                                                <span className="confidence-badge">{analysis.confidence}%</span>
                                            </div>

                                            <div className="admin-row-details">
                                                <div className="detail-item">
                                                    <User size={16} />
                                                    <span>{analysis.users?.email || analysis.users?.full_name || 'Anónimo'}</span>
                                                </div>

                                                <div className="detail-item">
                                                    <Calendar size={16} />
                                                    <span>{formatDate(analysis.created_at)}</span>
                                                </div>

                                                {analysis.lesion_type && (
                                                    <div className="detail-item">
                                                        <span className="label">Tipo:</span>
                                                        <span>{analysis.lesion_type}</span>
                                                    </div>
                                                )}

                                                {analysis.risk_level && (
                                                    <div className="detail-item">
                                                        <span className="label">Riesgo:</span>
                                                        <span className={`risk-badge risk-${analysis.risk_level.toLowerCase()}`}>
                                                            {analysis.risk_level}
                                                        </span>
                                                    </div>
                                                )}

                                                {analysis.asymmetry && (
                                                    <div className="detail-item">
                                                        <span className="label">Asimetría:</span>
                                                        <span>{analysis.asymmetry}</span>
                                                    </div>
                                                )}

                                                {analysis.border && (
                                                    <div className="detail-item">
                                                        <span className="label">Bordes:</span>
                                                        <span>{analysis.border}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
