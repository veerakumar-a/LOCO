/* ============================================================
   LOCO — messages.js
   Powers messages.html: conversation list + thread + send box.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("msgLayout")) return;
  if (!requireAuth()) return;
  initMessagesPage();
});

function initMessagesPage() {
  const user = DB.currentUser();
  const params = new URLSearchParams(window.location.search);
  const withUser = params.get("with");

  let activeConvoId = null;

  function renderList() {
    const listEl = document.getElementById("msgList");
    const convos = DB.messages()
      .filter(c => c.participants.includes(user.id))
      .sort((a, b) => (b.thread[b.thread.length - 1]?.time || 0) - (a.thread[a.thread.length - 1]?.time || 0));

    if (!convos.length) {
      listEl.innerHTML = `<div class="empty-state"><div class="icon">💬</div><h3>No conversations</h3><p>Connect with someone from Marketplace, Services, or Skills.</p></div>`;
      return;
    }
    listEl.innerHTML = convos.map(c => {
      const otherId = c.participants.find(p => p !== user.id);
      const other = DB.userById(otherId);
      const last = c.thread[c.thread.length - 1];
      return `<div class="msg-list-item ${c.id === activeConvoId ? "active" : ""}" data-id="${c.id}" data-other="${otherId}">
        <span class="avatar sm" style="background:${other.avatarColor}">${other.initials}</span>
        <div class="grow"><b>${other.name}</b><span>${last ? last.text : "Say hello!"}</span></div>
      </div>`;
    }).join("");
    listEl.querySelectorAll(".msg-list-item").forEach(item => {
      item.addEventListener("click", () => openThread(item.dataset.id, item.dataset.other));
    });
  }

  function openThread(convoId, otherId) {
    activeConvoId = convoId;
    renderList();
    const other = DB.userById(otherId);
    const convo = DB.messages().find(c => c.id === convoId);
    const threadEl = document.getElementById("msgThread");
    threadEl.classList.remove("hidden");
    document.getElementById("msgEmptyState")?.classList.add("hidden");

    document.getElementById("threadOtherAvatar").style.background = other.avatarColor;
    document.getElementById("threadOtherAvatar").textContent = other.initials;
    document.getElementById("threadOtherName").textContent = other.name;
    document.getElementById("threadOtherLoc").textContent = other.location;

    const bodyEl = document.getElementById("msgThreadBody");
    bodyEl.innerHTML = convo.thread.map(m => `
      <div class="bubble ${m.from === user.id ? "me" : "them"}">${escapeHtml(m.text)}</div>
    `).join("");
    bodyEl.scrollTop = bodyEl.scrollHeight;

    const form = document.getElementById("msgSendForm");
    form.dataset.other = otherId;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  document.getElementById("msgSendForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("msgInput");
    const text = input.value.trim();
    const otherId = e.target.dataset.other;
    if (!text || !otherId) return;
    DB.sendMessage(user.id, otherId, text);
    input.value = "";
    openThread(DB.conversationWith(user.id, otherId).id, otherId);
  });

  renderList();
  if (withUser) {
    let convo = DB.conversationWith(user.id, withUser);
    if (!convo) {
      convo = DB.sendMessage(user.id, withUser, "Hi! I found you on LOCO.");
    }
    openThread(convo.id, withUser);
  } else {
    const first = DB.messages().filter(c => c.participants.includes(user.id))[0];
    if (first) openThread(first.id, first.participants.find(p => p !== user.id));
  }
}
