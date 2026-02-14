import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const page = location.pathname.split("/").pop() || "index.html";

// Footer year
const yearEl = $("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Tabs (works on resident/admin pages)
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

// ---------- Login (index.html) ----------
const loginForm = $("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("msg");
    msg.textContent = "Logging in...";
    try {
      // Admin uses username "admin" => map to admin@waste.local
      let email = $("email").value.trim();
      const pass = $("password").value;

      if (email.toLowerCase() === "admin") email = "admin@waste.local";

      const cred = await signInWithEmailAndPassword(auth, email, pass);

      // Role-based redirect
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : "resident";

      location.href = (role === "admin") ? "admin.html" : "resident.html";
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}

// ---------- Register (resident.html) ----------
const signupForm = $("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("signupMsg");
    msg.textContent = "Creating account...";
    try {
      const name = $("name").value.trim();
      const address = $("address").value.trim();
      const email = $("rEmail").value.trim();
      const pass = $("rPass").value;

      if (email.toLowerCase() === "admin@waste.local") {
        throw new Error("This email is reserved for admin.");
      }

      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      // Create resident profile doc
      await setDoc(doc(db, "users", cred.user.uid), {
        role: "resident",
        name,
        address,
        createdAt: serverTimestamp()
      });

      msg.textContent = "Registered ✅ You are now logged in.";
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}

// ---------- Logout (resident/admin) ----------
const logoutBtn = $("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => signOut(auth));

// ---------- Guards + status text ----------
onAuthStateChanged(auth, async (user) => {
  // index.html is public
  if (page === "index.html") return;

  // resident/admin pages require login
  if (!user) {
    location.href = "index.html";
    return;
  }

  // get role from Firestore
  const snap = await getDoc(doc(db, "users", user.uid));
  const role = snap.exists() ? snap.data().role : "resident";

  // enforce correct page
  if (page === "admin.html" && role !== "admin") location.href = "resident.html";
  if (page === "resident.html" && role === "admin") location.href = "admin.html";

  // show status
  if ($("residentStatus") && role !== "admin") {
    $("residentStatus").textContent = `Logged in as RESIDENT (${user.email}) ✅`;
  }
  if ($("adminStatus") && role === "admin") {
    $("adminStatus").textContent = `Logged in as ADMIN (${user.email}) ✅`;
  }
});
