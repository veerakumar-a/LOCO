/* ============================================================
   LOCO — dashboard.js
   Powers dashboard.html (tabs + stats + CRUD) and profile.html
   (profile edit form + skill offer/request form).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashRoot")) initDashboard();
  if (document.getElementById("profileForm")) initProfilePage();
});

/* ================= DASHBOARD ================= */
function initDashboard() {
  if (!requireAuth()) return;
  const user = DB.currentUser();
  document.querySelectorAll(".dash-user-name").forEach(el => el.textContent = user.name);
  document.querySelectorAll(".dash-user-loc").forEach(el => el.textContent = user.location);
  document.querySelectorAll(".dash-user-avatar").forEach(el => { el.style.background = user.avatarColor; el.textContent = user.initials; });

  renderDashStats(user);

  const tabs = document.querySelectorAll(".dash-nav button");
  const panels = document.querySelectorAll(".dash-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      panels.forEach(p => p.classList.add("hidden"));
      document.getElementById(tab.dataset.target).classList.remove("hidden");
      renderDashPanel(tab.dataset.target, user);
    });
  });
  // default panel
  renderDashPanel("panel-listings", user);
}

function renderDashStats(user) {
  const el = document.getElementById("dashStats");
  if (!el) return;
  const myListings = DB.listings().filter(l => l.sellerId === user.id).length;
  const favs = DB.favorites().filter(f => f.userId === user.id).length;
  const events = DB.events().filter(e => e.participants.includes(user.id)).length;
  const convos = DB.messages().filter(c => c.participants.includes(user.id)).length;
  el.innerHTML = `
    <div class="panel stat-card"><b>${myListings}</b><span>Active Listings</span></div>
    <div class="panel stat-card"><b>${favs}</b><span>Saved Items</span></div>
    <div class="panel stat-card"><b>${events}</b><span>Joined Events</span></div>
    <div class="panel stat-card"><b>${convos}</b><span>Conversations</span></div>
  `;
}

function renderDashPanel(target, user) {
  const map = {
    "panel-listings": renderMyListings,
    "panel-saved": renderSavedItems,
    "panel-skills": renderMySkills,
    "panel-events": renderJoinedEvents,
    "panel-messages": renderDashMessages,
    "panel-notifications": renderDashNotifications
  };
  if (map[target]) map[target](user);
}

function emptyBlock(icon, title, sub) {
  return `<div class="empty-state"><div class="icon">${icon}</div><h3>${title}</h3><p>${sub}</p></div>`;
}

function renderMyListings(user) {
  const el = document.getElementById("panel-listings");
  const mine = DB.listings().filter(l => l.sellerId === user.id);
  if (!mine.length) { el.innerHTML = emptyBlock("🛍️", "No listings yet", "Create your first listing to start selling in your community.") + `<a href="create-listing.html" class="btn btn-primary btn-block mt-16">Create a Listing</a>`; return; }
  el.innerHTML = mine.map(l => `
    <div class="dash-list-item">
      <div class="thumb">${l.icon}</div>
      <div class="grow"><b>${l.title}</b><span>₹${l.price.toLocaleString("en-IN")} · ${l.category}</span></div>
      <div class="actions">
        <button class="btn btn-outline btn-sm edit-listing-btn" data-id="${l.id}">Edit</button>
        <button class="btn btn-danger btn-sm delete-listing-btn" data-id="${l.id}">Delete</button>
      </div>
    </div>`).join("");
  el.querySelectorAll(".edit-listing-btn").forEach(b => b.addEventListener("click", () => window.location.href = "create-listing.html?edit=" + b.dataset.id));
  el.querySelectorAll(".delete-listing-btn").forEach(b => b.addEventListener("click", () => {
    confirmDialog("Delete this listing? This cannot be undone.", () => {
      DB.deleteListing(b.dataset.id);
      toast("Listing deleted", "success");
      renderMyListings(user);
      renderDashStats(user);
    });
  }));
}

