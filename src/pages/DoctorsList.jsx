import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveDoctors } from '../services/doctorService'
import DoctorCard from '../components/DoctorCard'
import { Loader, Stethoscope, AlertTriangle } from 'lucide-react'

/**
 * DoctorsList - Página que muestra todos los doctores activos
 * Los usuarios pueden seleccionar un doctor para consulta
 */
function DoctorsList() {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        try {
            setLoading(true)
            const data = await getActiveDoctors()
            setDoctors(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching doctors:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectDoctor = (doctor) => {
        // Navegar a formulario de consulta con doctor seleccionado
        navigate('/nueva-consulta', { state: { doctor } })
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-section">
                    <Loader className="spinner" size={48} />
                    <p>Cargando doctores...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-section">
                    <AlertTriangle size={48} className="error-icon" />
                    <h2>Error al cargar doctores</h2>
                    <p>{error}</p>
                    <button className="cyber-button" onClick={fetchDoctors}>
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="doctors-list-page">
            <div className="container">
                <section className="page-header">
                    <div className="header-icon">
                        <Stethoscope size={48} />
                    </div>
                    <h1 className="page-title">Consultar con un Doctor</h1>
                    <p className="page-subtitle">
                        Selecciona un dermatólogo especializado para obtener una consulta profesional
                    </p>
                </section>

                {doctors.length === 0 ? (
                    <div className="empty-state">
                        <Stethoscope size={64} />
                        <h3>No hay doctores disponibles</h3>
                        <p>Por el momento no hay doctores activos en el sistema</p>
                    </div>
                ) : (
                    <div className="doctors-grid">
                        {doctors.map(doctor => (
                            <DoctorCard
                                key={doctor.id}
                                doctor={doctor}
                                onSelect={handleSelectDoctor}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorsList
