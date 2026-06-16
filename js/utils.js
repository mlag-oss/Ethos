// ── ETHOS AI · Utils ──

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function showToast(msg) {
  let t = document.getElementById('ethos-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'ethos-toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#182a1d;color:#fff;padding:10px 20px;border-radius:100px;font-family:Inter;font-size:13px;z-index:999;transition:opacity 0.3s;pointer-events:none;white-space:nowrap';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = '0', 2500);
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/↳\s*(.*)/g, '<span style="display:block;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid #eae8e4;font-style:italic;color:#94492d;">↳ $1</span>')
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}
