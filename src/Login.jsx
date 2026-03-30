import { useState } from 'react';
import { supabase } from './supabaseClient';
import logoWh from './assets/logowh.png'; 

function Login({ onLogin }) {
  const [matricula, setMatricula] = useState('');
  const [licencia, setLicencia] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const { data, error: dbError } = await supabase
        .from('operadores')
        .select('*')
        .eq('matricula', matricula)
        .eq('licencia', licencia)
        .single();

      if (dbError || !data) {
        setError('Credenciales no reconocidas en el sistema.');
        setCargando(false);
        return;
      }

      // ¡ESTO ES CRUCIAL! Le pasamos todos los datos (nombre, matricula) a App.jsx
      onLogin(data); 

    } catch (err) {
      setError('Error de conexión con el servidor central.');
      setCargando(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', overflow: 'hidden' }}>
      <div className="bg-animado"></div>
      <div className="mesh-cian" style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(100px)', top: '-10%', left: '15%', opacity: 0.5, zIndex: 0 }}></div>
      <div className="mesh-morado" style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(90px)', bottom: '-5%', right: '20%', opacity: 0.4, zIndex: 0 }}></div>

      <main className="animar-entrada delay-1" style={{ width: '100%', maxWidth: '460px', padding: '0', zIndex: 10, overflow: 'hidden', borderRadius: '16px' }}>
        <div className="glass-card" style={{ width: '100%', height: 'auto', padding: '0', backgroundColor: 'rgba(255, 255, 255, 0.85)', color: '#000000', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(20px)' }}>
          <div style={{ position: 'relative', zIndex: 10, backgroundColor: '#000000', padding: '25px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <img src={logoWh} alt="STZ Team Logo" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 10, padding: '40px 40px 50px 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <h1 style={{ fontSize: '3.6rem', marginBottom: '10px', color: '#000000', fontWeight: 300, letterSpacing: '-0.5px' }}>Acceso al Portal</h1>
              <p style={{ fontSize: '1.5rem', color: '#333333', margin: 0, fontWeight: 300 }}>Ingresa tus credenciales operativas.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {error && (
                <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '1.3rem', textAlign: 'center', border: '1px solid rgba(220, 38, 38, 0.2)', fontWeight: 400 }}>
                  {error}
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.4rem', fontWeight: 400, color: '#000000' }}>Matrícula asignada</label>
                <input type="text" placeholder="Ej. STZTM-001" value={matricula} onChange={(e) => setMatricula(e.target.value)} required style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.15)', padding: '14px', borderRadius: '10px', fontWeight: 300, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.4rem', fontWeight: 400, color: '#000000' }}>Licencia de acceso</label>
                <input type="password" placeholder="••••••••" value={licencia} onChange={(e) => setLicencia(e.target.value)} required style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.15)', padding: '14px', borderRadius: '10px', fontWeight: 300, width: '100%' }} />
              </div>
              <button type="submit" className="btn-solido" disabled={cargando} style={{ opacity: cargando ? 0.7 : 1 }}>
                {cargando ? 'Validando...' : 'Iniciar Sesión'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <span style={{ fontSize: '1.3rem', color: '#555555', fontWeight: 400 }}>Precision engineered robots.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;