function renderSavedItems(user) {
  const el = document.getElementById("panel-saved");
  const favs = DB.favorites().filter(f => f.userId === user.id);
  if (!favs.length) { el.innerHTML = emptyBlock("❤️", "No saved items", "Tap the heart icon on any listing, service, or event to save it here."); return; }
  el.innerHTML = favs.map(f => {
    const item = getItemById(f.itemId, f.itemType) || DB.skills().find(s => s.id === f.itemId);
    if (!item) return "";
    const title = item.title || item.name || item.skill;
    return `
    <div class="dash-list-item">
      <div class="thumb">${item.icon || "⭐"}</div>
      <div class="grow"><b>${title}</b><span>${f.itemType}</span></div>
      <div class="actions">
        <button class="btn btn-outline btn-sm view-fav-btn" data-id="${f.itemId}" data-type="${f.itemType}">View</button>
        <button class="btn btn-danger btn-sm rm-fav-btn" data-id="${f.itemId}" data-type="${f.itemType}">Remove</button>
      </div>
    </div>`;
  }).join("");
  el.querySelectorAll(".view-fav-btn").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.type === "skill") { window.location.href = "skills.html"; } else { openDetailsModal(b.dataset.id, b.dataset.type); }
  }));
  el.querySelectorAll(".rm-fav-btn").forEach(b => b.addEventListener("click", () => {
    DB.toggleFavorite(user.id, b.dataset.id, b.dataset.type);
    toast("Removed from favorites", "success");
    renderSavedItems(user);
    renderDashStats(user);
  }));
}

function renderMySkills(user) {
  const el = document.getElementById("panel-skills");
  const mine = DB.skills().filter(s => s.userId === user.id);
  const offered = mine.filter(s => s.type === "offer");
  const requested = mine.filter(s => s.type === "request");
  el.innerHTML = `
    <div class="flex justify-between items-center mb-16">
      <h3 style="margin:0;">Your Skills</h3>
      <button class="btn btn-primary btn-sm" id="addSkillBtn">+ Add Skill</button>
    </div>
    <b class="muted" style="font-size:12.5px;">OFFERING (${offered.length})</b>
    ${offered.length ? offered.map(skillRow).join("") : emptyBlock("🎓", "Nothing offered yet", "Share a skill you're good at.")}
    <b class="muted" style="font-size:12.5px;display:block;margin-top:20px;">REQUESTING (${requested.length})</b>
    ${requested.length ? requested.map(skillRow).join("") : emptyBlock("🙋", "Nothing requested yet", "Ask the community to teach you something.")}
  `;
  function skillRow(s) {
    return `<div class="dash-list-item"><div class="thumb">${s.icon}</div>
      <div class="grow"><b>${s.skill}</b><span>${s.level} · ${s.availability}</span></div>
      <div class="actions"><button class="btn btn-danger btn-sm rm-skill-btn" data-id="${s.id}">Remove</button></div></div>`;
  }
  el.querySelectorAll(".rm-skill-btn").forEach(b => b.addEventListener("click", () => {
    confirmDialog("Remove this skill entry?", () => {
      DB.saveSkills(DB.skills().filter(s => s.id !== b.dataset.id));
      toast("Skill removed", "success");
      renderMySkills(user);
    });
  }));
  document.getElementById("addSkillBtn").addEventListener("click", () => openSkillModal(user));
}

function openSkillModal(user) {
  let overlay = document.getElementById("skillModal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "skillModal";
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-head"><h3 style="margin:0;">Add a Skill</h3><button class="modal-close" data-close>✕</button></div>
        <form id="skillForm">
          <div class="form-group"><label>Skill</label>
            <select class="form-control" id="skillName">
              ${["Python","Web Development","Graphic Design","Video Editing","Photography","Guitar","Spoken English","Mathematics"].map(s => `<option>${s}</option>`).join("")}
            </select></div>
          <div class="form-row">
            <div class="form-group"><label>I want to</label>
              <select class="form-control" id="skillType"><option value="offer">Offer this skill</option><option value="request">Request this skill</option></select></div>
            <div class="form-group"><label>Level</label>
              <select class="form-control" id="skillLevel"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></div>
          </div>
          <div class="form-group"><label>Availability</label>
            <select class="form-control" id="skillAvail"><option>Weekends</option><option>Weekday evenings</option><option>Weekday mornings</option><option>Flexible</option></select></div>
          <button class="btn btn-primary btn-block" type="submit">Save Skill</button>
        </form>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.hasAttribute("data-close")) closeModal(overlay); });
  }
  const form = overlay.querySelector("#skillForm");
  form.onsubmit = (e) => {
    e.preventDefault();
    const skillName = form.querySelector("#skillName").value;
    DB.addSkill({
      id: "sk" + Date.now(),
      skill: skillName,
      icon: CATEGORY_ICONS[skillName] || "✨",
      userId: user.id,
      type: form.querySelector("#skillType").value,
      level: form.querySelector("#skillLevel").value,
      location: user.location,
      availability: form.querySelector("#skillAvail").value
    });
    closeModal(overlay);
    toast("Skill added", "success");
    renderMySkills(user);
  };
  openModal(overlay);
}

