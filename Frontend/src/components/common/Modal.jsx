// src/components/common/Modal.jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';


const Modal = ({ isOpen, onClose, children, title = 'Formulario de gestión' }) => {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('input, select, textarea, button')?.focus();
    function keyboard(event) {
      if (event.key === 'Escape') close.current();
      if (event.key !== 'Tab') return;
      const items = [...panel.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')];
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keyboard);
      previous?.focus();
    };
  }, [isOpen]);
  if (!isOpen) return null; // No renderiza nada si no está abierto

  return createPortal(
    <div className="tc-modal-overlay" onClick={onClose}>
      <div ref={panel} className="tc-modal-content" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <button type="button" className="tc-modal-close" aria-label="Cerrar ventana" onClick={onClose}>✖</button>
        {children}
      </div>
    </div>, document.body
  );
};

export default Modal;
