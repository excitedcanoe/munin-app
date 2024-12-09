/**
 * @file AuthForm.js
 * @description Komponent for autentisering og brukerregistrering i artsregistreringsappen.
 * 
 * Hovedfunksjoner:
 * 1. Håndterer både innlogging og registrering av nye brukere.
 * 2. Veksler mellom innloggings- og registreringsskjema basert på brukerens valg.
 * 3. Validerer brukerinput og sender autentiseringsforespørsler til backend.
 * 4. Viser feilmeldinger ved mislykkede innloggings- eller registreringsforsøk.
 * 5. Bruker ikoner for å forbedre brukergrensesnittet og brukervennligheten.
 * 
 * Komponentstruktur:
 * - Skjema: Inneholder input-felter for brukernavn (e-post), passord, og navn (ved registrering).
 * - Innsendingsknapp: For å sende inn skjemaet for innlogging eller registrering.
 * - Vekslingslenke: Lar brukeren bytte mellom innloggings- og registreringsmodus.
 * - Feilmelding: Viser eventuelle feil som oppstår under autentisering eller registrering.
 * 
 * Viktig for videre utvikling:
 * - Implementere mer omfattende inputvalidering på klientsiden.
 * - Legge til støtte for passordtilbakestilling og e-postverifisering.
 * - Implementere mer robuste sikkerhetsmekanismer, som CAPTCHA eller to-faktor autentisering.
 * - Forbedre feilhåndtering og gi mer detaljerte feilmeldinger til brukeren.
 * - Vurdere å implementere tredjepartsautentisering (f.eks. Google, Facebook).
 * - Optimalisere komponentens ytelse ved å minimere antall re-renders.
 */

import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AuthForm = () => {
  const { handleLogin, handleRegister, isLoading: authLoading, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = isLogin 
        ? await handleLogin(formData.email, formData.password)
        : await handleRegister({...formData});
  
      if (result.success) {
        setIsSuccess(true);
        // Success state vil vises kort før app re-rendrer pga endret auth state
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Reset form når man bytter mellom login/register
  const handleFormSwitch = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {isLogin ? 'Logg inn' : 'Opprett konto'}
      </h2>
      
      {authError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {authError}
        </div>
      )}

      {isSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {isLogin ? 'Innlogging vellykket!' : 'Registrering vellykket!'}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
              <User className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                name="firstName"
                placeholder="Fornavn"
                value={formData.firstName}
                onChange={handleChange}
                required={!isLogin}
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
              <User className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                name="lastName"
                placeholder="Etternavn"
                value={formData.lastName}
                onChange={handleChange}
                required={!isLogin}
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
          </>
        )}
        
        <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
          <Mail className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="email"
            name="email"
            placeholder="E-post"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-transparent w-full focus:outline-none"
          />
        </div>
        
        <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
          <Lock className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="password"
            name="password"
            placeholder="Passord"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-transparent w-full focus:outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={authLoading || isSuccess}
          className={`w-full py-3 px-4 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-full transition-colors duration-200 
            ${(authLoading || isSuccess) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {authLoading 
            ? 'Vennligst vent...' 
            : isSuccess 
              ? '✓ ' + (isLogin ? 'Logget inn!' : 'Registrert!')
              : isLogin ? 'Logg inn' : 'Registrer'}
        </button>
      </form>

      <p className="text-center mt-6">
        {isLogin ? 'Har du ikke en konto?' : 'Har du allerede en konto?'}
        {' '}
        <button
          onClick={handleFormSwitch}
          className="text-orange-400 hover:text-orange-500 font-medium focus:outline-none"
        >
          {isLogin ? 'Registrer deg' : 'Logg inn'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;