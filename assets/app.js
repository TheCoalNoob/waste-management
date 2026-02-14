import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const $ = (id) => document.getElementById(id);
const page = location.pathname.split("/").pop() || "index.html";

// Year
const yearEl = $("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Tabs
(function initTabs(){
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
})();

// Modal helpers (center popup)
function showModal(title, message){
  const overlay = $("modal");
  if (!overlay) return;
  const t = $("modalTitle");
  const m = $("modalMsg");
  if (t) t.textContent = title || "Notice";
  if (m) m.textContent = message || "";
  overlay.classList.add("show");
}
function hideModal(){
  const overlay = $("modal");
  if (!overlay) return;
  overlay.classList.remove("show");
}
const modalClose = $("modalClose");
const modalOk = $("modalOk");
if (modalClose) modalClose.addEventListener("click", hideModal);
if (modalOk) modalOk.addEventListener("click", hideModal);
const modal = $("modal");
if (modal) modal.addEventListener("click", (e) => {
  if (e.target === modal) hideModal();
});

// Admin (prototype hardcoded)
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
      location.href = "admin.html";
    } else {
      setAdminSession(false);
      showModal("Wrong Credentials", "You entered an incorrect admin username or password. Please try again.");
    }
  });
}

// Guard admin dashboard
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
  adminLogoutBtn.addEventListener("click", () => {
    setAdminSession(false);
    location.href = "index.html";
  });
}

// Resident login (index.html)
const residentLoginForm = $("residentLoginForm");
if (residentLoginForm) {
  residentLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const email = $("rEmailLogin").value.trim();
      const pass = $("rPassLogin").value;
      await signInWithEmailAndPassword(auth, email, pass);
      location.href = "resident.html";
    } catch (err) {
      showModal("Wrong Credentials", "Incorrect resident email or password. Please try again.");
    }
  });
}

// Resident register (resident.html)
const residentSignupForm = $("residentSignupForm");
if (residentSignupForm) {
  residentSignupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const email = $("rEmailReg").value.trim();
      const pass = $("rPassReg").value;
      await createUserWithEmailAndPassword(auth, email, pass);
      showModal("Registration Successful", "Your account has been created. You are now logged in.");
      const dashTab = document.querySelector('.tab[data-tab="tabResidentDash"]');
      if (dashTab) dashTab.click();
    } catch (err) {
      showModal("Registration Failed", err.message);
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

// Guard resident page
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
