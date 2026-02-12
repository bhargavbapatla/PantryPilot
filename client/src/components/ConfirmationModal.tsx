import React from 'react';
import { Modal } from '@mui/material';
import Button from './Button';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  primaryVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  secondaryVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  isLoading = false,
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  primaryVariant = 'primary',
  secondaryVariant = 'secondary',
}) => {
  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <div className={`fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none`}>
        {/* Backdrop with blur effect */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div
          className="relative w-full max-w-md mx-4 rounded-xl bg-white shadow-lg transform transition-all"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 
              id="confirmation-modal-title" 
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
          </div>
          
          <div className="px-5 py-4">
            <p 
              id="confirmation-modal-description" 
              className="text-sm text-gray-500 leading-relaxed"
            >
              {description}
            </p>
          </div>
          
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={handleSecondaryAction}
                fullWidth={false}
                className="px-4 py-2 text-sm font-medium"
                variant={secondaryVariant}
                disabled={isLoading}
              >
                {secondaryActionLabel}
              </Button>
              <Button
                type="button"
                onClick={onPrimaryAction}
                fullWidth={false}
                className="px-4 py-2 text-sm font-medium"
                variant={primaryVariant}
                loading={isLoading}
              >
                {primaryActionLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
