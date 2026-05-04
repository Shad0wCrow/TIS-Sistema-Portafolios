interface ModalErrorProps {
  message: string;
  onClose: () => void;
}

export default function ModalError({ message, onClose }: ModalErrorProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(15,25,20,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1200, padding: 16, backdropFilter: "blur(3px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg3)", border: "1px solid #f5c6c2",
          borderRadius: 12, padding: "28px 24px", width: "100%",
          maxWidth: 360, textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.13)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 52, height: 52, borderRadius: "50%", background: "var(--red-lt)",
          border: "1.5px solid #f5c6c2", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
          Error al eliminar
        </p>
        <p style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 22px", lineHeight: 1.6 }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            background: "var(--red)", border: "1.5px solid var(--red)", color: "#fff",
            padding: "9px 24px", borderRadius: 7, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
