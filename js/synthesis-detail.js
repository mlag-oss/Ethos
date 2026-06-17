// ── ETHOS AI · Synthesis Detail Page ──

let currentStudyId = null;

function getTagPalette(tag) {
  const p = {
    'Design Decolonial':     { a:'#96ab99', b:'#182a1d', c:'#4a7c59', l1:'#96ab99', l2:'#c8ddc5' },
    'Pesquisa de Campo':     { a:'#fd9e7b', b:'#94492d', c:'#c06030', l1:'#fd9e7b', l2:'#fec8a8' },
    'Saberes Ancestrais':    { a:'#c9b458', b:'#6b5b00', c:'#a08020', l1:'#c9b458', l2:'#e6d890' },
    'Artefato Especulativo': { a:'#7baafd', b:'#1a3460', c:'#3060a0', l1:'#7baafd', l2:'#b0ccf8' },
    'Cartografia':           { a:'#7bdfcf', b:'#1a5045', c:'#2a8070', l1:'#7bdfcf', l2:'#b0f0e8' },
  };
  return p[tag] || p['Design Decolonial'];
}

function getDefaultNodes(tag) {
  const d = {
    'Design Decolonial':     ['Território','Memória','Prática','Comunidade','Decolonidade'],
    'Pesquisa de Campo':     ['Campo','Observação','Contexto','Narrativa','Dado'],
    'Saberes Ancestrais':    ['Ancestralidade','Ritual','Terra','Transmissão','Tempo'],
    'Artefato Especulativo': ['Futuro','Imaginário','Corpo','Especulação','Tecnologia'],
    'Cartografia':           ['Lugar','Movimento','Limite','Representação','Escala'],
  };
  return d[tag] || ['Pesquisa','Análise','Síntese','Contexto','Descoberta'];
}

const NODE_ICONS = ['hub','eco','history_edu','travel_explore','science','map','lightbulb','psychology','biotech','landscape'];

function drawStudyCanvas(study) {
  const container = document.getElementById('study-canvas-container');
  if (!container) return;

  const pal = getTagPalette(study.tag);
  const synth = study.synthesis || {};
  const rawNodes = synth.nodes && synth.nodes.length >= 4 ? synth.nodes : getDefaultNodes(study.tag);
  const satellites = rawNodes.slice(0, rawNodes.length - 1);
  const centerLabel = rawNodes[rawNodes.length - 1];

  const W = container.getBoundingClientRect().width || container.offsetWidth || 800;
  const H = 460;
  const cx = W / 2, cy = H / 2;
  const radius = Math.min(W, H) * 0.30;

  let paths = '';
  satellites.forEach((_, i) => {
    const angle = (2 * Math.PI * i) / satellites.length - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const mx = cx + (radius * 0.45) * Math.cos(angle + 0.4);
    const my = cy + (radius * 0.45) * Math.sin(angle + 0.4);
    const color = i % 2 === 0 ? pal.l1 : pal.l2;
    paths += `<path class="flow-line" d="M ${cx},${cy} Q ${mx},${my} ${x},${y}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.45"/>`;
  });

  let nodesHtml = '';
  satellites.forEach((label, i) => {
    const angle = (2 * Math.PI * i) / satellites.length - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const bg = i % 2 === 0 ? pal.a : pal.b;
    const icon = NODE_ICONS[i % NODE_ICONS.length];
    const delay = (i * 0.55).toFixed(1);
    nodesHtml += `
      <div class="node-pulse node" style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;animation-delay:${delay}s">
        <div style="width:48px;height:48px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px ${bg}55;color:white">
          <span class="material-symbols-outlined" style="font-size:20px">${icon}</span>
        </div>
        <span style="font-size:10px;color:#182a1d;font-family:Inter;font-weight:500;white-space:nowrap;max-width:88px;text-align:center;line-height:1.3">${label}</span>
      </div>`;
  });

  const centerHtml = `
    <div style="position:absolute;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="width:72px;height:72px;border-radius:50%;border:3px solid ${pal.c};background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px ${pal.c}44;position:relative">
        <div style="position:absolute;inset:-4px;border-radius:50%;border:1px solid ${pal.c};animation:ping 2.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.2"></div>
        <span class="material-symbols-outlined" style="font-size:32px;color:${pal.c}">auto_awesome</span>
      </div>
      <span style="font-size:12px;font-family:'Hanken Grotesk';font-weight:700;color:#182a1d;letter-spacing:-0.01em;text-align:center;max-width:100px">${centerLabel}</span>
    </div>`;

  const miniProgress = synth.summary ? '75%' : '20%';
  const miniText = synth.summary ? synth.summary.slice(0, 80) + '…' : 'Clique em "Gerar síntese" para ativar os insights.';
  const miniCard = `
    <div style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.88);backdrop-filter:blur(12px);padding:14px 16px;border-radius:18px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 4px 20px rgba(0,0,0,0.07);max-width:185px">
      <p style="font-size:9px;letter-spacing:0.1em;color:${pal.c};font-family:Inter;text-transform:uppercase;margin-bottom:7px">SÍNTESE ATIVA</p>
      <div style="height:4px;background:#e8e8e4;border-radius:99px;overflow:hidden;margin-bottom:9px"><div style="height:100%;background:${pal.c};width:${miniProgress};transition:width 0.8s"></div></div>
      <p style="font-size:11px;color:#434843;font-family:Inter;line-height:1.5">${miniText}</p>
    </div>`;

  container.innerHTML = `
    <svg style="position:absolute;inset:0;width:100%;height:${H}px;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${paths}</svg>
    ${nodesHtml}
    ${centerHtml}
    ${miniCard}`;
}

