import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const router = useRouter();
  const [diffusions, setDiffusions] = useState([]);
  const [loading, setLoading] = useState(true);

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
    router.push(`/watch?m=${match.id}`);
  }

  function MatchCard({ match, isLive }) {
    return (
      <div style={{
        background: '#111118',
        border: `1px solid ${isLive ? '#ef4444' : '#1e1e2e'}`,
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        cursor: 'pointer'
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {/* Barre top live */}
        {isLive && (
          <div style={{
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '1px'
          }}>
            <span style={{
              width: '8px', height: '8px',
              background: 'white', borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite'
            }}></span>
            LIVE
          </div>
        )}

        <div style={{ padding: '20px' }}>
          {/* Competition */}
          <div style={{
            color: '#888', fontSize: '11px',
            fontWeight: '700', letterSpacing: '1.5px',
            textTransform: 'uppercase', marginBottom: '20px'
          }}>
            {match.competition}
          </div>

          {/* Teams */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            {/* Equipe domicile */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              {match.logo_domicile ? (
                <img
                  src={match.logo_domicile}
                  alt={match.equipe_domicile}
                  style={{
                    width: '64px', height: '64px',
                    objectFit: 'contain', marginBottom: '10px',
                    display: 'block', margin: '0 auto 10px'
                  }}
                />
              ) : (
                <div style={{
                  width: '64px', height: '64px',
                  background: '#1e1e2e', borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 10px',
                  fontSize: '24px'
                }}>⚽</div>
              )}
              <div style={{ fontWeight: '800', fontSize: '14px' }}>
                {match.equipe_domicile}
              </div>
            </div>

            {/* VS */}
            <div style={{
              color: '#333', fontWeight: '900',
              fontSize: '18px', padding: '0 16px'
            }}>VS</div>

            {/* Equipe extérieur */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              {match.logo_exterieur ? (
                <img
                  src={match.logo_exterieur}
                  alt={match.equipe_exterieur}
                  style={{
                    width: '64px', height: '64px',
                    objectFit: 'contain', marginBottom: '10px',
                    display: 'block', margin: '0 auto 10px'
                  }}
                />
              ) : (
                <div style={{
                  width: '64px', height: '64px',
                  background: '#1e1e2e', borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 10px',
                  fontSize: '24px'
                }}>⚽</div>
              )}
              <div style={{ fontWeight: '800', fontSize: '14px' }}>
                {match.equipe_exterieur}
              </div>
            </div>
          </div>

          {/* Date ou statut */}
          {!isLive && match.date_match && (
            <div style={{
              color: '#888', fontSize: '12px',
              marginBottom: '14px', textAlign: 'center'
            }}>
              🗓 {formatDate(match.date_match)}
            </div>
          )}

          {/* Bouton Regarder */}
          <button
            onClick={() => openMatch(match)}
            style={{
              width: '100%',
              padding: '12px',
              background: isLive
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : 'linear-gradient(90deg, #22d3ee, #0891b2)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ▶ Regarder
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Footizi - Streaming Football Gratuit</title>
        <meta name="description" content="Regardez tous les matchs de football en direct gratuitement" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', background: '#0b0b0f', color: 'white', fontFamily: 'Inter, Segoe UI, sans-serif' }}>

        {/* HEADER */}
        <header style={{
          background: '#0f0f14',
          borderBottom: '1px solid #1e1e2e',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '26px', fontWeight: '900' }}>
                <span style={{ color: 'white' }}>Foot</span>
                <span style={{ color: '#22d3ee' }}>izi</span>
              </span>
              <span style={{ marginLeft: '6px' }}>⚽</span>
            </Link>

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
              <svg width="16" height="16" viewBox="0 0 71 55" fill="white">
                <path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.7a40.9 40.9 0 0 0-1.8 3.7 54.2 54.2 0 0 0-16.3 0A39.7 39.7 0 0 0 25.6.7 58.4 58.4 0 0 0 11 4.9C1.6 19.1-.97 33 .31 46.7a59 59 0 0 0 18 9.1 44.6 44.6 0 0 0 3.8-6.3 38.4 38.4 0 0 1-6-2.9l1.5-1.1a42.1 42.1 0 0 0 36.2 0l1.5 1.1a38.3 38.3 0 0 1-6 2.9 44.4 44.4 0 0 0 3.8 6.3 58.7 58.7 0 0 0 18-9.1C72.2 30.9 68.2 17.1 60.1 4.9ZM23.8 38.4c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.5 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z"/>
              </svg>
              Discord
            </a>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888', fontSize: '16px' }}>
              Chargement des matchs...
            </div>
          ) : (
            <>
              {/* SECTION LIVE */}
              <section style={{ marginBottom: '48px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', marginBottom: '24px'
                }}>
                  <span style={{
                    width: '12px', height: '12px',
                    background: '#ef4444', borderRadius: '50%',
                    display: 'inline-block',
                    boxShadow: '0 0 8px #ef4444',
                    animation: 'pulse 1.5s infinite'
                  }}></span>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
                    LIVE <span style={{ color: '#888', fontWeight: '400', fontSize: '16px' }}>Matchs en cours</span>
                  </h2>
                </div>

                {live.length === 0 ? (
                  <div style={{
                    background: '#111118',
                    border: '1px solid #1e1e2e',
                    borderRadius: '14px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#555'
                  }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📡</div>
                    <div style={{ fontSize: '16px' }}>Aucun match en direct pour le moment</div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {live.map(match => (
                      <MatchCard key={match.id} match={match} isLive={true} />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION A VENIR */}
              <section>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', marginBottom: '24px'
                }}>
                  <span style={{ fontSize: '22px' }}>🗓</span>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
                    Prochains matchs
                  </h2>
                </div>

                {upcoming.length === 0 ? (
                  <div style={{
                    background: '#111118',
                    border: '1px solid #1e1e2e',
                    borderRadius: '14px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#555'
                  }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                    <div style={{ fontSize: '16px' }}>Aucun match à venir pour le moment</div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {upcoming.map(match => (
                      <MatchCard key={match.id} match={match} isLive={false} />
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
          padding: '30px 24px',
          textAlign: 'center',
          color: '#555',
          fontSize: '13px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>
            <span style={{ color: 'white' }}>Foot</span>
            <span style={{ color: '#22d3ee' }}>izi</span> ⚽
          </div>
          <p style={{ marginBottom: '6px' }}>Streaming football gratuit • Tous les matchs en direct</p>
          <a href="https://discord.gg/YhJDgrfauT" target="_blank" rel="noopener noreferrer"
            style={{ color: '#5865f2', textDecoration: 'none', fontWeight: '600' }}>
            Rejoindre le Discord
          </a>
          <p style={{ marginTop: '8px' }}>Ce site ne stocke aucune vidéo. Les flux sont fournis par des tiers.</p>
        </footer>
      </div>
    </>
  );
}
