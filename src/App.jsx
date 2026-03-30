import { useState } from 'react';
import './index.css';

import Login from './Login';
import Dashboard from './Dashboard';
import Recursos from './Recursos'; 
import MiTrabajo from './MiTrabajo';
import Reuniones from './Reuniones';
import GestionTareas from './GestionTareas';

function App() {
  const [usuario, setUsuario] = useState(null); // Guardamos la info del usuario real aquí
  const [currentScreen, setCurrentScreen] = useState('dashboard'); 

  // Esta función ahora recibe los datos del operador desde el Login
  const handleLoginSuccess = (datosOperador) => {
    setUsuario(datosOperador);
    setCurrentScreen('dashboard'); 
  };
  
  const handleLogout = () => {
    setUsuario(null);
  };

  const navigateTo = (screenName) => setCurrentScreen(screenName);

  // Si no hay usuario guardado, forzamos la pantalla de Login
  if (!usuario) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // Pasamos la variable "usuario" a todas las pantallas
  return (
    <>
      {currentScreen === 'dashboard' && (
        <Dashboard usuario={usuario} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentScreen === 'recursos' && (
        <Recursos usuario={usuario} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentScreen === 'trabajo' && (
        <MiTrabajo usuario={usuario} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentScreen === 'reuniones' && (
        <Reuniones usuario={usuario} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentScreen === 'gestion' && (
        <GestionTareas usuario={usuario} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
    </>
  );
}

export default App;