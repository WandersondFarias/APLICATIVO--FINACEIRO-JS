/* =============================================
   FinanceFlow – app.js
   Persistência total via localStorage
============================================= */

"use strict";

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
const STATE_KEY = "financeflow_v2";

let state = {
  salario: 0,
  meta: 0,
  transacoes: [],   // { id, descricao, valor, tipo, categoria, data, obs }
  eventos: []       // { id, titulo, data, tipo, desc }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch(e) { console.warn("Erro ao carregar state", e); }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function fmt(n) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
}

function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const CAT_ICON = {
  alimentacao:"🍔", transporte:"🚗", saude:"💊", lazer:"🎮",
  moradia:"🏠", educacao:"📚", salario:"💰", outros:"📦"
};

const EVENT_COLORS = { lembrete:"#4f8ef7", pagamento:"#f05c6e", recebimento:"#34d58f", meta:"#f0c040" };
const EVENT_LABELS = { lembrete:"🔔 Lembrete", pagamento:"💳 Pagamento", recebimento:"💵 Recebimento", meta:"🎯 Meta" };

function nowISO() { return new Date().toISOString().split("T")[0]; }

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function transOfMonth(ym) {
  return state.transacoes.filter(t => t.data && t.data.startsWith(ym));
}

function sumByType(list, tipo) {
  return list.filter(t => t.tipo === tipo).reduce((a,t) => a + Number(t.valor), 0);
}

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "ok") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast show${type === "error" ? " error" : type === "warn" ? " warning" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function navigate(sectionId) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  const sec = document.getElementById("sec-" + sectionId);
  if (sec) sec.classList.add("active");

  const nav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (nav) nav.classList.add("active");

  document.getElementById("pageTitle").textContent =
    { dashboard:"Dashboard", transacoes:"Transações", calendario:"Calendário", configuracoes:"Configurações" }[sectionId] || "";

  if (sectionId === "transacoes") renderTransacoes();
  if (sectionId === "calendario") renderCalendario();
  if (sectionId === "dashboard")  renderDashboard();
  if (sectionId === "configuracoes") {
    document.getElementById("inputSalario").value = state.salario || "";
    document.getElementById("inputMeta").value    = state.meta    || "";
  }

  // close sidebar on mobile
  document.querySelector(".sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-item").forEach(n => {
  n.addEventListener("click", e => { e.preventDefault(); navigate(n.dataset.section); });
});
document.querySelector(".ver-tudo").addEventListener("click", e => { e.preventDefault(); navigate("transacoes"); });
document.getElementById("menuToggle").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

// ─────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────
function renderDashboard() {
  const ym = currentMonthKey();
  const list = transOfMonth(ym);
  const receitas = sumByType(list, "receita") + Number(state.salario || 0);
  const gastos   = sumByType(list, "despesa");
  const economia = receitas - gastos;

  document.getElementById("cardSalario").textContent  = fmt(state.salario);
  document.getElementById("cardGastos").textContent   = fmt(gastos);
  document.getElementById("cardReceitas").textContent = fmt(receitas);
  document.getElementById("cardEconomia").textContent = fmt(economia < 0 ? 0 : economia);

  // Barra de progresso
  const meta = Number(state.meta || 0);
  const pct  = meta > 0 ? Math.min(100, (economia / meta) * 100) : 0;
  document.getElementById("economyBar").style.width = pct.toFixed(1) + "%";
  document.getElementById("economyPercent").textContent = pct.toFixed(0) + "%";
  document.getElementById("economySubLeft").textContent  = "Guardado: " + fmt(economia < 0 ? 0 : economia);
  document.getElementById("economySubRight").textContent = "Meta: " + fmt(meta);

  renderBarChart();
  renderRecentList();
}

function renderBarChart() {
  const chart = document.getElementById("barChart");
  chart.innerHTML = "";
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const list = transOfMonth(ym);
    let r = sumByType(list, "receita");
    if (i === 0) r += Number(state.salario || 0);
    const g = sumByType(list, "despesa");
    const maxVal = Math.max(r, g, 1);
    const maxH = 90;

    const grp = document.createElement("div");
    grp.className = "bar-group";

    const bw = document.createElement("div");
    bw.className = "bar-wrap";

    const br = document.createElement("div");
    br.className = "bar-g receita";
    br.style.height = ((r / maxVal) * maxH) + "px";
    br.title = `Receitas: ${fmt(r)}`;

    const bg = document.createElement("div");
    bg.className = "bar-g despesa";
    bg.style.height = ((g / maxVal) * maxH) + "px";
    bg.title = `Despesas: ${fmt(g)}`;

    const lbl = document.createElement("div");
    lbl.className = "bar-label";
    lbl.textContent = MONTHS_PT[d.getMonth()].slice(0,3);

    bw.appendChild(br); bw.appendChild(bg);
    grp.appendChild(bw); grp.appendChild(lbl);
    chart.appendChild(grp);
  }
}

function renderRecentList() {
  const el = document.getElementById("recentList");
  const recentes = [...state.transacoes]
    .sort((a,b) => b.data.localeCompare(a.data)).slice(0,5);
  renderTransList(el, recentes, true);
}

// ─────────────────────────────────────────────
//  TRANSAÇÕES
// ─────────────────────────────────────────────
let activeFilter = "todos";
let searchQuery  = "";

function renderTransacoes() {
  let list = [...state.transacoes].sort((a,b) => b.data.localeCompare(a.data));
  if (activeFilter !== "todos") list = list.filter(t => t.tipo === activeFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(t => t.descricao.toLowerCase().includes(q) ||
                             (t.obs || "").toLowerCase().includes(q));
  }
  renderTransList(document.getElementById("transList"), list, false);
}

function renderTransList(container, list, compact) {
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-inbox"></i>Nenhuma transação encontrada</div>`;
    return;
  }
  list.forEach(t => {
    const item = document.createElement("div");
    item.className = "trans-item";
    item.innerHTML = `
      <div class="trans-cat-icon ${t.tipo}">${CAT_ICON[t.categoria] || "📦"}</div>
      <div class="trans-info">
        <div class="trans-desc">${t.descricao}</div>
        <div class="trans-meta">${fmtDate(t.data)}${t.obs ? " · " + t.obs : ""}</div>
      </div>
      <div class="trans-amount ${t.tipo}">${t.tipo === "despesa" ? "-" : "+"}${fmt(t.valor)}</div>
      ${compact ? "" : `
      <div class="trans-actions">
        <button class="act-btn edit" title="Editar" data-id="${t.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="act-btn del"  title="Excluir" data-id="${t.id}"><i class="fa-solid fa-trash"></i></button>
      </div>`}
    `;
    container.appendChild(item);
  });

  container.querySelectorAll(".act-btn.edit").forEach(b => b.addEventListener("click", () => openEditModal(b.dataset.id)));
  container.querySelectorAll(".act-btn.del").forEach(b => b.addEventListener("click", () => deleteTransacao(b.dataset.id)));
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTransacoes();
  });
});
document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value;
  renderTransacoes();
});

// ─────────────────────────────────────────────
//  MODAL TRANSAÇÃO
// ─────────────────────────────────────────────
function openModal(editId = null) {
  document.getElementById("modalTransacao").classList.add("open");
  document.getElementById("editId").value   = editId || "";
  document.getElementById("modalTitle").textContent = editId ? "Editar Transação" : "Nova Transação";

  if (editId) {
    const t = state.transacoes.find(x => x.id === editId);
    if (t) {
      document.getElementById("fDescricao").value = t.descricao;
      document.getElementById("fValor").value     = t.valor;
      document.getElementById("fTipo").value      = t.tipo;
      document.getElementById("fCategoria").value = t.categoria;
      document.getElementById("fData").value      = t.data;
      document.getElementById("fObs").value       = t.obs || "";
    }
  } else {
    document.getElementById("fDescricao").value = "";
    document.getElementById("fValor").value     = "";
    document.getElementById("fTipo").value      = "despesa";
    document.getElementById("fCategoria").value = "alimentacao";
    document.getElementById("fData").value      = nowISO();
    document.getElementById("fObs").value       = "";
  }
}

function openEditModal(id) { openModal(id); }

function closeModal() { document.getElementById("modalTransacao").classList.remove("open"); }

