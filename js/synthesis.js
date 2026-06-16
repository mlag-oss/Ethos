// ── ETHOS AI · Synthesis List Page ──

function renderSynthesisList() {
  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]');
  const list = document.getElementById('synthesis-list');
  const empty = document.getElementById('synthesis-empty');
  list.innerHTML = '';

  if (studies.length === 0) {
    empty.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 2rem;text-align:center';
    return;
  }
  empty.style.display = 'none';

  const bgColors = ['bg-primary-container','bg-secondary-container','bg-tertiary-container','bg-surface-container-high'];
  const textColors = ['text-on-primary-container','text-on-secondary-container','text-tertiary-fixed-dim','text-on-surface-variant'];

  studies.forEach((study, i) => {
    const bg = bgColors[i % bgColors.length];
    const tc = textColors[i % textColors.length];
    const date = new Date(study.createdAt).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'});
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-5 border border-surface-container-high flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group';
    card.onclick = () => location.href = '/synthesis-detail?id=' + study.id;
    card.innerHTML = `
      <div class="w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${tc} flex-shrink-0">
        <span class="material-symbols-outlined text-[22px]">${study.icon || 'hub'}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-label-md text-primary font-semibold truncate">${study.title}</p>
        <p class="font-label-sm text-on-surface-variant mt-0.5 truncate">${study.sub || 'Em construção'}</p>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0">
        <span class="px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-label-sm text-[11px]">${study.tag}</span>
        <span class="font-label-sm text-[11px] text-on-surface-variant opacity-60">${date}</span>
        <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
      </div>`;
    list.appendChild(card);
  });
}

function createNewStudy() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(24,42,29,0.5);z-index:400;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = `
    <div style="background:#FDFBF7;border-radius:28px;padding:2.5rem;max-width:480px;width:100%;box-shadow:0 24px 80px rgba(24,42,29,0.2)">
      <h3 style="font-family:'Hanken Grotesk';font-size:20px;font-weight:600;color:#182a1d;margin-bottom:1.5rem">Novo Estudo</h3>
      <label style="font-family:Inter;font-size:12px;color:#737872;display:block;margin-bottom:4px">Título</label>
      <input id="new-study-title" type="text" placeholder="Ex: Encontro 2 — Cartografia ancestral" style="width:100%;padding:12px 16px;border:1px solid #c3c8c1;border-radius:12px;font-family:Inter;font-size:14px;background:#fff;outline:none;margin-bottom:1rem;color:#1b1c1a;box-sizing:border-box">
      <label style="font-family:Inter;font-size:12px;color:#737872;display:block;margin-bottom:4px">Subtítulo</label>
      <input id="new-study-sub" type="text" placeholder="Ex: Metodologias de campo não-extrativistas" style="width:100%;padding:12px 16px;border:1px solid #c3c8c1;border-radius:12px;font-family:Inter;font-size:14px;background:#fff;outline:none;margin-bottom:1rem;color:#1b1c1a;box-sizing:border-box">
      <label style="font-family:Inter;font-size:12px;color:#737872;display:block;margin-bottom:4px">Tag</label>
      <select id="new-study-tag" style="width:100%;padding:10px 16px;border:1px solid #c3c8c1;border-radius:12px;font-family:Inter;font-size:14px;background:#fff;color:#1b1c1a;outline:none;margin-bottom:1.5rem">
        <option>Design Decolonial</option>
        <option>Pesquisa de Campo</option>
        <option>Saberes Ancestrais</option>
        <option>Artefato Especulativo</option>
        <option>Cartografia</option>
      </select>
      <div style="display:flex;gap:10px">
        <button onclick="saveNewStudy(this)" style="flex:1;padding:12px;background:#182a1d;color:#fff;border:none;border-radius:12px;font-family:Inter;font-size:14px;font-weight:500;cursor:pointer">Criar estudo</button>
        <button onclick="this.closest('[style*=fixed]').remove()" style="padding:12px 20px;background:transparent;border:1px solid #c3c8c1;border-radius:12px;font-family:Inter;font-size:14px;cursor:pointer;color:#434843">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => document.getElementById('new-study-title')?.focus(), 100);
}

function saveNewStudy(btn) {
  const title = document.getElementById('new-study-title').value.trim();
  const sub = document.getElementById('new-study-sub').value.trim();
  const tag = document.getElementById('new-study-tag').value;
  if (!title) return;

  const id = 'study_' + Date.now();
  const icons = {'Design Decolonial':'eco','Pesquisa de Campo':'travel_explore','Saberes Ancestrais':'history_edu','Artefato Especulativo':'science','Cartografia':'map'};
  const icon = icons[tag] || 'hub';

  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]');
  studies.push({ id, title, sub, tag, icon, createdAt: Date.now() });
  localStorage.setItem('ethos_studies', JSON.stringify(studies));

  btn.closest('[style*=fixed]').remove();
  renderSynthesisList();
  showToast('✓ Estudo criado');
}

// ── INIT ──
function initSynthesisPage() {
  if (!requireAuth()) return;
  initSidebar('synthesis');
  renderSynthesisList();
}
