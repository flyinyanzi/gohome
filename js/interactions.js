
const toast = document.getElementById("toast");
function say(text){
  toast.textContent=text;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1800);
}

document.getElementById("water-cup").addEventListener("click",()=>say("咕嘟。"));
document.getElementById("record-player").addEventListener("click",()=>say("唱针轻轻落下。"));
document.getElementById("slow-down").addEventListener("click",()=>{
  document.getElementById("breathing-orb").classList.toggle("hidden");
});
document.getElementById("lamp").addEventListener("click",()=>{
  document.getElementById("bedroom").classList.toggle("lights-out");
});
document.getElementById("shooting-star").addEventListener("click",e=>{
  e.currentTarget.classList.remove("fly");
  void e.currentTarget.offsetWidth;
  e.currentTarget.classList.add("fly");
});

async function renderArchive(type, el, formatter){
  const rows = await getMemories(type);
  el.innerHTML = rows.map(formatter).join("");
}
function when(iso){ return new Date(iso).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}); }

document.getElementById("save-note").addEventListener("click",async()=>{
  const input=document.getElementById("note-input");
  if(!input.value.trim()) return;
  await addMemory("note",{text:input.value.trim()});
  input.value="";
  renderArchive("note",document.getElementById("note-list"),x=>`<article><small>${when(x.createdAt)}</small><div>${escapeHtml(x.data.text)}</div></article>`);
});
document.getElementById("release-note").addEventListener("click",()=>{
  document.getElementById("note-input").value="";
  document.getElementById("note-panel").close();
});
document.getElementById("save-wish").addEventListener("click",async()=>{
  const input=document.getElementById("wish-input");
  if(!input.value.trim()) return;
  await addMemory("wish",{text:input.value.trim()});
  input.value="";
  renderArchive("wish",document.getElementById("wish-list"),x=>`<article><small>${when(x.createdAt)}</small><div>✦ ${escapeHtml(x.data.text)}</div></article>`);
});
document.getElementById("release-wish").addEventListener("click",()=>{
  document.getElementById("wish-input").value="";
  document.getElementById("wish-panel").close();
});
document.getElementById("save-dream").addEventListener("click",async()=>{
  const a=document.getElementById("dream-original"), b=document.getElementById("dream-rewrite");
  if(!a.value.trim() && !b.value.trim()) return;
  await addMemory("dream",{original:a.value.trim(),rewrite:b.value.trim()});
  a.value=""; b.value="";
  renderArchive("dream",document.getElementById("dream-list"),x=>`<article><small>${when(x.createdAt)}</small><div><b>梦：</b>${escapeHtml(x.data.original||"……")}</div><div><b>新的结局：</b>${escapeHtml(x.data.rewrite||"……")}</div></article>`);
});
function escapeHtml(s){ return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }

["note","wish","dream"].forEach(type=>{
  const dialog=document.getElementById(type+"-panel");
  dialog?.addEventListener("show",()=>{});
  dialog?.addEventListener("click",()=>{});
});
document.getElementById("note-panel").addEventListener("close",()=>{});
document.querySelector('[data-panel="note-panel"]').addEventListener("click",()=>renderArchive("note",document.getElementById("note-list"),x=>`<article><small>${when(x.createdAt)}</small><div>${escapeHtml(x.data.text)}</div></article>`));
document.querySelector('[data-panel="wish-panel"]').addEventListener("click",()=>renderArchive("wish",document.getElementById("wish-list"),x=>`<article><small>${when(x.createdAt)}</small><div>✦ ${escapeHtml(x.data.text)}</div></article>`));
document.querySelector('[data-panel="dream-panel"]').addEventListener("click",()=>renderArchive("dream",document.getElementById("dream-list"),x=>`<article><small>${when(x.createdAt)}</small><div><b>梦：</b>${escapeHtml(x.data.original||"……")}</div><div><b>新的结局：</b>${escapeHtml(x.data.rewrite||"……")}</div></article>`));
