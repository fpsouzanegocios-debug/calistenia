import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';

export function Auth({ onNavigate }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { updateUserProfile } = useApp();

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password || !name) {
          throw new Error('Por favor, completa nombre, correo electrónico y contraseña.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone
            }
          }
        });

        if (error) throw error;

        // If session is not immediately available, sign in to establish persistent session
        if (!data.session) {
          try {
            await supabase.auth.signInWithPassword({ email, password });
          } catch (autoSignErr) {
            console.warn('Auto sign-in notice:', autoSignErr);
          }
        }

        await updateUserProfile({
          name,
          email,
          phone,
          onboardingCompleted: false
        });

        setSuccessMessage('¡Cuenta creada con éxito!');
        setTimeout(() => {
          onNavigate('/onboarding');
        }, 500);
      } else {
        if (!email || !password) {
          throw new Error('Por favor, ingresa tu correo electrónico y contraseña.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Check if onboarding is completed or if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profile) {
          await updateUserProfile({
            name: profile.name || '',
            email: profile.email || data.user.email || '',
            phone: profile.phone || '',
            age: profile.age,
            height: profile.height,
            currentWeight: profile.current_weight,
            targetWeight: profile.target_weight,
            targetDays: profile.target_days,
            onboardingCompleted: profile.onboarding_completed ?? false,
            isAdmin: profile.is_admin ?? false
          });
        }

        if (profile?.is_admin) {
          onNavigate('/admin');
        } else if (profile && !profile.onboarding_completed) {
          onNavigate('/onboarding');
        } else {
          onNavigate('/');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Ocurrió un error al procesar.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Correo electrónico o contraseña incorrectos.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Correo electrónico no confirmado. Por favor intenta de nuevo.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este correo ya está registrado. Intenta iniciar sesión.';
      } else if (msg.includes('Database error querying schema') || msg.includes('Scan error')) {
        msg = 'Error interno en la base de datos. Por favor, intenta de nuevo.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMessage(err.message || 'Error al conectar con Google.');
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    updateUserProfile({
      name: name || 'Atleta',
      email: 'visitante@calistenia.app',
      onboardingCompleted: false
    });
    onNavigate('/onboarding');
  };

  return (
    <div className="auth-container">
      {/* Header Section */}
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="text-4xl font-display text-[#D3455B] tracking-tight mb-1.5">
          CALISTENIA
        </h1>
        <span className="inline-block text-[11px] font-medium text-[#84626D] dark:text-[#B8A2AB] bg-[#F7F2F4] dark:bg-[#251D21] px-3 py-0.5 rounded-md">
          Asiática
        </span>
      </div>

      {/* Main Modern Floating Card */}
      <div
        className="auth-card-modern animate-slide-up"
        style={{
          borderRadius: '36px',
          padding: '36px 28px',
          boxSizing: 'border-box'
        }}
      >
        {/* Card Title */}
        <h2 className="text-xl font-bold text-center text-foreground mb-6 tracking-tight">
          {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>

        {/* Google Button on Top */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="auth-btn-google"
          style={{
            borderRadius: '9999px'
          }}
        >
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '22px 0' }}>
          <div className="auth-divider-line" style={{ flex: 1, borderTop: '1px solid #D8CED2' }}></div>
          <span style={{ padding: '0 12px', fontSize: '11.5px', fontWeight: 500, color: '#9B8B92', textTransform: 'uppercase', letterSpacing: '0.06em', userSelect: 'none' }}>
            O
          </span>
          <div className="auth-divider-line" style={{ flex: 1, borderTop: '1px solid #D8CED2' }}></div>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium text-center">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-2xl bg-success/10 border border-success/20 text-success text-xs font-medium text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-[#6B575F] dark:text-[#B8A2AB] mb-2 pl-2">
                Nombre completo
              </label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <User
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: '#A19198',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-pill-input"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6B575F] dark:text-[#B8A2AB] mb-2 pl-2">
              Correo electrónico
            </label>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <Mail
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: '#A19198',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-pill-input"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-[#6B575F] dark:text-[#B8A2AB] mb-2 pl-2">
                Teléfono (WhatsApp)
              </label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <Phone
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: '#A19198',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
                <input
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-pill-input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6B575F] dark:text-[#B8A2AB] mb-2 pl-2">
              Contraseña
            </label>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: '#A19198',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-pill-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#A19198',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
              </button>
            </div>
          </div>

          {/* Olvidé mi contraseña */}
          {!isSignUp && (
            <div style={{ textAlign: 'right', marginTop: '-8px', paddingRight: '6px' }}>
              <button
                type="button"
                onClick={() => alert('Para restablecer tu contraseña, ponte en contacto con soporte o inicia sesión con Google.')}
                className="text-xs text-[#D3455B] hover:opacity-80 transition-opacity font-normal cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* Botón principal */}
          <div style={{ marginTop: '6px' }}>
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
              style={{
                borderRadius: '9999px'
              }}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</span>
              )}
            </button>
          </div>
        </form>

        {/* Alternar entre Iniciar Sesión y Crear Cuenta */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#84626D] dark:text-[#A19198] mb-1">
            {isSignUp ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(prev => !prev);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="text-sm font-semibold text-[#D3455B] hover:underline cursor-pointer"
          >
            {isSignUp ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </div>
      </div>

      {/* Términos de Uso y Política de Privacidad */}
      <p
        className="mt-6 text-center text-[#A19198] dark:text-[#84626D] max-w-xs"
        style={{ fontSize: '12px', lineHeight: 1.5 }}
      >
        Al continuar, aceptas nuestros Términos de Uso y Política de Privacidad.
      </p>
    </div>
  );
}
