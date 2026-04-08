import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import styles from '../../styles/Admin.module.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const VIDE = {
  titre: '', competition: '', equipe_domicile: '', equipe_exterieur: '',
  logo_domicile: '', logo_exterieur: '', date_match: '', 
  lien_stream_1: '', lien_stream_2: '', lien_stream_3: '',
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
    if (!token) { router.push('/admin'); return; }
    fetchDiffusions();
  }, []);

  async function fetchDiffusions() {
    const { data } = await supabase.from('diffusions').select('*').order('date_match', { ascending: true });
    if (data) setDiffusions(data);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      statut: form.est_en_cours ? 'en_cours' : 'a_venir'
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('diffusions').update(payload).eq('id', editId));
    } else {
      ({ error } = await supabase.from('diffusions').insert([payload]));
    }

    if (error) {
      setMessage('❌ Erreur : ' + error.message);
    } else {
      setMessage(editId ? '✅ Diffusion modifiée !' : '✅ Diffusion créée !');
      setForm(VIDE);
      setEditId(null);
      setShowForm(false);
      fetchDiffusions();
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette diffusion ?')) return;
    await supabase.from('diffusions').delete().eq('id', id);
    fetchDiffusions();
  }

  async function toggleLive(id, current) {
    await supabase.from('diffusions').update({ 
      est_en_cours: !current,
      statut: !current ? 'en_cours' : 'a_venir'
    }).eq('id', id);
    fetchDiffusions();
  }

  function handleEdit(match) {
    setForm({
      titre: match.titre || '',
      competition: match.competition || '',
      equipe_domicile: match.equipe_domicile || '',
      equipe_exterieur: match.equipe_exterieur || '',
      logo_domicile: match.logo_domicile || '',
      logo_exterieur: match.logo_exterieur || '',
      date_match: match.date_match ? match.date_match.slice(0,16) : '',
      lien_stream_1: match.lien_stream_1 || '',
      lien_stream_2: match.lien_stream_2 || '',
      lien_stream_3: match.lien_stream_3 || '',
      est_en_cours: match.est_en_cours || false
    });
    setEditId(match.id);
    setShowForm(true);
    window.scrollTo(0,0);
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  }

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
            <a href="/" target="_blank" className={styles.viewSiteBtn}>👁 Voir le site</a>
            <button onClick={handleLogout} className={styles.logoutBtn}>Déconnexion</button>
          </div>
        </div>
      </header>

      <div className={styles.dashboardContent}>
        {message && <div className={styles.message}>{message}</div>}

        {/* STATS */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{diffusions.filter(d => d.est_en_cours).length}</span>
            <span className={styles.statLabel}>🔴 En direct</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{diffusions.filter(d => !d.est_en_cours).length}</span>
            <span className={styles.statLabel}>📅 À venir</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{diffusions.length}</span>
            <span className={styles.statLabel}>📺 Total</span>
          </div>
        </div>

        {/* BOUTON AJOUTER */}
        <button 
          className={styles.addBtn}
          onClick={() => { setForm(VIDE); setEditId(null); setShowForm(!showForm); }}
        >
          {showForm ? '✕ Annuler' : '+ Ajouter une diffusion'}
        </button>

        {/* FORMULAIRE */}
        {showForm && (
          <div className={styles.formCard}>
            <h2>{editId ? '✏️ Modifier la diffusion' : '➕ Nouvelle diffusion'}</h2>
            <form onSubmit={handleSubmit} className={styles.adminForm}>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Titre du match *</label>
                  <input name="titre" value={form.titre} onChange={handleChange} placeholder="PSG vs Real Madrid" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Compétition</label>
                  <input name="competition" value={form.competition} onChange={handleChange} placeholder="UEFA Champions League" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Équipe domicile *</label>
                  <input name="equipe_domicile" value={form.equipe_domicile} onChange={handleChange} placeholder="PSG" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Équipe extérieur *</label>
                  <input name="equipe_exterieur" value={form.equipe_exterieur} onChange={handleChange} placeholder="Real Madrid" required />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Logo équipe domicile (URL)</label>
                  <input name="logo_domicile" value={form.logo_domicile} onChange={handleChange} placeholder="https://..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Logo équipe extérieur (URL)</label>
                  <input name="logo_exterieur" value={form.logo_exterieur} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date et heure du match *</label>
                  <input type="datetime-local" name="date_match" value={form.date_match} onChange={handleChange} required />
                </div>
                <div className={styles.formGroupCheck}>
                  <label>
                    <input type="checkbox" name="est_en_cours" checked={form.est_en_cours} onChange={handleChange} />
                    <span>🔴 Match en direct maintenant</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Lien Stream 1 *</label>
                <input name="lien_stream_1" value={form.lien_stream_1} onChange={handleChange} placeholder="https://..." required />
              </div>
              <div className={styles.formGroup}>
                <label>Lien Stream 2 (optionnel)</label>
                <input name="lien_stream_2" value={form.lien_stream_2} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className={styles.formGroup}>
                <label>Lien Stream 3 (optionnel)</label>
                <input name="lien_stream_3" value={form.lien_stream_3} onChange={handleChange} placeholder="https://..." />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Enregistrement...' : editId ? '✏️ Modifier' : '✅ Créer la diffusion'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => { setShowForm(false); setEditId(null); setForm(VIDE); }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTE DES DIFFUSIONS */}
        <div className={styles.diffusionsList}>
          <h2>📺 Toutes les diffusions</h2>
          
          {diffusions.length === 0 ? (
            <p className={styles.empty}>Aucune diffusion créée</p>
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
                        <strong>{d.equipe_domicile}</strong> vs <strong>{d.equipe_exterieur}</strong>
                      </td>
                      <td>{d.competition || '-'}</td>
                      <td>{new Date(d.date_match).toLocaleString('fr-FR')}</td>
                      <td>
                        <button 
                          className={`${styles.statusBtn} ${d.est_en_cours ? styles.statusLive : styles.statusSoon}`}
                          onClick={() => toggleLive(d.id, d.est_en_cours)}
                          title="Cliquer pour changer le statut"
                        >
                          {d.est_en_cours ? '🔴 LIVE' : '📅 À venir'}
                        </button>
                      </td>
                      <td>
                        {d.lien_stream_1 ? '✅' : '❌'}
                        {d.lien_stream_2 ? ' ✅' : ' ➖'}
                        {d.lien_stream_3 ? ' ✅' : ' ➖'}
                      </td>
                      <td className={styles.actionBtns}>
                        <button className={styles.editBtn} onClick={() => handleEdit(d)}>✏️</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(d.id)}>🗑️</button>
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
