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
  const [playerError, setPlayerError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (m) fetchMatch();
  }, [m]);

  useEffect(() => {
    if (match && match.statut === 'a_venir' && match.date_match) {
      const interval = setInterval(() => {
        const diff = new Date(match.date_match) - new Date();
        if (diff <= 0) {
          setTimeLeft('00:00:00');
          clearInterval(interval);
        } else {
          const h = Math.floor(diff / 3600000);
          const min = Math.floor((diff % 3600000) / 60000);
          const sec = Math.floor((diff % 60000) / 1000);
          setTimeLeft(
            `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
          );
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [match]);

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
    if (!match?.liens_stream) return [];
    try {
      return typeof match.liens_stream === 'string'
        ? JSON.parse(match.liens_stream)
        : match.liens_stream;
    } catch { return []; }
  }

  const liens = getLiens();
  const currentLien = liens[selectedSource];

  function handleRetry() {
    setPlayerError(false);
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    }, 100);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0b0b0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      Chargement...
    </div>
  );

  if (!match) return (
    <div style={{ minHeight: '100vh', background: '#0b0b0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Inter, sans-serif', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>😕</div>
      <div style={{ fontSize: '20px', fontWeight: '700' }}>Match introuvable</div>
      <Link href="/" style={{ color: '#22d3ee', textDecoration: 'none' }}>← Retour à l'accueil</Link>
    </div>
  );

  const isLive = match.statut === 'live';
  const isUpcoming = match.statut === 'a_venir';

  return (
    <>
      <Head>
        <title>{match.equipe_domicile} vs {match.equipe_exterieur} - Footizi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0b0b0f', color: 'white', fontFamily: 'Inter, Segoe UI, sans-serif' }}>

        {/* HEADER */}
        <header style={{
          background: '#0f0f14',
          borderBottom: '1px solid #1e1e2e',
          padding: '0 20px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <Link href="/" style={{
            color: 'white', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '600'
          }}>
            ← <span style={{ fontSize: '20px', fontWeight: '900' }}>
              <span style={{ color: 'white' }}>Foot</span>
              <span style={{ color: '#22d3ee' }}>izi</span>
            </span> ⚽
          </Link>

          <a
            href="https://discord.gg/YhJDgrfauT"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#5865f2', color: 'white',
              padding: '6px 14px', borderRadius: '8px',
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

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>

          {/* INFOS MATCH */}
          <div style={{
            background: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {match.logo_domicile && (
                <img src={match.logo_domicile} alt={match.equipe_domicile}
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              )}
              <div>
                <div style={{ fontWeight: '800', fontSize: '18px' }}>
                  {match.equipe_domicile} <span style={{ color: '#555' }}>vs</span> {match.equipe_exterieur}
                </div>
                <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                  {match.competition}
                </div>
              </div>
              {match.logo_exterieur && (
                <img src={match.logo_exterieur} alt={match.equipe_exterieur}
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              )}
            </div>
            <div>
              {isLive && (
                <span style={{
                  background: '#ef4444', color: 'white',
                  padding: '6px 14px', borderRadius: '20px',
                  fontWeight: '800', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', display: 'inline-block' }}></span>
                  EN DIRECT
                </span>
              )}
              {isUpcoming && (
                <span style={{
                  background: '#1e1e2e', color: '#22d3ee',
                  padding: '6px 14px', borderRadius: '20px',
                  fontWeight: '700', fontSize: '13px'
                }}>
                  À VENIR
                </span>
              )}
            </div>
          </div>

          {/* PLAYER ZONE */}
          <div style={{
            background: '#000',
            borderRadius: '14px',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '16/9',
            marginBottom: '20px',
            border: '1px solid #1e1e2e'
          }}>

            {/* Diffusion à venir */}
            {isUpcoming && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0b0b0f, #111128)',
                gap: '16px'
              }}>
                <div style={{ fontSize: '48px' }}>⏳</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#22d3ee' }}>Diffusion à venir</div>
                {timeLeft && (
                  <div style={{
                    fontSize: '48px', fontWeight: '900',
                    fontFamily: 'monospace', color: 'white',
                    letterSpacing: '4px'
                  }}>
                    {timeLeft}
                  </div>
                )}
                <div style={{ color: '#888', fontSize: '14px' }}>
                  Le lecteur s'affichera automatiquement au lancement.
                </div>
              </div>
            )}

            {/* Player actif */}
            {isLive && currentLien && !playerError && (
              <iframe
                ref={iframeRef}
                src={currentLien.url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                allow="autoplay; fullscreen"
                onError={() => setPlayerError(true)}
              />
            )}

            {/* Erreur source */}
            {isLive && playerError && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#0b0b0f', gap: '12px', padding: '20px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '40px' }}>📡</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444' }}>Source indisponible</div>
                <div style={{ color: '#888', fontSize: '14px', maxWidth: '400px' }}>
                  La source n'a pas pu charger. Si vous êtes hors de France, essayez un VPN. Sinon, essayez une autre source.
                </div>
                <button onClick={handleRetry} style={{
                  background: '#22d3ee', color: 'black',
                  border: 'none', padding: '10px 24px',
                  borderRadius: '8px', fontWeight: '800',
                  fontSize: '14px', cursor: 'pointer'
                }}>
                  🔄 Réessayer
                </button>
              </div>
            )}

            {/* Aucune source */}
            {isLive && liens.length === 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#0b0b0f', gap: '12px'
              }}>
                <div style={{ fontSize: '40px' }}>📡</div>
                <div style={{ fontSize: '16px', color: '#888' }}>Aucune source disponible pour le moment</div>
              </div>
            )}
          </div>

          {/* SÉLECTEUR DE SOURCES */}
          {isLive && liens.length > 0 && (
            <div style={{
              background: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '20px'
            }}>
              <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '14px', color: '#ccc' }}>
                📺 Sources disponibles
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {liens.map((lien, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedSource(i); setPlayerError(false); }}
                    style={{
                      background: selectedSource === i ? '#22d3ee' : '#1a1a24',
                      color: selectedSource === i ? 'black' : 'white',
                      border: `1px solid ${selectedSource === i ? '#22d3ee' : '#2a2a3a'}`,
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📺 {lien.nom || `Source ${i + 1}`}
                    {lien.qualite && (
                      <span style={{
                        background: selectedSource === i ? 'rgba(0,0,0,0.2)' : '#2a2a3a',
                        padding: '2px 6px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: '600'
                      }}>
                        {lien.qualite}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '12px', color: '#555', fontSize: '12px' }}>
                Si une source ne fonctionne pas, essayez une autre source ou utilisez un VPN.
              </div>
            </div>
          )}

          {/* RECONNEXION INFO */}
          {isLive && (
            <div style={{
              background: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '14px',
              padding: '16px 24px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#888',
              fontSize: '13px'
            }}>
              <span>🔄</span>
              <span>Reconnexion en cours automatiquement si la source coupe...</span>
            </div>
          )}

          {/* VOUS REGARDEZ */}
          <div style={{
            background: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '20px'
          }}>
            <div style={{ color: '#888', fontSize: '13px', marginBottom: '6px' }}>Vous regardez</div>
            <div style={{ fontWeight: '800', fontSize: '18px' }}>
              {match.equipe_domicile} — {match.equipe_exterieur}
            </div>
            <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>{match.competition}</div>
          </div>

          {/* DISCORD CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #5865f2, #4752c4)',
            borderRadius: '14px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>
              Rejoignez la communauté Footizi
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '16px' }}>
              Discussions live, alertes matchs, et plus encore sur notre Discord !
            </div>
            <a
              href="https://discord.gg/YhJDgrfauT"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'white', color: '#5865f2',
                padding: '12px 28px', borderRadius: '10px',
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
          fontSize: '13px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '900', marginBottom: '6px' }}>
            <span style={{ color: 'white' }}>Foot</span>
            <span style={{ color: '#22d3ee' }}>izi</span> ⚽
          </div>
          <p style={{ margin: '0' }}>Ce site ne stocke aucune vidéo. Les flux sont fournis par des tiers.</p>
        </footer>
      </div>
    </>
  );
}
