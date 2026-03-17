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
    mode: 'onBlur',
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
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    }
  };

  return (
    <div className="relative min-h-screen bg-base flex items-center justify-center px-4">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center text-sm font-medium text-muted hover:text-[var(--color-text)] transition-colors group z-10"
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

      <div className="max-w-md w-full space-y-8 border border-[var(--color-border)] p-8 rounded-2xl bg-[var(--color-surface)] shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-default tracking-tight">
            Panel Admin
          </h2>
          <p className="mt-2 text-center text-sm text-muted">
            Inicia sesión para gestionar el sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} aria-busy={isSubmitting}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-muted uppercase mb-1 ml-1">
                Email <span className="text-[var(--color-error-text)]" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="appearance-none relative block w-full px-4 py-3 border border-[var(--color-border)] placeholder-[var(--color-text-muted)] text-default bg-[var(--color-bg-alt)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent sm:text-sm transition-all"
                placeholder="admin@ejemplo.com"
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? 'login-email-error' : undefined}
                {...register('email')}
              />
              {formErrors.email && (
                <p id="login-email-error" role="alert" className="text-xs text-[var(--color-error-text)] mt-1 ml-1">{formErrors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-muted uppercase mb-1 ml-1">
                Contraseña <span className="text-[var(--color-error-text)]" aria-hidden="true">*</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none relative block w-full px-4 py-3 border border-[var(--color-border)] placeholder-[var(--color-text-muted)] text-default bg-[var(--color-bg-alt)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent sm:text-sm transition-all"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!formErrors.password}
                aria-describedby={formErrors.password ? 'login-password-error' : undefined}
                {...register('password')}
              />
              {formErrors.password && (
                <p id="login-password-error" role="alert" className="text-xs text-[var(--color-error-text)] mt-1 ml-1">{formErrors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error-border)] p-3 animate-in fade-in zoom-in duration-300">
              <p className="text-sm text-[var(--color-error-text)] text-center font-medium">
                {error === 'Demasiados intentos. Espera unos minutos.' 
                  ? 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
                  : error === 'Invalid login credentials'
                    ? 'Correo o contraseña incorrectos. Intenta de nuevo.'
                    : 'No se pudo iniciar sesión. Intenta de nuevo más tarde.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-[var(--color-on-accent)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] focus:ring-[var(--focus-ring)] disabled:opacity-50 transition-all shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--color-on-accent)]" fill="none" viewBox="0 0 24 24">
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
