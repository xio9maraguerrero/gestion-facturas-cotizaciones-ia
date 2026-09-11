// C:\xampp\htdocs\gestion-facturas-cotizaciones-ia\public\app.js
const API_BASE = ''; // mismo origen
const authTokenKey = 'gd_token';
const authUserKey = 'gd_user';

function getToken() { return localStorage.getItem(authTokenKey); }
function setToken(token) { if (token) localStorage.setItem(authTokenKey, token); else localStorage.removeItem(authTokenKey); }
function setUserBasic(user) { if (user) localStorage.setItem(authUserKey, JSON.stringify(user)); else localStorage.removeItem(authUserKey); }
function getUserBasic() { const v = localStorage.getItem(authUserKey); return v ? JSON.parse(v) : null; }
function fetchWithAuth(url, opts = {}) {
  opts.headers = opts.headers || {};
  const token = getToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, opts);
}
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes)/Math.log(1024)) || 0;
  return `${(bytes/Math.pow(1024,i)).toFixed( i ? 2 : 0 )} ${sizes[i]}`;
}
function el(q) { return document.querySelector(q); }
function els(q) { return Array.from(document.querySelectorAll(q)); }

/* ---------- DOM elements (declared here, cached after DOMContentLoaded) ---------- */
let serverStatusEl, serverStatusText;
let themeToggleBtn, body;
let modalAuth, showLoginBtn, showRegisterBtn, modalAuthCloseBtns, formLogin, formRegister, authTitle, authError, registerError;
let authFormsWrap, userPanel, userEmailSpan, logoutBtn;
let dropzone, fileInput, uploadList;
let docsTbody, searchInput, refreshBtn;
let kpiTotal, kpiStorage, kpiServer, kpiProcessed;
let chartCanvas, chartPlaceholder;
let modalChat, chatTitle, chatHistory, chatForm, chatInput;
let selectRepositorio, btnNewRepo, modalNewRepo, formNewRepo, newRepoError, selectCategoria;
let modalDocDetails;

// NEW: repo settings elements
let repoSelectWrap, btnRepoSettings, repoDropdownMenu, optCreateRepo, optEditRepo, optDeleteRepo;

// NEW: guest hero elements (used to show friendly view when logged out)
let guestHero, heroLogin, heroRegister;

/* App state */
let categoriesChart = null;
let documents = [];
let repositorios = [];
let activeRepoId = null;
let activeCategoria = 'Todas';

/* Confirm modal state (promise-resolve) */
let _confirmResolve = null;

/* Repo dropdown state */
let _repoMenuOpen = false;

/* Init */
document.addEventListener('DOMContentLoaded', init);

function cacheElements() {
  serverStatusEl = el('#server-status');
  serverStatusText = el('#server-status-text');

  themeToggleBtn = el('#theme-toggle');
  body = document.body;

  modalAuth = el('#modal-auth');
  showLoginBtn = el('#show-login');
  showRegisterBtn = el('#show-register');
  modalAuthCloseBtns = els('[data-close]');
  formLogin = el('#form-login');
  formRegister = el('#form-register');
  authTitle = el('#auth-title');
  authError = el('#auth-error');
  registerError = el('#register-error');

  authFormsWrap = el('#auth-forms');
  userPanel = el('#user-panel');
  userEmailSpan = el('#user-email');
  logoutBtn = el('#logout-btn');

  dropzone = el('#dropzone');
  fileInput = el('#file-input');
  uploadList = el('#upload-list');

  docsTbody = el('#docs-tbody');
  searchInput = el('#search-input');
  refreshBtn = el('#refresh-btn');

  kpiTotal = el('#kpi-total');
  kpiStorage = el('#kpi-storage');
  kpiServer = el('#kpi-server');
  kpiProcessed = el('#kpi-processed');

  chartCanvas = el('#categories-chart');
  chartPlaceholder = el('#chart-placeholder');

  modalChat = el('#modal-chat');
  chatTitle = el('#chat-title');
  chatHistory = el('#chat-history');
  chatForm = el('#chat-form');
  chatInput = el('#chat-input');

  selectRepositorio = el('#select-repositorio');
  btnNewRepo = el('#btn-new-repo');
  modalNewRepo = el('#modal-new-repo');
  formNewRepo = el('#form-new-repo');
  newRepoError = el('#new-repo-error');
  selectCategoria = el('#select-categoria');

  modalDocDetails = el('#modal-doc-details');

  // NEW: repo settings elements (may be null if HTML not updated)
  repoSelectWrap = el('#repo-select-wrap');
  btnRepoSettings = el('#btn-repo-settings');
  repoDropdownMenu = el('#repo-dropdown-menu');
  optCreateRepo = el('#opt-create-repo');
  optEditRepo = el('#opt-edit-repo');
  optDeleteRepo = el('#opt-delete-repo');

  // NEW: guest hero elements
  guestHero = el('#guest-hero');
  heroLogin = el('#hero-login');
  heroRegister = el('#hero-register');
}

async function init() {
  cacheElements();
  setupTheme();
  bindUI();

  // Restore session (token -> user) BEFORE loading documents
  await restoreSessionFromToken();
  updateAuthUI();

  pollServerStatus();
  setupDropzone();

  // init confirm modal
  initConfirmModal();

  // load repos first so dropzone/upload knows current repo
  await loadRepos();

  // Initialize chart only if Chart is available (local vendor)
  if (typeof Chart !== 'undefined') setupChart();
  else {
    if (chartCanvas) chartCanvas.style.display = 'none';
    if (chartPlaceholder) {
      const msg = document.createElement('div');
      msg.style.color = 'var(--muted)';
      msg.style.padding = '18px';
      msg.textContent = 'Gráfica no disponible (Chart.js no cargado).';
      chartPlaceholder.appendChild(msg);
    }
  }

  // Always attempt to load documents
  await loadDocuments();

  // hide chart canvas if Chart unavailable (safety)
  if (typeof Chart === 'undefined' && chartCanvas) chartCanvas.style.display='none';
}

/* ---------- Repositorios (FRONT) ---------- */
async function loadRepos() {
  // No hay sesión: evitar llamada protegida (401) y limpiar estado local
  if (!getToken()) {
    repositorios = [];
    populateRepoSelect();
    return;
  }
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/repositorios`);
    if (!res.ok) { repositorios = []; populateRepoSelect(); return; }
    const json = await res.json();
    repositorios = json.data || [];
    populateRepoSelect();
  } catch (err) {
    console.error('loadRepos', err);
    repositorios = [];
    populateRepoSelect();
  }
}

function populateRepoSelect() {
  if (!selectRepositorio) return;
  selectRepositorio.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.textContent = 'Todos los repositorios';
  selectRepositorio.appendChild(optAll);

  repositorios.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.nombre;
    selectRepositorio.appendChild(opt);
  });

  // set active selection
  if (activeRepoId) selectRepositorio.value = activeRepoId;
  else selectRepositorio.value = '';

  // if no repo selected but there are repos, select first by default
  if (!selectRepositorio.value && repositorios.length > 0) {
    selectRepositorio.value = repositorios[0].id;
    activeRepoId = repositorios[0].id;
  }

  // Update menu state (enable/disable options)
  try { updateRepoMenuState(); } catch (e) { /* ignore if not ready */ }
}

async function createRepoHandler(e) {
  e.preventDefault();
  if (!newRepoError) return;
  newRepoError.textContent = '';
  const fd = new FormData(formNewRepo);
  const nombre = fd.get('nombre')?.trim();
  const descripcion = fd.get('descripcion')?.trim();
  if (!nombre) { newRepoError.textContent = 'El nombre es requerido'; return; }

  try {
    const res = await fetchWithAuth(`${API_BASE}/api/repositorios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion })
    });
    const json = await res.json();
    if (!res.ok) { newRepoError.textContent = json.message || 'Error creando repositorio'; return; }
    // success: reload repos and close modal
    await loadRepos();
    hideModal(modalNewRepo);
    formNewRepo.reset();
    // select new repo
    activeRepoId = json.data?.id || null;
    if (activeRepoId && selectRepositorio) selectRepositorio.value = activeRepoId;
    await loadDocuments();
  } catch (err) {
    console.error('createRepoHandler', err);
    newRepoError.textContent = 'Error de red';
  }
}

/* ---------- Session helpers ---------- */
async function restoreSessionFromToken() {
  const token = getToken();
  if (!token) return;
  const currentUser = getUserBasic();
  if (currentUser && currentUser.id) return; // already present
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) payload += '=';
      const decoded = atob(payload);
      const json = JSON.parse(decodeURIComponent(escape(decoded)));
      const user = { id: json.id || json.sub || null, email: json.email || null, nombre: json.nombre || null };
      if (user.id || user.email) setUserBasic(user);
    }
  } catch (err) {
    console.debug('No se pudo decodificar JWT para reconstruir usuario:', err);
  }
}

/* ---------- UI binding ---------- */
function setupTheme() {
  const theme = localStorage.getItem('gd_theme') || 'dark';
  body.classList.toggle('theme-light', theme === 'light');
  if (themeToggleBtn) themeToggleBtn.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
}

function bindUI() {
  if (showLoginBtn) showLoginBtn.addEventListener('click', () => openAuthModal('login'));
  if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => openAuthModal('register'));

  // CORRECCIÓN: Cierra TODOS los modales que contengan botones con data-close
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.classList.add('hidden');
    });
  });

  el('[data-switch="register"]')?.addEventListener('click', () => switchAuthForm('register'));
  el('[data-switch="login"]')?.addEventListener('click', () => switchAuthForm('login'));
  if (formLogin) formLogin.addEventListener('submit', handleLogin);
  if (formRegister) formRegister.addEventListener('submit', handleRegister);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (refreshBtn) refreshBtn.addEventListener('click', async () => { await loadDocuments(); renderDocsTable(); });
  if (searchInput) searchInput.addEventListener('input', () => renderDocsTable());
  if (chatForm) chatForm.addEventListener('submit', handleChatSubmit);

  // theme toggle binding (ensures the button actually toggles)
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('theme-light');
      localStorage.setItem('gd_theme', isLight ? 'light' : 'dark');
      themeToggleBtn.textContent = isLight ? 'Modo oscuro' : 'Modo claro';
    });
  }

  // connect guest hero buttons (if present) to auth modals
  if (heroLogin) heroLogin.addEventListener('click', () => showLoginBtn?.click());
  if (heroRegister) heroRegister.addEventListener('click', () => showRegisterBtn?.click());

  if (selectRepositorio) {
    selectRepositorio.addEventListener('change', async () => {
      activeRepoId = selectRepositorio.value || null;
      // Close repo dropdown if open when selection changes
      _repoMenuOpen = false;
      updateRepoMenuState();
      await loadDocuments();
    });
  }

  if (selectCategoria) {
    selectCategoria.addEventListener('change', async () => {
      activeCategoria = selectCategoria.value || 'Todas';
      await loadDocuments();
    });
  }

  if (btnNewRepo) btnNewRepo.addEventListener('click', () => showModal(modalNewRepo));
  if (formNewRepo) formNewRepo.addEventListener('submit', createRepoHandler);
  const btnCancelNewRepo = el('#btn-new-repo-cancel');
  if (btnCancelNewRepo) btnCancelNewRepo.addEventListener('click', () => { hideModal(modalNewRepo); formNewRepo.reset(); if (newRepoError) newRepoError.textContent=''; });

  if (dropzone) {
    // IMPORTANT: only trigger file chooser on trusted user events (avoid programmatic triggers causing "File chooser dialog can only be shown with a user activation")
    dropzone.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.isTrusted) { e.preventDefault(); if (fileInput) fileInput.click(); }
    });
    // click handler - ensure trusted user click
    dropzone.addEventListener('click', (e) => { if (e.isTrusted && fileInput) fileInput.click(); });
  }

  // ---------------------------
  // Repo dropdown behavior
  // ---------------------------
  // Ensure elements exist
  if (btnRepoSettings) {
    btnRepoSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      _repoMenuOpen = !_repoMenuOpen;
      updateRepoMenuState();
    });
  }

  // clicking inside menu should not close it (allow buttons to handle)
  if (repoDropdownMenu) {
    repoDropdownMenu.addEventListener('click', (e) => { e.stopPropagation(); });
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!_repoMenuOpen) return;
    const wrap = repoSelectWrap || selectRepositorio?.parentElement;
    if (wrap && !wrap.contains(e.target)) {
      _repoMenuOpen = false;
      updateRepoMenuState();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && _repoMenuOpen) {
      _repoMenuOpen = false;
      updateRepoMenuState();
    }
  });

  // Create new repo option
  if (optCreateRepo) {
    optCreateRepo.addEventListener('click', (e) => {
      e.stopPropagation();
      _repoMenuOpen = false;
      updateRepoMenuState();
      showModal(modalNewRepo);
    });
  }

  // Referencias para el modal de editar repositorio
const modalEditRepo = el('#modal-edit-repo');
const formEditRepo = el('#form-edit-repo');
const editRepoId = el('#edit-repo-id');
const editRepoNombre = el('#edit-repo-nombre');
const editRepoDescripcion = el('#edit-repo-descripcion');
const editRepoError = el('#edit-repo-error');
const btnCancelEditRepo = el('#btn-edit-repo-cancel');

// Abrir modal al presionar la opción de renombrar
if (optEditRepo) {
  optEditRepo.addEventListener('click', (e) => {
    e.stopPropagation();
    _repoMenuOpen = false;
    if (typeof updateRepoMenuState === 'function') updateRepoMenuState();

    const repo = typeof getRepositorioSeleccionado === 'function' ? getRepositorioSeleccionado() : null;
    const sel = selectRepositorio;
    const repoId = repo?.id || sel?.value;
    const currentName = repo?.nombre || (sel?.options[sel?.selectedIndex]?.text) || '';

    if (!repoId) { 
      alert('Selecciona un repositorio válido para renombrar.'); 
      return; 
    }

    if (editRepoId) editRepoId.value = repoId;
    if (editRepoNombre) editRepoNombre.value = currentName;
    if (editRepoDescripcion) editRepoDescripcion.value = repo?.descripcion || '';
    if (editRepoError) editRepoError.textContent = '';

    if (typeof showModal === 'function') showModal(modalEditRepo);
  });
}

// Cancelar modal de edición
if (btnCancelEditRepo) {
  btnCancelEditRepo.addEventListener('click', () => {
    if (typeof hideModal === 'function') hideModal(modalEditRepo);
    if (formEditRepo) formEditRepo.reset();
    if (editRepoError) editRepoError.textContent = '';
  });
}

// Enviar cambios con PUT (incluye nombre y descripcion)
if (formEditRepo) {
  formEditRepo.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (editRepoError) editRepoError.textContent = '';

    const id = editRepoId?.value;
    const nombre = editRepoNombre?.value?.trim();
    const descripcion = editRepoDescripcion?.value?.trim() || '';

    if (!id || !nombre) {
      if (editRepoError) editRepoError.textContent = 'El nombre es obligatorio';
      return;
    }

    try {
      const res = await fetchWithAuth(`${API_BASE}/api/repositorios/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion }) // Mandamos ambos campos requeridos por el backend
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (editRepoError) editRepoError.textContent = json?.message || 'No se pudo renombrar el repositorio';
        return;
      }

      await loadRepos();
      activeRepoId = id;
      if (selectRepositorio) selectRepositorio.value = id;
      await loadDocuments();

      if (typeof hideModal === 'function') hideModal(modalEditRepo);
      formEditRepo.reset();
    } catch (err) {
      console.error('Error al renombrar repositorio:', err);
      if (editRepoError) editRepoError.textContent = 'Error de red al renombrar repositorio';
    }
  });
}

  // Delete repo option
  if (optDeleteRepo) {
    optDeleteRepo.addEventListener('click', async (e) => {
      e.stopPropagation();
      const sel = selectRepositorio;
      const repoId = sel?.value;
      const repoName = sel?.options[sel.selectedIndex]?.text || '';
      if (!repoId) { alert('Selecciona un repositorio válido para eliminar.'); return; }

      const confirmed = await showConfirmModal('Eliminar repositorio', `¿Está seguro que desea eliminar el repositorio "${repoName}" y todos sus documentos? Esta acción no se puede deshacer.`);
      if (!confirmed) { _repoMenuOpen = false; updateRepoMenuState(); return; }

      try {
        const res = await fetchWithAuth(`${API_BASE}/api/repositorios/${encodeURIComponent(repoId)}`, { method: 'DELETE' });
        const json = await res.json().catch(()=>null);
        if (!res.ok) { alert(json?.message || 'No se pudo eliminar el repositorio'); return; }
        // reload repos and reset selection to 'Todos'
        await loadRepos();
        activeRepoId = null;
        if (selectRepositorio) selectRepositorio.value = '';
        await loadDocuments();
      } catch (err) {
        console.error('delete repo error', err);
        alert('Error de red al eliminar repositorio');
      } finally {
        _repoMenuOpen = false;
        updateRepoMenuState();
      }
    });
  }
}

/* Modal helpers */
function openAuthModal(mode='login') {
  if (!modalAuth) return;
  modalAuth.classList.remove('hidden');
  switchAuthForm(mode);
}
function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  if (authError) authError.textContent = '';
  if (registerError) registerError.textContent = '';
}
function switchAuthForm(mode) {
  if (!formLogin || !formRegister || !authTitle) return;
  if (mode === 'register') {
    formLogin.classList.add('hidden');
    formRegister.classList.remove('hidden');
    authTitle.textContent = 'Crear cuenta';
  } else {
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
    authTitle.textContent = 'Iniciar sesión';
  }
}

function showModal(modal) { if (!modal) return; modal.classList.remove('hidden'); modal.querySelector('input,textarea,button')?.focus(); }
function hideModal(modal) { if (!modal) return; modal.classList.add('hidden'); }

/* ---------- Repo menu helper (kept outside bindUI so populateRepoSelect can call it) ---------- */
function updateRepoMenuState() {
  const btn = btnRepoSettings;
  const menu = repoDropdownMenu;
  const edit = optEditRepo;
  const del = optDeleteRepo;
  const sel = selectRepositorio;
  const hasSelection = sel && sel.value && String(sel.value).trim() !== '';

  if (btn) btn.setAttribute('aria-expanded', _repoMenuOpen ? 'true' : 'false');
  if (menu) {
    if (_repoMenuOpen) menu.classList.remove('hidden');
    else menu.classList.add('hidden');
  }

  if (edit) edit.setAttribute('aria-disabled', hasSelection ? 'false' : 'true');
  if (del) del.setAttribute('aria-disabled', hasSelection ? 'false' : 'true');
}

/* ---------- Auth handlers (unchanged) ---------- */
async function handleLogin(e) {
  if (e) e.preventDefault();
  if (authError) authError.textContent = '';
  
  const data = new FormData(formLogin);
  const email = data.get('email');
  const password = data.get('password');

  if (!email || !password) {
    if (authError) authError.textContent = 'Por favor ingresa correo y contraseña';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const json = await res.json();
    if (!res.ok) { 
      if (authError) authError.textContent = json.message || 'Error autenticando'; 
      return; 
    }

    // Guarda credenciales
    setToken(json.data.token);
    setUserBasic({ id: json.data.id, email: json.data.email, nombre: json.data.nombre });
    
    // Actualiza interfaz y limpia clase del Body
    updateAuthUI();
    closeModal(modalAuth);
    
    // Carga datos del panel
    await loadRepos();
    await loadDocuments();
  } catch (err) { 
    console.error('Login error:', err); 
    if (authError) authError.textContent = 'Error de red al intentar iniciar sesión'; 
  }
}

async function handleRegister(e) {
  e.preventDefault();
  if (registerError) registerError.textContent = '';
  const data = new FormData(formRegister);
  try {
    const body = { nombre: data.get('nombre'), email: data.get('email'), password: data.get('password') };
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) { if (registerError) registerError.textContent = json.message || 'Error registrando'; return; }
    setToken(json.data.token);
    setUserBasic({ id: json.data.id, email: json.data.email, nombre: json.data.nombre });
    updateAuthUI();
    closeModal(modalAuth);
    await loadRepos();
    await loadDocuments();
  } catch (err) { console.error(err); if (registerError) registerError.textContent = 'Error de red'; }
}

function handleLogout() { setToken(null); setUserBasic(null); updateAuthUI(); documents = []; renderDocsTable(); }

/* ---------- updateAuthUI: muestra hero cuando no hay sesión ---------- */
function updateAuthUI() {
  const token = getToken();
  const dashboard = document.querySelector('.dashboard');

  if (token) {
    // IMPORTANTE: Remueve la clase del body para mostrar el dashboard
    document.body.classList.remove('not-authenticated');

    authFormsWrap?.classList.add('hidden');
    userPanel?.classList.remove('hidden');
    if (guestHero) guestHero.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    const user = getUserBasic();
    if (userEmailSpan) userEmailSpan.textContent = user?.email || 'Usuario';
  } else {
    // Vuelve a añadir la clase si no hay token
    document.body.classList.add('not-authenticated');

    authFormsWrap?.classList.remove('hidden');
    userPanel?.classList.add('hidden');
    if (guestHero) guestHero.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
    if (userEmailSpan) userEmailSpan.textContent = '';
  }
}

/* ---------- Server health ---------- */
async function pollServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const json = await res.json();
    if (res.ok && json.status === 'ok') {
      serverStatusEl?.classList.remove('offline'); serverStatusEl?.classList.add('online');
      if (serverStatusText) serverStatusText.textContent = 'Servidor OK';
      if (kpiServer) kpiServer.textContent = 'OK';
    } else {
      serverStatusEl?.classList.remove('online'); serverStatusEl?.classList.add('offline');
      if (serverStatusText) serverStatusText.textContent = 'Problemas';
      if (kpiServer) kpiServer.textContent = 'Problemas';
    }
  } catch (err) {
    serverStatusEl?.classList.remove('online'); serverStatusEl?.classList.add('offline');
    if (serverStatusText) serverStatusText.textContent = 'Desconectado';
    if (kpiServer) kpiServer.textContent = 'Desconectado';
  } finally { setTimeout(pollServerStatus, 15000); }
}

/* ---------- Dropzone & upload (now includes repositorio_id) ---------- */
function setupDropzone() {
  if (!dropzone) return;
  // click handler already added in bindUI (we keep for safety)
  // drag/drop
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault(); dropzone.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files || []);
    handleFilesUpload(files);
  });
  if (fileInput) fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []); handleFilesUpload(files); fileInput.value = '';
  });
}

function handleFilesUpload(files) {
  if (!files.length) return;
  files.forEach(file => {
    if (!['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'].includes(file.type) &&
        !/\.(pdf|docx|txt)$/i.test(file.name)) {
      alert(`Tipo no soportado: ${file.name}`); return;
    }
    const item = document.createElement('div'); item.className = 'upload-item';
    const meta = document.createElement('div'); meta.className = 'meta';
    meta.innerHTML = `<div style="font-weight:600">${escapeHtml(file.name)}</div><div style="font-size:13px;color:var(--muted)">${formatBytes(file.size)}</div>`;
    const progressWrap = document.createElement('div'); progressWrap.className = 'progress';
    const bar = document.createElement('i'); bar.style.width = '0%'; progressWrap.appendChild(bar);
    const cancelBtn = document.createElement('button'); cancelBtn.className = 'btn small'; cancelBtn.textContent = 'Cancelar';
    item.appendChild(meta); item.appendChild(progressWrap); item.appendChild(cancelBtn);
    uploadList?.appendChild(item);

    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);

    // Attach repo id (if selected)
    const repoId = selectRepositorio?.value || '';
    if (repoId) form.append('repositorio_id', repoId);

    xhr.open('POST', `${API_BASE}/api/docs/upload`, true);
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) bar.style.width = Math.round((ev.loaded/ev.total)*100) + '%'; };
    xhr.onload = async () => {
      if (xhr.status >=200 && xhr.status <300) {
        bar.style.width = '100%';
        await loadDocuments();
        renderDocsTable();
      } else {
        bar.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
        console.error('Upload failed', xhr.responseText);
        alert('Error subiendo archivo');
      }
      setTimeout(()=> item.remove(), 1400);
    };
    xhr.onerror = () => { console.error('Upload network error'); item.remove(); };
    cancelBtn.addEventListener('click', () => { xhr.abort(); item.remove(); });
    xhr.send(form);
  });
}

/* ---------- Load documents (now sends repo and categoria as query params) ---------- */
async function loadDocuments() {
  // No hay sesión: evitar llamada protegida (401) y limpiar estado local
  if (!getToken()) {
    documents = [];
    renderDocsTable(documents);
    updateKPIsAndChart();
    return;
  }
  try {
    const params = new URLSearchParams();

    // Solo enviar repositorio si hay uno seleccionado dinámicamente
    if (activeRepoId) params.append('repositorio_id', activeRepoId);

    // Solo enviar categoría si NO es 'Todas'
    if (activeCategoria && activeCategoria !== 'Todas') {
      params.append('categoria', activeCategoria);
    }

    const url = params.toString() ? `${API_BASE}/api/docs?${params.toString()}` : `${API_BASE}/api/docs`;
    const res = await fetchWithAuth(url);

    if (!res.ok) {
      documents = [];
      renderDocsTable(documents);
      updateKPIsAndChart();
      return;
    }

    const json = await res.json();
    documents = json.data || [];

    // Render con la variable documents actualizada
    renderDocsTable(documents);
    updateKPIsAndChart();
  } catch (err) {
    console.error('loadDocuments error', err);
    documents = [];
    renderDocsTable(documents);
    updateKPIsAndChart();
  }
}

/* ---------- Render table (CSP-safe: no inline onclick) ---------- */
function renderDocsTable(docsList = documents) {
  const tbody = docsTbody || document.getElementById('docs-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Aplicar filtro de búsqueda si hay texto en el input
  const query = (searchInput?.value || '').toLowerCase().trim();
  let listToRender = docsList;

  if (query) {
    listToRender = docsList.filter(d =>
      (d.nombre_original || d.nombre || '').toLowerCase().includes(query)
    );
  }

  if (!listToRender || listToRender.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay documentos subidos.</td></tr>';
    return;
  }

  listToRender.forEach(doc => {
    const tr = document.createElement('tr');

    // 1. Nombre del archivo (truncado visualmente + data-fullname)
    const tdNombre = document.createElement('td');
    const fullName = String(doc.nombre_original || doc.nombre || '');
    const maxLen = 80; // visual truncation length
    const displayName = fullName.length > maxLen ? fullName.slice(0, maxLen) + '…' : fullName;
    const spanName = document.createElement('span');
    spanName.textContent = displayName;
    tdNombre.appendChild(spanName);
    tdNombre.setAttribute('data-fullname', fullName);
    tdNombre.style.position = 'relative';
    tdNombre.title = fullName; // fallback tooltip

    // 2. Repositorio
    const tdRepo = document.createElement('td');
    const repoNombre = doc.repo_nombre || 'General';
    tdRepo.innerHTML = `<span class="badge">${escapeHtml(repoNombre)}</span>`;

    // 3. Formato
    const tdFormato = document.createElement('td');
    tdFormato.textContent = (doc.tipo_formato || 'pdf').toUpperCase();

    // 4. Estado IA
    const tdEstado = document.createElement('td');
    const esCompletado = doc.estado_procesamiento === 'completado';
    tdEstado.innerHTML = esCompletado
      ? '<span style="color: #2ec4b6; font-weight: bold;">● Completado</span>'
      : '<span style="color: #ff9f1c; font-weight: bold;">⏳ Pendiente</span>';

    // 5. Categoría
    const tdCategoria = document.createElement('td');
    const catName = doc.analisis_categoria || 'Sin clasificar';
    tdCategoria.innerHTML = renderCategoryBadge(catName);

    // 6. Acciones (no inline handlers, attach listeners)
    const tdAcciones = document.createElement('td');
    tdAcciones.style.display = 'flex';
    tdAcciones.style.gap = '5px';

    // Botón Análisis IA
    const btnAnalisis = document.createElement('button');
    btnAnalisis.className = 'btn small';
    btnAnalisis.title = 'Ver Resumen y Extracción';
    btnAnalisis.textContent = 'Análisis IA';
    btnAnalisis.addEventListener('click', () => window.verAnalisisIA(doc.id));

    // Enlace Descargar
    const aDesc = document.createElement('a');
    aDesc.href = `/uploads/${encodeURIComponent(doc.nombre_servidor || '')}`;
    aDesc.download = '';
    aDesc.className = 'btn small';
    aDesc.title = 'Descargar';
    aDesc.textContent = 'Descargar';

    // Botón Chat
    const btnChat = document.createElement('button');
    btnChat.className = 'btn small primary';
    btnChat.title = 'Consultar RAG';
    btnChat.textContent = 'Chat';
    btnChat.addEventListener('click', () => window.abrirChatDoc(doc.id));

    // Botón Eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn small danger';
    btnEliminar.title = 'Eliminar';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => window.eliminarDoc(doc.id));

    tdAcciones.appendChild(btnAnalisis);
    tdAcciones.appendChild(aDesc);
    tdAcciones.appendChild(btnChat);
    tdAcciones.appendChild(btnEliminar);

    tr.appendChild(tdNombre);
    tr.appendChild(tdRepo);
    tr.appendChild(tdFormato);
    tr.appendChild(tdEstado);
    tr.appendChild(tdCategoria);
    tr.appendChild(tdAcciones);

    tbody.appendChild(tr);
  });
}
function renderCategoryBadge(categoria) {
  if (!categoria || categoria === '—') return `<span class="badge badge-neutral">—</span>`;
  const cls = categoria === 'Factura' ? 'badge badge-yellow' :
              categoria === 'Cotización' ? 'badge badge-blue' :
              categoria === 'Cuenta de Cobro' ? 'badge badge-green' :
              'badge badge-gray';
  return `<span class="${cls}">${escapeHtml(categoria)}</span>`;
}

/* ---------- Confirm modal functions (unchanged) ---------- */
function initConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  const btnAccept = document.getElementById('confirm-accept-btn');
  const btnCancel = document.getElementById('confirm-cancel-btn');
  const btnClose = document.getElementById('confirm-modal-close');

  if (btnAccept) btnAccept.addEventListener('click', () => {
    hideConfirmModal();
    if (_confirmResolve) { _confirmResolve(true); _confirmResolve = null; }
  });

  if (btnCancel) btnCancel.addEventListener('click', () => {
    hideConfirmModal();
    if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
  });

  if (btnClose) btnClose.addEventListener('click', () => {
    hideConfirmModal();
    if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
  });

  // keyboard: Escape cancels
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      hideConfirmModal();
      if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
    }
  });

  // click backdrop cancels
  const backdrop = modal.querySelector('.confirm-modal-backdrop');
  if (backdrop) backdrop.addEventListener('click', () => {
    hideConfirmModal();
    if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
  });
}

function showConfirmModal(title, message) {
  const modal = document.getElementById('confirm-modal');
  if (!modal) return Promise.resolve(false);
  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-message');
  if (titleEl) titleEl.textContent = title || 'Confirmar';
  if (msgEl) msgEl.textContent = message || '';
  modal.classList.remove('hidden');
  const focusEl = document.getElementById('confirm-cancel-btn') || document.getElementById('confirm-accept-btn');
  focusEl?.focus();
  return new Promise((resolve) => { _confirmResolve = resolve; });
}

function hideConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

/* ---------- Delete document (uses new confirm modal) ---------- */
async function deleteDocument(doc) {
  const projectTitle = document.querySelector('.brand h1')?.textContent?.trim() || 'Gestión Documental IA';
  const confirmed = await showConfirmModal(projectTitle, `¿Está seguro que desea eliminar el archivo "${doc.nombre_original}"?`);
  if (!confirmed) return;

  try {
    const res = await fetchWithAuth(`${API_BASE}/api/docs/${doc.id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadDocuments();
      renderDocsTable();
    } else {
      const json = await res.json().catch(()=>({}));
      alert(json.message || 'No se pudo eliminar');
    }
  } catch (err) { console.error('deleteDocument', err); alert('Error de red'); }
}

/* ---------- Chat (unchanged) ---------- */
let activeChatDoc = null;
function safeRenderMarkdown(md) {
  try {
    if (typeof marked !== 'undefined' && marked && typeof marked.parse === 'function') return marked.parse(md || '');
  } catch (e) { console.debug('marked.parse falló, usando fallback', e); }
  return escapeHtml(md || '').replace(/\n/g, '<br/>');
}
function openChat(doc) {
  activeChatDoc = doc;
  if (chatTitle) chatTitle.textContent = `Chat IA - ${doc.nombre_original}`;
  if (chatHistory) chatHistory.innerHTML = '';
  const welcome = `¡Hola! Soy tu asistente de IA. He analizado el documento **${doc.nombre_original}**. ¿En qué puedo ayudarte?`;
  const welcomeDiv = document.createElement('div'); welcomeDiv.className='msg ai'; welcomeDiv.innerHTML=safeRenderMarkdown(welcome);
  chatHistory?.appendChild(welcomeDiv); if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
  modalChat?.classList.remove('hidden'); setTimeout(()=>chatInput?.focus(),120);
}
function appendChatMessage(text, who='ai', temp=false) {
  const bubble = document.createElement('div'); bubble.className = 'msg ' + (who === 'user' ? 'user' : 'ai');
  if (who === 'ai') bubble.innerHTML = safeRenderMarkdown(text); else bubble.textContent = text;
  if (temp) bubble.dataset.temp='1';
  chatHistory?.appendChild(bubble); if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
}
async function handleChatSubmit(e) {
  e.preventDefault();
  const q = chatInput.value.trim();
  if (!q || !activeChatDoc) return;
  appendChatMessage(q,'user'); chatInput.value='';
  appendChatMessage('Procesando respuesta...','ai',true);
  chatInput.disabled=true; chatForm.querySelector('button[type="submit"]').disabled=true;
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/ai/chat`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ documento_id: activeChatDoc.id, pregunta: q })
    });
    const json = await res.json().catch(()=>null);
    const temp = chatHistory.querySelector('.msg.ai[data-temp="1"]'); if (temp) temp.remove();
    if (!res.ok) { appendChatMessage((json&&json.message)?json.message:'Error en la consulta IA','ai'); console.error('AI chat error',json); return; }
    const resp = (json && json.data && json.data.respuesta) ? json.data.respuesta : (json && json.respuesta) ? json.respuesta : 'Sin respuesta';
    appendChatMessage(resp,'ai');
  } catch (err) { console.error('chat error',err); const temp = chatHistory.querySelector('.msg.ai[data-temp="1"]'); if (temp) temp.remove(); appendChatMessage('Error de red en la consulta IA','ai'); }
  finally { chatInput.disabled=false; chatForm.querySelector('button[type="submit"]').disabled=false; chatInput.focus(); }
}

/* ---------- KPIs & Chart (unchanged except update function uses documents array) ---------- */
function setupChart() {
  if (typeof Chart === 'undefined' || !chartCanvas) return;
  categoriesChart = new Chart(chartCanvas.getContext('2d'), {
    type:'doughnut',
    data:{ labels:['pdf','docx','txt','otro'], datasets:[{label:'Formatos', data:[0,0,0,0], backgroundColor:['#0b6fb3','#1d4ed8','#06b6d4','#94a3b8'], hoverOffset:8}] },
    options:{ plugins:{ legend:{ position:'bottom', labels:{ color:getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#94a3b8' } } }, maintainAspectRatio:false }
  });
}
function updateKPIsAndChart() {
  const total = documents.length;
  const storage = documents.reduce((s,d)=> s + (Number(d.tamano_bytes)||0), 0);
  const processed = documents.filter(d => d.estado_procesamiento === 'completado').length;
  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiStorage) kpiStorage.textContent = formatBytes(storage);
  if (kpiProcessed) kpiProcessed.textContent = processed;
  const counts = { pdf:0, docx:0, txt:0, otro:0 };
  documents.forEach(d => {
    const t = (d.tipo_formato || '').toLowerCase();
    if (t.startsWith('pdf')) counts.pdf++;
    else if (t.includes('docx')) counts.docx++;
    else if (t.includes('txt')) counts.txt++;
    else counts.otro++;
  });
  if (categoriesChart) { categoriesChart.data.datasets[0].data = [counts.pdf, counts.docx, counts.txt, counts.otro]; categoriesChart.update(); }
}

/* ---------- Utilities ---------- */
function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

/* ---------- Conexión de Botones con la Interfaz (Global Scope) ---------- */

window.verAnalisisIA = async function(id) {
  const doc = documents.find(d => String(d.id) === String(id)) || { id };

  const modalDetails = modalDocDetails || document.getElementById('modal-doc-details');
  const titleEl = document.getElementById('detail-doc-title');
  const summaryEl = document.getElementById('detail-doc-summary');
  const extractedEl = document.getElementById('detail-doc-extracted');

  function formatDateMaybe(d) {
    try {
      if (!d) return '';
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return dt.toLocaleString();
    } catch (e) { return String(d); }
  }

  if (titleEl) titleEl.textContent = `Análisis IA - ${doc.nombre_original || doc.nombre || 'Documento'}`;
  if (summaryEl) summaryEl.textContent = 'Cargando análisis...';
  if (extractedEl) extractedEl.innerHTML = '';

  let analysis = null;
  try {
    const urlA = `${API_BASE}/api/analisis?documento_id=${encodeURIComponent(id)}`;
    const resA = await fetchWithAuth(urlA);
    if (resA && resA.ok) {
      const jsonA = await resA.json().catch(()=>null);
      const payload = jsonA && jsonA.data !== undefined ? jsonA.data : jsonA;
      if (Array.isArray(payload) && payload.length > 0) {
        payload.sort((a,b) => {
          const ta = a.fecha_analisis ? new Date(a.fecha_analisis).getTime() : 0;
          const tb = b.fecha_analisis ? new Date(b.fecha_analisis).getTime() : 0;
          return tb - ta;
        });
        analysis = payload[0];
      } else if (payload && typeof payload === 'object') {
        analysis = payload;
      }
    }
  } catch (e) {
    console.debug('verAnalisisIA: error fetch /api/analisis', e);
  }

  if (!analysis) {
    try {
      const urlD = `${API_BASE}/api/documentos/${encodeURIComponent(id)}`;
      const resD = await fetchWithAuth(urlD);
      if (resD && resD.ok) {
        const jsonD = await resD.json().catch(()=>null);
        const payload = jsonD && jsonD.data !== undefined ? jsonD.data : jsonD;
        if (payload) {
          if (payload.analisis || payload.analysis) {
            analysis = payload.analisis || payload.analysis;
          } else {
            analysis = {
              resumen: payload.analisis_resumen || payload.resumen || null,
              datos_extraidos_json: payload.datos_extraidos_json || payload.datos_extraidos || null,
              categoria: payload.analisis_categoria || payload.categoria || null,
              fecha_analisis: payload.fecha_analisis || null
            };
          }
        }
      }
    } catch (e) {
      console.debug('verAnalisisIA: error fetch /api/documentos/{id}', e);
    }
  }

  let summary = null;
  if (analysis) {
    summary = analysis.resumen || analysis.resumen_ia || analysis.summary || analysis.analysis_summary || null;
  }
  if (!summary) summary = doc.analisis_resumen || doc.resumen || null;
  if (!summary) summary = 'Resumen no generado o en proceso.';

  let extractedRaw = null;
  if (analysis) {
    extractedRaw = analysis.datos_extraidos_json || analysis.datos_extraidos || analysis.extraido || analysis.extracted || null;
  }
  if (!extractedRaw) {
    extractedRaw = doc.datos_extraidos_json || doc.datos_extraidos || null;
  }

  let parsedExtracted = null;
  if (extractedRaw) {
    if (typeof extractedRaw === 'string') {
      try { parsedExtracted = JSON.parse(extractedRaw); }
      catch (e) { parsedExtracted = extractedRaw; }
    } else {
      parsedExtracted = extractedRaw;
    }
  }

  try {
    if (summaryEl) {
      if (typeof safeRenderMarkdown === 'function') summaryEl.innerHTML = safeRenderMarkdown(String(summary || ''));
      else summaryEl.innerHTML = `<div>${escapeHtml(String(summary || ''))}</div>`;
    }
  } catch (e) {
    if (summaryEl) summaryEl.innerHTML = `<div>${escapeHtml(String(summary || ''))}</div>`;
  }

  const categoria = (analysis && (analysis.categoria || analysis.analisis_categoria)) || doc.analisis_categoria || doc.categoria || 'Sin clasificar';
  const tam = formatBytes(doc.tamano_bytes || doc.tamano || 0);
  const estado = doc.estado_procesamiento || 'Desconocido';
  const fechaCarga = doc.fecha_subida ? formatDateMaybe(doc.fecha_subida) : '';
  const fechaAnalisis = (analysis && (analysis.fecha_analisis || analysis.fecha)) ? formatDateMaybe(analysis.fecha_analisis || analysis.fecha) : (doc.fecha_analisis ? formatDateMaybe(doc.fecha_analisis) : '');

  let html = '';
  html += `<p><strong>Categoría:</strong> ${escapeHtml(categoria)}</p>`;
  html += `<p><strong>Tamaño:</strong> ${escapeHtml(tam)}</p>`;
  html += `<p><strong>Estado:</strong> ${escapeHtml(estado)}</p>`;
  if (fechaCarga) html += `<p><strong>Fecha carga:</strong> ${escapeHtml(fechaCarga)}</p>`;
  if (fechaAnalisis) html += `<p><strong>Fecha análisis:</strong> ${escapeHtml(fechaAnalisis)}</p>`;

  const isEmptyValue = (v) => {
    if (v === null || typeof v === 'undefined') return true;
    if (typeof v === 'string' && v.trim() === '') return true;
    if (Array.isArray(v) && v.length === 0) return true;
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return true;
    return false;
  };

  // Helper para renderizar valores simples u objetos complejos (ej. items)
  const renderValue = (val) => {
    if (isEmptyValue(val)) return '<em>Sin datos</em>';
    if (Array.isArray(val)) {
      if (val.every(item => typeof item === 'object' && item !== null)) {
        return `<ul style="margin: 4px 0; padding-left: 18px;">` +
          val.map(item => `<li>${Object.entries(item).map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}`).join(', ')}</li>`).join('') +
          `</ul>`;
      }
      return val.map(v => escapeHtml(String(v))).join(', ');
    }
    if (typeof val === 'object') {
      return `<pre style="margin:4px 0; padding:6px; background:rgba(0,0,0,0.03); border-radius:4px; font-size:0.85em;">${escapeHtml(JSON.stringify(val, null, 2))}</pre>`;
    }
    return escapeHtml(String(val));
  };

  let renderedFields = 0;

  if (parsedExtracted && typeof parsedExtracted === 'object') {
    const keys = Object.entries(parsedExtracted).filter(([,v]) => !isEmptyValue(v));
    if (keys.length > 0) {
      html += `<h4 style="margin-top:14px; margin-bottom:8px;">Campos extraídos</h4><dl style="margin:0;">`;
      keys.forEach(([k, v]) => {
        html += `<dt style="font-weight:600; margin-top:8px;">${escapeHtml(k)}</dt><dd style="margin:2px 0 8px 0;">${renderValue(v)}</dd>`;
        renderedFields++;
      });
      html += `</dl>`;
    }
  } else if (parsedExtracted && !isEmptyValue(parsedExtracted)) {
    html += `<h4 style="margin-top:14px;">Datos extraídos</h4><pre style="white-space:pre-wrap; background:rgba(0,0,0,0.02); padding:8px; border-radius:6px;">${escapeHtml(String(parsedExtracted))}</pre>`;
    renderedFields++;
  }

  if (renderedFields === 0) {
    if (String(categoria).toLowerCase().includes('factura')) {
      html += `<p style="color:var(--muted, #666); margin-top:10px;">No se detectaron valores financieros o ítems en esta factura.</p>`;
    } else {
      html += `<p style="color:var(--muted, #666); margin-top:10px;">No se encontraron datos extraídos para este documento.</p>`;
    }
  }

  const contentKeys = ['contenido','texto','full_text','content','text'];
  for (const k of contentKeys) {
    const v = (analysis && analysis[k]) || doc[k];
    if (v) {
      const full = String(v || '');
      const preview = full.length > 2000 ? full.slice(0,2000) + '…' : full;
      html += `<h4 style="margin-top:12px;">Extracto del contenido</h4><pre style="white-space:pre-wrap; background:rgba(0,0,0,0.02); padding:8px; border-radius:6px;">${escapeHtml(preview)}</pre>`;
      break;
    }
  }

  if (extractedEl) extractedEl.innerHTML = html;

  if (modalDetails) {
    modalDetails.classList.remove('hidden');
    modalDetails.querySelector('button[data-close]')?.focus();
  }
};

window.abrirChatDoc = function(id) {
  const doc = documents.find(d => String(d.id) === String(id));
  if (doc) {
    openChat(doc);
  } else {
    alert("No se encontró la información del documento para el chat.");
  }
};

window.eliminarDoc = function(id) {
  const doc = documents.find(d => String(d.id) === String(id));
  if (doc) {
    deleteDocument(doc);
  }
};

// Devuelve el objeto del repositorio actualmente seleccionado en la interfaz
function getRepositorioSeleccionado() {
  const repoId = selectRepositorio?.value || activeRepoId;
  if (!repoId) return null;
  
  // Busca el repositorio coincidente dentro del array global que llenó loadRepos()
  return repositorios.find(r => String(r.id) === String(repoId)) || null;
}