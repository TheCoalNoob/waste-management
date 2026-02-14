import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  doc, setDoc, getDoc,
  collection, addDoc, serverTimestamp,
  query, where, orderBy, onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const page = location.pathname.split("/").pop() || "index.html";

function show(el, text){ if(el) el.textContent = text || ""; }
function guardRedirect(to){ location.href = to; }

// ---------- Login (index.html) ----------
const loginForm = $("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    show($("msg"), "Logging in...");
    try {
      const email = $("email").value.trim();
      const pass  = $("password").value;
      const cred = await signInWithEmailAndPassword(auth, email, pass);

      // Role-based redirect
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : "resident";
      guardRedirect(role === "admin" ? "admin.html" : "resident.html");
    } catch (err) {
      show($("msg"), err.message);
    }
  });
}

// ---------- Logout buttons ----------
const logoutBtn = $("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => signOut(auth));

// ---------- Resident (resident.html) ----------
const signupForm = $("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    show($("signupMsg"), "Creating account...");
    try {
      const name = $("rName").value.trim();
      const address = $("rAddress").value.trim();
      const email = $("rEmail").value.trim();
      const pass = $("rPass").value;

      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      await setDoc(doc(db, "users", cred.user.uid), {
        role: "resident",
        name,
        address,
        createdAt: serverTimestamp()
      });

      show($("signupMsg"), "Account created. You’re logged in.");
    } catch (err) {
      show($("signupMsg"), err.message);
    }
  });
}

const requestForm = $("requestForm");
if (requestForm) {
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    show($("reqMsg"), "Submitting...");
    try {
      const u = auth.currentUser;
      if (!u) throw new Error("Please login first.");

      await addDoc(collection(db, "requests"), {
        uid: u.uid,
        type: $("reqType").value,
        description: $("reqDesc").value.trim(),
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      requestForm.reset();
      show($("reqMsg"), "Submitted ✅");
    } catch (err) {
      show($("reqMsg"), err.message);
    }
  });
}

// Live lists for resident
function bindResidentLists(uid){
  const myRequestsEl = $("myRequests");
  if (myRequestsEl) {
    const q1 = query(
      collection(db, "requests"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q1, (snap) => {
      myRequestsEl.innerHTML = "";
      snap.forEach((d) => {
        const r = d.data();
        myRequestsEl.insertAdjacentHTML("beforeend", `
          <div class="item">
            <div class="row">
              <strong>${r.type}</strong>
              <span class="badge">${r.status}</span>
            </div>
            <div class="small">${r.description || ""}</div>
          </div>
        `);
      });
      if (!snap.size) myRequestsEl.innerHTML = `<div class="small">No requests yet.</div>`;
    });
  }

  const schedulesEl = $("schedules");
  if (schedulesEl) {
    const q2 = query(collection(db, "schedules"), orderBy("date", "asc"));
    onSnapshot(q2, (snap) => {
      schedulesEl.innerHTML = "";
      snap.forEach((d) => {
        const s = d.data();
        schedulesEl.insertAdjacentHTML("beforeend", `
          <div class="item">
            <div class="row">
              <strong>${s.area}</strong>
              <span class="badge">${s.wasteType}</span>
            </div>
            <div class="small">Date: ${s.date}</div>
            <div class="small">${s.notes || ""}</div>
          </div>
        `);
      });
      if (!snap.size) schedulesEl.innerHTML = `<div class="small">No schedules posted yet.</div>`;
    });
  }
}

// ---------- Admin (admin.html) ----------
const scheduleForm = $("scheduleForm");
if (scheduleForm) {
  scheduleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    show($("schMsg"), "Saving...");
    try {
      const u = auth.currentUser;
      if (!u) throw new Error("Please login first.");

      await addDoc(collection(db, "schedules"), {
        area: $("schArea").value.trim(),
        date: $("schDate").value,          // keep as YYYY-MM-DD string for simplicity
        wasteType: $("schType").value.trim(),
        notes: $("schNotes").value.trim(),
        createdBy: u.uid,
        createdAt: serverTimestamp()
      });

      scheduleForm.reset();
      show($("schMsg"), "Schedule saved ✅");
    } catch (err) {
      show($("schMsg"), err.message);
    }
  });
}

// Live list for admin requests
function bindAdminRequests(){
  const allRequestsEl = $("allRequests");
  if (!allRequestsEl) return;

  const q1 = query(collection(db, "requests"), orderBy("createdAt", "desc"));
  onSnapshot(q1, (snap) => {
    allRequestsEl.innerHTML = "";
    snap.forEach((d) => {
      const r = d.data();
      allRequestsEl.insertAdjacentHTML("beforeend", `
        <div class="item">
          <div class="row">
            <strong>${r.type}</strong>
            <span class="badge">${r.status}</span>
          </div>
          <div class="small">${r.description || ""}</div>
          <div class="actions">
            <button data-id="${d.id}" data-s="Approved">Approve</button>
            <button class="deny" data-id="${d.id}" data-s="Rejected">Reject</button>
            <button data-id="${d.id}" data-s="Resolved">Resolved</button>
          </div>
        </div>
      `);
    });
    if (!snap.size) allRequestsEl.innerHTML = `<div class="small">No requests yet.</div>`;

    allRequestsEl.querySelectorAll("button[data-id]").forEach(btn=>{
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const status = btn.getAttribute("data-s");
        await updateDoc(doc(db, "requests", id), {
          status,
          updatedAt: serverTimestamp()
        });
      });
    });
  });
}

// ---------- Auth gate + role routing ----------
onAuthStateChanged(auth, async (user) => {
  if (page === "index.html") return; // login page doesn't require auth

  if (!user) {
    // protect pages
    guardRedirect("index.html");
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  const role = snap.exists() ? snap.data().role : "resident";

  // enforce correct page per role
  if (page === "admin.html" && role !== "admin") guardRedirect("resident.html");
  if (page === "resident.html" && role === "admin") guardRedirect("admin.html");

  // bind page data
  if (page === "resident.html") bindResidentLists(user.uid);
  if (page === "admin.html") bindAdminRequests();
});
