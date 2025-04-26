// components/Modal.tsx
import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Optional title displayed in header */
  title?: string;
  /** Content inside the modal body */
  children: ReactNode;
  /** Close handler */
  onClose: () => void;
  /** Background color of the modal container */
  bgColor?: string;
  /** Text color inside the modal */
  textColor?: string;
  /** Custom width (e.g. '400px', '50%', 'min(90%,400px)') */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 mb-0">
      <div
        className="rounded-2xl shadow-lg mx-4"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          width,
          maxWidth: '100%',
        }}
      >
        <div className="flex justify-between items-center border-b px-4 py-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5 cursor-pointer" style={{ color: textColor }} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
