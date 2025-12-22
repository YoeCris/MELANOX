import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveDoctors } from '../services/doctorService'
import { getDoctorRating } from '../services/doctorService'
import DoctorCard from '../components/DoctorCard'
import StarRating from '../components/StarRating'
import { Loader, Stethoscope, AlertTriangle } from 'lucide-react'

/**
 * DoctorsList - Página que muestra todos los doctores activos
 * Los usuarios pueden seleccionar un doctor para consulta
 */
function DoctorsList() {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState([])
    const [ratings, setRatings] = useState({}) // { doctorId: { average, count } }
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        try {
            setLoading(true)
            const data = await getActiveDoctors()
            console.log('[DoctorsList] Fetched doctors:', data)
            setDoctors(data)

            // Fetch ratings for each doctor
            const ratingsData = {}
            for (const doctor of data) {
                const rating = await getDoctorRating(doctor.id)
                ratingsData[doctor.id] = rating
            }
            setRatings(ratingsData)

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
                <section className="page-title">
                    <div className="header-icon">
                        <Stethoscope size={40} />
                        Consultar con un Doctor
                    </div>
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
                                rating={ratings[doctor.id]}
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