function renderStudySynthesis(study) {
  const area = document.getElementById('synthesis-content-area');
  if (!area) return;
  const synth = study.synthesis || {};
  const pal = getTagPalette(study.tag);

  if (!synth.summary) {
    area.innerHTML = `
      <div class="bg-white rounded-[28px] p-10 border border-surface-container-high text-center shadow-sm">
        <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-5">
          <span class="material-symbols-outlined text-on-primary-container text-[32px]">auto_awesome</span>
        </div>
        <h4 class="font-headline-lg text-xl text-primary mb-3">Síntese não gerada</h4>
        <p class="text-on-surface-variant text-sm mb-6 max-w-sm mx-auto leading-relaxed">A IA vai analisar as conversas do projeto e gerar um resumo com os principais insights e conexões emergentes.</p>
        <button onclick="generateStudySynthesis('${study.id}')" class="px-6 py-3 bg-primary text-white rounded-xl font-label-md text-sm hover:bg-primary-container hover:text-on-primary-container transition-colors">
          Gerar síntese com IA
        </button>
      </div>`;
    return;
  }

  const insightsHtml = (synth.insights || []).map((ins, i) => `
    <div class="bg-white p-5 rounded-2xl border border-surface-container-high">
      <div class="w-8 h-8 rounded-full flex items-center justify-center mb-3" style="background:${pal.a}33;color:${pal.b}">
        <span class="material-symbols-outlined text-[16px]">lightbulb</span>
      </div>
      <p contenteditable="true" class="text-sm text-on-surface-variant leading-relaxed outline-none"
         style="cursor:text"
         onblur="saveStudyInsight('${study.id}',${i},this.textContent.trim())">${ins}</p>
    </div>`).join('');

  const genDate = synth.generatedAt ? new Date(synth.generatedAt).toLocaleString('pt-BR') : '';
  area.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-white p-8 rounded-[28px] shadow-sm border border-surface-container-high">
        <div class="flex gap-2 mb-5">
          <span class="px-3 py-1 rounded-full font-label-sm text-xs" style="background:${pal.a}22;color:${pal.b}">Fio Principal</span>
          <span class="px-3 py-1 rounded-full font-label-sm text-xs" style="background:${pal.b}12;color:${pal.b}">Síntese Ethos</span>
        </div>
        <p contenteditable="true" id="synthesis-summary-edit" class="text-on-surface-variant leading-relaxed text-base outline-none"
           style="cursor:text;border-bottom:2px solid transparent;transition:border-color 0.2s"
           onfocus="this.style.borderBottomColor='${pal.a}'"
           onblur="saveStudySummary('${study.id}',this.textContent.trim())">${synth.summary}</p>
        <button onclick="generateStudySynthesis('${study.id}')" class="mt-6 flex items-center gap-2 text-xs text-on-surface-variant opacity-40 hover:opacity-80 transition-all">
          <span class="material-symbols-outlined text-[14px]">refresh</span> Regenerar síntese
        </button>
      </div>
      <div class="flex flex-col gap-3">
        ${insightsHtml}
        <button onclick="location.href='/chat'" class="w-full border border-outline-variant hover:bg-surface-container-high py-3 rounded-xl transition-all font-label-md text-sm text-on-surface-variant mt-1">
          Explorar na Conversa →
        </button>
      </div>
    </div>
    ${genDate ? `<p class="text-xs text-on-surface-variant opacity-30 mt-4 text-right">Síntese gerada em ${genDate}</p>` : ''}`;
}

async function generateStudySynthesis(studyId) {
  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]');
  const study = studies.find(s => s.id === studyId);
  if (!study) return;

  const area = document.getElementById('synthesis-content-area');
  if (area) area.innerHTML = `
    <div class="bg-white rounded-[28px] p-10 border border-surface-container-high text-center shadow-sm">
      <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-5" style="animation:spin 1.5s linear infinite">
        <span class="material-symbols-outlined text-on-primary-container text-[32px]">auto_awesome</span>
      </div>
      <p class="text-primary font-semibold mb-2">Analisando conversas…</p>
      <p class="text-on-surface-variant text-sm">A IA está criando sua síntese personalizada</p>
    </div>`;

  const allConvs = JSON.parse(localStorage.getItem('ethos_conversations') || '[]');
  const conversationText = allConvs.map(conv => {
    const msgs = (conv.messages || [])
      .map(m => `${m.role === 'user' ? 'Pesquisador' : 'Ethos AI'}: ${m.content || m.parts?.[0]?.text || ''}`)
      .join('\n');
    return `Conversa "${conv.title || 'Sem título'}":\n${msgs}`;
  }).join('\n\n---\n\n');

  const hasConversations = conversationText.trim().length > 0;
  const prompt = hasConversations
    ? `Você é um assistente de síntese de pesquisa especulativa. Com base nas conversas abaixo do projeto "${study.title}" (categoria: ${study.tag}), gere:
1. Um parágrafo de síntese (4-6 frases) descrevendo os temas centrais, descobertas e conexões emergentes
2. Exatamente 3 insights curtos (1-2 frases cada) que revelam padrões, tensões ou oportunidades
3. Uma lista de exatamente 5 conceitos-chave (substantivos simples)

Responda APENAS com JSON válido neste formato:
{"summary":"...","insights":["...","...","..."],"nodes":["conceito1","conceito2","conceito3","conceito4","conceito5"]}

Conversas:
${conversationText.slice(0, 8000)}`
    : `Crie uma síntese inicial especulativa para o estudo "${study.title}" sobre "${study.tag}".
Gere: parágrafo de síntese (3-4 frases), 3 insights provocativos (1-2 frases cada), 5 conceitos centrais.
Responda APENAS com JSON: {"summary":"...","insights":["...","...","..."],"nodes":["...","...","...","...","..."]}`;

  try {
    const { url, headers } = buildGeminiRequest();
    const res = await fetch(url, {
      method: 'POST', headers,
      body: JSON.stringify({
        model: GEMINI_MODEL,
        body: {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 2000 }
        }
      })
    });
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    const raw = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON não encontrado na resposta');
    const parsed = JSON.parse(match[0]);

    const idx = studies.findIndex(s => s.id === studyId);
    if (idx >= 0) {
      studies[idx].synthesis = {
        summary: parsed.summary || '',
        insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 3) : [],
        nodes: Array.isArray(parsed.nodes) ? parsed.nodes.slice(0, 5) : [],
        generatedAt: Date.now()
      };
      localStorage.setItem('ethos_studies', JSON.stringify(studies));
      const updated = studies[idx];
      renderStudySynthesis(updated);
      requestAnimationFrame(() => drawStudyCanvas(updated));
      showToast('✓ Síntese gerada');
    }
  } catch(e) {
    console.error('Synthesis error:', e);
    if (area) area.innerHTML = `
      <div class="bg-white rounded-[28px] p-8 border border-surface-container-high text-center shadow-sm">
        <p class="text-error mb-2 font-semibold">Erro ao gerar síntese</p>
        <p class="text-on-surface-variant text-sm mb-5">${e.message}</p>
        <button onclick="generateStudySynthesis('${studyId}')" class="px-5 py-2.5 bg-primary text-white rounded-xl text-sm">Tentar novamente</button>
      </div>`;
    showToast('Erro ao gerar síntese');
  }
}

function saveStudyField(id, field, value) {
  if (!value) return;
  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]');
  const idx = studies.findIndex(s => s.id === id);
  if (idx >= 0) {
    studies[idx][field] = value;
    localStorage.setItem('ethos_studies', JSON.stringify(studies));
  }
}

function saveStudySummary(id, value) {
  if (!value) return;
  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]');
  const idx = studies.findIndex(s => s.id === id);
  if (idx >= 0) {
    if (!studies[idx].synthesis) studies[idx].synthesis = {};
    studies[idx].synthesis.summary = value;
    localStorage.setItem('ethos_studies', JSON.stringify(studies));
  }
}

function saveStudyInsight(id, index, value) {
  if (!value) return;
  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]');
  const idx = studies.findIndex(s => s.id === id);
  if (idx >= 0 && studies[idx].synthesis?.insights) {
    studies[idx].synthesis.insights[index] = value;
    localStorage.setItem('ethos_studies', JSON.stringify(studies));
  }
}

function deleteStudy(id) {
  if (!confirm('Excluir este estudo?')) return;
  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]').filter(s => s.id !== id);
  localStorage.setItem('ethos_studies', JSON.stringify(studies));
  location.href = '/synthesis';
}

// ── INIT ──
function initSynthesisDetailPage() {
  if (!requireAuth()) return;
  initSidebar('synthesis-detail');

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.href = '/synthesis'; return; }

  currentStudyId = id;
  const studies = JSON.parse(localStorage.getItem('ethos_studies') || '[]');
  const study = studies.find(s => s.id === id);
  if (!study) { location.href = '/synthesis'; return; }

  // Render header
  const header = document.getElementById('synthesis-detail-header');
  if (header) {
    header.innerHTML = `
      <span style="font-family:Inter;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#94492d;opacity:0.7;display:block;margin-bottom:4px">ESTUDO ATUAL</span>
      <h3 contenteditable="true" id="study-title-edit" class="text-4xl font-bold text-primary mt-1 outline-none"
          style="letter-spacing:-0.02em;line-height:1.1;cursor:text;border-bottom:2px solid transparent;transition:border-color 0.2s;min-width:100px"
          onfocus="this.style.borderBottomColor='#96ab99'"
          onblur="saveStudyField('${id}','title',this.textContent.trim())"
      >${study.title}</h3>
      <p contenteditable="true" id="study-sub-edit" class="text-on-surface-variant mt-2 outline-none"
         style="font-size:0.95rem;cursor:text;border-bottom:2px solid transparent;transition:border-color 0.2s"
         onfocus="this.style.borderBottomColor='#96ab99'"
         onblur="saveStudyField('${id}','sub',this.textContent.trim())"
      >${study.sub || 'Adicionar subtítulo...'}</p>
      <div class="flex items-center gap-3 mt-4">
        <span class="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-label-sm text-xs">${study.tag}</span>
        <button onclick="deleteStudy('${id}')" class="text-xs text-on-surface-variant opacity-50 hover:opacity-100 hover:text-error transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">delete</span> Excluir estudo
        </button>
      </div>`;
  }

  renderStudySynthesis(study);
  requestAnimationFrame(() => drawStudyCanvas(study));
}
