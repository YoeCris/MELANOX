import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import './ImageUploader.css'

function ImageUploader({ onImageSelect, selectedImage, isScanning }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files[0]) handleFile(files[0])
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files && files[0]) handleFile(files[0])
  }

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => onImageSelect(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    onImageSelect(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="image-uploader">
      <h2 className="uploader-title">
        <ImageIcon size={24} />
        Cargar Imagen
      </h2>

      {!selectedImage ? (
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <div className="upload-icon"><Upload size={48} /></div>
            <p className="upload-text">Arrastra una imagen aquí</p>
            <p className="upload-subtext">o haz clic para seleccionar</p>
            <p className="upload-formats">PNG, JPG, JPEG</p>
          </div>
          <div className="upload-corners">
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <div className={`image-preview ${isScanning ? 'scanning' : ''}`}>
            <img src={selectedImage} alt="Preview" />
            {isScanning && <div className="scanner-line"></div>}
          </div>
          {!isScanning && (
            <button className="clear-button" onClick={handleClear}>
              <X size={20} />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUploader
