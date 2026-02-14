import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import { doc, setDoc, getDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const page = location.pathname.split("/").pop() || "index.html";

// --- LOGIN ---
const loginForm = $("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    $("msg").textContent = "Logging in...";
    try {
      const email = $("email").value.trim();
      const pass = $("password").value;

      const cred = await signInWithEmailAndPassword(auth, email, pass);

      // Check role from Firestore
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : "resident";

      location.href = (role === "admin") ? "admin.html" : "resident.html";
    } catch (err) {
      $("msg").textContent = err.message;
    }
  });
}

// --- REGISTER (RESIDENT) ---
const signupForm = $("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    $("signupMsg").textContent = "Creating account...";
    try {
      const name = $("name").value.trim();
      const address = $("address").value.trim();
      const email = $("rEmail").value.trim();
      const pass = $("rPass").value;

      // Prevent residents from using the admin email
      if (email.toLowerCase() === "admin@waste.local") {
        throw new Error("This email is reserved for admin.");
      }

      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      await setDoc(doc(db, "users", cred.user.uid), {
        role: "resident",
        name,
        address,
        createdAt: serverTimestamp()
      });

      $("signupMsg").textContent = "Registered ✅ You are now logged in.";
    } catch (err) {
      $("signupMsg").textContent = err.message;
    }
  });
}

// --- LOGOUT ---
const logoutBtn = $("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => signOut(auth));

// --- PAGE GUARDS (protect resident/admin pages) ---
onAuthStateChanged(auth, async (user) => {
  // index.html is public
  if (page === "index.html") return;

  // must be logged in for resident/admin pages
  if (!user) {
    location.href = "index.html";
    return;
  }

  // role check
  const snap = await getDoc(doc(db, "users", user.uid));
  const role = snap.exists() ? snap.data().role : "resident";

  if (page === "admin.html") {
    if (role !== "admin") location.href = "resident.html";
    if ($("adminStatus")) $("adminStatus").textContent = `Logged in as ADMIN (${user.email}) ✅`;
  }

  if (page === "resident.html") {
    if (role === "admin") location.href = "admin.html";
    if ($("residentStatus")) $("residentStatus").textContent = `Logged in as RESIDENT (${user.email}) ✅`;
  }
});
