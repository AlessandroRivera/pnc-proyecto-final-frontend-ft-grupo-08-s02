import React from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const Modal: React.FC<ModalProps> = ({ open, title, message, onClose, confirmText, onConfirm, type = 'info' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw] animate-fadeInUp">
        {title && <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>}
        <div className={`mb-4 text-center ${type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>{message}</div>
        <div className="flex justify-center gap-2 mt-4">
          {onConfirm && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => { onConfirm(); onClose(); }}
            >
              {confirmText || 'Aceptar'}
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            onClick={onClose}
          >
            {onConfirm ? 'Cancelar' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal; 