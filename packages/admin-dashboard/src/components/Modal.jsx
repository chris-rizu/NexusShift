import { useEffect } from 'react'
import { X } from 'lucide-react'

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl, full
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true
}) {
  useEffect(() => {
    if (closeOnEscape && isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  }

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Modal sub-components for better composition
Modal.Header = function ModalHeader({ children, showClose = true, onClose }) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-neutral-200">
      {children}
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="p-2 hover:bg-neutral-100 rounded-lg transition text-neutral-500 hover:text-neutral-900"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

Modal.Body = function ModalBody({ children }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {children}
    </div>
  )
}

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 p-6 border-t border-neutral-200 ${className}`}>
      {children}
    </div>
  )
}

export default Modal
