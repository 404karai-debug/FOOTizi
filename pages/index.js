import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [diffusions, setDiffusions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchDiffusions();
    const interval = setInterval(fetchDiffusions, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDiffusions() {
    const { data } = await supabase
      .from('diffusions')
      .select('*')
      .order('date_match', { ascending: true });
    if (data) setDiffusions(data);
    setLoading(false);
  }

  const live = diffusions.filter(d => d.statut === 'live');
  const upcoming = diffusions.filter(d => d.statut === 'a_venir');

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function openMatch(match) {
    setSelectedMatch(match);
  }

  function closeModal() {
    setSelectedMatch(null);
  }

  return (
    <>
      <Head>
        <title>Footizi - Streaming Football Gratuit</title>
        <meta name="description" content="Regardez tous les matchs de football en direct gratuitement" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0b0b0f', color: 'white', fontFamily: 'Inter, Segoe UI, sans-serif' }}>
        
        {/* HEADER */}
        <header style={{
          background: '#0f0f14',
          borderBottom: '1px solid #1e1e2e',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            <span style={{ color: 'white' }}>Foot</span>
            <span style={{ color: '#22d3ee' }}>izi</span>
            <span style={{ marginLeft: '6px' }}>⚽</span>
          </div>
          <a
            href="https://discord.gg/YhJDgrfauT"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#5865f2',
              color: 'white',
              padding: '8px 18px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 71 55" fill="white">
              <path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.7a40.9 40.9 0 0 0-1.8 3.7 54.2 54.2 0 0 0-16.3 0A39.7 39.7 0 0 0 25.6.7 58.4 58.4 0 0 0 11 4.9C1.6 19.1-.97 33 .31 46.7a59 59 0 0 0 18 9.1 44.6 44.6 0 0 0 3.8-6.3 38.4 38.4 0 0 1-6-2.9l1.5-1.1a42.1 42.1 0 0 0 36.2 0l1.5 1.1a38.3 38.3 0 0 1-6 2.9 44.4 44.4 0 0 0 3.8 6.3 58.7 58.7 0 0 0 18-9.1C72.2 30.9 68.2 17.1 60.1 4.9ZM23.8 38.4c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.5 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
            </svg>
            Discord
          </a>
        </header>

        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>Chargement...</div>
          ) : (
            <>
              {/* LIVE */}
              <section style={{ marginBottom: '50px' }}>
                <h2 style={{
                  fontSize: '20px', fontWeight: '800', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span style={{
                    width: '12px', height: '12px', background: '#ef4444',
                    borderRadius: '50%', display: 'inline-block',
                    boxShadow: '0 0 8px #ef4444',
                    animation: 'none'
                  }}></span>
                  LIVE &nbsp;<span style={{ color: '#888', fontWeight: '400', fontSize: '16px' }}>Matchs en cours</span>
                </h2>

                {live.length === 0 ? (
                  <div style={{
                    background: '#111118', border: '1px solid #1e1e2e',
                    borderRadius: '12px', padding: '40px',
                    textAlign: 'center', color: '#555'
                  }}>
                    Aucun match en direct pour le moment
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {live.map(match => (
                      <MatchCard key={match.id} match={match} onWatch={() => openMatch(match)} />
                    ))}
                  </div>
                )}
              </section>

              {/* A VENIR */}
              <section>
                <h2 style={{
                  fontSize: '20px', fontWeight: '800', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  📅 <span style={{ color: '#888', fontWeight: '400', fontSize: '16px' }}>Prochains matchs</span>
                </h2>

                {upcoming.length === 0 ? (
                  <div style={{
                    background: '#111118', border: '1px solid #1e1e2e',
                    borderRadius: '12px', padding: '40px',
                    textAlign: 'center', color: '#555'
                  }}>
                    Aucun match programmé
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {upcoming.map(match => (
                      <MatchCard key={match.id} match={match} onWatch={() => openMatch(match)} formatDate={formatDate} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        {/* FOOTER */}
        <footer style={{
          borderTop: '1px solid #1e1e2e',
          padding: '30px 20px',
          textAlign: 'center',
          color: '#555',
          fontSize: '13px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>
            <span style={{ color: 'white' }}>Foot</span>
            <span style={{ color: '#22d3ee' }}>izi</span> ⚽
          </div>
          <p style={{ margin: '0 0 6px 0' }}>Streaming football gratuit • Tous les matchs en direct</p>
          <a href="https://discord.gg/YhJDgrfauT" style={{ color: '#5865f2' }}>Rejoindre le Discord</a>
          <p style={{ margin: '8px 0 0 0', color: '#444' }}>Ce site ne stocke aucune vidéo. Les flux sont fournis par des tiers.</p>
        </footer>

        {/* MODAL */}
        {selectedMatch && (
          <Modal match={selectedMatch} onClose={closeModal} />
        )}
      </div>
    </>
  );
}

function MatchCard({ match, onWatch, formatDate }) {
  const isLive = match.statut === 'live';

  return (
    <div style={{
      background: '#111118',
      border: `1px solid ${isLive ? '#ef4444' : '#1e1e2e'}`,
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: isLive ? '0 0 20px rgba(239,68,68,0.15)' : 'none'
    }}>
      {/* Barre top */}
      <div style={{
        background: isLive ? '#ef4444' : '#1a1a2a',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' }}>
          {isLive && (
            <span style={{
              width: '8px', height: '8px', background: 'white',
              borderRadius: '50%', display: 'inline-block'
            }}></span>
          )}
          <span style={{ color: 'white' }}>{isLive ? 'LIVE' : ''}</span>
        </div>
        <span style={{ color: isLive ? 'rgba(255,255,255,0.8)' : '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {match.competition}
        </span>
      </div>

      {/* Corps */}
      <div style={{
        padding: '24px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Équipe domicile */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {match.logo_domicile ? (
            <img src={match.logo_domicile} alt={match.equipe_domicile}
              style={{ width: '72px', height: '72px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: '72px', height: '72px', background: '#1e1e2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>⚽</div>
          )}
          <span style={{ fontWeight: '800', fontSize: '16px', textAlign: 'center' }}>{match.equipe_domicile}</span>
        </div>

        {/* VS + infos */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#333', marginBottom: '8px' }}>VS</div>
          {!isLive && match.date_match && (
            <div style={{ fontSize: '13px', color: '#888' }}>{formatDate && formatDate(match.date_match)}</div>
          )}
          {isLive && (
            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>En cours</div>
          )}
        </div>

        {/* Équipe extérieur */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {match.logo_exterieur ? (
            <img src={match.logo_exterieur} alt={match.equipe_exterieur}
              style={{ width: '72px', height: '72px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: '72px', height: '72px', background: '#1e1e2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>⚽</div>
          )}
          <span style={{ fontWeight: '800', fontSize: '16px', textAlign: 'center' }}>{match.equipe_exterieur}</span>
        </div>
      </div>

      {/* Footer card */}
      <div style={{
        padding: '14px 30px',
        borderTop: '1px solid #1e1e2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '13px', color: '#666' }}>
          {!isLive && match.date_match && formatDate ? formatDate(match.date_match) : isLive ? 'En cours' : ''}
        </span>
        <button
          onClick={onWatch}
          style={{
            background: isLive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
            color: 'white',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '8px',
            fontWeight: '800',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ▶ Regarder
        </button>
      </div>
    </div>
  );
}

function Modal({ match, onClose }) {
  const liens = match.liens_stream ? 
    (typeof match.liens_stream === 'string' ? JSON.parse(match.liens_stream) : match.liens_stream) 
    : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111118',
          border: '1px solid #1e1e2e',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1e1e2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px' }}>
              {match.equipe_domicile} vs {match.equipe_exterieur}
            </div>
            <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>{match.competition}</div>
          </div>
          <button onClick={onClose} style={{
            background: '#1e1e2e', border: 'none', color: 'white',
            width: '32px', height: '32px', borderRadius: '8px',
            fontSize: '16px', cursor: 'pointer'
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
            Choisissez un lien de diffusion :
          </p>
          {liens.length === 0 ? (
            <div style={{ color: '#555', textAlign: 'center', padding: '20px' }}>
              Aucun lien disponible
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {liens.map((lien, i) => (
                <a
                  key={i}
                  href={lien.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: '#1a1a24',
                    border: '1px solid #2a2a3a',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#22d3ee'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                >
                  <span style={{ fontSize: '22px' }}>📺</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{lien.nom || `Lien ${i + 1}`}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>{lien.qualite || 'HD'}</div>
                  </div>
                  <span style={{ color: '#555' }}>→</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
