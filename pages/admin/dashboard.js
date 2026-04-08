import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import styles from '../../styles/Admin.module.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const VIDE = {
  titre: '',
  competition: '',
  equipe_domicile: '',
  equipe_exterieur: '',
  logo_domicile: '',
  logo_exterieur: '',
  date_match: '',
  lien_stream_1: '',
  lien_stream_2: '',
  lien_stream_3: '',
  est_en_cours: false
};

export default function Dashboard() {
  const [diffusions, setDiffusions] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchDiffusions();
  }, []);

  async function fetchDiffusions() {
    const { data } = await supabase
      .from('diffusions')
      .select('*')
      .order('date_match', { ascending: true });
    if (data) setDiffusions(data);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      titre: form.titre || `${form.equipe_domicile} vs ${form.equipe_exterieur}`,
      competition: form.competition,
      equipe_domicile: form.equipe_domicile,
      equipe_exterieur: form.equipe_exterieur,
      logo_domicile: form.logo_domicile,
      logo_exterieur: form.logo_exterieur,
      date_match: form.date_match,
      lien_stream_1: form.lien_stream_1,
      lien_stream_2: form.lien_stream_2,
      lien_stream_3: form.lien_stream_3,
      est_en_cours: form.est_en_cours
    };

    if (editId) {
      await supabase.from('diffusions').update(payload).eq('id', editId);
      setMessage('✅ Diffusion modifiée avec succès !');
    } else {
      await supabase.from('diffusions').insert([payload]);
      setMessage('✅ Diffusion créée avec succès !');
    }

    setForm(VIDE);
    setEditId(null);
    setShowForm(false);
    setLoading(false);
    fetchDiffusions();
    setTimeout(() => setMessage(''), 4000);
  }

  function handleEdit(d) {
    const dateForInput = new Date(d.date_match).toISOString().slice(0, 16);
    setForm({
      titre: d.titre || '',
      competition: d.competition || '',
      equipe_domicile: d.equipe_domicile || '',
      equipe_exterieur: d.equipe_exterieur || '',
      logo_domicile: d.logo_domicile || '',
      logo_exterieur: d.logo_exterieur || '',
      date_match: dateForInput,
      lien_stream_1: d.lien_stream_1 || '',
      lien_stream_2: d.lien_stream_2 || '',
      lien_stream_3: d.lien_stream_3 || '',
      est_en_cours: d.est_en_cours || false
    });
    setEditId(d.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette diffusion ?')) return;
    await supabase.from('diffusions').delete().eq('id', id);
    setMessage('🗑️ Diffusion supprimée.');
    fetchDiffusions();
    setTimeout(() => setMessage(''), 3000);
  }

  async function toggleLive(id, currentStatus) {
    await supabase
      .from('diffusions')
      .update({ est_en_cours: !currentStatus })
      .eq('id', id);
    fetchDiffusions();
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  }

  const totalLive = diffusions.filter(d => d.est_en_cours).length;
  const totalAVenir = diffusions.filter(d => !d.est_en_cours).length;

  return (
    <div className={styles.dashboard}>

      {/* HEADER ADMIN */}
      <header className={styles.adminHeader}>
        <div className={styles.adminHeaderContent}>
          <div className={styles.adminLogo}>
            <span className={styles.logoFoot}>Foot</span>
            <span className={styles.logoIzi}>izi</span>
            <span> ⚽ Admin</span>
          </div>
          <div className={styles.adminActions}>
            <a href="/" target="_blank" className={styles.viewSiteBtn}>
              👁️ Voir le site
            </a>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className={styles.dashboardContent}>

        {/* MESSAGE */}
        {message && (
          <div className={styles.message}>{message}</div>
        )}

        {/* STATS */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{diffusions.length}</span>
            <span className={styles.statLabel}>Total diffusions</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum} style={{color: '#ff4444'}}>{totalLive}</span>
            <span className={styles.statLabel}>🔴 En direct</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{totalAVenir}</span>
            <span className={styles.statLabel}>📅 À venir</span>
          </div>
        </div>

        {/* BOUTON AJOUTER */}
        <button
          className={styles.addBtn}
          onClick={() => {
            setForm(VIDE);
            setEditId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '✕ Fermer le formulaire' : '+ Ajouter une diffusion'}
        </button>

        {/* FORMULAIRE */}
        {showForm && (
          <div className={styles.formCard}>
            <h2>{editId ? '✏️ Modifier la diffusion' : '➕ Nouvelle diffusion'}</h2>

            <form onSubmit={handleSubmit} className={styles.adminForm}>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Titre (optionnel)</label>
                  <input
                    name="titre"
                    value={form.titre}
                    onChange={handleChange}
                    placeholder="Laisse vide = généré automatiquement"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Compétition</label>
                  <input
                    name="competition"
                    value={form.competition}
                    onChange={handleChange}
                    placeholder="UEFA Champions League"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Équipe domicile *</label>
                  <input
                    name="equipe_domicile"
                    value={form.equipe_domicile}
                    onChange={handleChange}
                    placeholder="PSG"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Équipe extérieur *</label>
                  <input
                    name="equipe_exterieur"
                    value={form.equipe_exterieur}
                    onChange={handleChange}
                    placeholder="Real Madrid"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Logo équipe domicile (URL image)</label>
                  <input
                    name="logo_domicile"
                    value={form.logo_domicile}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  {form.logo_domicile && (
                    <img
                      src={form.logo_domicile}
                      alt="preview"
                      style={{width: '40px', height: '40px', objectFit: 'contain', marginTop: '6px'}}
                    />
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Logo équipe extérieur (URL image)</label>
                  <input
                    name="logo_exterieur"
                    value={form.logo_exterieur}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  {form.logo_exterieur && (
                    <img
                      src={form.logo_exterieur}
                      alt="preview"
                      style={{width: '40px', height: '40px', objectFit: 'contain', marginTop: '6px'}}
                    />
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date et heure du match *</label>
                  <input
                    type="datetime-local"
                    name="date_match"
                    value={form.date_match}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroupCheck}>
                  <label>
                    <input
                      type="checkbox"
                      name="est_en_cours"
                      checked={form.est_en_cours}
                      onChange={handleChange}
                    />
                    <span>🔴 Mettre en direct maintenant</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>🔗 Lien Stream 1 *</label>
                <input
                  name="lien_stream_1"
                  value={form.lien_stream_1}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>🔗 Lien Stream 2 (optionnel)</label>
                <input
                  name="lien_stream_2"
                  value={form.lien_stream_2}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>🔗 Lien Stream 3 (optionnel)</label>
                <input
                  name="lien_stream_3"
                  value={form.lien_stream_3}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Enregistrement...' : editId ? '✏️ Modifier' : '✅ Créer la diffusion'}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setForm(VIDE);
                  }}
                >
                  Annuler
                </button>
              </div>

            </form>
          </div>
        )}

        {/* LISTE DES DIFFUSIONS */}
        <div className={styles.diffusionsList}>
          <h2>📺 Toutes les diffusions ({diffusions.length})</h2>

          {diffusions.length === 0 ? (
            <p className={styles.empty}>
              Aucune diffusion créée. Clique sur "Ajouter une diffusion" !
            </p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>Compétition</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Streams</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {diffusions.map(d => (
                    <tr key={d.id} className={d.est_en_cours ? styles.liveRow : ''}>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          {d.logo_domicile && (
                            <img src={d.logo_domicile} alt="" style={{width:'24px', height:'24px', objectFit:'contain'}} />
                          )}
                          <strong>{d.equipe_domicile}</strong>
                          <span style={{color:'#555'}}>vs</span>
                          <strong>{d.equipe_exterieur}</strong>
                          {d.logo_exterieur && (
                            <img src={d.logo_exterieur} alt="" style={{width:'24px', height:'24px', objectFit:'contain'}} />
                          )}
                        </div>
                      </td>
                      <td style={{color:'#8b949e'}}>{d.competition || '-'}</td>
                      <td style={{fontSize:'13px', color:'#8b949e'}}>
                        {new Date(d.date_match).toLocaleString('fr-FR', {
                          day:'2-digit', month:'2-digit', year:'numeric',
                          hour:'2-digit', minute:'2-digit'
                        })}
                      </td>
                      <td>
                        <button
                          className={`${styles.statusBtn} ${d.est_en_cours ? styles.statusLive : styles.statusSoon}`}
                          onClick={() => toggleLive(d.id, d.est_en_cours)}
                          title="Cliquer pour basculer le statut"
                        >
                          {d.est_en_cours ? '🔴 LIVE' : '📅 À venir'}
                        </button>
                      </td>
                      <td style={{fontSize:'18px'}}>
                        <span title="Stream 1">{d.lien_stream_1 ? '✅' : '❌'}</span>
                        <span title="Stream 2"> {d.lien_stream_2 ? '✅' : '➖'}</span>
                        <span title="Stream 3"> {d.lien_stream_3 ? '✅' : '➖'}</span>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(d)}
                            title="Modifier"
                          >✏️</button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(d.id)}
                            title="Supprimer"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
