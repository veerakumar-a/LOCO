/* ============================================================
   LOCO — app.js
   Global behaviour shared by every page: theme toggle, mobile
   nav drawer, toast system, modal helpers, notification panel,
   auth-aware nav state, back-to-top, global search suggestions.
   ============================================================ */

/* ---------- Theme ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.querySelector("#themeToggle .theme-icon");
  if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
}
function initTheme() {
  applyTheme(DB.theme());
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = DB.theme() === "dark" ? "light" : "dark";
      DB.setTheme(next);
      applyTheme(next);
      toast("Switched to " + next + " mode", "info");
    });
  }
}

/* ---------- Toasts ---------- */
function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}
function toast(message, type = "info", duration = 3200) {
  const stack = ensureToastStack();
  const el = document.createElement("div");
  el.className = "toast " + type;
  const icon = type === "success" ? "✅" : type === "error" ? "⚠️" : "🔔";
  el.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    el.style.opacity = "0";
    el.style.transform = "translateX(30px)";
    setTimeout(() => el.remove(), 300);
  }, duration);
}
window.toast = toast;

/* ---------- Modal helpers ---------- */
function openModal(overlayEl) {
  overlayEl.classList.add("open");
  document.body.style.overflow = "hidden";
  const onKey = (e) => { if (e.key === "Escape") closeModal(overlayEl); };
  overlayEl._escHandler = onKey;
  document.addEventListener("keydown", onKey);
  const focusable = overlayEl.querySelector("input,button,textarea,select,a");
  if (focusable) setTimeout(() => focusable.focus(), 50);
}
function closeModal(overlayEl) {
  overlayEl.classList.remove("open");
  document.body.style.overflow = "";
  if (overlayEl._escHandler) document.removeEventListener("keydown", overlayEl._escHandler);
}
window.openModal = openModal;
window.closeModal = closeModal;

function confirmDialog(message, onConfirm) {
  let overlay = document.getElementById("globalConfirmModal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "globalConfirmModal";
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px;">
        <div class="modal-head"><h3 style="margin:0;">Are you sure?</h3>
          <button class="modal-close" data-close>✕</button></div>
        <p class="muted" id="confirmMsg"></p>
        <div class="flex gap-12 mt-16">
          <button class="btn btn-outline btn-block" data-close>Cancel</button>
          <button class="btn btn-danger btn-block" id="confirmYes">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.hasAttribute("data-close")) closeModal(overlay); });
  }
  overlay.querySelector("#confirmMsg").textContent = message;
  const yesBtn = overlay.querySelector("#confirmYes");
  const newYes = yesBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newYes, yesBtn);
  newYes.addEventListener("click", () => { closeModal(overlay); onConfirm(); });
  openModal(overlay);
}
window.confirmDialog = confirmDialog;

/* ---------- Mobile nav drawer ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  const backdrop = document.querySelector(".drawer-backdrop");
  if (!toggle || !drawer) return;
  const open = () => { drawer.classList.add("open"); backdrop.classList.add("open"); };
  const close = () => { drawer.classList.remove("open"); backdrop.classList.remove("open"); };
  toggle.addEventListener("click", open);
  backdrop.addEventListener("click", close);
  drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 500);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Notification panel ---------- */
function renderNotifPanel() {
  const list = document.getElementById("notifList");
  const count = document.getElementById("notifCount");
  if (!list) return;
  const notifs = DB.notifications().sort((a, b) => b.time - a.time);
  const unread = DB.unreadNotificationCount();
  if (count) {
    count.textContent = unread;
    count.classList.toggle("hidden", unread === 0);
  }
  if (!notifs.length) {
    list.innerHTML = `<div class="empty-state" style="padding:30px 10px;"><div class="icon">🔔</div><p>No notifications yet</p></div>`;
    return;
  }
  list.innerHTML = notifs.map(n => `
    <div class="sugg-item" style="align-items:flex-start; ${n.read ? "" : "background:rgba(37,99,235,0.05);"}">
      <span>${n.type === "message" ? "💬" : n.type === "event" ? "📅" : n.type === "favorite" ? "❤️" : "🔔"}</span>
      <div><div style="font-size:13px;">${n.text}</div><div class="sugg-tag" style="margin-left:0;">${timeAgo(n.time)}</div></div>
    </div>`).join("");
}
function initNotifPanel() {
  const bell = document.getElementById("notifBell");
  const panel = document.getElementById("notifPanel");
  if (!bell || !panel) return;
  renderNotifPanel();
  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) {
      DB.markAllNotificationsRead();
      renderNotifPanel();
    }
  });
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== bell) panel.classList.add("hidden");
  });
}

/* ---------- Time helper ---------- */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  return days + "d ago";
}
window.timeAgo = timeAgo;

/* ---------- Auth-aware nav ---------- */
function renderAuthNav() {
  const user = DB.currentUser();
  const slot = document.getElementById("navUserSlot");
  if (!slot) return;
  if (user) {
    slot.innerHTML = `
      <a href="dashboard.html" class="avatar sm" style="background:${user.avatarColor}">${user.initials}</a>
    `;
  } else {
    slot.innerHTML = `<a href="login.html" class="btn btn-primary btn-sm">Sign In</a>`;
  }
}

/* ---------- Favorite toggle helper (used across pages) ---------- */
function wireFavoriteButtons(root = document) {
  root.querySelectorAll(".fav-toggle").forEach(btn => {
    const { itemId, itemType } = btn.dataset;
    const user = DB.currentUser();
    const uid = user ? user.id : "guest";
    if (DB.isFavorite(uid, itemId, itemType)) btn.classList.add("active");
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!DB.currentUser()) {
        toast("Please sign in to save favorites", "error");
        return;
      }
      const nowFav = DB.toggleFavorite(uid, itemId, itemType);
      btn.classList.toggle("active", nowFav);
      toast(nowFav ? "Added to favorites" : "Removed from favorites", "success");
    };
  });
}
window.wireFavoriteButtons = wireFavoriteButtons;

/* ---------- Global search suggestions (used on home + marketplace search bars) ---------- */
function initGlobalSearch(inputId, suggBoxId, onSubmit) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggBoxId);
  if (!input || !box) return;
  const pool = () => {
    const listings = DB.listings().map(l => ({ label: l.title, tag: "Marketplace", icon: l.icon }));
    const services = DB.services().map(s => ({ label: s.title, tag: "Service", icon: s.icon }));
    const skills = DB.skills().map(s => ({ label: s.skill + " (" + s.type + ")", tag: "Skill", icon: s.icon }));
    const events = DB.events().map(e => ({ label: e.name, tag: "Event", icon: e.icon }));
    return [...listings, ...services, ...skills, ...events];
  };
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.classList.add("hidden"); box.innerHTML = ""; return; }
    const matches = pool().filter(p => p.label.toLowerCase().includes(q)).slice(0, 6);
    if (!matches.length) {
      box.innerHTML = `<div class="sugg-item">No matches found for "${input.value}"</div>`;
    } else {
      box.innerHTML = matches.map(m => `<div class="sugg-item" data-val="${m.label.replace(/"/g, '')}"><span>${m.icon}</span><span>${m.label}</span><span class="sugg-tag">${m.tag}</span></div>`).join("");
    }
    box.classList.remove("hidden");
  });
  box.addEventListener("click", (e) => {
    const item = e.target.closest(".sugg-item");
    if (item && item.dataset.val) {
      input.value = item.dataset.val;
      box.classList.add("hidden");
      if (onSubmit) onSubmit(input.value);
    }
  });
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !box.contains(e.target)) box.classList.add("hidden");
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      box.classList.add("hidden");
      if (onSubmit) onSubmit(input.value);
    }
  });
}
window.initGlobalSearch = initGlobalSearch;

/* ---------- Auth guard for protected pages ---------- */
function requireAuth() {
  if (!DB.currentUser()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}
window.requireAuth = requireAuth;

/* ---------- Init on every page ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileNav();
  initBackToTop();
  initNotifPanel();
  renderAuthNav();
  markActiveNavLink();
});

function markActiveNavLink() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-drawer a").forEach(a => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}
