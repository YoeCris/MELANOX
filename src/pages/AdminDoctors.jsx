import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDoctors, deleteDoctor, toggleDoctorStatus } from '../services/doctorService'
import { Loader, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Stethoscope } from 'lucide-react'

/**
 * AdminDoctors - Panel de administración de doctores
 * Solo accesible para super admin
 */
function AdminDoctors() {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        try {
            setLoading(true)
            const data = await getAllDoctors()
            setDoctors(data)
        } catch (err) {
            console.error('Error fetching doctors:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        navigate('/admin/doctor/new')
    }

    const handleEdit = (doctor) => {
        navigate(`/admin/doctor/edit/${doctor.id}`)
    }

    const handleDelete = async (doctorId) => {
        if (!confirm('¿Está seguro de eliminar este doctor?')) return

        try {
            await deleteDoctor(doctorId)
            fetchDoctors()
        } catch (err) {
            alert('Error al eliminar doctor')
        }
    }

    const handleToggleStatus = async (doctorId, currentStatus) => {
        try {
            await toggleDoctorStatus(doctorId, !currentStatus)
            fetchDoctors()
        } catch (err) {
            alert('Error al cambiar estado')
        }
    }

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="loading-gears">
                    <div className="gear gear-large">⚙</div>
                    <div className="gear gear-medium">⚙</div>
                    <div className="gear gear-small">⚙</div>
                </div>
                <div className="loading-text">Cargando doctores...</div>
            </div>
        )
    }

    return (
        <div className="admin-doctors-page">
            <div className="container">
                <section className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Gestión de Doctores</h1>
                        <button className="cyber-button primary" onClick={handleCreate}>
                            <Plus size={20} />
                            Agregar Doctor
                        </button>
                    </div>
                </section>

                <div className="doctors-table-container cyber-card">
                    <table className="doctors-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Especialización</th>
                                <th>Lugar de Trabajo</th>
                                <th>Cargo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(doctor => (
                                <tr key={doctor.id}>
                                    <td>
                                        <div className="doctor-name-cell">
                                            {doctor.profile_image_url && (
                                                <img
                                                    src={`${doctor.profile_image_url}?t=${new Date().getTime()}`}
                                                    alt={doctor.full_name}
                                                    className="doctor-avatar-small"
                                                />
                                            )}
                                            {doctor.full_name}
                                        </div>
                                    </td>
                                    <td>{doctor.specialization}</td>
                                    <td>{doctor.workplace}</td>
                                    <td>{doctor.position}</td>
                                    <td>
                                        <span className={`status-badge ${doctor.is_active ? 'active' : 'inactive'}`}>
                                            {doctor.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-button"
                                                onClick={() => handleToggleStatus(doctor.id, doctor.is_active)}
                                                title={doctor.is_active ? 'Desactivar' : 'Activar'}
                                            >
                                                {doctor.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            </button>
                                            <button
                                                className="icon-button"
                                                onClick={() => handleEdit(doctor)}
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="icon-button danger"
                                                onClick={() => handleDelete(doctor.id)}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {doctors.length === 0 && (
                        <div className="empty-table">
                            <Stethoscope size={48} />
                            <p>No hay doctores registrados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDoctors
