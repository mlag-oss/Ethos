// ── ETHOS AI · Knowledge Graph Page ──

let allConversations = JSON.parse(localStorage.getItem('ethos_conversations') || '[]');

function extractGraphTopics() {
  const stopWords = new Set(['que','com','uma','para','como','por','não','mas','são','foi','ser','isso','mais','seus','suas','meu','minha','você','ela','ele','nos','nas','dos','das','the','and','or','in','of','to','essa','esse','este','esta','sua','seu','pelo','pela','quando','onde','quais','qual','muito','bem','pode','tem','ter','também','ainda','precisa','forma','sobre','este','isso','faz','fazer','entre','existe','cada','apenas','todos','algumas','diferentes','tipo','algo','assim','aqui','sendo','pelos','pelas','quem','então','tanto','mesmo','outra','outro','nossa','nosso','numa','qual','quais','cujo','cuja']);

  const wordCount = {};
  const cooccur = {};

  allConversations.forEach(conv => {
    const msgWords = [];
    conv.messages.forEach(msg => {
      const words = (msg.parts?.[0]?.text || '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g,'')
        .replace(/[^a-z\s]/g,' ')
        .split(/\s+/)
        .filter(w => w.length > 4 && !stopWords.has(w));

      words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });
      msgWords.push(...words);
    });

    const unique = [...new Set(msgWords)];
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = [unique[i], unique[j]].sort().join('|');
        cooccur[key] = (cooccur[key] || 0) + 1;
      }
    }
  });

  const nodes = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([w]) => w);

  const freq = Object.fromEntries(nodes.map(w => [w, wordCount[w]]));

  const edges = [];
  Object.entries(cooccur).forEach(([key, w]) => {
    if (w < 1) return;
    const [a, b] = key.split('|');
    const ai = nodes.indexOf(a), bi = nodes.indexOf(b);
    if (ai >= 0 && bi >= 0) edges.push([ai, bi, w]);
  });

  return { nodes, edges, freq };
}

function buildKnowledgeGraph() {
  const canvas = document.getElementById('knowledge-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  ctx.clearRect(0, 0, W, H);

  const topics = extractGraphTopics();

  if (topics.nodes.length === 0) {
    ctx.fillStyle = '#182a1d';
    ctx.font = '500 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Inicie conversas para ver o grafo emergir', W/2, H/2 - 10);
    ctx.fillStyle = '#737872';
    ctx.font = '12px Inter';
    ctx.fillText('Cada conversa adiciona nós ao conhecimento', W/2, H/2 + 14);
    return;
  }

  const n = topics.nodes.length;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.32;

  const positions = topics.nodes.map((_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i / n) - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i / n) - Math.PI / 2)
  }));

  topics.edges.forEach(([a, b, w]) => {
    const pa = positions[a], pb = positions[b];
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = `rgba(148,73,45,${Math.min(0.5, w * 0.12)})`;
    ctx.lineWidth = Math.min(2.5, w * 0.4);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#182a1d';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ETHOS', cx, cy);

  topics.nodes.slice(0, Math.min(6, n)).forEach((_, i) => {
    const p = positions[i];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = 'rgba(24,42,29,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  topics.nodes.forEach((node, i) => {
    const p = positions[i];
    const freq = topics.freq[node] || 1;
    const radius = Math.max(18, Math.min(30, 16 + freq * 2));
    const colors = ['#2d4032','#94492d','#3f3c33','#4f6354','#763318'];
    const color = colors[i % colors.length];

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `500 ${Math.max(9, Math.min(11, radius * 0.38))}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.length > 10 ? node.slice(0, 9) + '…' : node, p.x, p.y);

    ctx.fillStyle = '#182a1d';
    ctx.font = '10px Inter';
    const lx = p.x + (p.x - cx) * 0.28;
    const ly = p.y + (p.y - cy) * 0.28;
    ctx.fillText(freq + 'x', lx, ly);
  });

  canvas._positions = positions;
  canvas._nodes = topics.nodes;

  // Update stats
  const nc = document.getElementById('graph-node-count');
  const cc = document.getElementById('graph-conv-count');
  const ec = document.getElementById('graph-edge-count');
  if (nc) nc.textContent = topics.nodes.length;
  if (cc) cc.textContent = allConversations.length;
  if (ec) ec.textContent = topics.edges.length;
}

// ── INIT ──
function initGraphPage() {
  if (!requireAuth()) return;
  initSidebar('graph');

  setTimeout(() => buildKnowledgeGraph(), 80);

  document.getElementById('knowledge-canvas')?.addEventListener('click', function(e) {
    if (!this._positions) return;
    const rect = this.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    this._positions.forEach((p, i) => {
      const d = Math.hypot(mx - p.x, my - p.y);
      if (d < 30) {
        const topic = this._nodes[i];
        const perguntas = [
          `Quero explorar "${topic}" com profundidade. Que tensões ou contradições você enxerga nesse conceito dentro do design decolonial?`,
          `"${topic}" emergiu bastante nas minhas pesquisas. O que eu ainda não estou perguntando sobre esse tema?`,
          `Como abordar "${topic}" de forma não-extrativista em um projeto com comunidades tradicionais?`,
          `O que significa "${topic}" a partir de uma perspectiva ancestral e territorial, e não ocidental?`,
          `Que saberes práticos e relacionais existem em torno de "${topic}" que escapam da abordagem acadêmica convencional?`,
        ];
        const q = perguntas[Math.floor(Math.random() * perguntas.length)];
        sessionStorage.setItem('ethos_chat_topic', q);
        sessionStorage.setItem('ethos_chat_autosend', '1');
        location.href = '/chat';
      }
    });
  });
}
