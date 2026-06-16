// ── ETHOS AI · Chat Page ──

let conversationHistory = [];
let isTyping = false;
let activeConvId = null;
let allConversations = JSON.parse(localStorage.getItem('ethos_conversations') || '[]');
let focoMode = false;
let provocMode = false;
let recognition = null;
let isRecording = false;

// ── MESSAGES ──
function addMessage(role, content) {
  const container = document.getElementById('chat-container');
  const sugg = document.getElementById('suggestions-area');
  if (sugg) sugg.remove();

  const div = document.createElement('div');
  div.className = 'msg-enter';

  if (role === 'model') {
    div.innerHTML = `
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 opacity-60">
          <span class="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
          <span class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Nó Ethos</span>
        </div>
        <div class="max-w-2xl bg-white p-8 rounded-[24px] shadow-sm border border-surface-container-high">
          <div class="ai-prose font-body-lg text-body-lg leading-relaxed text-primary"><p>${renderMarkdown(content)}</p></div>
        </div>
      </div>`;
  } else {
    div.innerHTML = `
      <div class="flex flex-col items-end gap-2">
        <div class="max-w-xl bg-primary-container p-6 rounded-[24px] text-white shadow-md">
          <p class="font-body-md text-body-md leading-relaxed">${content}</p>
        </div>
      </div>`;
  }

  container.appendChild(div);
  const scroll = document.getElementById('chat-messages-scroll');
  if (scroll) setTimeout(() => scroll.scrollTop = scroll.scrollHeight, 50);
}

// ── API CALL ──
async function callGemini(userMessage) {
  conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

  let sysPrompt = SYSTEM_PROMPT;
  if (provocMode) sysPrompt += '\n\nMODO PROVOCAÇÃO ATIVO: Seja mais crítico, desafiador e socrático. Questione premissas implícitas na pergunta.';
  if (focoMode) sysPrompt += '\n\nFOCO PROFUNDO ATIVO: Elabore respostas mais completas, com mais camadas de análise e referências teóricas.';

  const body = {
    system_instruction: { parts: [{ text: sysPrompt }] },
    contents: conversationHistory,
    generationConfig: {
      temperature: provocMode ? 0.95 : 0.85,
      maxOutputTokens: focoMode ? 8192 : 4096,
      topP: 0.95
    }
  };

  const { url, headers } = buildGeminiRequest();
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ model: GEMINI_MODEL, body }) });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const partial = errData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (partial) {
      conversationHistory.push({ role: 'model', parts: [{ text: partial }] });
      return partial;
    }
    throw new Error(errData.error?.message || 'Erro na API');
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const reply = parts.map(p => p.text || '').join('').trim() || null;

  if (!reply) {
    const reason = data.candidates?.[0]?.finishReason;
    if (reason === 'SAFETY') throw new Error('Resposta bloqueada por filtro de segurança.');
    throw new Error('Resposta vazia da API.');
  }

  conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
  return reply;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || isTyping) return;

  input.value = '';
  input.style.height = 'auto';
  isTyping = true;

  addMessage('user', text);

  const thinking = document.getElementById('thinking-indicator');
  thinking.classList.remove('hidden');
  thinking.classList.add('flex');
  const s = document.getElementById('chat-messages-scroll');
  if (s) s.scrollTop = s.scrollHeight;

  try {
    const reply = await callGemini(text);
    thinking.classList.add('hidden');
    thinking.classList.remove('flex');
    addMessage('model', reply);
    saveCurrentConversation();
  } catch(e) {
    thinking.classList.add('hidden');
    thinking.classList.remove('flex');
    const lastMsg = document.getElementById('chat-container')?.lastElementChild;
    if (lastMsg) {
      const note = document.createElement('p');
      note.style.cssText = 'font-size:11px;color:#94492d;opacity:0.6;margin-top:8px;font-style:italic;font-family:Inter';
      note.textContent = '↳ Resposta incompleta — tente novamente.';
      lastMsg.appendChild(note);
    }
    if (conversationHistory.length > 1) saveCurrentConversation();
    console.warn('Gemini error:', e.message);
  }

  isTyping = false;
}

function sendSuggestion(btn) {
  const clone = btn.cloneNode(true);
  const icon = clone.querySelector('.material-symbols-outlined');
  if (icon) icon.remove();
  document.getElementById('chat-input').value = clone.textContent.trim();
  sendMessage();
}

// ── HISTORY ──
function saveCurrentConversation() {
  if (conversationHistory.length === 0) return;
  const title = conversationHistory[0]?.parts[0]?.text?.slice(0, 50) || 'Nova conversa';
  if (activeConvId) {
    const idx = allConversations.findIndex(c => c.id === activeConvId);
    if (idx >= 0) {
      allConversations[idx].messages = [...conversationHistory];
      allConversations[idx].title = title;
    }
  } else {
    activeConvId = generateId();
    allConversations.push({ id: activeConvId, title, createdAt: Date.now(), messages: [...conversationHistory] });
  }
  localStorage.setItem('ethos_conversations', JSON.stringify(allConversations));
  renderHistoryList();
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  if (allConversations.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  const existing = list.querySelectorAll('.hist-item');
  existing.forEach(e => e.remove());

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let lastGroup = '';

  [...allConversations].reverse().forEach(conv => {
    const d = new Date(conv.createdAt);
    const dStr = d.toDateString();
    const group = dStr === today ? 'Hoje' : dStr === yesterday ? 'Ontem' : d.toLocaleDateString('pt-BR', {day:'2-digit',month:'long'});

    if (group !== lastGroup) {
      lastGroup = group;
      const label = document.createElement('p');
      label.className = 'hist-item';
      label.style.cssText = 'font-family:Inter;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#737872;padding:8px 8px 4px;font-weight:600';
      label.textContent = group;
      list.appendChild(label);
    }

    const item = document.createElement('div');
    item.className = 'hist-item' + (conv.id === activeConvId ? ' active-conv' : '');
    item.style.cssText = 'border-radius:10px;padding:10px 12px;cursor:pointer;margin-bottom:2px';
    item.innerHTML = `
      <p style="font-family:Inter;font-size:13px;font-weight:500;color:#182a1d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px">${conv.title}</p>
      <p style="font-family:Inter;font-size:11px;color:#737872">${conv.messages.length} mensagens · ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p>`;
    item.onclick = () => loadConversation(conv.id);
    item.onmouseenter = () => {
      if (!item.querySelector('.del-btn')) {
        const del = document.createElement('button');
        del.className = 'del-btn';
        del.style.cssText = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;color:#ba1a1a;opacity:0.5;padding:4px';
        del.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">delete</span>';
        del.onclick = (e) => { e.stopPropagation(); deleteConversation(conv.id); };
        item.style.position = 'relative';
        item.appendChild(del);
      }
    };
    item.onmouseleave = () => {
      const del = item.querySelector('.del-btn');
      if (del) del.remove();
    };
    list.appendChild(item);
  });

  const badge = document.getElementById('hist-count');
  if (badge) {
    badge.textContent = allConversations.length;
    badge.style.display = allConversations.length > 0 ? 'inline' : 'none';
  }
}

function loadConversation(id) {
  const conv = allConversations.find(c => c.id === id);
  if (!conv) return;
  activeConvId = id;
  conversationHistory = [...conv.messages];

  const container = document.getElementById('chat-container');
  container.innerHTML = '';
  const sugg = document.getElementById('suggestions-area');
  if (sugg) sugg.remove();

  conversationHistory.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'msg-enter';
    if (msg.role === 'model') {
      div.innerHTML = `<div class="flex flex-col gap-3"><div class="flex items-center gap-2 opacity-60"><span class="material-symbols-outlined text-primary text-[18px]">auto_awesome</span><span class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Nó Ethos</span></div><div class="max-w-2xl bg-white p-8 rounded-[24px] shadow-sm border border-surface-container-high"><div class="ai-prose font-body-lg text-body-lg leading-relaxed text-primary"><p>${renderMarkdown(msg.parts[0].text)}</p></div></div></div>`;
    } else {
      div.innerHTML = `<div class="flex flex-col items-end gap-2"><div class="max-w-xl bg-primary-container p-6 rounded-[24px] text-white shadow-md"><p class="font-body-md text-body-md leading-relaxed">${msg.parts[0].text}</p></div></div>`;
    }
    container.appendChild(div);
  });

  const scroll = document.getElementById('chat-messages-scroll');
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
  renderHistoryList();
}

function deleteConversation(id) {
  allConversations = allConversations.filter(c => c.id !== id);
  localStorage.setItem('ethos_conversations', JSON.stringify(allConversations));
  if (activeConvId === id) { activeConvId = null; newConversation(); }
  else renderHistoryList();
}

function newConversation() {
  conversationHistory = [];
  activeConvId = null;
  const container = document.getElementById('chat-container');
  container.innerHTML = '';
  if (!document.getElementById('suggestions-area')) {
    const sugg = document.createElement('div');
    sugg.id = 'suggestions-area';
    sugg.className = 'mb-10';
    sugg.style.cssText = 'max-width:640px;margin-left:auto;margin-right:auto';
    sugg.innerHTML = `<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-6 opacity-70">Como posso ajudar sua pesquisa?</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button onclick="sendSuggestion(this)" class="text-left p-4 bg-white rounded-2xl border border-surface-container-high hover:border-secondary/40 hover:shadow-md transition-all text-sm text-on-surface-variant"><span class="material-symbols-outlined text-secondary text-[18px] block mb-2">eco</span>Como pesquisar com comunidades indígenas de forma não-extrativista?</button>
      <button onclick="sendSuggestion(this)" class="text-left p-4 bg-white rounded-2xl border border-surface-container-high hover:border-secondary/40 hover:shadow-md transition-all text-sm text-on-surface-variant"><span class="material-symbols-outlined text-secondary text-[18px] block mb-2">history_edu</span>Qual a diferença entre se inspirar em saberes ancestrais e extraí-los?</button>
      <button onclick="sendSuggestion(this)" class="text-left p-4 bg-white rounded-2xl border border-surface-container-high hover:border-secondary/40 hover:shadow-md transition-all text-sm text-on-surface-variant"><span class="material-symbols-outlined text-secondary text-[18px] block mb-2">person_search</span>Como validar soluções de design sem impor minha visão ao usuário?</button>
      <button onclick="sendSuggestion(this)" class="text-left p-4 bg-white rounded-2xl border border-surface-container-high hover:border-secondary/40 hover:shadow-md transition-all text-sm text-on-surface-variant"><span class="material-symbols-outlined text-secondary text-[18px] block mb-2">psychology</span>O que significa design decolonial na prática?</button>
    </div>`;
    container.parentElement.insertBefore(sugg, container);
  }
  renderHistoryList();
}

