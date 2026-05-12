import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UnauthorizedErrorPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-2xl p-10 flex flex-col items-center max-w-md">
        <svg
          className="w-20 h-20 text-red-400 mb-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-default mb-2">
          Acceso Denegado
        </h1>
        <p className="text-muted mb-4 text-center">
          Debes iniciar sesión para acceder al panel de administración.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded-xl shadow hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] transition"
        >
          Ir al Inicio
        </button>
        <p className="text-xs text-muted mt-4">
          Redireccionando en 3 segundos...
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedErrorPage;
