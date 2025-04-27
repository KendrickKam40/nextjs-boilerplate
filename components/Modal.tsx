// components/Modal.tsx
import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  bgColor?: string;
  textColor?: string;
  width?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  onClose,
  bgColor = '#FFFFFF',
  textColor = '#000000',
  width = '100%',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="rounded-2xl shadow-lg mx-4 overflow-hidden bg-white"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          width,
          maxWidth: '100%',
          maxHeight: '90vh',            // <-- limit total height
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5 cursor-pointer" style={{ color: textColor }} />
          </button>
        </div>

        {/* Body (scrollable if too tall) */}
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
