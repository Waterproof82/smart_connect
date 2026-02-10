/**
 * Login Component
 * Clean Architecture: Presentation Layer
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginAdminUseCase } from '../../domain/usecases/LoginAdminUseCase';
import { AuthSession } from '../../domain/repositories/IAuthRepository';

interface LoginProps {
  loginUseCase: LoginAdminUseCase;
  onLoginSuccess: (session: AuthSession) => void;
}

export const Login: React.FC<LoginProps> = ({ loginUseCase, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Se especifica el tipo de evento sobre el elemento Form para evitar advertencias
  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const session = await loginUseCase.execute({ email, password });
      onLoginSuccess(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020408] flex items-center justify-center px-4">
      
      {/* Botón Volver - Arriba a la izquierda con ajuste para móviles */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors group z-10"
      >
        <svg 
          className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="max-w-md w-full space-y-8 border border-gray-800 p-8 rounded-2xl bg-[#0B0E14]/50 shadow-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Inicia sesión para gestionar el sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                    placeholder="admin@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">
                    Contraseña
                  </label>
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-3 animate-in fade-in zoom-in duration-300">
              <p className="text-sm text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020408] focus:ring-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Autenticando...
              </span>
            ) : 'Entrar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};