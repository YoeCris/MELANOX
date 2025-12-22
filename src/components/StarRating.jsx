import { useState } from 'react'
import { Star } from 'lucide-react'

/**
 * StarRating - Componente de calificación con estrellas
 * @param {number} value - Valor actual (1-5)
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {boolean} readonly - Si es solo lectura
 * @param {string} size - Tamaño: 'small', 'medium', 'large'
 */
function StarRating({ value = 0, onChange, readonly = false, size = 'medium' }) {
    const [hoverValue, setHoverValue] = useState(0)

    const handleClick = (rating) => {
        if (!readonly && onChange) {
            onChange(rating)
        }
    }

    const handleMouseEnter = (rating) => {
        if (!readonly) {
            setHoverValue(rating)
        }
    }

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverValue(0)
        }
    }

    const getSizeClass = () => {
        switch (size) {
            case 'small':
                return 'star-small'
            case 'large':
                return 'star-large'
            default:
                return 'star-medium'
        }
    }

    const displayValue = hoverValue || value

    return (
        <div className={`star-rating ${readonly ? 'readonly' : 'interactive'} ${getSizeClass()}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`star ${star <= displayValue ? 'filled' : 'empty'}`}
                    fill={star <= displayValue ? 'currentColor' : 'none'}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => handleMouseEnter(star)}
                    onMouseLeave={handleMouseLeave}
                />
            ))}
        </div>
    )
}

export default StarRating