document.getElementById("btnNovaTransacao").addEventListener("click", () => openModal());
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalCancel").addEventListener("click", closeModal);
document.getElementById("modalTransacao").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById("modalSalvar").addEventListener("click", () => {
  const desc = document.getElementById("fDescricao").value.trim();
  const val  = parseFloat(document.getElementById("fValor").value);
  const tipo = document.getElementById("fTipo").value;
  const cat  = document.getElementById("fCategoria").value;
  const data = document.getElementById("fData").value;
  const obs  = document.getElementById("fObs").value.trim();
  const editId = document.getElementById("editId").value;

  if (!desc) { showToast("Informe a descrição.", "error"); return; }
  if (isNaN(val) || val <= 0) { showToast("Valor inválido.", "error"); return; }
  if (!data) { showToast("Informe a data.", "error"); return; }

  if (editId) {
    const idx = state.transacoes.findIndex(x => x.id === editId);
    if (idx > -1) state.transacoes[idx] = { id:editId, descricao:desc, valor:val, tipo, categoria:cat, data, obs };
    showToast("Transação atualizada! ✅");
  } else {
    state.transacoes.push({ id:genId(), descricao:desc, valor:val, tipo, categoria:cat, data, obs });
    showToast("Transação salva! ✅");
  }

  saveState();
  closeModal();
  renderDashboard();
  renderTransacoes();
});

function deleteTransacao(id) {
  if (!confirm("Excluir esta transação?")) return;
  state.transacoes = state.transacoes.filter(t => t.id !== id);
  saveState();
  showToast("Transação excluída.", "warn");
  renderDashboard();
  renderTransacoes();
}

// ─────────────────────────────────────────────
//  CALENDÁRIO
// ─────────────────────────────────────────────
let calYear, calMonth, calSelectedDate;

function initCal() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  calSelectedDate = null;
}

function renderCalendario() {
  const monthName = MONTHS_PT[calMonth] + " " + calYear;
  document.getElementById("calMonthYear").textContent = monthName;

  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  const first = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev  = new Date(calYear, calMonth, 0).getDate();
  const today = nowISO();

  // prev month filler
  for (let i = first - 1; i >= 0; i--) {
    const day = document.createElement("div");
    day.className = "cal-day other-month";
    day.textContent = daysInPrev - i;
    grid.appendChild(day);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const day = document.createElement("div");
    day.className = "cal-day";
    if (iso === today) day.classList.add("today");
    if (calSelectedDate === iso) day.classList.add("selected");

    const num = document.createElement("span");
    num.textContent = d;
    day.appendChild(num);

    // dots for events
    const evs = state.eventos.filter(e => e.data === iso);
    if (evs.length) {
      const dots = document.createElement("div");
      dots.className = "cal-dots";
      evs.slice(0,3).forEach(ev => {
        const dot = document.createElement("div");
        dot.className = `cal-dot ${ev.tipo}`;
        dots.appendChild(dot);
      });
      day.appendChild(dots);
    }

    day.addEventListener("click", () => selectCalDay(iso));
    grid.appendChild(day);
  }

  // next month filler
  const total = first + daysInMonth;
  const remainder = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= remainder; i++) {
    const day = document.createElement("div");
    day.className = "cal-day other-month";
    day.textContent = i;
    grid.appendChild(day);
  }

  renderCalEvents();
}

function selectCalDay(iso) {
  calSelectedDate = iso;
  renderCalendario();
  document.getElementById("calSelectedDate").textContent = fmtDate(iso);
  document.getElementById("btnAddCalEvent").style.display = "";
  renderCalEvents();
}

function renderCalEvents() {
  const el = document.getElementById("calEventsList");
  el.innerHTML = "";
  if (!calSelectedDate) {
    el.innerHTML = `<div class="empty-state" style="padding:20px"><i class="fa-regular fa-calendar"></i>Clique num dia para ver eventos</div>`;
    return;
  }
  const evs = state.eventos.filter(e => e.data === calSelectedDate);
  if (!evs.length) {
    el.innerHTML = `<div class="empty-state" style="padding:20px"><i class="fa-solid fa-calendar-xmark"></i>Nenhum evento neste dia</div>`;
    return;
  }
  evs.forEach(ev => {
    const item = document.createElement("div");
    item.className = "event-item";
    item.innerHTML = `
      <div class="event-dot" style="background:${EVENT_COLORS[ev.tipo]}"></div>
      <div class="event-info">
        <div class="event-title">${ev.titulo}</div>
        <div class="event-sub">${EVENT_LABELS[ev.tipo]}${ev.desc ? " · " + ev.desc : ""}</div>
      </div>
      <div class="event-actions">
        <button class="act-btn edit" title="Editar" data-id="${ev.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="act-btn del"  title="Excluir" data-id="${ev.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    el.appendChild(item);
  });

  el.querySelectorAll(".act-btn.edit").forEach(b => b.addEventListener("click", () => openEventoModal(b.dataset.id)));
  el.querySelectorAll(".act-btn.del").forEach(b => b.addEventListener("click", () => deleteEvento(b.dataset.id)));
}

document.getElementById("calPrev").addEventListener("click", () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendario();
});
document.getElementById("calNext").addEventListener("click", () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendario();
});

// ─────────────────────────────────────────────
//  MODAL EVENTO
// ─────────────────────────────────────────────
function openEventoModal(editId = null) {
  document.getElementById("modalEvento").classList.add("open");
  document.getElementById("eventoEditId").value = editId || "";
  document.getElementById("eventoModalTitle").textContent = editId ? "Editar Evento" : "Novo Evento";

  if (editId) {
    const ev = state.eventos.find(x => x.id === editId);
    if (ev) {
      document.getElementById("eventoTitulo").value = ev.titulo;
      document.getElementById("eventoData").value   = ev.data;
      document.getElementById("eventoTipo").value   = ev.tipo;
      document.getElementById("eventoDesc").value   = ev.desc || "";
    }
  } else {
    document.getElementById("eventoTitulo").value = "";
    document.getElementById("eventoData").value   = calSelectedDate || nowISO();
    document.getElementById("eventoTipo").value   = "lembrete";
    document.getElementById("eventoDesc").value   = "";
  }
}

function closeEventoModal() { document.getElementById("modalEvento").classList.remove("open"); }

document.getElementById("btnAddCalEvent").addEventListener("click", () => openEventoModal());
document.getElementById("eventoModalClose").addEventListener("click", closeEventoModal);
document.getElementById("eventoCancel").addEventListener("click", closeEventoModal);
document.getElementById("modalEvento").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeEventoModal();
});

document.getElementById("eventoSalvar").addEventListener("click", () => {
  const titulo = document.getElementById("eventoTitulo").value.trim();
  const data   = document.getElementById("eventoData").value;
  const tipo   = document.getElementById("eventoTipo").value;
  const desc   = document.getElementById("eventoDesc").value.trim();
  const editId = document.getElementById("eventoEditId").value;

  if (!titulo) { showToast("Informe o título do evento.", "error"); return; }
  if (!data)   { showToast("Informe a data.", "error"); return; }

  if (editId) {
    const idx = state.eventos.findIndex(x => x.id === editId);
    if (idx > -1) state.eventos[idx] = { id:editId, titulo, data, tipo, desc };
    showToast("Evento atualizado! ✅");
  } else {
    state.eventos.push({ id:genId(), titulo, data, tipo, desc });
    showToast("Evento criado! ✅");
  }

  calSelectedDate = data;
  saveState();
  closeEventoModal();
  renderCalendario();
});

function deleteEvento(id) {
  if (!confirm("Excluir este evento?")) return;
  state.eventos = state.eventos.filter(e => e.id !== id);
  saveState();
  showToast("Evento excluído.", "warn");
  renderCalendario();
}

// ─────────────────────────────────────────────
//  CONFIGURAÇÕES
// ─────────────────────────────────────────────
document.getElementById("btnSalvarConfig").addEventListener("click", () => {
  const sal  = parseFloat(document.getElementById("inputSalario").value);
  const meta = parseFloat(document.getElementById("inputMeta").value);
  if (isNaN(sal) || sal < 0)  { showToast("Salário inválido.", "error"); return; }
  if (isNaN(meta) || meta < 0){ showToast("Meta inválida.", "error"); return; }
  state.salario = sal;
  state.meta    = meta;
  saveState();
  document.getElementById("cardSalario").textContent = fmt(sal);
  renderDashboard();
  showToast("Configurações salvas! ✅");
});

document.getElementById("btnEditSalario").addEventListener("click", () => navigate("configuracoes"));

document.getElementById("btnResetAll").addEventListener("click", () => {
  if (!confirm("Tem certeza? Todos os dados serão apagados permanentemente!")) return;
  localStorage.removeItem(STATE_KEY);
  state = { salario:0, meta:0, transacoes:[], eventos:[] };
  renderDashboard();
  showToast("Dados apagados.", "warn");
});

// ─────────────────────────────────────────────
//  DATE BADGE
// ─────────────────────────────────────────────
function updateDateBadge() {
  const d = new Date();
  const opts = { weekday:"short", day:"numeric", month:"short" };
  document.getElementById("currentDate").textContent =
    d.toLocaleDateString("pt-BR", opts);
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
loadState();
initCal();
updateDateBadge();
navigate("dashboard");
