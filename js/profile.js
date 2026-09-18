/* ============================================================
   LOCO — profile.js
   Handles profile viewing/editing for profile.html.
   Updates the current user in localStorage immediately so the app
   reflects the new name, email, and bio without a backend.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("profileForm")) return;
  if (!requireAuth()) return;
  initProfilePage();
});

function initProfilePage() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  const currentUser = DB.currentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const nameInput = document.getElementById("profName");
  const emailInput = document.getElementById("profEmail");
  const locationInput = document.getElementById("profLocation");
  const bioInput = document.getElementById("profBio");
  const avatarPreview = document.getElementById("profAvatarPreview");

  if (avatarPreview) {
    avatarPreview.textContent = currentUser.initials;
    avatarPreview.style.background = currentUser.avatarColor;
  }

  if (nameInput) nameInput.value = currentUser.name || "";
  if (emailInput) emailInput.value = currentUser.email || "";
  if (locationInput) locationInput.value = currentUser.location || "";
  if (bioInput) bioInput.value = currentUser.bio || "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nextName = nameInput.value.trim();
    const nextEmail = emailInput.value.trim();
    const nextLocation = locationInput.value.trim();
    const nextBio = bioInput.value.trim();

    const validName = nextName.length >= 2;
    const validEmail = /\S+@\S+\.\S+/.test(nextEmail);

    if (!validName) {
      nameInput.closest(".form-group")?.classList.add("has-error");
      toast("Please enter a valid full name", "error");
      return;
    }

    if (!validEmail) {
      emailInput.closest(".form-group")?.classList.add("has-error");
      toast("Please enter a valid email address", "error");
      return;
    }

    const users = DB.users();
    const userIndex = users.findIndex((user) => user.id === currentUser.id);

    if (userIndex === -1) {
      toast("Profile user not found in local storage", "error");
      return;
    }

    users[userIndex] = {
      ...users[userIndex],
      name: nextName,
      email: nextEmail,
      location: nextLocation || users[userIndex].location,
      bio: nextBio || users[userIndex].bio,
      initials: initials(nextName),
      avatarColor: avatarColor(nextName)
    };

    store.set(DB_KEYS.users, users);

    if (avatarPreview) {
      avatarPreview.textContent = initials(nextName);
      avatarPreview.style.background = avatarColor(nextName);
    }

    if (typeof renderAuthNav === "function") renderAuthNav();
    toast("Profile saved successfully", "success");
  });
}
