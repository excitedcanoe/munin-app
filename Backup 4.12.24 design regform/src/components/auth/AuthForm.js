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
import { loginUser, registerUser } from '../../services/auth';
import { Mail, Lock, User } from 'lucide-react';

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let user;
      if (isLogin) {
        user = await loginUser(username, password);
      } else {
        await registerUser(username, password, firstName, lastName);
        user = await loginUser(username, password);
      }
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Logg inn' : 'Opprett konto'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
              <User className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Fornavn"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
              <User className="w-5 h-5 text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Etternavn"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
          </>
        )}
        
        <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
          <Mail className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="E-post"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-transparent w-full focus:outline-none"
          />
        </div>
        
        <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
          <Lock className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-transparent w-full focus:outline-none"
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3 px-4 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-full transition-colors duration-200"
        >
          {isLogin ? 'Logg inn' : 'Registrer'}
        </button>
      </form>

      <p className="text-center mt-6">
        {isLogin ? 'Har du ikke en konto?' : 'Har du allerede en konto?'}
        {' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-orange-400 hover:text-orange-500 font-medium focus:outline-none"
        >
          {isLogin ? 'Registrer deg' : 'Logg inn'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;