function renderJoinedEvents(user) {
  const el = document.getElementById("panel-events");
  const joined = DB.events().filter(e => e.participants.includes(user.id));
  if (!joined.length) { el.innerHTML = emptyBlock("📅", "No events joined", "Browse community events and hit Join to see them here."); return; }
  el.innerHTML = joined.map(ev => `
    <div class="dash-list-item">
      <div class="thumb">${ev.icon}</div>
      <div class="grow"><b>${ev.name}</b><span>${ev.date} · ${ev.location}</span></div>
      <div class="actions">
        <button class="btn btn-outline btn-sm leave-event-btn" data-id="${ev.id}">Leave</button>
      </div>
    </div>`).join("");
  el.querySelectorAll(".leave-event-btn").forEach(b => b.addEventListener("click", () => {
    DB.joinEvent(b.dataset.id, user.id);
    toast("Left event", "success");
    renderJoinedEvents(user);
    renderDashStats(user);
  }));
}

function renderDashMessages(user) {
  const el = document.getElementById("panel-messages");
  const convos = DB.messages().filter(c => c.participants.includes(user.id));
  if (!convos.length) { el.innerHTML = emptyBlock("💬", "No messages yet", "Connect with a seller, provider, or skill match to start chatting."); return; }
  el.innerHTML = convos.map(c => {
    const otherId = c.participants.find(p => p !== user.id);
    const other = DB.userById(otherId);
    const last = c.thread[c.thread.length - 1];
    return `<div class="dash-list-item" style="cursor:pointer;" onclick="window.location.href='messages.html?with=${otherId}'">
      <span class="avatar" style="background:${other.avatarColor}">${other.initials}</span>
      <div class="grow"><b>${other.name}</b><span>${last ? last.text : ""}</span></div>
      <span class="muted" style="font-size:12px;">${last ? timeAgo(last.time) : ""}</span>
    </div>`;
  }).join("");
}

function renderDashNotifications() {
  const el = document.getElementById("panel-notifications");
  const notifs = DB.notifications().sort((a, b) => b.time - a.time);
  if (!notifs.length) { el.innerHTML = emptyBlock("🔔", "You're all caught up", "New notifications will show up here."); return; }
  el.innerHTML = notifs.map(n => `
    <div class="dash-list-item">
      <div class="thumb">${n.type === "message" ? "💬" : n.type === "event" ? "📅" : n.type === "favorite" ? "❤️" : "🔔"}</div>
      <div class="grow"><b style="font-weight:600;font-size:13.5px;">${n.text}</b><span>${timeAgo(n.time)}</span></div>
    </div>`).join("");
  DB.markAllNotificationsRead();
}

/* ================= PROFILE PAGE ================= */
function initProfilePage() {
  if (!requireAuth()) return;
  const user = DB.currentUser();
  const form = document.getElementById("profileForm");
  form.querySelector("#profName").value = user.name;
  form.querySelector("#profEmail").value = user.email;
  form.querySelector("#profLocation").value = user.location.replace(", Coimbatore", "");
  form.querySelector("#profBio").value = user.bio;
  const avatarPreview = document.getElementById("profAvatarPreview");
  if (avatarPreview) { avatarPreview.style.background = user.avatarColor; avatarPreview.textContent = user.initials; }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameGroup = form.querySelector("#profName").closest(".form-group");
    const nameOk = form.querySelector("#profName").value.trim().length >= 3;
    nameGroup.classList.toggle("has-error", !nameOk);
    if (!nameOk) return;
    const btn = form.querySelector("button[type=submit]");
    btn.classList.add("loading");
    setTimeout(() => {
      const patch = {
        name: form.querySelector("#profName").value.trim(),
        location: form.querySelector("#profLocation").value.trim() + ", Coimbatore",
        bio: form.querySelector("#profBio").value.trim(),
        initials: initials(form.querySelector("#profName").value.trim())
      };
      const users = DB.users().map(u => u.id === user.id ? { ...u, ...patch } : u);
      store.set(DB_KEYS.users, users);
      btn.classList.remove("loading");
      toast("Profile updated", "success");
      renderAuthNav();
      setTimeout(() => window.location.reload(), 600);
    }, 600);
  });
}
