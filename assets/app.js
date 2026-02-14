import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const $ = (id) => document.getElementById(id);
const page = location.pathname.split("/").pop() || "index.html";

// Footer year
const yearEl = $("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Tabs
function initTabs(){
  const tabs = document.querySelectorAll(".tab");
  const panes = document.querySelectorAll(".tabPane");
  if (!tabs.length || !panes.length) return;

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      const pane = document.getElementById(target);
      if (pane) pane.classList.add("active");
    });
  });
}
initTabs();

// -------------------- ADMIN (prototype hardcoded) --------------------
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";
const ADMIN_SESSION_KEY = "waste_admin_ok";

function setAdminSession(ok){
  if (ok) sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
  else sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
function isAdminSession(){
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

// Admin login (index.html)
const adminLoginForm = $("adminLoginForm");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("adminUser").value.trim();
    const p = $("adminPass").value;

    if (u === ADMIN_USER && p === ADMIN_PASS) {
      setAdminSession(true);
      $("aLoginMsg").textContent = "Admin login successful ✅";
      location.href = "admin.html";
    } else {
      setAdminSession(false);
      $("aLoginMsg").textContent = "Invalid admin credentials.";
    }
  });
}

// Admin dashboard guard
if (page === "admin.html") {
  if (!isAdminSession()) {
    location.href = "index.html";
  } else {
    const el = $("adminStatusText");
    if (el) el.textContent = "Admin session active ✅";
  }
}

// Admin logout
const adminLogoutBtn = $("adminLogoutBtn");
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", async () => {
    setAdminSession(false);
    location.href = "index.html";
  });
}

// -------------------- RESIDENT (Firebase Auth) --------------------

// Resident login (index.html)
const residentLoginForm = $("residentLoginForm");
if (residentLoginForm) {
  residentLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("rLoginMsg");
    msg.textContent = "Logging in...";
    try {
      const email = $("rEmailLogin").value.trim();
      const pass = $("rPassLogin").value;
      await signInWithEmailAndPassword(auth, email, pass);
      msg.textContent = "Login successful ✅";
      location.href = "resident.html";
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}

// Resident register (resident.html)
const residentSignupForm = $("residentSignupForm");
if (residentSignupForm) {
  residentSignupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("rRegMsg");
    msg.textContent = "Creating account...";
    try {
      const email = $("rEmailReg").value.trim();
      const pass = $("rPassReg").value;

      // Optional: prevent admin email use
      if (email.toLowerCase() === "admin@waste.local") {
        throw new Error("This email is reserved.");
      }

      await createUserWithEmailAndPassword(auth, email, pass);

      msg.textContent = "Registered ✅ You are now logged in.";
      // Switch to Dashboard tab if present
      const dashTab = document.querySelector('.tab[data-tab="tabResidentDash"]');
      if (dashTab) dashTab.click();
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}

// Resident logout
const residentLogoutBtn = $("residentLogoutBtn");
if (residentLogoutBtn) {
  residentLogoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    location.href = "index.html";
  });
}

// Resident page guard + status
if (page === "resident.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }
    const el = $("residentStatusText");
    if (el) el.textContent = `Logged in as RESIDENT (${user.email}) ✅`;
  });
}

// Home page: if already logged in as resident, optionally show a hint (no redirect forced)
if (page === "index.html") {
  onAuthStateChanged(auth, (user) => {
    // Keep it simple; no auto redirect
  });
}
