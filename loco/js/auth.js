/* ============================================================
   LOCO — auth.js
   Frontend-only demo authentication. No real backend: session
   is just { userId } stored in localStorage via DB.setSession.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  wireLoginForm();
  wireRegisterForm();
  wireLogoutButtons();
  wireDemoLoginButton();
});

function validateField(input, condition, msg) {
  const group = input.closest(".form-group");
  const errorEl = group.querySelector(".error-text");
  if (!condition) {
    group.classList.add("has-error");
    if (errorEl) errorEl.textContent = msg;
    return false;
  }
  group.classList.remove("has-error");
  return true;
}

function wireLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("#loginEmail");
    const password = form.querySelector("#loginPassword");
    const emailOk = validateField(email, /\S+@\S+\.\S+/.test(email.value), "Enter a valid email address");
    const passOk = validateField(password, password.value.length >= 4, "Password must be at least 4 characters");
    if (!emailOk || !passOk) return;

    const btn = form.querySelector("button[type=submit]");
    btn.classList.add("loading");
    setTimeout(() => {
      const users = DB.users();
      const match = users.find(u => u.email.toLowerCase() === email.value.toLowerCase()) || users[0];
      DB.setSession(match.id);
      toast("Welcome back, " + match.name.split(" ")[0] + "!", "success");
      setTimeout(() => window.location.href = "dashboard.html", 500);
    }, 700);
  });
}

function wireRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("#regName");
    const email = form.querySelector("#regEmail");
    const password = form.querySelector("#regPassword");
    const location = form.querySelector("#regLocation");

    const nameOk = validateField(name, name.value.trim().length >= 3, "Enter your full name");
    const emailOk = validateField(email, /\S+@\S+\.\S+/.test(email.value), "Enter a valid email address");
    const passOk = validateField(password, password.value.length >= 4, "Password must be at least 4 characters");
    const locOk = validateField(location, location.value.trim().length >= 2, "Tell us your area");
    if (!nameOk || !emailOk || !passOk || !locOk) return;

    const btn = form.querySelector("button[type=submit]");
    btn.classList.add("loading");
    setTimeout(() => {
      const users = DB.users();
      const newUser = {
        id: "u" + (users.length + 1) + Math.floor(Math.random() * 1000),
        name: name.value.trim(),
        avatarColor: avatarColor(name.value.trim()),
        initials: initials(name.value.trim()),
        location: location.value.trim() + ", Coimbatore",
        bio: "New to LOCO. Excited to connect with the community!",
        rating: "5.0",
        joined: new Date().getFullYear().toString(),
        email: email.value.trim()
      };
      users.push(newUser);
      store.set(DB_KEYS.users, users);
      DB.setSession(newUser.id);
      toast("Account created! Welcome to LOCO, " + newUser.name.split(" ")[0] + ".", "success");
      setTimeout(() => window.location.href = "dashboard.html", 600);
    }, 700);
  });
}

function wireDemoLoginButton() {
  const btn = document.getElementById("demoLoginBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const demoUser = DB.users()[0];
    DB.setSession(demoUser.id);
    toast("Signed in with demo account", "success");
    setTimeout(() => window.location.href = "dashboard.html", 400);
  });
}

function wireLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      DB.clearSession();
      toast("Signed out", "info");
      setTimeout(() => window.location.href = "index.html", 400);
    });
  });
}
