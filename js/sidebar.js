// ── ETHOS AI · Sidebar ──
// Injects the shared sidebar + header and sets active nav based on current page

function initSidebar(activePage) {
  const allConvs = JSON.parse(localStorage.getItem('ethos_conversations') || '[]');
  const histCount = allConvs.length;

  // ── SIDEBAR ──
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <div class="mb-10 px-2">
      <h1 class="font-headline-md text-headline-md text-primary tracking-tight">Ethos AI</h1>
      <p class="font-label-sm text-label-sm text-on-surface-variant opacity-60">Modo de Pesquisa Profunda</p>
    </div>
    <nav class="flex-1 space-y-2">
      <a onclick="location.href='/chat'" class="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md text-on-surface-variant cursor-pointer ${activePage==='chat'?'active-nav':''}" id="nav-chat">
        <span class="material-symbols-outlined">forum</span>
        <span>Conversas</span>
        <span id="hist-count" style="margin-left:auto;font-size:11px;background:#eae8e4;color:#434843;padding:1px 7px;border-radius:100px;${histCount>0?'':'display:none'}">${histCount}</span>
      </a>
      <a onclick="location.href='/synthesis'" class="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md text-on-surface-variant cursor-pointer ${activePage==='synthesis'||activePage==='synthesis-detail'?'active-nav':''}" id="nav-synthesis">
        <span class="material-symbols-outlined">hub</span>
        <span>Sínteses Ethos</span>
      </a>
      <a onclick="location.href='/graph'" class="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md text-on-surface-variant cursor-pointer ${activePage==='graph'?'active-nav':''}" id="nav-graph">
        <span class="material-symbols-outlined">account_tree</span>
        <span>Grafo de Conhecimento</span>
      </a>
    </nav>
    <div class="mt-auto pt-6 border-t border-outline-variant/30">
      <div class="flex items-center gap-3 px-2 mt-2">
        <div class="user-avatar w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-md font-bold flex-shrink-0 overflow-hidden">MA</div>
        <div class="overflow-hidden flex-1">
          <p class="user-name font-label-md text-label-md truncate text-primary">Maria Luíza</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant opacity-70">Pesquisador(a)</p>
        </div>
        <button onclick="signOut()" title="Sair" class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors flex-shrink-0">
          <span class="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    </div>`;

  // ── HEADER ──
  const pageTitles = {
    chat: 'Santuário de Pesquisa Ethos',
    synthesis: 'Hub de Integração Eco-Cultural',
    'synthesis-detail': 'Hub de Integração Eco-Cultural',
    graph: 'Grafo de Conhecimento'
  };
  const pageSubs = {
    chat: 'A Era do Curupira',
    synthesis: 'Síntese Ativa',
    'synthesis-detail': 'Síntese Ativa',
    graph: 'Conexões emergentes'
  };

  const header = document.getElementById('main-header');
  header.innerHTML = `
    <div class="flex items-center gap-4">
      <button class="md:hidden material-symbols-outlined text-primary" onclick="document.getElementById('sidebar').classList.toggle('open')">menu</button>
      <h2 class="font-headline-md text-headline-md text-primary" id="view-title">${pageTitles[activePage]||''}</h2>
      <div class="h-4 w-px bg-outline-variant mx-2 hidden md:block"></div>
      <span class="font-label-md text-label-md text-secondary hidden md:block">${pageSubs[activePage]||''}</span>
    </div>
    <div class="flex items-center gap-4">
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px]">search</span>
        <input id="search-input" class="bg-surface-container-low border-none rounded-full pl-9 pr-4 py-2 w-48 font-label-md focus:ring-2 focus:ring-secondary transition-all text-sm hidden md:block" placeholder="Buscar insights..." type="text">
      </div>
      <button onclick="activateSilence()" title="Modo Silêncio" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-secondary">
        <span class="material-symbols-outlined text-[20px]">do_not_disturb_on</span>
      </button>
      <div class="user-avatar w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm overflow-hidden">MA</div>
    </div>`;

  // Apply user info to avatars/names
  if (currentUser) applyUser(currentUser);
}

// ── SILENCE MODE (shared across all pages) ──
let silenceInterval;
function activateSilence() {
  document.getElementById('silence-overlay').classList.add('active');
  let s = 30;
  document.getElementById('silence-close-btn').style.display = 'none';
  document.getElementById('silence-timer').textContent = '0:30';
  silenceInterval = setInterval(() => {
    s--;
    document.getElementById('silence-timer').textContent = '0:' + String(s).padStart(2,'0');
    if (s <= 0) {
      clearInterval(silenceInterval);
      document.getElementById('silence-timer').textContent = '✓';
      document.getElementById('silence-quote').textContent = '"O silêncio passou. O que você percebeu que não havia percebido antes de pausar?"';
      document.getElementById('silence-close-btn').style.display = 'inline-block';
    }
  }, 1000);
}
function closeSilence() {
  clearInterval(silenceInterval);
  document.getElementById('silence-overlay').classList.remove('active');
  // After silence, go to chat
  setTimeout(() => { location.href = '/chat'; }, 400);
}