// ── VOICE ──
function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Seu navegador não suporta reconhecimento de voz. Use o Chrome.');
    return;
  }
  if (!isRecording) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      document.getElementById('chat-input').value = t;
    };
    recognition.onend = () => {
      isRecording = false;
      document.getElementById('pulse-ring').classList.add('hidden');
      document.getElementById('voice-btn').classList.remove('bg-on-secondary-fixed-variant');
      document.getElementById('voice-status-label').textContent = 'Voz';
    };
    recognition.start();
    isRecording = true;
    document.getElementById('pulse-ring').classList.remove('hidden');
    document.getElementById('voice-btn').classList.add('bg-on-secondary-fixed-variant');
    document.getElementById('voice-status-label').textContent = 'Gravando...';
  } else {
    recognition.stop();
    isRecording = false;
  }
}

// ── MODES ──
function toggleFoco() {
  focoMode = !focoMode;
  const btn = document.getElementById('btn-foco');
  const dot = document.getElementById('dot-foco');
  btn.style.opacity = focoMode ? '1' : '0.4';
  dot.style.transform = focoMode ? 'scale(1.6)' : 'scale(1)';
  dot.style.boxShadow = focoMode ? '0 0 0 3px rgba(24,42,29,0.15)' : '';
  showToast(focoMode ? '🌿 Foco Profundo ativado' : 'Foco Profundo desativado');
}

function toggleProvocacao() {
  provocMode = !provocMode;
  const btn = document.getElementById('btn-prov');
  const dot = document.getElementById('dot-prov');
  btn.style.opacity = provocMode ? '1' : '0.4';
  dot.style.background = provocMode ? '#94492d' : '';
  dot.style.transform = provocMode ? 'scale(1.6)' : 'scale(1)';
  dot.style.boxShadow = provocMode ? '0 0 0 3px rgba(148,73,45,0.15)' : '';
  showToast(provocMode ? '🔥 Modo Provocação ativado' : 'Modo Provocação desativado');
}

// ── MOBILE HISTORY DRAWER ──
function openMobileHistory() {
  const drawer = document.getElementById('mobile-history-drawer');
  const mlist = document.getElementById('mobile-history-list');
  drawer.classList.add('open');
  mlist.innerHTML = '';
  const allConvs = JSON.parse(localStorage.getItem('ethos_conversations') || '[]');
  if (allConvs.length === 0) {
    mlist.innerHTML = '<p style="font-family:Inter;font-size:12px;color:#737872;text-align:center;padding:2rem 1rem">Nenhuma conversa ainda.</p>';
    return;
  }
  [...allConvs].reverse().forEach(conv => {
    const item = document.createElement('div');
    item.style.cssText = 'border-radius:10px;padding:10px 12px;cursor:pointer;margin-bottom:2px';
    item.innerHTML = `<p style="font-family:Inter;font-size:13px;font-weight:500;color:#182a1d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px">${conv.title}</p><p style="font-family:Inter;font-size:11px;color:#737872">${conv.messages.length} mensagens</p>`;
    item.onmouseenter = () => item.style.background = '#f5f3ef';
    item.onmouseleave = () => item.style.background = 'transparent';
    item.onclick = () => { loadConversation(conv.id); closeMobileHistory(); };
    mlist.appendChild(item);
  });
}

function closeMobileHistory() {
  document.getElementById('mobile-history-drawer').classList.remove('open');
}

// ── SEARCH ──
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll('#history-list .hist-item').forEach(item => {
      if (!item.querySelector('p')) return;
      const text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  });
}

// ── INIT ──
function initChatPage() {
  if (!requireAuth()) return;
  initSidebar('chat');
  renderHistoryList();
  initSearch();

  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // Check if a topic was passed from the graph page
  const topic = sessionStorage.getItem('ethos_chat_topic');
  if (topic) {
    sessionStorage.removeItem('ethos_chat_topic');
    setTimeout(() => {
      document.getElementById('chat-input').value = topic;
      document.getElementById('chat-input').focus();
    }, 300);
  }

  // Mobile: show history drawer when clicking "Conversas" nav
  document.getElementById('nav-chat')?.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      document.getElementById('sidebar').classList.remove('open');
      openMobileHistory();
    }
  });
}
