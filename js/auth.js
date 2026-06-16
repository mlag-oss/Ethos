// ── ETHOS AI · Auth ──
let currentUser = JSON.parse(localStorage.getItem('ethos_user') || 'null');

// Called on every inner page — redirect to login if not authenticated
function requireAuth() {
  if (!currentUser) {
    location.href = '/';
    return false;
  }
  applyUser(currentUser);
  return true;
}

function applyUser(user) {
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  document.querySelectorAll('.user-avatar').forEach(el => {
    if (user.picture) {
      el.style.padding = '0';
      el.style.background = 'transparent';
      el.innerHTML = `<img src="${user.picture}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block" onerror="this.parentElement.textContent='${initials}';this.parentElement.style.background=''">`;
    } else {
      el.textContent = initials;
    }
  });
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
}

function signOut() {
  localStorage.removeItem('ethos_user');
  if (GOOGLE_CLIENT_ID && currentUser?.sub) {
    try { google.accounts.id.revoke(currentUser.sub, () => {}); } catch(e) {}
  }
  location.href = '/';
}

// ── Login page functions ──
function initLoginPage() {
  if (currentUser) { location.href = '/chat'; return; }
  if (GOOGLE_CLIENT_ID) {
    const tryRender = () => {
      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false
        });
        const container = document.getElementById('g-signin-btn');
        container.innerHTML = '';
        google.accounts.id.renderButton(container, {
          theme: 'outline', size: 'large', width: 320, locale: 'pt-BR', text: 'signin_with'
        });
      } catch(e) {
        setTimeout(tryRender, 300);
      }
    };
    setTimeout(tryRender, 200);
  }
}

function handleGoogleCredential(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    currentUser = { name: payload.name, email: payload.email, picture: payload.picture || '', sub: payload.sub };
    localStorage.setItem('ethos_user', JSON.stringify(currentUser));
    location.href = '/chat';
  } catch(e) {
    alert('Erro ao processar login. Tente novamente.');
  }
}
