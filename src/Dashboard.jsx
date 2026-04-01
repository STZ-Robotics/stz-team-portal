import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import logoWh from './assets/logowh.png'; 

function Dashboard({ usuario, onLogout, onNavigate }) {

  const esAdmin = usuario?.matricula === 'STZTM-001' || usuario?.matricula === 'STZTM-002';

  const [stats, setStats] = useState({ pendientes: 0, progreso: 0 });
  const [proximaTarea, setProximaTarea] = useState('Cargando...');
  
  // ESTADOS NUEVOS PARA EL WIDGET DE REUNIÓN
  const [proximaReunion, setProximaReunion] = useState(null);
  const [diasFaltantes, setDiasFaltantes] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // ==========================================
        // 1. OBTENER TAREAS
        // ==========================================
        let queryTareas = supabase.from('tareas').select('*').order('fecha_limite', { ascending: true });
        const { data: tareas, error: errorTareas } = await queryTareas;

        if (errorTareas) throw errorTareas;

        if (tareas) {
          const misTareas = esAdmin 
            ? tareas 
            : tareas.filter(t => t.asignado_a === 'Todos' || t.asignado_a === usuario?.nombre);

          const pendientes = misTareas.filter(t => t.estado === 'pendiente').length;
          const progreso = misTareas.filter(t => t.estado === 'progreso' || t.estado === 'en_revision').length;
          
          setStats({ pendientes, progreso });

          const pendienteMasCercana = misTareas.find(t => t.estado === 'pendiente');
          if (pendienteMasCercana) {
            setProximaTarea(pendienteMasCercana.titulo);
          } else {
            setProximaTarea('¡Todo despejado por ahora!');
          }
        }

        // ==========================================
        // 2. OBTENER PRÓXIMA REUNIÓN
        // ==========================================
        const hoy = new Date();
        const { data: reuniones, error: errorReuniones } = await supabase
          .from('reuniones')
          .select('*')
          // Buscamos reuniones cuya fecha sea mayor o igual a hoy a las 00:00:00
          .gte('fecha_reunion', new Date(hoy.setHours(0,0,0,0)).toISOString())
          .order('fecha_reunion', { ascending: true })
          .limit(1); // Solo traemos la más cercana

        if (errorReuniones) throw errorReuniones;

        if (reuniones && reuniones.length > 0) {
          const reunion = reuniones[0];
          setProximaReunion(reunion);
          
          // Calcular días faltantes
          const hoyReal = new Date();
          const diffTime = new Date(reunion.fecha_reunion) - hoyReal;
          const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDiasFaltantes(diffDias);
        }

      } catch (err) {
        console.error("Error cargando dashboard data:", err.message);
      }
    }

    if (usuario) fetchData();
  }, [usuario, esAdmin]);

  // ==========================================
  // FORMATOS Y UTILIDADES
  // ==========================================
  const formatFechaLarga = (fechaStr) => {
    const d = new Date(fechaStr);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  const formatHora = (fechaStr) => {
    return new Date(fechaStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const AvatarPerfil = ({ nombre }) => {
    const inicial = nombre ? nombre.charAt(0).toUpperCase() : 'U';
    return (
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.4rem', fontWeight: '400', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', flexShrink: 0 }}>
        {inicial}
      </div>
    );
  };

  if (!usuario) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <nav className="apple-nav">
        <div className="apple-nav-belt">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={logoWh} alt="Logo" style={{ height: '20px' }} />
            <span style={{ fontWeight: '400', letterSpacing: '1px' }}>Portal</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: '#ffffff', fontWeight: '400' }}>Panel General</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('trabajo'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Mi Trabajo</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('recursos'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Recursos</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('reuniones'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Reuniones</a>
            {esAdmin && (
               <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('gestion'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Gestión</a>
            )}
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#f5f5f7', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8, fontWeight: '300' }}>
            Desconectar
          </button>
        </div>
      </nav>

      <main className="animar-entrada" style={{ paddingTop: '100px', paddingBottom: '60px', paddingLeft: '5%', paddingRight: '5%', maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            <AvatarPerfil nombre={usuario.nombre} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h1 style={{ fontSize: '4.2rem', letterSpacing: '-1.5px', fontWeight: '300', color: '#0f172a', margin: 0 }}>
                Hola, {usuario.nombre}.
              </h1>
              {esAdmin && (
                <span style={{ fontSize: '1.1rem', backgroundColor: '#0f172a', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '10px' }}>
                  Admin
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '400' }}>División:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '400', color: '#0f172a', backgroundColor: '#e2e8f0', padding: '4px 12px', borderRadius: '4px' }}>
                {usuario.division || 'General'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '400' }}>Departamento:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '400', color: '#0f172a', backgroundColor: '#e2e8f0', padding: '4px 12px', borderRadius: '4px' }}>
                {usuario.departamento || 'Operativo'}
              </span>
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          
          {/* ========================================== */}
          {/* WIDGET 1: CUENTA REGRESIVA DE EVENTO REAL */}
          {/* ========================================== */}
          <div className="apple-box" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0', alignItems: 'stretch', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#000000', padding: '20px 30px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Siguiente Evento</h3>
            </div>
            <div style={{ padding: '35px 30px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
              
              {proximaReunion ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '8rem', fontWeight: '300', color: '#0f172a', lineHeight: '1', letterSpacing: '-4px', fontFamily: 'monospace' }}>
                      T-{diasFaltantes < 10 && diasFaltantes >= 0 ? `0${diasFaltantes}` : Math.max(0, diasFaltantes)}
                    </span>
                    <span style={{ fontSize: '2rem', fontWeight: '400', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Días</span>
                  </div>
                  
                  <p style={{ fontSize: '1.8rem', fontWeight: '400', color: '#0f172a', margin: '0 0 5px 0', textAlign: 'center' }}>
                    {proximaReunion.titulo}
                  </p>
                  
                  {/* Detalles de la Reunión con Modalidad */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                    <p style={{ fontSize: '1.4rem', color: '#64748b', fontWeight: '400', margin: '0 0 8px 0' }}>
                      {formatFechaLarga(proximaReunion.fecha_reunion)} • {formatHora(proximaReunion.fecha_reunion)}
                    </p>
                    <span style={{ 
                      backgroundColor: '#e2e8f0', 
                      color: '#0f172a', 
                      padding: '4px 12px', 
                      borderRadius: '4px', 
                      fontSize: '1.2rem', 
                      fontWeight: '500', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px' 
                    }}>
                      {proximaReunion.modalidad || 'Presencial'}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => { e.preventDefault(); onNavigate('reuniones'); }}
                    className="btn-solido" 
                    style={{ marginTop: 'auto', width: '100%', maxWidth: '250px', padding: '12px', fontSize: '1.4rem', fontWeight: '400' }}
                  >
                    Ir a Reuniones
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <p style={{ fontSize: '1.6rem', color: '#64748b', margin: '30px 0', textAlign: 'center' }}>No hay eventos próximos programados.</p>
                </div>
              )}

            </div>
          </div>

          {/* ========================================== */}
          {/* WIDGET 2: RESUMEN DE MI TRABAJO */}
          {/* ========================================== */}
          <div className="apple-box" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0', alignItems: 'stretch', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#000000', padding: '20px 30px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Resumen Operativo</h3>
            </div>
            <div style={{ padding: '35px 30px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '4rem', fontWeight: '300', color: '#0f172a', lineHeight: '1' }}>{stats.pendientes}</span>
                  <span style={{ fontSize: '1.3rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Pendientes</span>
                </div>
                <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '4rem', fontWeight: '300', color: '#1D4ED8', lineHeight: '1' }}>{stats.progreso}</span>
                  <span style={{ fontSize: '1.3rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>En Proceso</span>
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <p style={{ fontSize: '1.2rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px 0' }}>Siguiente Acción:</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '400', color: '#0f172a', margin: 0 }}>{proximaTarea}</p>
              </div>
              <button onClick={(e) => { e.preventDefault(); onNavigate('trabajo'); }} className="btn-solido" style={{ marginTop: 'auto', padding: '12px', fontSize: '1.4rem', fontWeight: '400', backgroundColor: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1', boxShadow: 'none' }}>
                Ir al Tablero
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;