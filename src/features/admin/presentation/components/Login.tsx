/**
 * Login Component
 * Clean Architecture: Presentation Layer
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginAdminUseCase } from '../../domain/usecases/LoginAdminUseCase';
import { AuthSession } from '../../domain/repositories/IAuthRepository';
import { loginSchema, LoginFormData } from '../schemas/loginSchema';
import { rateLimiter, RateLimitPresets } from '@shared/utils/rateLimiter';

interface LoginProps {
  loginUseCase: LoginAdminUseCase;
  onLoginSuccess: (session: AuthSession) => void;
}

export const Login: React.FC<LoginProps> = ({ loginUseCase, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setError(null);

    const isAllowed = await rateLimiter.checkLimit(`login_${email}`, RateLimitPresets.LOGIN);
    if (!isAllowed) {
      setError('Demasiados intentos. Espera unos minutos.');
      return;
    }

    try {
      const session = await loginUseCase.execute({ email, password });
      onLoginSuccess(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-sc-dark flex items-center justify-center px-4">

      {/* Back button */}
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

      <div className="max-w-md w-full space-y-8 border border-gray-800 p-8 rounded-2xl bg-sc-dark-card/50 shadow-2xl backdrop-blur-sm">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Inicia sesión para gestionar el sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="admin@ejemplo.com"
                disabled={isSubmitting}
                {...register('email')}
              />
              {formErrors.email && (
                <p className="text-xs text-red-400 mt-1 ml-1">{formErrors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="••••••••"
                disabled={isSubmitting}
                {...register('password')}
              />
              {formErrors.password && (
                <p className="text-xs text-red-400 mt-1 ml-1">{formErrors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-3 animate-in fade-in zoom-in duration-300">
              <p className="text-sm text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020408] focus:ring-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
          >
            {isSubmitting ? (
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
