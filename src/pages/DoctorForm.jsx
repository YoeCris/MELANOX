import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createDoctor, updateDoctor, getDoctorById } from '../services/doctorService'
import { supabase } from '../config/supabase'
import { Upload, X, ArrowLeft } from 'lucide-react'

/**
 * DoctorForm - Página dedicada para crear/editar doctores
 */
function DoctorForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id

    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        specialization: '',
        workplace: '',
        position: '',
        profile_image_url: '',
        is_active: true
    })
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isEditing) {
            loadDoctor()
        }
    }, [id])

    const loadDoctor = async () => {
        try {
            setLoading(true)
            const doctor = await getDoctorById(id)
            setFormData({
                email: doctor.email || '',
                full_name: doctor.full_name || '',
                specialization: doctor.specialization || '',
                workplace: doctor.workplace || '',
                position: doctor.position || '',
                profile_image_url: doctor.profile_image_url || '',
                is_active: doctor.is_active !== undefined ? doctor.is_active : true
            })
            setImagePreview(doctor.profile_image_url || null)
        } catch (err) {
            console.error('Error loading doctor:', err)
            alert('Error al cargar doctor')
            navigate('/admin/doctores')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setFormData(prev => ({ ...prev, profile_image_url: '' }))
    }

    const uploadImage = async () => {
        if (!imageFile) return null

        try {
            setUploading(true)
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `doctor-${Date.now()}.${fileExt}`
            const filePath = `doctors/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('melanox-images')
                .upload(filePath, imageFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('melanox-images')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            throw error
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSubmitting(true)

            // Upload image if selected
            let imageUrl = formData.profile_image_url
            if (imageFile) {
                imageUrl = await uploadImage()
            }

            const dataToSave = {
                ...formData,
                profile_image_url: imageUrl
            }

            if (isEditing) {
                await updateDoctor(id, dataToSave)
            } else {
                await createDoctor(dataToSave)
            }

            navigate('/admin/doctores')
        } catch (err) {
            console.error('Error saving doctor:', err)
            alert('Error al guardar doctor: ' + err.message)
        } finally {
            setSubmitting(false)
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
                <div className="loading-text">Cargando doctor...</div>
            </div>
        )
    }

    return (
        <>
            {uploading && (
                <div className="loading-overlay">
                    <div className="loading-gears">
                        <div className="gear gear-large">⚙</div>
                        <div className="gear gear-medium">⚙</div>
                        <div className="gear gear-small">⚙</div>
                    </div>
                    <div className="loading-text">Subiendo imagen...</div>
                </div>
            )}

            <div className="page-container doctor-form-page">
                <div className="container">
                    <div className="page-header">
                        <button
                            className="back-button cyber-button secondary"
                            onClick={() => navigate('/admin/doctores')}
                        >
                            <ArrowLeft size={20} />
                            Volver
                        </button>
                        <h1>{isEditing ? 'Editar Doctor' : 'Nuevo Doctor'}</h1>
                    </div>

                    <div className="doctor-form-card cyber-card">
                        <form onSubmit={handleSubmit} className="doctor-form-layout">
                            <div className="form-left-section">
                                <div className="form-group">
                                    <label>Foto de Perfil</label>
                                    <div className="image-upload-container-compact">
                                        {imagePreview ? (
                                            <div className="image-preview-compact">
                                                <img src={imagePreview} alt="Preview" />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={removeImage}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="upload-label-compact">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    style={{ display: 'none' }}
                                                />
                                                <div className="upload-placeholder-compact">
                                                    <Upload size={24} />
                                                    <span>Click para subir foto</span>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-right-section">
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isEditing}
                                        className="cyber-input"
                                        placeholder="doctor@ejemplo.com"
                                    />
                                </div>

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

                                <div className="form-grid-2col">
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
                                            placeholder="Dermatólogo"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="workplace">Lugar *</label>
                                        <input
                                            type="text"
                                            id="workplace"
                                            name="workplace"
                                            value={formData.workplace}
                                            onChange={handleChange}
                                            required
                                            className="cyber-input"
                                            placeholder="Hospital"
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
                                            placeholder="Jefe"
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
                                            Activo
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cyber-button secondary"
                                    onClick={() => navigate('/admin/doctores')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="cyber-button primary"
                                    disabled={submitting || uploading}
                                >
                                    {submitting ? 'Guardando...' : uploading ? 'Subiendo imagen...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DoctorForm
