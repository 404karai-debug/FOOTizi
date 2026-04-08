import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Watch() {
  const router = useRouter();
  const { m } = router.query;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState(0);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (m) fetchMatch();
  }, [m]);

  async function fetchMatch() {
    const { data } = await supabase
      .from('diffusions')
      .select('*')
      .eq('id', m)
      .single();
    if (data) setMatch(data);
    setLoading(false);
  }

  function getLiens() {
    if (!match) return [];
    // Essaie les champs possibles
    const raw = match.liens_stream || match.lien_stream_1;
    if (!raw) {
      // Construire depuis les champs séparés
      const liens = [];
      if (match.lien_stream_1) liens.push({ nom: 'Source 1', url: match.lien_stream_1 });
      if (match.lien_stream_2) liens.push({ nom: 'Source 2', url: match.lien_stream_2 });
      if (match.lien_stream_3) liens.push({ nom: 'Source 3', url: match.lien_stream_3 });
      return liens;
    }
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [{ nom: 'Source 1', url: raw }];
    }
  }

  function changeSource(index) {
    setSelectedSource(index);
    // Force reload iframe
    if (iframeRef.current) {
      const url = liens[index]?.url;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = url;
      }, 100);
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0b0b0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid #1e1e2e',
        borderTop: '3px solid #22d3ee', borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Chargement...
    </div>
  );

  if (!match) return (
    <div style={{
      minHeight: '100vh', background: '#0b0b0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'Inter, sans-serif', gap: '16px'
    }}>
      <div style={{ fontSize: '48px' }}>😕</div>
      <div style={{ fontSize: '20px', fontWeight: '700' }}>Match introuvable</div>
      <Link href="/" style={{ color: '#22d3ee', textDecoration: 'none' }}>← Retour à l'accueil</Link>
    </div>
  );

  const liens = getLiens();
  const currentUrl = liens[selectedSource]?.url || '';
  const isLive = match.statut === 'live';

  return (
    <>
      <Head>
        <title>{match.equipe_domicile} vs {match.equipe_exterieur} - Footizi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0b0b0f; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .source-btn:hover {
            border-color: #22d3ee !important;
            color: #22d3ee !important;
          }
        `}</style>
      </Head>

      <div style={{
        minHeight: '100vh', background: '#0b0b0f',
        color: 'white', fontFamily: 'Inter, Segoe UI, sans-serif'
      }}>

        {/* HEADER */}
        <header style={{
          background: '#0f0f14',
          borderBottom: '1px solid #1e1e2e',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <Link href="/" style={{
            color: 'white', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '14px', fontWeight: '600'
          }}>
            <span style={{ color: '#888' }}>←</span>
            <span style={{ fontSize: '22px', fontWeight: '900' }}>
              <span style={{ color: 'white' }}>Foot</span>
              <span style={{ color: '#22d3ee' }}>izi</span>
            </span>
            <span>⚽</span>
          </Link>

          <a
            href="https://discord.gg/YhJDgrfauT"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#5865f2', color: 'white',
              padding: '7px 16px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '700', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 71 55" fill="white">
              <path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.7a40.9 40.9 0 0 0-1.8 3.7 54.2 54.2 0 0 0-16.3 0A39.7 39.7 0 0 0 25.6.7 58.4 58.4 0 0 0 11 4.9C1.6 19.1-.97 33 .31 46.7a59 59 0 0 0 18 9.1 44.6 44.6 0 0 0 3.8-6.3 38.4 38.4 0 0 1-6-2.9l1.5-1.1a42.1 42.1 0 0 0 36.2 0l1.5 1.1a38.3 38.3 0 0 1-6 2.9 44.4 44.4 0 0 0 3.8 6.3 58.7 58.7 0 0 0 18-9.1C72.2 30.9 68.2 17.1 60.1 4.9ZM23.8 38.4c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.5 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
            </svg>
            Discord
          </a>
        </header>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>

          {/* INFOS MATCH EN HAUT */}
          <div style={{
            background: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '14px',
            padding: '16px 24px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {match.logo_domicile && (
                <img src={match.logo_domicile} alt={match.equipe_domicile}
                  style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
              )}
              <div>
                <div style={{ fontWeight: '800', fontSize: '17px' }}>
                  {match.equipe_domicile}
                  <span style={{ color: '#555', margin: '0 8px' }}>vs</span>
                  {match.equipe_exterieur}
                </div>
                <div style={{ color: '#666', fontSize: '13px', marginTop: '3px' }}>
                  🏆 {match.competition}
                </div>
              </div>
              {match.logo_exterieur && (
                <img src={match.logo_exterieur} alt={match.equipe_exterieur}
                  style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isLive ? (
                <div style={{
                  background: '#ef4444',
                  padding: '6px 16px', borderRadius: '20px',
                  fontWeight: '800', fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{
                    width: '7px', height: '7px',
                    background: 'white', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite'
                  }}></span>
                  EN DIRECT
                </div>
              ) : (
                <div style={{
                  background: '#1a1a24', color: '#22d3ee',
                  padding: '6px 16px', borderRadius: '20px',
                  fontWeight: '700', fontSize: '12px', border: '1px solid #22d3ee33'
                }}>
                  À VENIR
                </div>
              )}
            </div>
          </div>

          {/* PLAYER PRINCIPAL */}
          <div style={{
            background: '#000',
            borderRadius: '14px',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            border: '1px solid #1e1e2e',
            marginBottom: '16px'
          }}>
            {isLive && currentUrl ? (
              <iframe
                ref={iframeRef}
                src={currentUrl}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                scrolling="no"
              />
            ) : isLive && liens.length === 0 ? (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '12px'
              }}>
                <div style={{ fontSize: '48px' }}>📡</div>
                <div style={{ color: '#888', fontSize: '16px' }}>Aucune source disponible</div>
              </div>
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '12px',
                background: 'linear-gradient(135deg, #0b0b0f 0%, #111128 100%)'
              }}>
                <div style={{ fontSize: '48px' }}>⏳</div>
                <div style={{ color: '#22d3ee', fontSize: '20px', fontWeight: '800' }}>
                  Diffusion à venir
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Le lecteur démarrera au lancement du match
                </div>
              </div>
            )}
          </div>

          {/* SOURCES */}
          {isLive && liens.length > 0 && (
            <div style={{
              background: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '13px', fontWeight: '700',
                color: '#888', marginBottom: '14px',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                📺 Sources disponibles
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {liens.map((lien, i) => (
                  <button
                    key={i}
                    className="source-btn"
                    onClick={() => changeSource(i)}
                    style={{
                      background: selectedSource === i ? '#22d3ee' : '#16161f',
                      color: selectedSource === i ? '#000' : '#ccc',
                      border: `1px solid ${selectedSource === i ? '#22d3ee' : '#2a2a3a'}`,
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>📺</span>
                    <span>{lien.nom || `Source ${i + 1}`}</span>
                    {lien.qualite && (
                      <span style={{
                        background: selectedSource === i ? 'rgba(0,0,0,0.15)' : '#2a2a3a',
                        color: selectedSource === i ? '#000' : '#888',
                        padding: '2px 7px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {lien.qualite}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div style={{
                marginTop: '14px',
                padding: '10px 14px',
                background: '#0d0d14',
                borderRadius: '8px',
                color: '#555',
                fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span>💡</span>
                <span>Si une source ne fonctionne pas, essayez une autre. Certaines sources nécessitent un VPN si vous êtes hors de France.</span>
              </div>
            </div>
          )}

          {/* DISCORD */}
          <div style={{
            background: 'linear-gradient(135deg, #5865f2 0%, #4752c4 100%)',
            borderRadius: '14px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>
              Rejoignez la communauté Footizi
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginBottom: '18px' }}>
              Discussions live, alertes matchs, et bien plus sur notre Discord !
            </div>
            <a
              href="https://discord.gg/YhJDgrfauT"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'white', color: '#5865f2',
                padding: '12px 32px', borderRadius: '10px',
                textDecoration: 'none', fontWeight: '800',
                fontSize: '15px', display: 'inline-block'
              }}
            >
              Rejoindre le Discord
            </a>
          </div>

        </div>

        {/* FOOTER */}
        <footer style={{
          borderTop: '1px solid #1e1e2e',
          padding: '24px 20px',
          textAlign: 'center',
          color: '#555',
          fontSize: '13px',
          marginTop: '24px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '900', marginBottom: '6px' }}>
            <span style={{ color: 'white' }}>Foot</span>
            <span style={{ color: '#22d3ee' }}>izi</span> ⚽
          </div>
          <p>Ce site ne stocke aucune vidéo. Les flux sont fournis par des tiers.</p>
        </footer>
      </div>
    </>
  );
}
