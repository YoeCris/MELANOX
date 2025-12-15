import { useState, useEffect } from 'react'
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, toggleDoctorStatus } from '../services/doctorService'
import { Loader, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Stethoscope } from 'lucide-react'

/**
 * AdminDoctors - Panel de administración de doctores
 * Solo accesible para super admin
 */
function AdminDoctors() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState(null)

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
        setEditingDoctor(null)
        setShowModal(true)
    }

    const handleEdit = (doctor) => {
        setEditingDoctor(doctor)
        setShowModal(true)
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
            <div className="page-container">
                <div className="loading-section">
                    <Loader className="spinner" size={48} />
                    <p>Cargando doctores...</p>
                </div>
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
                                                <img src={doctor.profile_image_url} alt={doctor.full_name} className="doctor-avatar-small" />
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

            {showModal && (
                <DoctorModal
                    doctor={editingDoctor}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false)
                        fetchDoctors()
                    }}
                />
            )}
        </div>
    )
}

/**
 * DoctorModal - Modal para crear/editar doctor
 */
function DoctorModal({ doctor, onClose, onSave }) {
    const [formData, setFormData] = useState({
        full_name: doctor?.full_name || '',
        specialization: doctor?.specialization || '',
        workplace: doctor?.workplace || '',
        position: doctor?.position || '',
        profile_image_url: doctor?.profile_image_url || '',
        is_active: doctor?.is_active !== undefined ? doctor.is_active : true
    })
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSubmitting(true)

            if (doctor) {
                // Editar
                await updateDoctor(doctor.id, formData)
            } else {
                // Crear - necesita user_id
                // Por ahora, el admin debe crear el usuario primero en Supabase Auth
                // y luego agregar el doctor con el user_id
                alert('Para crear un doctor, primero debe crear el usuario en Supabase Auth y obtener su user_id')
                return
            }

            onSave()
        } catch (err) {
            console.error('Error saving doctor:', err)
            alert('Error al guardar doctor')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content cyber-card" onClick={(e) => e.stopPropagation()}>
                <h2>{doctor ? 'Editar Doctor' : 'Nuevo Doctor'}</h2>

                <form onSubmit={handleSubmit} className="doctor-form">
                    <div className="form-group">
                        <label htmlFor="full_name">Nombre Completo *</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            className="cyber-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="specialization">Especialización *</label>
                        <input
                            type="text"
                            id="specialization"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            required
                            className="cyber-input"
                            placeholder="ej: Dermatólogo Oncólogo"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="workplace">Lugar de Trabajo *</label>
                        <input
                            type="text"
                            id="workplace"
                            name="workplace"
                            value={formData.workplace}
                            onChange={handleChange}
                            required
                            className="cyber-input"
                            placeholder="ej: Hospital Nacional"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="position">Cargo *</label>
                        <input
                            type="text"
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            required
                            className="cyber-input"
                            placeholder="ej: Jefe de Dermatología"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="profile_image_url">URL de Imagen de Perfil</label>
                        <input
                            type="url"
                            id="profile_image_url"
                            name="profile_image_url"
                            value={formData.profile_image_url}
                            onChange={handleChange}
                            className="cyber-input"
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            Doctor Activo
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cyber-button secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="cyber-button primary" disabled={submitting}>
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AdminDoctors
