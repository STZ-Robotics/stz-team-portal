import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import logoWh from './assets/logowh.png'; 

// AGREGAMOS "usuario" a las propiedades que recibe el componente
function MiTrabajo({ usuario, onLogout, onNavigate }) {
  
  // ==========================================
  // LÓGICA DE AUTENTICACIÓN REAL
  // ==========================================
  // Solo STZTM-001 (Jared) y STZTM-002 (Gerardo) son administradores
  const esAdmin = usuario?.matricula === 'STZTM-001' || usuario?.matricula === 'STZTM-002'; 
  const usuarioActual = usuario?.nombre || 'Operador'; 

  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ==========================================
  // CARGAR DATOS CON FILTRO INTELIGENTE REAL
  // ==========================================
  useEffect(() => {
    async function obtenerTareas() {
      try {
        const { data, error } = await supabase
          .from('tareas')
          .select('*')
          .order('fecha_limite', { ascending: true }); 

        if (error) throw error;
        
        if (data) {
          if (esAdmin) {
            // Los Admins (Tú y Gerardo) ven todo el tablero
            setTareas(data);
          } else {
            // Un operador normal solo ve sus tareas directas o las generales ("Todos")
            const tareasFiltradas = data.filter(t => 
              t.asignado_a === 'Todos' || t.asignado_a === usuarioActual
            );
            setTareas(tareasFiltradas);
          }
        }
      } catch (error) {
        console.error("Error al cargar tareas:", error.message);
      } finally {
        setCargando(false);
      }
    }

    // Solo buscamos tareas si realmente hay un usuario logueado
    if (usuario) {
      obtenerTareas();
    }
  }, [usuario, esAdmin, usuarioActual]);

  const formatearFechaRelativa = (fechaString) => {
    if (!fechaString) return 'Sin fecha';
    
    const fechaLimite = new Date(fechaString);
    const hoy = new Date();
    
    fechaLimite.setHours(0, 0, 0, 0);
    const hoyLimpio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    
    const diferenciaMilisegundos = fechaLimite - hoyLimpio;
    const diasDiferencia = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    if (diasDiferencia === 0) return 'Vence hoy';
    if (diasDiferencia === 1) return 'Vence mañana';
    if (diasDiferencia === -1) return 'Venció ayer';
    if (diasDiferencia > 1) return `Vence en ${diasDiferencia} días`;
    if (diasDiferencia < -1) return `Venció hace ${Math.abs(diasDiferencia)} días`;
    
    return 'Fecha inválida';
  };

  const avanzarTarea = async (id, estadoActual) => {
    let nuevoEstado = '';
    
    if (estadoActual === 'pendiente') {
      nuevoEstado = 'progreso';
    } else if (estadoActual === 'progreso') {
      if (esAdmin) {
        nuevoEstado = 'completada';
      } else {
        nuevoEstado = 'en_revision';
        alert('Tu solicitud será revisada por administración.');
      }
    } else if (estadoActual === 'en_revision' && esAdmin) {
        nuevoEstado = 'completada';
    } else {
      return; 
    }

    setTareas(tareas.map(tarea => 
      tarea.id === id ? { ...tarea, estado: nuevoEstado } : tarea
    ));

    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        console.error("Error al actualizar estado en la nube:", error.message);
      }
    } catch (err) {
      console.error("Fallo la conexión:", err);
    }
  };

  const Avatar = ({ nombre }) => {
    const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          color: '#475569',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          {inicial}
        </div>
        <span style={{ fontSize: '1.2rem', color: '#64748b' }}>{nombre}</span>
      </div>
    );
  };

  const renderizarTarea = (tarea) => (
    <div key={tarea.id} style={{ 
      backgroundColor: '#ffffff', 
      border: '1px solid #e2e8f0', 
      borderLeft: `4px solid ${tarea.tag_color || '#cbd5e1'}`, 
      borderRadius: '6px', 
      padding: '15px', 
      marginBottom: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ 
          fontSize: '1.1rem', 
          color: tarea.tag_color || '#64748b', 
          backgroundColor: `${tarea.tag_color || '#64748b'}15`, 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {tarea.tag || 'General'}
        </span>
        
        <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: '400' }}>
          {formatearFechaRelativa(tarea.fecha_limite)}
        </span>
      </div>
      
      <h4 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: '400', margin: '0 0 15px 0', lineHeight: '1.4' }}>
        {tarea.titulo}
      </h4>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #e2e8f0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase' }}>De:</span>
            <Avatar nombre={tarea.asignado_por} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase' }}>Para:</span>
            <Avatar nombre={tarea.asignado_a} />
        </div>
      </div>

      {tarea.estado !== 'completada' && (
        <button 
          onClick={() => avanzarTarea(tarea.id, tarea.estado)}
          disabled={tarea.estado === 'en_revision' && !esAdmin}
          style={{ 
            width: '100%',
            backgroundColor: tarea.estado === 'en_revision' ? '#f1f5f9' : 'transparent', 
            color: tarea.estado === 'en_revision' ? '#94a3b8' : '#0f172a', 
            border: `1px solid ${tarea.estado === 'en_revision' ? '#e2e8f0' : '#cbd5e1'}`, 
            padding: '6px 12px', 
            borderRadius: '4px', 
            fontSize: '1.2rem', 
            fontWeight: '400',
            cursor: tarea.estado === 'en_revision' && !esAdmin ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
              if(tarea.estado !== 'en_revision' || esAdmin) {
                  e.currentTarget.style.backgroundColor = '#f8fafc'
              }
          }}
          onMouseOut={(e) => {
              if(tarea.estado !== 'en_revision' || esAdmin) {
                  e.currentTarget.style.backgroundColor = 'transparent'
              }
          }}
        >
          {tarea.estado === 'pendiente' && 'Iniciar Trabajo'}
          {tarea.estado === 'progreso' && 'Marcar Completada'}
          {tarea.estado === 'en_revision' && (!esAdmin ? 'En Revisión...' : 'Aprobar Tarea')}
        </button>
      )}
    </div>
  );

  // Si no hay usuario cargado (por si acaso), no renderizamos la pantalla para evitar bugs visuales
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
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Panel General</a>
            <a href="#" style={{ color: '#ffffff', fontWeight: '400' }}>Mi Trabajo</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('recursos'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Recursos</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('reuniones'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Reuniones</a>
            
            {esAdmin && (
               <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('gestion'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Gestión</a>
            )}
          </div>

          <button 
            onClick={onLogout}
            style={{ background: 'transparent', border: 'none', color: '#f5f5f7', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8, fontWeight: '300' }}
          >
            Desconectar
          </button>
        </div>
      </nav>

      <main className="animar-entrada" style={{ paddingTop: '100px', paddingBottom: '60px', paddingLeft: '5%', paddingRight: '5%', maxWidth: '1400px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '4.2rem', marginBottom: '15px', letterSpacing: '-1.5px', fontWeight: '300', color: '#0f172a' }}>
            Asignaciones
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.8rem', fontWeight: '400', margin: 0 }}>
            {esAdmin ? 'Gestión de tareas y responsabilidades operativas (Vista Admin).' : `Tablero operativo de ${usuarioActual}.`}
          </p>
        </header>

        {cargando ? (
           <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem', color: '#64748b' }}>
             Cargando tareas operativas desde el servidor...
           </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', alignItems: 'start' }}>
            
            <div className="apple-box" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0', alignItems: 'stretch', textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#1D4ED8', padding: '15px 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Pendientes
                </h3>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                  {tareas.filter(t => t.estado === 'pendiente').length}
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                {tareas.filter(t => t.estado === 'pendiente').map(renderizarTarea)}
              </div>
            </div>

            <div className="apple-box" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0', alignItems: 'stretch', textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f59e0b', padding: '15px 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  En Progreso
                </h3>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                  {tareas.filter(t => t.estado === 'progreso' || t.estado === 'en_revision').length}
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                {tareas.filter(t => t.estado === 'progreso' || t.estado === 'en_revision').map(renderizarTarea)}
              </div>
            </div>

            <div className="apple-box" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0', alignItems: 'stretch', textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#10b981', padding: '15px 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Completadas
                </h3>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                  {tareas.filter(t => t.estado === 'completada').length}
                </span>
              </div>
              <div style={{ padding: '20px', opacity: 0.7 }}>
                {tareas.filter(t => t.estado === 'completada').map(renderizarTarea)}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default MiTrabajo;