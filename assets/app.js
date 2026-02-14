import { db } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const page = location.pathname.split("/").pop() || "index.html";

if ($("year")) $("year").textContent = new Date().getFullYear();

// Basic “cooldown” to reduce spam (NOT secure)
function canPost(key, seconds=20){
  const now = Date.now();
  const last = Number(localStorage.getItem(key) || 0);
  if (now - last < seconds*1000) return false;
  localStorage.setItem(key, String(now));
  return true;
}

// ---------- Public dashboard lists ----------
function bindSchedules(){
  const el = $("scheduleList");
  if (!el) return;
  const qy = query(collection(db, "schedules"), orderBy("date", "asc"));
  onSnapshot(qy, (snap) => {
    el.innerHTML = "";
    snap.forEach((d) => {
      const s = d.data();
      el.insertAdjacentHTML("beforeend", `
        <div class="item">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <strong>${escapeHtml(s.area || "")}</strong>
            <span class="badge">${escapeHtml(s.wasteType || "")}</span>
          </div>
          <div class="muted" style="margin-top:6px;font-size:12px;">
            Date: ${escapeHtml(s.date || "")} • ${escapeHtml(s.notes || "")}
          </div>
        </div>
      `);
    });
    if (!snap.size) el.innerHTML = `<div class="muted">No schedules yet.</div>`;
  });
}

function bindReportsPublic(){
  const el = $("reportList");
  if (!el) return;

  const qy = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  onSnapshot(qy, (snap) => {
    el.innerHTML = "";
    snap.forEach((d) => {
      const r = d.data();
      el.insertAdjacentHTML("beforeend", `
        <div class="item">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <strong>${escapeHtml(r.type || "")}</strong>
            <span class="badge">${escapeHtml(r.status || "Pending")}</span>
          </div>
          <div class="muted" style="margin-top:6px;font-size:12px;">
            Area: ${escapeHtml(r.area || "")}
          </div>
          <div style="margin-top:6px;font-size:13px;">
            ${escapeHtml(r.description || "")}
          </div>
        </div>
      `);
    });
    if (!snap.size) el.innerHTML = `<div class="muted">No reports yet.</div>`;
  });
}

const reportForm = $("reportForm");
if (reportForm) {
  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("reportMsg");
    msg.textContent = "";

    if (!canPost("reportCooldown", 20)) {
      msg.textContent = "Please wait a bit before submitting again.";
      return;
    }

    try{
      await addDoc(collection(db, "reports"), {
        area: $("area").value.trim(),
        type: $("type").value,
        description: $("desc").value.trim(),
        contact: $("contact").value.trim(),
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      reportForm.reset();
      msg.textContent = "Report submitted ✅";
    } catch(err){
      msg.textContent = err.message;
    }
  });
}

// ---------- Admin page (no auth) ----------
function bindAdminReports(){
  const el = $("adminReportList");
  if (!el) return;

  const qy = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  onSnapshot(qy, (snap) => {
    el.innerHTML = "";
    snap.forEach((d) => {
      const r = d.data();
      el.insertAdjacentHTML("beforeend", `
        <div class="item">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <strong>${escapeHtml(r.type || "")}</strong>
            <span class="badge">${escapeHtml(r.status || "Pending")}</span>
          </div>
          <div class="muted" style="margin-top:6px;font-size:12px;">
            Area: ${escapeHtml(r.area || "")} • Contact: ${escapeHtml(r.contact || "-")}
          </div>
          <div style="margin-top:6px;font-size:13px;">
            ${escapeHtml(r.description || "")}
          </div>

          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
            <button class="btn" data-id="${d.id}" data-status="In Progress">In Progress</button>
            <button class="btn" data-id="${d.id}" data-status="Resolved">Resolved</button>
            <button class="btn ghost" data-id="${d.id}" data-status="Rejected">Rejected</button>
          </div>
        </div>
      `);
    });

    el.querySelectorAll("button[data-id]").forEach(btn=>{
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const status = btn.getAttribute("data-status");
        await updateDoc(doc(db, "reports", id), {
          status,
          updatedAt: serverTimestamp()
        });
      });
    });

    if (!snap.size) el.innerHTML = `<div class="muted">No reports yet.</div>`;
  });
}

const scheduleForm = $("scheduleForm");
if (scheduleForm) {
  scheduleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("scheduleMsg");
    msg.textContent = "";

    if (!canPost("scheduleCooldown", 10)) {
      msg.textContent = "Please wait a bit before posting again.";
      return;
    }

    try{
      await addDoc(collection(db, "schedules"), {
        area: $("sArea").value.trim(),
        date: $("sDate").value,
        wasteType: $("sType").value.trim(),
        notes: $("sNotes").value.trim(),
        createdAt: serverTimestamp()
      });
      scheduleForm.reset();
      msg.textContent = "Schedule published ✅";
    } catch(err){
      msg.textContent = err.message;
    }
  });
}

// XSS safety for public text
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

// Start
bindSchedules();
bindReportsPublic();
bindAdminReports();
