import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import logoWh from './assets/logowh.png';

function GestionTareas({ usuario, onLogout, onNavigate }) {
  const [tabActiva, setTabActiva] = useState('tareas'); 
  const [enviando, setEnviando] = useState(false);
  const operadores = ['Todos', 'Jared', 'Gerardo', 'Lalo', 'Guillermo', 'Vanessa Z.', 'Yu Chi', 'Luis', 'Itzel', 'Vanessa E.'];
  const esAdmin = usuario?.matricula === 'STZTM-001' || usuario?.matricula === 'STZTM-002';
  
  // Tab 1: Tareas
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [asignadoA, setAsignadoA] = useState('Todos');
  const [fechaLimite, setFechaLimite] = useState('');
  const [tag, setTag] = useState('N.A');
  
  // Tab 2: Reuniones
  const [tituloReunion, setTituloReunion] = useState('');
  const [fechaReunion, setFechaReunion] = useState('');
  const [temasReunion, setTemasReunion] = useState('');
  const [modalidadReunion, setModalidadReunion] = useState('Presencial'); 
  
  // Tab 3: Minutas
  const [reunionesPasadas, setReunionesPasadas] = useState([]);
  const [reunionSeleccionada, setReunionSeleccionada] = useState('');
  const [asistencia, setAsistencia] = useState('');
  const [minutaTexto, setMinutaTexto] = useState('');

  useEffect(() => {
    if (tabActiva === 'minutas' && esAdmin) {
      supabase.from('reuniones').select('id, titulo, fecha_reunion').order('fecha_reunion', { ascending: false })
        .then(({ data }) => setReunionesPasadas(data || []));
    }
  }, [tabActiva, esAdmin]);

  const crearTarea = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const colorTag = tag === 'software' ? '#1D4ED8' : tag === 'labs' ? '#8b5cf6' : tag === 'edu' ? '#10b981' : tag === 'administrativas' ? '#f59e0b' : '#64748b';
    const { error } = await supabase.from('tareas').insert([{ titulo: nuevoTitulo, tag, tag_color: colorTag, fecha_limite: fechaLimite, asignado_a: asignadoA, asignado_por: usuario.nombre, estado: 'pendiente' }]);
    if (error) alert("Error: " + error.message);
    else { alert("Tarea asignada."); setNuevoTitulo(''); setFechaLimite(''); setTag('N.A'); onNavigate('trabajo'); }
    setEnviando(false);
  };

  const crearReunion = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const temasArray = temasReunion.split(',').map(t => t.trim()).filter(t => t !== '');
    
    const { error } = await supabase.from('reuniones').insert([{ 
      titulo: tituloReunion, 
      fecha_reunion: fechaReunion, 
      temas: temasArray,
      modalidad: modalidadReunion 
    }]);

    if (error) alert("Error al programar: " + error.message);
    else { alert("Reunión programada."); setTituloReunion(''); setFechaReunion(''); setTemasReunion(''); setModalidadReunion('Presencial'); onNavigate('reuniones'); }
    setEnviando(false);
  };

  const guardarMinuta = async (e) => {
    e.preventDefault();
    if (!reunionSeleccionada) return alert("Selecciona una reunión.");
    if (!minutaTexto) return alert("Escribe un resumen directivo.");
    setEnviando(true);

    const { data: reunionActual } = await supabase.from('reuniones').select('minuta').eq('id', reunionSeleccionada).single();
    const nuevaMinutaArray = [...(reunionActual?.minuta || []), { texto: minutaTexto, timestamp: new Date() }];

    const { error } = await supabase.from('reuniones').update({ asistencia, minuta: nuevaMinutaArray }).eq('id', reunionSeleccionada);

    if (error) alert("Error al guardar: " + error.message);
    else { alert("Minuta registrada."); setAsistencia(''); setMinutaTexto(''); onNavigate('reuniones'); }
    setEnviando(false);
  };

  if (!esAdmin) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '2rem', color: '#64748b' }}>Acceso denegado. Se requiere rango superior.</div>;

  const TabButton = ({ id, label }) => (
    <button onClick={() => setTabActiva(id)} style={{ flex: 1, padding: '12px', backgroundColor: tabActiva === id ? '#000000' : 'transparent', color: tabActiva === id ? '#ffffff' : '#64748b', border: '1px solid #000000', fontWeight: '400', fontSize: '1.3rem', cursor: 'pointer', transition: 'all 0.2s', borderTopLeftRadius: id==='tareas'?'6px':0, borderBottomLeftRadius: id==='tareas'?'6px':0, borderTopRightRadius: id==='minutas'?'6px':0, borderBottomRightRadius: id==='minutas'?'6px':0 }}>{label}</button>
  );

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.5rem', fontWeight: '300', outline: 'none', backgroundColor: '#ffffff' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '1.3rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <nav className="apple-nav">
        <div className="apple-nav-belt">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><img src={logoWh} alt="Logo" style={{ height: '20px' }} /><span style={{ fontWeight: '400', letterSpacing: '1px' }}>Portal</span></div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Panel General</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('trabajo'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Mi Trabajo</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('recursos'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Recursos</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('reuniones'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Reuniones</a>
            <a href="#" style={{ color: '#ffffff', fontWeight: '400' }}>Gestión</a>
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#f5f5f7', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}>Desconectar</button>
        </div>
      </nav>

      <main className="animar-entrada" style={{ paddingTop: '100px', paddingBottom: '60px', paddingLeft: '5%', paddingRight: '5%', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '4.2rem', marginBottom: '15px', letterSpacing: '-1.5px', fontWeight: '300' }}>Control Maestro</h1>
          <p style={{ color: '#64748b', fontSize: '1.8rem', fontWeight: '400', margin: 0 }}>Distribución operativa y bitácora directiva del equipo.</p>
        </header>

        <div style={{ display: 'flex', marginBottom: '30px' }}>
          <TabButton id="tareas" label="Asignar Tareas" />
          <TabButton id="nuevaReunion" label="Programar Reunión" />
          <TabButton id="minutas" label="Bitácora Ejecutiva" />
        </div>

        <div className="apple-box" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
          
          {tabActiva === 'tareas' && (
            <>
              <div style={{ backgroundColor: '#000000', padding: '20px 30px' }}><h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Crear Tarea</h3></div>
              <form onSubmit={crearTarea} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div><label style={labelStyle}>Descripción</label><input type="text" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} required style={inputStyle} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div><label style={labelStyle}>Asignar A:</label><select value={asignadoA} onChange={(e) => setAsignadoA(e.target.value)} required style={inputStyle}>{operadores.map(op => <option key={op} value={op}>{op}</option>)}</select></div>
                  <div><label style={labelStyle}>Categoría:</label><select value={tag} onChange={(e) => setTag(e.target.value)} required style={{...inputStyle, textTransform: 'capitalize'}}><option value="labs">Labs</option><option value="software">Software</option><option value="edu">Edu</option><option value="administrativas">Administrativas</option><option value="N.A">N.A</option></select></div>
                </div>
                <div><label style={labelStyle}>Fecha Límite</label><input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} required style={inputStyle} /></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="submit" disabled={enviando} className="btn-solido" style={{ padding: '14px 30px', fontSize: '1.4rem', borderRadius: '8px' }}>{enviando ? 'Enviando...' : 'Asignar Tarea'}</button></div>
              </form>
            </>
          )}

          {tabActiva === 'nuevaReunion' && (
            <>
              <div style={{ backgroundColor: '#000000', padding: '20px 30px' }}><h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Programar Reunión</h3></div>
              <form onSubmit={crearReunion} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div><label style={labelStyle}>Título de Reunión</label><input type="text" placeholder="Ej. Kickoff Proyecto Mars" value={tituloReunion} onChange={(e) => setTituloReunion(e.target.value)} required style={inputStyle} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div><label style={labelStyle}>Fecha y Hora</label><input type="datetime-local" value={fechaReunion} onChange={(e) => setFechaReunion(e.target.value)} required style={inputStyle} /></div>
                  <div>
                    <label style={labelStyle}>Modalidad</label>
                    <select value={modalidadReunion} onChange={(e) => setModalidadReunion(e.target.value)} required style={inputStyle}>
                      <option value="Presencial">Presencial</option>
                      <option value="Virtual">Virtual</option>
                    </select>
                  </div>
                </div>
                <div><label style={labelStyle}>Agenda (Separados por coma)</label><input type="text" placeholder="Temas 1, Tema 2, ..." value={temasReunion} onChange={(e) => setTemasReunion(e.target.value)} style={inputStyle} /></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="submit" disabled={enviando} className="btn-solido" style={{ padding: '14px 30px', fontSize: '1.4rem', borderRadius: '8px' }}>{enviando ? 'Programando...' : 'Fijar Reunión'}</button></div>
              </form>
            </>
          )}

          {tabActiva === 'minutas' && (
            <>
              <div style={{ backgroundColor: '#000000', padding: '20px 30px' }}><h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase' }}>Registro Oficial</h3></div>
              <form onSubmit={guardarMinuta} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <label style={labelStyle}>Seleccionar Reunión</label>
                  <select value={reunionSeleccionada} onChange={(e) => setReunionSeleccionada(e.target.value)} required style={inputStyle}>
                    <option value="">-- Elige la sesión --</option>
                    {reunionesPasadas.map(r => <option key={r.id} value={r.id}>{r.titulo} ({new Date(r.fecha_reunion).toLocaleDateString()})</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Asistentes Oficiales</label><input type="text" placeholder="Jared, Gerardo, Diego..." value={asistencia} onChange={(e) => setAsistencia(e.target.value)} style={inputStyle} /></div>
                <div>
                  <label style={labelStyle}>Resumen Ejecutivo y Acuerdos</label>
                  <textarea placeholder="Escribe la minuta oficial de la sesión..." value={minutaTexto} onChange={(e) => setMinutaTexto(e.target.value)} required style={{...inputStyle, resize: 'vertical', minHeight: '120px'}} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="submit" disabled={enviando} className="btn-solido" style={{ padding: '14px 30px', fontSize: '1.4rem', borderRadius: '8px' }}>{enviando ? 'Guardando...' : 'Publicar en Bitácora'}</button></div>
              </form>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default GestionTareas;