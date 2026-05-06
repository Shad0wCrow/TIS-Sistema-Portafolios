import React from 'react';
import styles from './ModalCrearPortafolio.module.css';

type Props = {
  onCrear: () => void;
  onOmitir: () => void;
};

const ModalCrearPortafolio: React.FC<Props> = ({ onCrear, onOmitir }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>

        <div className={styles.icon}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#e8f5ee" />
            <path
              d="M14 18a2 2 0 0 1 2-2h4l2 3h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V18Z"
              stroke="#1a6644"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <h2 className={styles.title}>Crea tu portafolio digital</h2>

        <p className={styles.desc}>
          Aún no tienes un portafolio. Organiza tu información profesional —
          proyectos, habilidades y más — en un solo lugar.
        </p>

        <div className={styles.actions}>
          <button className={styles.btnOmitir} onClick={onOmitir}>
            Omitir
          </button>
          <button className={styles.btnCrear} onClick={onCrear}>
            Crear portafolio →
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalCrearPortafolio;