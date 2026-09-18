/* ============================================================
   LOCO — marketplace.js
   Powers: marketplace.html, services.html, skills.html,
   events.html, create-listing.html, and the home page's
   trending / nearby / events preview sections.
   ============================================================ */

const PAGE_SIZE = 8;

/* ---------- card templates ---------- */
function listingCardHTML(l) {
  const seller = DB.userById(l.sellerId);
  return `
  <div class="card" data-id="${l.id}" data-type="listing">
    <div class="card-media">${l.icon}
      <button class="fav-toggle" data-item-id="${l.id}" data-item-type="listing" aria-label="Save to favorites">❤️</button>
    </div>
    <div class="card-body">
      <span class="card-cat">${l.category}</span>
      <span class="card-title">${l.title}</span>
      <div class="card-meta">📍 ${l.location}</div>
      <div class="card-price">₹${l.price.toLocaleString("en-IN")}</div>
      <div class="seller-row"><span class="avatar sm" style="background:${seller.avatarColor}">${seller.initials}</span> ${seller.name}</div>
      <div class="card-footer">
        <span class="rating">⭐ ${l.rating}</span>
        <button class="btn btn-ghost btn-sm view-details" data-id="${l.id}" data-type="listing">View Details</button>
      </div>
    </div>
  </div>`;
}

function serviceCardHTML(s) {
  const provider = DB.userById(s.providerId);
  return `
  <div class="card" data-id="${s.id}" data-type="service">
    <div class="card-media">${s.icon}
      <button class="fav-toggle" data-item-id="${s.id}" data-item-type="service" aria-label="Save to favorites">❤️</button>
    </div>
    <div class="card-body">
      <span class="card-cat">${s.category}</span>
      <span class="card-title">${s.title}</span>
      <div class="card-meta">📍 ${s.location}</div>
      <div class="card-price">₹${s.price.toLocaleString("en-IN")} <small>${s.unit}</small></div>
      <div class="seller-row"><span class="avatar sm" style="background:${provider.avatarColor}">${provider.initials}</span> ${provider.name}</div>
      <div class="card-footer">
        <span class="rating">⭐ ${s.rating}</span>
        <button class="btn btn-ghost btn-sm view-details" data-id="${s.id}" data-type="service">View Details</button>
      </div>
    </div>
  </div>`;
}

function skillCardHTML(sk) {
  const user = DB.userById(sk.userId);
  return `
  <div class="card skill-card" data-id="${sk.id}" data-type="skill">
    <div class="skill-top">
      <div class="skill-icon">${sk.icon}</div>
      <div>
        <div class="card-title">${sk.skill}</div>
        <span class="tag ${sk.type === "offer" ? "tag-offer" : "tag-request"}">${sk.type === "offer" ? "Offering" : "Requesting"}</span>
        <span class="tag tag-level">${sk.level}</span>
      </div>
    </div>
    <div class="seller-row"><span class="avatar sm" style="background:${user.avatarColor}">${user.initials}</span> ${user.name}</div>
    <div class="card-meta">📍 ${sk.location} &nbsp;·&nbsp; 🕒 ${sk.availability}</div>
    <div class="card-footer">
      <span></span>
      <button class="btn btn-primary btn-sm connect-btn" data-user-id="${sk.userId}" data-skill="${sk.skill}">Connect</button>
    </div>
  </div>`;
}

function eventCardHTML(ev) {
  const organizer = DB.userById(ev.organizerId);
  const d = new Date(ev.date);
  const month = d.toLocaleString("en", { month: "short" });
  const pct = Math.min(100, Math.round((ev.participants.length / ev.capacity) * 100));
  const user = DB.currentUser();
  const joined = user && ev.participants.includes(user.id);
  return `
  <div class="card event-card" data-id="${ev.id}" data-type="event">
    <div class="card-media">${ev.icon}
      <div class="event-date-badge">${d.getDate()}<br>${month}</div>
    </div>
    <div class="card-body">
      <span class="card-title">${ev.name}</span>
      <div class="card-meta">📍 ${ev.location}</div>
      <div class="card-meta">🕒 ${ev.time}</div>
      <div class="seller-row">Organized by <span class="avatar sm" style="background:${organizer.avatarColor}">${organizer.initials}</span> ${organizer.name}</div>
      <div class="progress-bar"><div style="width:${pct}%"></div></div>
      <div class="card-meta">${ev.participants.length} / ${ev.capacity} joined</div>
      <div class="card-footer">
        <button class="btn btn-outline btn-sm view-details" data-id="${ev.id}" data-type="event">Details</button>
        <button class="btn ${joined ? "btn-outline" : "btn-primary"} btn-sm join-event-btn" data-id="${ev.id}">${joined ? "Leave Event" : "Join Event"}</button>
      </div>
    </div>
  </div>`;
}

/* ---------- generic paginated grid renderer ---------- */
function renderGrid({ gridId, emptyId, data, templateFn, page, onPageChange, loadMoreId }) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  if (!grid) return;
  const visible = data.slice(0, page * PAGE_SIZE);
  if (!data.length) {
    grid.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    if (loadMoreId) document.getElementById(loadMoreId)?.classList.add("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  grid.innerHTML = visible.map(templateFn).join("");
  wireFavoriteButtons(grid);
  wireDetailButtons(grid);
  wireConnectButtons(grid);
  wireJoinEventButtons(grid);
  if (loadMoreId) {
    const lm = document.getElementById(loadMoreId);
    if (lm) lm.classList.toggle("hidden", visible.length >= data.length);
  }
}

/* ---------- skeleton loading ---------- */
function showSkeleton(gridId, count = 8) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }).map(() => `<div class="skeleton skeleton-card"></div>`).join("");
}

/* ---------- details modal ---------- */
function wireDetailButtons(root) {
  root.querySelectorAll(".view-details").forEach(btn => {
    btn.addEventListener("click", () => openDetailsModal(btn.dataset.id, btn.dataset.type));
  });
  root.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openDetailsModal(card.dataset.id, card.dataset.type);
    });
  });
}

function getItemById(id, type) {
  if (type === "listing") return DB.listings().find(x => x.id === id);
  if (type === "service") return DB.services().find(x => x.id === id);
  if (type === "event") return DB.events().find(x => x.id === id);
  return null;
}

function openDetailsModal(id, type) {
  const item = getItemById(id, type);
  if (!item) return;
  let overlay = document.getElementById("detailsModal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "detailsModal";
    overlay.innerHTML = `<div class="modal wide" id="detailsModalContent"></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(overlay); });
  }
  const content = document.getElementById("detailsModalContent");

  if (type === "event") {
    const organizer = DB.userById(item.organizerId);
    const user = DB.currentUser();
    const joined = user && item.participants.includes(user.id);
    content.innerHTML = `
      <div class="modal-head">
        <div><h3 style="margin:0 0 4px;">${item.name}</h3><span class="muted">${item.location}</span></div>
        <button class="modal-close" onclick="closeModal(document.getElementById('detailsModal'))">✕</button>
      </div>
      <div class="card-media" style="border-radius:16px;height:180px;">${item.icon}</div>
      <div class="mt-16"><b>📅 ${item.date}</b> &nbsp; <b>🕒 ${item.time}</b></div>
      <p class="mt-16">${item.description}</p>
      <div class="flex items-center gap-8 mt-16">
        <span class="avatar sm" style="background:${organizer.avatarColor}">${organizer.initials}</span>
        <span>Organized by <b>${organizer.name}</b></span>
      </div>
      <div class="progress-bar mt-16"><div style="width:${Math.min(100, Math.round(item.participants.length / item.capacity * 100))}%"></div></div>
      <div class="muted mt-8">${item.participants.length} / ${item.capacity} people joined</div>
      <button class="btn ${joined ? "btn-outline" : "btn-primary"} btn-block mt-24 join-event-btn" data-id="${item.id}">${joined ? "Leave Event" : "Join Event"}</button>
    `;
    wireJoinEventButtons(content);
  } else {
    const personId = type === "listing" ? item.sellerId : item.providerId;
    const person = DB.userById(personId);
    const priceLine = type === "listing"
      ? `₹${item.price.toLocaleString("en-IN")}`
      : `₹${item.price.toLocaleString("en-IN")} <small class="muted">${item.unit}</small>`;
    content.innerHTML = `
      <div class="modal-head">
        <div><h3 style="margin:0 0 4px;">${item.title}</h3><span class="tag tag-level">${item.category}</span></div>
        <button class="modal-close" onclick="closeModal(document.getElementById('detailsModal'))">✕</button>
      </div>
      <div class="card-media" style="border-radius:16px;height:180px;position:relative;">${item.icon}
        <button class="fav-toggle" data-item-id="${item.id}" data-item-type="${type}">❤️</button>
      </div>
      <div class="flex justify-between items-center mt-16">
        <span class="card-price" style="font-size:22px;">${priceLine}</span>
        <span class="rating">⭐ ${item.rating}</span>
      </div>
      <div class="card-meta mt-8">📍 ${item.location} ${item.condition ? "· Condition: " + item.condition : ""}</div>
      <p class="mt-16">${item.description}</p>
      <div class="panel flex items-center gap-12 mt-16" style="padding:14px 18px;">
        <span class="avatar" style="background:${person.avatarColor}">${person.initials}</span>
        <div><b>${person.name}</b><div class="muted" style="font-size:12.5px;">${person.location} · ⭐ ${person.rating}</div></div>
      </div>
      <div class="flex gap-12 mt-24">
        <button class="btn btn-outline btn-block modal-fav-btn" data-item-id="${item.id}" data-item-type="${type}">Save</button>
        <button class="btn btn-primary btn-block connect-btn" data-user-id="${personId}" data-skill="${item.title}">Message ${person.name.split(" ")[0]}</button>
      </div>
    `;
    wireFavoriteButtons(content);
    wireConnectButtons(content);
    const modalFav = content.querySelector(".modal-fav-btn");
    if (modalFav) modalFav.addEventListener("click", () => content.querySelector(".fav-toggle").click());
  }
  openModal(overlay);
}
window.openDetailsModal = openDetailsModal;

/* ---------- connect button -> seeds a message + redirects ---------- */
function wireConnectButtons(root) {
  root.querySelectorAll(".connect-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!requireAuth()) return;
      const me = DB.currentUser();
      const otherId = btn.dataset.userId;
      if (otherId === me.id) { toast("This is your own listing", "info"); return; }
      DB.sendMessage(me.id, otherId, `Hi! I'm interested in "${btn.dataset.skill}". Is it still available?`);
      toast("Message sent — opening conversation", "success");
      setTimeout(() => window.location.href = "messages.html?with=" + otherId, 500);
    });
  });
}

/* ---------- join / leave event ---------- */
function wireJoinEventButtons(root) {
  root.querySelectorAll(".join-event-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!requireAuth()) return;
      const me = DB.currentUser();
      DB.joinEvent(btn.dataset.id, me.id);
      const ev = DB.events().find(x => x.id === btn.dataset.id);
      const joined = ev.participants.includes(me.id);
      toast(joined ? "You joined " + ev.name : "You left " + ev.name, "success");
      if (typeof refreshCurrentPage === "function") refreshCurrentPage();
      const overlay = document.getElementById("detailsModal");
      if (overlay && overlay.classList.contains("open")) openDetailsModal(ev.id, "event");
    });
  });
}

/* ---------- Filtering state machines for each listing page ---------- */
function setupFilterPage(config) {
  // config: { gridId, emptyId, loadMoreId, dataFn, templateFn, categories, searchInputId }
  const activeChip = document.querySelector("[data-filter-chip].active");
  const searchInputEl = config.searchInputId ? document.getElementById(config.searchInputId) : null;
  let state = {
    category: activeChip ? activeChip.dataset.filterChip : "all",
    sort: "newest",
    query: searchInputEl ? searchInputEl.value : "",
    page: 1
  };

  function apply() {
    let data = config.dataFn();
    if (state.query) {
      const q = state.query.toLowerCase();
      data = data.filter(d => (d.title || d.name || d.skill || "").toLowerCase().includes(q));
    }
    if (state.category !== "all") {
      data = data.filter(d => d.category === state.category || d.skill === state.category);
    }
    if (state.sort === "price-low") data = [...data].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (state.sort === "price-high") data = [...data].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (state.sort === "rating") data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (state.sort === "popular") data = [...data].sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));
    if (state.sort === "newest") data = [...data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderGrid({ gridId: config.gridId, emptyId: config.emptyId, data, templateFn: config.templateFn, page: state.page, loadMoreId: config.loadMoreId });
  }

  document.querySelectorAll(`[data-filter-chip]`).forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(`[data-filter-chip]`).forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.category = chip.dataset.filterChip;
      state.page = 1;
      apply();
    });
  });
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; state.page = 1; apply(); });

  if (config.searchInputId) {
    const input = document.getElementById(config.searchInputId);
    if (input) input.addEventListener("input", () => { state.query = input.value; state.page = 1; apply(); });
  }

  const loadMoreBtn = document.getElementById(config.loadMoreId);
  if (loadMoreBtn) loadMoreBtn.addEventListener("click", () => { state.page++; apply(); });

  window.refreshCurrentPage = apply;
  showSkeleton(config.gridId);
  setTimeout(apply, 350); // simulate loading for skeleton effect
}
window.setupFilterPage = setupFilterPage;

/* ---------- Create / Edit Listing page ---------- */
function initCreateListingPage() {
  const form = document.getElementById("createListingForm");
  if (!form) return;
  if (!requireAuth()) return;
  const user = DB.currentUser();
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  let chosenIcon = "📦";

  const iconGrid = document.getElementById("iconPicker");
  const icons = ["📦","💻","📚","🛋️","👕","🏠","🍱","🏸","🎧","🚲","📷","🪑"];
  if (iconGrid) {
    iconGrid.innerHTML = icons.map(i => `<button type="button" class="preview-thumb icon-pick" data-icon="${i}">${i}</button>`).join("");
    iconGrid.querySelectorAll(".icon-pick").forEach(btn => {
      btn.addEventListener("click", () => {
        chosenIcon = btn.dataset.icon;
        iconGrid.querySelectorAll(".icon-pick").forEach(b => b.style.outline = "none");
        btn.style.outline = "3px solid var(--blue)";
        document.getElementById("mediaPreview").textContent = chosenIcon;
      });
    });
  }

  if (editId) {
    const existing = DB.listings().find(l => l.id === editId);
    if (existing && existing.sellerId === user.id) {
      form.querySelector("#lTitle").value = existing.title;
      form.querySelector("#lCategory").value = existing.category;
      form.querySelector("#lPrice").value = existing.price;
      form.querySelector("#lCondition").value = existing.condition;
      form.querySelector("#lLocation").value = existing.location;
      form.querySelector("#lDescription").value = existing.description;
      chosenIcon = existing.icon;
      document.getElementById("mediaPreview").textContent = chosenIcon;
      document.getElementById("formTitle").textContent = "Edit Listing";
      document.getElementById("submitBtnLabel").textContent = "Save Changes";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.querySelector("#lTitle");
    const price = form.querySelector("#lPrice");
    const category = form.querySelector("#lCategory");
    const location = form.querySelector("#lLocation");
    const description = form.querySelector("#lDescription");

    const titleOk = validateGroup(title, title.value.trim().length >= 4, "Title must be at least 4 characters");
    const priceOk = validateGroup(price, Number(price.value) > 0, "Enter a valid price greater than 0");
    const locOk = validateGroup(location, location.value.trim().length >= 2, "Enter a pickup location");
    const descOk = validateGroup(description, description.value.trim().length >= 10, "Add a short description (10+ characters)");
    if (!titleOk || !priceOk || !locOk || !descOk) { toast("Please fix the highlighted fields", "error"); return; }

    const btn = form.querySelector("button[type=submit]");
    btn.classList.add("loading");

    setTimeout(() => {
      if (editId) {
        DB.updateListing(editId, {
          title: title.value.trim(), category: category.value, price: Number(price.value),
          condition: form.querySelector("#lCondition").value, location: location.value.trim(),
          description: description.value.trim(), icon: chosenIcon
        });
        toast("Listing updated", "success");
      } else {
        DB.addListing({
          id: "l" + Date.now(),
          title: title.value.trim(), category: category.value, price: Number(price.value),
          condition: form.querySelector("#lCondition").value, icon: chosenIcon,
          location: location.value.trim(), sellerId: user.id, rating: "5.0",
          description: description.value.trim(), createdAt: Date.now()
        });
        toast("Listing created", "success");
      }
      setTimeout(() => window.location.href = "dashboard.html", 500);
    }, 500);
  });
}
function validateGroup(input, cond, msg) {
  const group = input.closest(".form-group");
  const err = group.querySelector(".error-text");
  group.classList.toggle("has-error", !cond);
  if (err) err.textContent = msg;
  return cond;
}
document.addEventListener("DOMContentLoaded", initCreateListingPage);
