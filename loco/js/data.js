/* ============================================================
   LOCO — data.js
   Seed data + localStorage "database" layer.
   Every other script reads/writes through the DB object below.
   ============================================================ */

const DB_KEYS = {
  users: "loco_users",
  listings: "loco_listings",
  services: "loco_services",
  skills: "loco_skills",
  events: "loco_events",
  messages: "loco_messages",
  favorites: "loco_favorites",
  notifications: "loco_notifications",
  session: "loco_session",
  theme: "loco_theme",
  seeded: "loco_seeded_v1"
};

/* ---------- generic storage helpers ---------- */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("store.get failed for", key, e);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("store.set failed for", key, e);
    }
  }
};

/* ---------- avatar / image placeholders (no network needed) ---------- */
const AVATAR_COLORS = ["#2563EB", "#7C3AED", "#38BDF8", "#F59E0B", "#10B981", "#EF4444", "#EC4899"];
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function avatarColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
const CATEGORY_ICONS = {
  Electronics: "💻", Books: "📚", Furniture: "🛋️", Fashion: "👕",
  Home: "🏠", Food: "🍱", Sports: "🏸", Other: "📦",
  Tutoring: "🎓", Repairs: "🔧", Photography: "📷", Design: "🎨",
  "Home Services": "🧹", "Tech Support": "🖥️", Transportation: "🚗", Freelance: "💼",
  Python: "🐍", "Web Development": "🌐", "Graphic Design": "🎨", "Video Editing": "🎬",
  Guitar: "🎸", "Spoken English": "🗣️", Mathematics: "➗"
};

/* ---------- seed builders ---------- */
function buildUsers() {
  const names = [
    "Ananya Rao", "Karthik Subramaniam", "Priya Natarajan", "Arjun Menon",
    "Divya Krishnan", "Rahul Varma", "Sneha Iyer", "Vignesh Kumar",
    "Meera Pillai", "Suresh Babu", "Lakshmi Narayan", "Vikram Aditya"
  ];
  const areas = ["RS Puram", "Gandhipuram", "Peelamedu", "Saibaba Colony", "Race Course", "Ganapathy", "Singanallur", "Ramanathapuram"];
  return names.map((name, i) => ({
    id: "u" + (i + 1),
    name,
    avatarColor: avatarColor(name),
    initials: initials(name),
    location: areas[i % areas.length] + ", Coimbatore",
    bio: "Community member since 2023. Loves helping neighbours out.",
    rating: (4 + Math.random() * 1).toFixed(1),
    joined: "2023",
    email: name.toLowerCase().replace(/\s+/g, ".") + "@loco.demo"
  }));
}

function buildListings(users) {
  const items = [
    ["MacBook Air M1 - Excellent Condition", "Electronics", 58000, "Like New"],
    ["Study Table with Chair", "Furniture", 3200, "Good"],
    ["Cricket Kit Full Set", "Sports", 4500, "Good"],
    ["Data Structures Textbook Bundle", "Books", 850, "Good"],
    ["Men's Casual Jacket - L", "Fashion", 1200, "Like New"],
    ["Home-made Pickles (Assorted)", "Food", 250, "Fresh"],
    ["Wooden Bookshelf 5-Tier", "Furniture", 2800, "Good"],
    ["Canon DSLR 1500D + Lens", "Electronics", 22000, "Excellent"],
    ["Badminton Racket Pair", "Sports", 1600, "Good"],
    ["Ceramic Dinner Set 24pc", "Home", 1900, "New"],
    ["Women's Ethnic Wear Combo", "Fashion", 2200, "Like New"],
    ["Bluetooth Speaker JBL", "Electronics", 2600, "Good"],
    ["Gaming Chair Ergonomic", "Furniture", 6500, "Good"],
    ["Novel Collection (12 books)", "Books", 1100, "Good"],
    ["Non-stick Cookware Set", "Home", 1750, "New"],
    ["Kids Bicycle 20 inch", "Sports", 3400, "Good"]
  ];
  return items.map((it, i) => ({
    id: "l" + (i + 1),
    title: it[0],
    category: it[1],
    price: it[2],
    condition: it[3],
    icon: CATEGORY_ICONS[it[1]] || "📦",
    location: users[i % users.length].location,
    sellerId: users[i % users.length].id,
    rating: (3.8 + Math.random() * 1.2).toFixed(1),
    description: "Selling due to upgrade / no longer needed. Genuine buyers from the local community only, please connect through LOCO messages. Pickup preferred, can discuss delivery within the area.",
    createdAt: Date.now() - i * 86400000
  }));
}

function buildServices(users) {
  const items = [
    ["Home Math & Science Tutoring", "Tutoring", 400, "per session"],
    ["AC & Fridge Repair Expert", "Repairs", 350, "per visit"],
    ["Wedding & Event Photography", "Photography", 8000, "per event"],
    ["Logo & Brand Identity Design", "Design", 3500, "per project"],
    ["Deep Home Cleaning Service", "Home Services", 1200, "per visit"],
    ["Laptop & PC Tech Support", "Tech Support", 500, "per visit"],
    ["Local Packers & Movers", "Transportation", 2500, "per trip"],
    ["Freelance Content Writing", "Freelance", 2, "per word"],
    ["Plumbing & Fittings Repair", "Repairs", 300, "per visit"],
    ["Portrait & Event Photography", "Photography", 3000, "per hour"],
    ["UI/UX Design Consultation", "Design", 1500, "per hour"],
    ["Bike Pickup & Drop Service", "Transportation", 150, "per trip"]
  ];
  return items.map((it, i) => ({
    id: "s" + (i + 1),
    title: it[0],
    category: it[1],
    price: it[2],
    unit: it[3],
    icon: CATEGORY_ICONS[it[1]] || "🧰",
    providerId: users[(i + 3) % users.length].id,
    location: users[(i + 3) % users.length].location,
    rating: (4 + Math.random() * 1).toFixed(1),
    description: "Reliable, community-verified service provider. Book directly through LOCO and coordinate timing via messages.",
    createdAt: Date.now() - i * 43200000
  }));
}

function buildSkills(users) {
  const skillList = ["Python", "Web Development", "Graphic Design", "Video Editing", "Photography", "Guitar", "Spoken English", "Mathematics"];
  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const out = [];
  let id = 1;
  skillList.forEach((skill, i) => {
    out.push({
      id: "sk" + id++,
      skill,
      icon: CATEGORY_ICONS[skill] || "✨",
      userId: users[i % users.length].id,
      type: "offer",
      level: levels[(i + 1) % levels.length],
      location: users[i % users.length].location,
      availability: ["Weekends", "Weekday evenings", "Flexible", "Weekday mornings"][i % 4]
    });
    out.push({
      id: "sk" + id++,
      skill,
      icon: CATEGORY_ICONS[skill] || "✨",
      userId: users[(i + 5) % users.length].id,
      type: "request",
      level: levels[i % levels.length],
      location: users[(i + 5) % users.length].location,
      availability: ["Weekends", "Weekday evenings", "Flexible", "Weekday mornings"][(i + 2) % 4]
    });
  });
  return out;
}

function buildEvents(users) {
  const items = [
    ["Community Cleanliness Drive", "Ganapathy Park", "🌳", 40],
    ["Local Skill Exchange Meetup", "Community Hall, RS Puram", "🤝", 60],
    ["Weekend Farmers Market", "Race Course Grounds", "🥕", 120],
    ["Kids Coding Workshop", "Peelamedu Library", "🧑‍💻", 30],
    ["Evening Badminton Tournament", "Saibaba Colony Courts", "🏸", 24],
    ["Photography Walk & Meetup", "Marudhamalai Foothills", "📷", 20]
  ];
  const now = Date.now();
  return items.map((it, i) => ({
    id: "e" + (i + 1),
    name: it[0],
    location: it[1],
    icon: it[2],
    capacity: it[3],
    date: new Date(now + (i + 2) * 86400000 * 3).toISOString().slice(0, 10),
    time: ["9:00 AM", "5:30 PM", "7:00 AM", "4:00 PM", "6:00 PM", "6:30 AM"][i],
    organizerId: users[i % users.length].id,
    description: "Open to everyone in the community. Bring your enthusiasm — LOCO handles the rest. Sign up to reserve your spot and get event updates.",
    participants: users.slice(0, 3 + (i % 4)).map(u => u.id)
  }));
}

function buildMessages(users) {
  return [
    {
      id: "c1",
      participants: ["u1", "u2"],
      thread: [
        { from: "u2", text: "Hi! Is the MacBook Air still available?", time: Date.now() - 3600000 * 5 },
        { from: "u1", text: "Yes it is! Barely used, 2 months old.", time: Date.now() - 3600000 * 4 },
        { from: "u2", text: "Great, can we meet this weekend?", time: Date.now() - 3600000 * 2 }
      ]
    },
    {
      id: "c2",
      participants: ["u1", "u4"],
      thread: [
        { from: "u4", text: "Do you still offer Python tutoring?", time: Date.now() - 3600000 * 30 },
        { from: "u1", text: "Yes! Weekday evenings work best for me.", time: Date.now() - 3600000 * 28 }
      ]
    }
  ];
}

function buildNotifications() {
  return [
    { id: "n1", text: "Priya Natarajan sent you a message about your MacBook listing.", time: Date.now() - 3600000 * 2, read: false, type: "message" },
    { id: "n2", text: "Your event 'Community Cleanliness Drive' has 3 new participants.", time: Date.now() - 3600000 * 6, read: false, type: "event" },
    { id: "n3", text: "Someone favorited your 'Canon DSLR 1500D + Lens' listing.", time: Date.now() - 3600000 * 20, read: true, type: "favorite" },
    { id: "n4", text: "Welcome to LOCO! Complete your profile to get better matches.", time: Date.now() - 3600000 * 48, read: true, type: "system" }
  ];
}

