import { User, MapPin, Briefcase } from 'lucide-react'
import StarRating from './StarRating'

/**
 * DoctorCard - Tarjeta de presentación de doctor
 * Muestra información del doctor para que usuarios seleccionen
 */
function DoctorCard({ doctor, rating, onSelect }) {
    return (
        <div className="doctor-card cyber-card">
            <div className="doctor-card-header">
                <div className="doctor-image">
                    {doctor.profile_image_url ? (
                        <img
                            src={doctor.profile_image_url}
                            alt={doctor.full_name}
                            onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                            }}
                        />
                    ) : null}
                    <div className="doctor-image-placeholder" style={{ display: doctor.profile_image_url ? 'none' : 'flex' }}>
                        <User size={48} />
                    </div>
                </div>
                <div className="doctor-info">
                    <h3 className="doctor-name">{doctor.full_name}</h3>
                    <p className="doctor-specialization">{doctor.specialization}</p>

                    {rating && rating.count > 0 && (
                        <div className="doctor-rating-display">
                            <StarRating value={rating.average} readonly size="small" />
                            <span className="rating-value">{rating.average}</span>
                            <span className="rating-count">
                                ({rating.count} {rating.count === 1 ? 'calificación' : 'calificaciones'})
                            </span>
                        </div>
                    )}
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
