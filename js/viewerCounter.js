import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://cauctdopucifmsocjupb.supabase.co',     // ton URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdWN0ZG9wdWNpZm1zb2NqdXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Njc0NTUsImV4cCI6MjA5MTI0MzQ1NX0.cvNTmmclUbwYLLvkVvAIff2R5diqzg1lQIJSucm9W5o'          // clé anon (pas la secret key !)
);

const registeredPages = new Set();

export async function initViewerCounter(pageName, elementId, readonly = false) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // --- Ajouter le viewer au chargement ---
  if (!readonly && !registeredPages.has(pageName)) {
    registeredPages.add(pageName);

    // Incrémenter à l'arrivée
    await supabase.rpc('increment_viewer', { page: pageName });

    // Décrémenter quand l'utilisateur quitte
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/api/decrement', JSON.stringify({ page: pageName }));
    });
  }

  // --- Lire le count en temps réel ---
  const channel = supabase
    .channel('viewers-' + pageName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'viewers',
        filter: `page_name=eq.${pageName}`
      },
      (payload) => {
        el.textContent = payload.new.count ?? 0;
      }
    )
    .subscribe();

  // Valeur initiale
  const { data } = await supabase
    .from('viewers')
    .select('count')
    .eq('page_name', pageName)
    .single();

  el.textContent = data?.count ?? 0;
}

export function autoInitCounters() {
  const elements = document.querySelectorAll('[data-viewer-counter]');

  elements.forEach((el) => {
    const pageName = el.getAttribute('data-viewer-counter');
    const isReadonly = el.hasAttribute('data-viewer-readonly');

    if (!el.id) el.id = 'cnt_' + Math.random().toString(36).substr(2, 5);

    initViewerCounter(pageName, el.id, isReadonly);
  });
}

autoInitCounters();
