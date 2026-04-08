import Head from 'next/head';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from '../styles/Home.module.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [diffusionsEnCours, setDiffusionsEnCours] = useState([]);
  const [diffusionsAVenir, setDiffusionsAVenir] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState(null);
  const [activeStreamNum, setActiveStreamNum] = useState(1);

  useEffect(() => {
    fetchDiffusions();
    const interval = setInterval(fetchDiffusions, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDiffusions() {
    const { data, error } = await supabase
      .from('diffusions')
      .select('*')
      .order('date_match', { ascending: true });

    if (data) {
      setDiffusionsEnCours(data.filter(d => d.est_en_cours));
      setDiffusionsAVenir(data.filter(d => !d.est_en_cours));
    }
    setLoading(false);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getTimeUntil(dateString) {
    const now = new Date();
    const matchDate = new Date(dateString);
    const diff = matchDate - now;
    
    if (diff < 0) return 'En cours';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) return `Dans ${hours}h${minutes}min`;
    return `Dans ${minutes} min`;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Footizi - Streaming Football Gratuit</title>
        <meta name="description" content="Regardez vos matchs de football en streaming gratuit" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <span className={styles.logoFoot}>Foot</span>
            <span className={styles.logoIzi}>izi</span>
            <span className={styles.logoIcon}>⚽</span>
          </div>
          <nav className={styles.nav}>
            <a href="https://discord.gg/YhJDgrfauT" target="_blank" rel="noopener noreferrer" className={styles.discordBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.09.118 18.12.14 18.14a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord
            </a>
          </nav>
        </div>
      </header>

      {/* PLAYER */}
      {activeStream && (
        <div className={styles.playerSection}>
          <div className={styles.playerContainer}>
            <div className={styles.playerHeader}>
              <span>🔴 EN DIRECT - {activeStream.equipe_domicile} vs {activeStream.equipe_exterieur}</span>
              <div className={styles.streamButtons}>
                {activeStream.lien_stream_1 && (
                  <button 
                    className={`${styles.streamBtn} ${activeStreamNum === 1 ? styles.active : ''}`}
                    onClick={() => setActiveStreamNum(1)}
                  >Lien 1</button>
                )}
                {activeStream.lien_stream_2 && (
                  <button 
                    className={`${styles.streamBtn} ${activeStreamNum === 2 ? styles.active : ''}`}
                    onClick={() => setActiveStreamNum(2)}
                  >Lien 2</button>
                )}
                {activeStream.lien_stream_3 && (
                  <button 
                    className={`${styles.streamBtn} ${activeStreamNum === 3 ? styles.active : ''}`}
                    onClick={() => setActiveStreamNum(3)}
                  >Lien 3</button>
                )}
                <button className={styles.closeBtn} onClick={() => setActiveStream(null)}>✕ Fermer</button>
              </div>
            </div>
            <div className={styles.iframeWrapper}>
              <iframe
                src={
                  activeStreamNum === 1 ? activeStream.lien_stream_1 :
                  activeStreamNum === 2 ? activeStream.lien_stream_2 :
                  activeStream.lien_stream_3
                }
                allowFullScreen
                scrolling="no"
                frameBorder="0"
                className={styles.iframe}
              />
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        
        {/* SECTION EN COURS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.liveIndicator}>🔴 LIVE</span>
            Matchs en cours
          </h2>
          
          {loading ? (
            <div className={styles.loading}>Chargement...</div>
          ) : diffusionsEnCours.length === 0 ? (
            <div className={styles.noMatch}>Aucun match en direct pour le moment</div>
          ) : (
            <div className={styles.matchGrid}>
              {diffusionsEnCours.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isLive={true}
                  onWatch={() => { setActiveStream(match); setActiveStreamNum(1); window.scrollTo(0,0); }}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </section>

        {/* SECTION A VENIR */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            📅 Prochains matchs
          </h2>
          
          {loading ? (
            <div className={styles.loading}>Chargement...</div>
          ) : diffusionsAVenir.length === 0 ? (
            <div className={styles.noMatch}>Aucun match programmé</div>
          ) : (
            <div className={styles.matchGrid}>
              {diffusionsAVenir.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isLive={false}
                  onWatch={() => { setActiveStream(match); setActiveStreamNum(1); window.scrollTo(0,0); }}
                  formatDate={formatDate}
                  getTimeUntil={getTimeUntil}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <span className={styles.logoFoot}>Foot</span>
            <span className={styles.logoIzi}>izi</span>
            <span className={styles.logoIcon}>⚽</span>
          </div>
          <p className={styles.footerText}>
            Streaming football gratuit • Tous les matchs en direct
          </p>
          <a href="https://discord.gg/YhJDgrfauT" target="_blank" rel="noopener noreferrer" className={styles.footerDiscord}>
            Rejoindre le Discord
          </a>
          <p className={styles.footerDisclaimer}>
            Ce site ne stocke aucune vidéo. Les flux sont fournis par des tiers.
          </p>
        </div>
      </footer>
    </div>
  );
}

function MatchCard({ match, isLive, onWatch, formatDate, getTimeUntil }) {
  return (
    <div className={`${styles.matchCard} ${isLive ? styles.liveCard : ''}`}>
      {isLive && <div className={styles.liveBadge}>🔴 LIVE</div>}
      
      <div className={styles.competition}>
        {match.competition || 'Football'}
      </div>
      
      <div className={styles.teams}>
        <div className={styles.team}>
          {match.logo_domicile && (
            <img src={match.logo_domicile} alt={match.equipe_domicile} className={styles.teamLogo} />
          )}
          <span className={styles.teamName}>{match.equipe_domicile}</span>
        </div>
        
        <div className={styles.vs}>VS</div>
        
        <div className={styles.team}>
          {match.logo_exterieur && (
            <img src={match.logo_exterieur} alt={match.equipe_exterieur} className={styles.teamLogo} />
          )}
          <span className={styles.teamName}>{match.equipe_exterieur}</span>
        </div>
      </div>
      
      <div className={styles.matchInfo}>
        {isLive ? (
          <span className={styles.matchTime}>En cours</span>
        ) : (
          <span className={styles.matchTime}>{formatDate(match.date_match)}</span>
        )}
      </div>

      {!isLive && getTimeUntil && (
        <div className={styles.countdown}>{getTimeUntil(match.date_match)}</div>
      )}
      
      <button 
        className={`${styles.watchBtn} ${isLive ? styles.watchBtnLive : styles.watchBtnSoon}`}
        onClick={onWatch}
        disabled={!isLive && !match.lien_stream_1}
      >
        {isLive ? '▶ Regarder' : match.lien_stream_1 ? '▶ Regarder' : '🔔 Bientôt disponible'}
      </button>
    </div>
  );
}
