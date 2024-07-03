// src/components/ui/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuthenticated }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'votre-mot-de-passe') {
      setAuthenticated(true);
      navigate('/');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez le mot de passe"
        />
        <button type="submit">Connexion</button>
      </form>
    </div>
  );
};

export default Login;
