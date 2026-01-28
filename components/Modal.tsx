'use client';

import { ReactNode, CSSProperties } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
};

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '10vh 1rem',
  zIndex: 1000,
};

const containerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '720px',
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  padding: '1rem',
};

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