/* ---------- seed on first load ---------- */
function seedIfNeeded() {
  if (store.get(DB_KEYS.seeded, false)) return;
  const users = buildUsers();
  store.set(DB_KEYS.users, users);
  store.set(DB_KEYS.listings, buildListings(users));
  store.set(DB_KEYS.services, buildServices(users));
  store.set(DB_KEYS.skills, buildSkills(users));
  store.set(DB_KEYS.events, buildEvents(users));
  store.set(DB_KEYS.messages, buildMessages(users));
  store.set(DB_KEYS.favorites, []);
  store.set(DB_KEYS.notifications, buildNotifications());
  store.set(DB_KEYS.seeded, true);
}
seedIfNeeded();

/* ---------- DB access API used across pages ---------- */
const DB = {
  users: () => store.get(DB_KEYS.users, []),
  userById: (id) => DB.users().find(u => u.id === id),

  listings: () => store.get(DB_KEYS.listings, []),
  saveListings: (arr) => store.set(DB_KEYS.listings, arr),
  addListing: (listing) => {
    const arr = DB.listings();
    arr.unshift(listing);
    DB.saveListings(arr);
  },
  updateListing: (id, patch) => {
    const arr = DB.listings().map(l => l.id === id ? { ...l, ...patch } : l);
    DB.saveListings(arr);
  },
  deleteListing: (id) => {
    DB.saveListings(DB.listings().filter(l => l.id !== id));
  },

  services: () => store.get(DB_KEYS.services, []),
  saveServices: (arr) => store.set(DB_KEYS.services, arr),

  skills: () => store.get(DB_KEYS.skills, []),
  saveSkills: (arr) => store.set(DB_KEYS.skills, arr),
  addSkill: (skill) => {
    const arr = DB.skills();
    arr.unshift(skill);
    DB.saveSkills(arr);
  },

  events: () => store.get(DB_KEYS.events, []),
  saveEvents: (arr) => store.set(DB_KEYS.events, arr),
  joinEvent: (eventId, userId) => {
    const arr = DB.events().map(e => {
      if (e.id !== eventId) return e;
      const already = e.participants.includes(userId);
      return { ...e, participants: already ? e.participants.filter(p => p !== userId) : [...e.participants, userId] };
    });
    DB.saveEvents(arr);
  },

  messages: () => store.get(DB_KEYS.messages, []),
  saveMessages: (arr) => store.set(DB_KEYS.messages, arr),
  conversationWith: (userA, userB) => {
    return DB.messages().find(c => c.participants.includes(userA) && c.participants.includes(userB));
  },
  sendMessage: (userA, userB, text) => {
    let arr = DB.messages();
    let convo = arr.find(c => c.participants.includes(userA) && c.participants.includes(userB));
    if (!convo) {
      convo = { id: "c" + (arr.length + 1) + Math.random().toString(36).slice(2, 5), participants: [userA, userB], thread: [] };
      arr.push(convo);
    }
    convo.thread.push({ from: userA, text, time: Date.now() });
    DB.saveMessages(arr);
    return convo;
  },

  favorites: () => store.get(DB_KEYS.favorites, []),
  saveFavorites: (arr) => store.set(DB_KEYS.favorites, arr),
  isFavorite: (userId, itemId, itemType) => {
    return DB.favorites().some(f => f.userId === userId && f.itemId === itemId && f.itemType === itemType);
  },
  toggleFavorite: (userId, itemId, itemType) => {
    let arr = DB.favorites();
    const exists = arr.some(f => f.userId === userId && f.itemId === itemId && f.itemType === itemType);
    if (exists) {
      arr = arr.filter(f => !(f.userId === userId && f.itemId === itemId && f.itemType === itemType));
    } else {
      arr.push({ userId, itemId, itemType });
    }
    DB.saveFavorites(arr);
    return !exists;
  },

  notifications: () => store.get(DB_KEYS.notifications, []),
  saveNotifications: (arr) => store.set(DB_KEYS.notifications, arr),
  markAllNotificationsRead: () => {
    DB.saveNotifications(DB.notifications().map(n => ({ ...n, read: true })));
  },
  unreadNotificationCount: () => DB.notifications().filter(n => !n.read).length,

  session: () => store.get(DB_KEYS.session, null),
  setSession: (userId) => store.set(DB_KEYS.session, { userId, loginAt: Date.now() }),
  clearSession: () => localStorage.removeItem(DB_KEYS.session),
  currentUser: () => {
    const s = DB.session();
    return s ? DB.userById(s.userId) : null;
  },

  theme: () => store.get(DB_KEYS.theme, "light"),
  setTheme: (t) => store.set(DB_KEYS.theme, t)
};
