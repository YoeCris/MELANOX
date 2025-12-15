import { User, MapPin, Briefcase } from 'lucide-react'

/**
 * DoctorCard - Tarjeta de presentación de doctor
 * Muestra información del doctor para que usuarios seleccionen
 */
function DoctorCard({ doctor, onSelect }) {
    return (
        <div className="doctor-card cyber-card">
            <div className="doctor-card-header">
                <div className="doctor-image">
                    {doctor.profile_image_url ? (
                        <img src={doctor.profile_image_url} alt={doctor.full_name} />
                    ) : (
                        <div className="doctor-image-placeholder">
                            <User size={48} />
                        </div>
                    )}
                </div>
                <div className="doctor-info">
                    <h3 className="doctor-name">{doctor.full_name}</h3>
                    <p className="doctor-specialization">{doctor.specialization}</p>
                </div>
            </div>

            <div className="doctor-card-body">
                <div className="doctor-detail">
                    <Briefcase size={18} />
                    <span>{doctor.position}</span>
                </div>
                <div className="doctor-detail">
                    <MapPin size={18} />
                    <span>{doctor.workplace}</span>
                </div>
            </div>

            <div className="doctor-card-footer">
                <button
                    className="cyber-button select-doctor-btn"
                    onClick={() => onSelect(doctor)}
                >
                    Consultar con este Doctor
                </button>
            </div>
        </div>
    )
}

export default DoctorCard
