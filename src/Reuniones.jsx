import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import logoWh from './assets/logowh.png'; 

function Reuniones({ usuario, onLogout, onNavigate }) {
  const esAdmin = usuario?.matricula === 'STZTM-001' || usuario?.matricula === 'STZTM-002';

  const [reuniones, setReuniones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('');
  const [reunionActiva, setReunionActiva] = useState(null);

  // ==========================================
  // CALENDARIO HISTÓRICO
  // ==========================================
  const hoyReal = new Date();
  const [fechaCalendario, setFechaCalendario] = useState(new Date()); 

  const cambiarMes = (delta) => {
    const nuevaFecha = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + delta, 1);
    setFechaCalendario(nuevaFecha);
  };

  const getDiasDelMes = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1).getDay(); 
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    
    const primerDiaAjustado = primerDia === 0 ? 6 : primerDia - 1;
    const dias = Array.from({ length: ultimoDia }, (_, i) => i + 1);
    const slotsVacios = Array.from({ length: primerDiaAjustado }, () => null);
    
    return [...slotsVacios, ...dias];
  };

  const mesesCompletos = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const todoElCalendario = getDiasDelMes(fechaCalendario);

  // ==========================================
  // CARGAR REUNIONES 
  // ==========================================
  useEffect(() => {
    async function fetchReuniones() {
      setCargando(true);
      try {
        const { data, error } = await supabase.from('reuniones').select('*').order('fecha_reunion', { ascending: false });
        if (error) throw error;
        if (data) setReuniones(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setCargando(false);
      }
    }
    fetchReuniones();
  }, []);

  const diasReunionMap = reuniones.filter(r => {
    const d = new Date(r.fecha_reunion);
    return d.getMonth() === fechaCalendario.getMonth() && d.getFullYear() === fechaCalendario.getFullYear();
  }).map(r => new Date(r.fecha_reunion).getDate());

  const futuras = reuniones.filter(r => new Date(r.fecha_reunion) >= hoyReal).sort((a,b) => new Date(a.fecha_reunion) - new Date(b.fecha_reunion));
  const proximaReunion = futuras.length > 0 ? futuras[0] : null;
  
  let diasFaltantes = 0;
  if (proximaReunion) {
    const diffTime = new Date(proximaReunion.fecha_reunion) - hoyReal;
    diasFaltantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const formatFechaLarga = (fechaStr) => {
    const d = new Date(fechaStr);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dias[d.getDay()]}, ${d.getDate()} de ${mesesCompletos[d.getMonth()]}`;
  };

  const formatHora = (fechaStr) => new Date(fechaStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ==========================================
  // SUBMIT DE NOTAS TEXTUALES
  // ==========================================
  const agregarNota = async (reunionId) => {
    if (!nuevaNotaTexto.trim()) return;

    const nombreAutor = usuario?.nombre || 'Operador';
    const reunionAfectada = reuniones.find(r => r.id === reunionId);

    const nuevasNotas = [...(reunionAfectada.notas || []), { 
      id: Date.now(), 
      autor: nombreAutor, 
      texto: nuevaNotaTexto
    }];

    setReuniones(reuniones.map(r => r.id === reunionId ? { ...r, notas: nuevasNotas } : r));
    setNuevaNotaTexto('');
    setReunionActiva(null);

    try {
      const { error } = await supabase.from('reuniones').update({ notas: nuevasNotas }).eq('id', reunionId);
      if (error) throw error;
    } catch (err) { console.error(err); }
  };

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
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('trabajo'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Mi Trabajo</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('recursos'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Recursos</a>
            <a href="#" style={{ color: '#ffffff', fontWeight: '400' }}>Reuniones</a>
            {esAdmin && <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('gestion'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Gestión</a>}
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#f5f5f7', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}>Desconectar</button>
        </div>
      </nav>

      <main className="animar-entrada" style={{ paddingTop: '100px', paddingBottom: '60px', paddingLeft: '5%', paddingRight: '5%', maxWidth: '1400px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '4.2rem', marginBottom: '15px', letterSpacing: '-1.5px', fontWeight: '300' }}>Reuniones Operativas</h1>
          <p style={{ color: '#64748b', fontSize: '1.8rem', fontWeight: '400', margin: 0 }}>Historial, acuerdos y bitácora del STZ Team.</p>
        </header>

        {cargando ? (
           <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem', color: '#64748b' }}>Sincronizando bitácora operativa...</div>
        ) : (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            <div style={{ flex: '1 1 350px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              <div className="apple-box" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ backgroundColor: '#000000', padding: '15px 30px' }}><h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '2px', textTransform: 'uppercase' }}>Próxima Sesión</h3></div></div>
                <div style={{ padding: '35px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {proximaReunion ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}><span style={{ fontSize: '8rem', fontWeight: '300', color: '#0f172a', lineHeight: '1', letterSpacing: '-4px', fontFamily: 'monospace' }}>T-{diasFaltantes < 10 && diasFaltantes >= 0 ? `0${diasFaltantes}` : Math.max(0, diasFaltantes)}</span><span style={{ fontSize: '2rem', fontWeight: '300', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Días</span></div>
                      <p style={{ fontSize: '1.8rem', fontWeight: '400', color: '#0f172a', margin: '0 0 5px 0', textAlign: 'center' }}>{proximaReunion.titulo}</p>
                      <p style={{ fontSize: '1.4rem', color: '#64748b', fontWeight: '400', margin: '0 0 10px 0' }}>{formatFechaLarga(proximaReunion.fecha_reunion)} • {formatHora(proximaReunion.fecha_reunion)}</p>
                      
                      <span style={{ backgroundColor: '#e2e8f0', color: '#0f172a', padding: '4px 12px', borderRadius: '4px', fontSize: '1.2rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '30px' }}>
                        {proximaReunion.modalidad || 'Presencial'}
                      </span>
                      
                      <button className="btn-solido" style={{ width: '100%', maxWidth: '250px', padding: '12px', fontSize: '1.4rem', borderRadius: '8px' }}>Hacer Check In</button>
                    </>
                  ) : (<p style={{ fontSize: '1.6rem', color: '#64748b', margin: '30px 0' }}>No hay reuniones programadas.</p>)}
                </div>
              </div>

              <div className="apple-box" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ backgroundColor: '#000000', padding: '15px 30px' }}><h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '2px', textTransform: 'uppercase' }}>Calendario</h3></div></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px 5px 25px' }}>
                  <button onClick={() => cambiarMes(-1)} style={{ background: 'transparent', border: 'none', fontSize: '2rem', color: '#1D4ED8', cursor: 'pointer' }}>&lt;</button>
                  <span style={{ fontSize: '1.6rem', fontWeight: '400', color: '#0f172a' }}>{mesesCompletos[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}</span>
                  <button onClick={() => cambiarMes(1)} style={{ background: 'transparent', border: 'none', fontSize: '2rem', color: '#1D4ED8', cursor: 'pointer' }}>&gt;</button>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>{diasSemana.map(d => <span key={d} style={{ fontSize: '1.2rem', color: '#94a3b8' }}>{d}</span>)}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {todoElCalendario.map((dia, index) => {
                      if (dia === null) return <div key={`empty-${index}`}></div>;
                      const esReunion = diasReunionMap.includes(dia);
                      const esHoy = dia === hoyReal.getDate() && fechaCalendario.getMonth() === hoyReal.getMonth() && fechaCalendario.getFullYear() === hoyReal.getFullYear();
                      return (
                        <div key={index} style={{ 
                          display: 'flex', justifyContent: 'center', alignItems: 'center', width: '32px', height: '32px', margin: '0 auto', borderRadius: '50%', 
                          backgroundColor: esReunion ? '#1D4ED8' : 'transparent',
                          border: esHoy ? '1px solid #1D4ED8' : 'none',
                          color: esReunion ? '#ffffff' : (esHoy ? '#1D4ED8' : '#64748b'), fontSize: '1.3rem', fontWeight: esHoy || esReunion ? '500' : '300'
                        }}>{dia}</div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {reuniones.map((reunion) => (
                <div key={reunion.id} className="apple-box" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', borderRadius: '16px', overflow: 'hidden' }}>
                  
                  <div style={{ width: '100%', height: '70px', backgroundColor: '#1D4ED8', display: 'flex', alignItems: 'center', padding: '0 30px' }}>
                    <img src={logoWh} alt="STZ" style={{ height: '25px', width: 'auto' }} />
                  </div>

                  <div style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.2rem', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {formatFechaLarga(reunion.fecha_reunion)} • {formatHora(reunion.fecha_reunion)}
                      </span>
                      
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '1rem', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '1px' }}>
                        {reunion.modalidad || 'Presencial'}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '2.8rem', color: '#0f172a', margin: '0 0 20px 0', fontWeight: '300', letterSpacing: '-1px' }}>{reunion.titulo}</h2>
                    
                    {reunion.temas && reunion.temas.length > 0 && (
                      <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '1.4rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '300', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Agenda</h4>
                        <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155', fontSize: '1.4rem', fontWeight: '300', lineHeight: '1.6' }}>{reunion.temas.map((tema, i) => <li key={i}>{tema}</li>)}</ul>
                      </div>
                    )}

                    {(reunion.asistencia || (reunion.minuta && reunion.minuta.length > 0)) && (
                      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '1.3rem', color: '#1D4ED8', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Reporte de Sesión</h4>
                        {reunion.asistencia && <p style={{ fontSize: '1.3rem', color: '#64748b', marginBottom: '10px' }}><strong>Asistentes:</strong> {reunion.asistencia}</p>}
                        
                        {reunion.minuta && reunion.minuta.map((item, idx) => (
                          <div key={idx} style={{ marginBottom: idx === reunion.minuta.length-1 ? 0 : '15px' }}>
                            {item.texto && <p style={{ fontSize: '1.4rem', color: '#334155', fontWeight: '300', margin: '0' }}>{item.texto}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '400', marginBottom: '15px' }}>Notas Colaborativas</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        {reunion.notas && reunion.notas.map(nota => (
                          <div key={nota.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem', flexShrink: 0 }}>{nota.autor.charAt(0)}</div>
                            <div style={{ backgroundColor: '#f8fafc', padding: '10px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '100%' }}>
                              <span style={{ fontSize: '1.1rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>{nota.autor}</span>
                              <span style={{ fontSize: '1.3rem', color: '#334155', fontWeight: '300' }}>{nota.texto}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {reunionActiva === reunion.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <textarea autoFocus value={nuevaNotaTexto} onChange={(e) => setNuevaNotaTexto(e.target.value)} placeholder="Escribe un comentario o tarea..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #1D4ED8', fontSize: '1.3rem', resize: 'vertical', minHeight: '60px', outline: 'none' }} />
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => { setReunionActiva(null); setNuevaNotaTexto(''); }} style={{ padding: '8px 16px', fontSize: '1.2rem', backgroundColor: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                              <button onClick={() => agregarNota(reunion.id)} style={{ padding: '8px 16px', fontSize: '1.2rem', backgroundColor: '#1D4ED8', color: '#ffffff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Guardar Nota</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setReunionActiva(reunion.id)} style={{ width: '100%', padding: '10px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', color: '#64748b', borderRadius: '6px', fontSize: '1.3rem', cursor: 'pointer' }}>+ Agregar nota a esta sesión</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reuniones;