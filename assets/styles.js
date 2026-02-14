:root{
  --bg:#0b1220;
  --card:#121b2e;
  --muted:rgba(255,255,255,.7);
  --text:#fff;
  --line:rgba(255,255,255,.12);
  --radius:18px;
}
*{box-sizing:border-box}
body{
  margin:0; font-family:system-ui,Segoe UI,Arial;
  background:radial-gradient(900px 500px at 20% 10%, rgba(99,102,241,.25), transparent 60%),
             radial-gradient(900px 500px at 80% 20%, rgba(16,185,129,.18), transparent 55%),
             var(--bg);
  color:var(--text);
}
.card{
  max-width:420px; margin:8vh auto; padding:24px;
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.04));
  border:1px solid var(--line); border-radius:var(--radius);
  box-shadow:0 24px 80px rgba(0,0,0,.35);
}
h1,h2{margin:0 0 10px}
.muted{color:var(--muted); margin:0 0 16px}
.stack{display:grid; gap:10px}
input,select,textarea,button{
  width:100%; padding:12px 12px; border-radius:14px;
  border:1px solid var(--line);
  background:rgba(0,0,0,.25); color:var(--text);
}
button{cursor:pointer; background:rgba(99,102,241,.9); border:none}
button.ghost{background:transparent; border:1px solid var(--line)}
.msg{min-height:18px; color:rgba(255,255,255,.85); margin:0}
.divider{height:1px; background:var(--line); margin:16px 0}
.link{color:#a5b4fc; text-decoration:none}
.topbar{
  display:flex; justify-content:space-between; align-items:center;
  padding:14px 18px; border-bottom:1px solid var(--line);
  background:rgba(0,0,0,.25); backdrop-filter: blur(10px);
  position:sticky; top:0;
}
.brand{font-weight:700}
.layout{
  max-width:1100px; margin:18px auto; padding:0 14px;
  display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:14px;
}
.panel{
  padding:16px; border-radius:var(--radius);
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--line);
}
.list{display:grid; gap:10px}
.item{
  padding:12px; border-radius:14px;
  border:1px solid var(--line);
  background:rgba(0,0,0,.18);
}
.small{font-size:12px; color:var(--muted)}
.badge{
  display:inline-block; padding:4px 10px; border-radius:999px;
  background:rgba(255,255,255,.10); border:1px solid var(--line);
  font-size:12px;
}
.row{display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap}
.actions{display:flex; gap:8px; margin-top:10px}
.actions button{background:rgba(16,185,129,.9)}
.actions button.deny{background:rgba(239,68,68,.9)}
