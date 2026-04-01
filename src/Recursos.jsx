import React from 'react';
import logoWh from './assets/logowh.png'; 

import rs1 from './assets/resources/rs1.png';
import rs2 from './assets/resources/rs2.png';
import rs3 from './assets/resources/rs3.png';
import rs4 from './assets/resources/rs4.png';
import rs5 from './assets/resources/rs5.png';

// 1. Recibe 'usuario'
function Recursos({ usuario, onLogout, onNavigate }) {
  
  // 2. Validamos si es Admin (STZTM-001 o 002)
  const esAdmin = usuario?.matricula === 'STZTM-001' || usuario?.matricula === 'STZTM-002';
  
  // ==========================================
  // LISTA DE RECURSOS 
  // ==========================================
  const recursosList = [
    {
      id: 1,
      titulo: 'Kyra Mini (Onshape)',
      descripcion: 'Ensamblajes oficiales del Quadruped Spider Robot. Se necesita acceso.',
      logo: rs1,
      link: 'https://cad.onshape.com/documents/a62996163453c446bd0615aa/w/109568ae767d35a04098231a/e/256aa415adf54b1a4e52b13d?renderMode=0&uiState=69c8bea2d7c007341d5a5ec3',
      tags: [
        { label: 'Labs', color: '#64748b' },
        { label: 'Diseño CAD', color: '#f59e0b' },
        { label: 'Permisos Req.', color: '#dc2626' }
      ]
    },
    {
      id: 2,
      titulo: 'STZ Robotics (Github)',
      descripcion: 'Acceso a la organización de GitHub del equipo.',
      logo: rs2,
      link: 'https://github.com/STZ-Robotics',
      tags: [
        { label: 'Software', color: '#64748b' },
        { label: 'Desarrollo', color: '#4b7bff' },
      ]
    },
    {
      id: 3,
      titulo: 'Inventario (Excel)',
      descripcion: 'Inventario del equipo.',
      logo: rs3,
      link: '#excel-link',
      tags: [
        { label: 'Administración', color: '#10b981' },
      ]
    },
    {
      id: 4,
      titulo: 'Manual (Docs)',
      descripcion: 'Manual del equipo',
      logo: rs5,
      link: 'https://docs.google.com/document/d/1OFBOpWo5HOXyaz1gcoAz8J0Qmc0p2DAukPvQFDuJ7ik/edit?usp=sharing',
      tags: [
        { label: 'Administración', color: '#10b981' },
      ]
    },
    {
      id: 5,
      titulo: 'Design Drafts (Figma)',
      descripcion: 'Bocetos de diseño y prototipos en Figma.',
      logo: rs4,
      link: 'https://www.figma.com/design/oDbC69aV1ZoBFRuDT51G3w/STZ-Robotics?node-id=0-1&t=qj3fIiKNmFTUQjjH-1',
      tags: [
        { label: 'Diseño', color: '#8b5cf6' }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      
      {/* Navbar Superior */}
      <nav className="apple-nav">
        <div className="apple-nav-belt">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={logoWh} alt="Logo" style={{ height: '20px' }} />
            <span style={{ fontWeight: '400', letterSpacing: '1px' }}>Portal</span>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Panel General</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('trabajo'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Mi Trabajo</a>
            <a href="#" style={{ color: '#ffffff', fontWeight: '400' }}>Recursos</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('reuniones'); }} style={{ opacity: 0.7, fontWeight: '300' }}>Reuniones</a>
            
            {/* 3. Link condicional a Gestión */}
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

      {/* Contenido Principal */}
      <main className="animar-entrada" style={{ paddingTop: '100px', paddingBottom: '60px', paddingLeft: '5%', paddingRight: '5%', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <header style={{ marginBottom: '40px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '4.2rem', marginBottom: '15px', letterSpacing: '-1.5px', fontWeight: '300', color: '#0f172a' }}>
            Recursos Operativos
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.8rem', fontWeight: '400', margin: 0 }}>
            Herramientas, software y documentación disponibles para tu división.
          </p>
        </header>

        {/* LISTA COMPACTA DE RECURSOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {recursosList.map((recurso) => (
            <div key={recurso.id} style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              padding: '16px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s ease'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', overflow: 'hidden' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  <img 
                    src={recurso.logo} 
                    alt={recurso.titulo} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0, fontWeight: '400' }}>
                      {recurso.titulo}
                    </h3>
                  </div>
                  
                  <a href={recurso.link} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: '1.2rem',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    {recurso.link} 
                  </a>

                  <p style={{ 
                    fontSize: '1.3rem', 
                    color: '#64748b', 
                    margin: '0 0 8px 0', 
                    fontWeight: '400',
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {recurso.descripcion}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: '400', marginRight: '4px' }}>
                      STZ Team
                    </span>
                    
                    {recurso.tags.map((tag, index) => (
                      <span key={index} style={{ 
                        fontSize: '1.1rem', 
                        color: tag.color, 
                        backgroundColor: `${tag.color}15`, 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontWeight: '400',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ paddingLeft: '20px', flexShrink: 0 }}>
                <a 
                  href={recurso.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    backgroundColor: '#ffffff', 
                    color: '#0f172a', 
                    border: '1px solid #cbd5e1', 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    fontSize: '1.3rem', 
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  Abrir
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Recursos;