
const toast = document.getElementById("toast");
function say(text){
  toast.textContent=text;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1800);
}

// ===== 客厅 =====
const cup = document.getElementById("water-cup");
cup.addEventListener("click",()=>{
  cup.classList.remove("sip");
  void cup.offsetWidth;
  cup.classList.add("sip");
  say("咕嘟。喝一点水。");
});

let lampLevel = 0;
const lamp = document.getElementById("floor-lamp");
const livingDim = document.getElementById("living-dim");
lamp.addEventListener("click",()=>{
  lampLevel = (lampLevel + 1) % 4;
  const levels = [
    ["rgba(10,8,6,.06)","现在刚刚好。"],
    ["rgba(10,8,6,.20)","暗一点。"],
    ["rgba(10,8,6,.34)","再柔和一点。"],
    ["rgba(10,8,6,.00)","亮一点。"]
  ];
  livingDim.style.background = levels[lampLevel][0];
  say(levels[lampLevel][1]);
});

document.getElementById("slow-down").addEventListener("click",()=>{
  const orb = document.getElementById("breathing-orb");
  orb.classList.toggle("hidden");
  say(orb.classList.contains("hidden") ? "好啦。" : "不需要数拍子，跟着它就好。");
});

// 30 秒无操作彩蛋
let quietTimer;
function startQuietTimer(){
  clearTimeout(quietTimer);
  quietTimer = setTimeout(()=>{
    if(document.getElementById("living-room").classList.contains("is-active")){
      say("这样待着也很好。");
    }
  },30000);
}
["click","pointermove","keydown"].forEach(evt=>{
  document.getElementById("living-room").addEventListener(evt,startQuietTimer,{passive:true});
});
document.querySelector('[data-room="living-room"]').addEventListener("click",()=>{
  startQuietTimer();
  setTimeout(()=>document.getElementById("living-hint")?.classList.add("hide"),6500);
});

// 唱片小游戏：把唱片拖到唱片机转盘中央
const disc = document.getElementById("record-disc");
const target = document.getElementById("record-target");

function finishRecordGame(){
  target.classList.remove("record-ready");
  target.classList.add("record-success");
  const sleeve=document.querySelector(".record-sleeve");
  if(sleeve) sleeve.style.opacity="0";
  disc.style.opacity="0";
  disc.style.pointerEvents="none";
  say("放好了。给自己听一首歌吧。");
}

disc.addEventListener("dragstart",e=>{
  e.dataTransfer.setData("text/plain","record");
  target.classList.add("record-ready");
});
disc.addEventListener("dragend",()=>target.classList.remove("record-ready"));
target.addEventListener("dragover",e=>e.preventDefault());
target.addEventListener("drop",e=>{
  e.preventDefault();
  if(e.dataTransfer.getData("text/plain")==="record") finishRecordGame();
});

let pointerDragging = false;
disc.addEventListener("pointerdown",e=>{
  pointerDragging = true;
  disc.setPointerCapture?.(e.pointerId);
  target.classList.add("record-ready");
});
disc.addEventListener("pointerup",e=>{
  if(!pointerDragging) return;
  pointerDragging = false;
  target.classList.remove("record-ready");
  const r = target.getBoundingClientRect();
  if(e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom){
    finishRecordGame();
  }
});

// ===== 其他房间原有交互 =====
document.getElementById("lamp")?.addEventListener("click",()=>{
  document.getElementById("bedroom")?.classList.toggle("lights-out");
});
document.getElementById("shooting-star")?.addEventListener("click",e=>{
  e.currentTarget.classList.remove("fly");
  void e.currentTarget.offsetWidth;
  e.currentTarget.classList.add("fly");
});

async function renderArchive(type, el, formatter){
  const rows = await getMemories(type);
  el.innerHTML = rows.map(formatter).join("");
}
function when(iso){
  return new Date(iso).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
}

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
  const a=document.getElementById("dream-original");
  const b=document.getElementById("dream-rewrite");
  if(!a.value.trim() && !b.value.trim()) return;
  await addMemory("dream",{original:a.value.trim(),rewrite:b.value.trim()});
  a.value=""; b.value="";
  renderArchive("dream",document.getElementById("dream-list"),x=>`<article><small>${when(x.createdAt)}</small><div><b>梦：</b>${escapeHtml(x.data.original||"……")}</div><div><b>新的结局：</b>${escapeHtml(x.data.rewrite||"……")}</div></article>`);
});
function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

document.querySelector('[data-panel="note-panel"]').addEventListener("click",()=>renderArchive("note",document.getElementById("note-list"),x=>`<article><small>${when(x.createdAt)}</small><div>${escapeHtml(x.data.text)}</div></article>`));
document.querySelector('[data-panel="wish-panel"]').addEventListener("click",()=>renderArchive("wish",document.getElementById("wish-list"),x=>`<article><small>${when(x.createdAt)}</small><div>✦ ${escapeHtml(x.data.text)}</div></article>`));
document.querySelector('[data-panel="dream-panel"]').addEventListener("click",()=>renderArchive("dream",document.getElementById("dream-list"),x=>`<article><small>${when(x.createdAt)}</small><div><b>梦：</b>${escapeHtml(x.data.original||"……")}</div><div><b>新的结局：</b>${escapeHtml(x.data.rewrite||"……")}</div></article>`));


// ===== V1.8 卧室交互 =====
function bedSay(text){
  const t = document.getElementById("bedroom-toast");
  if(!t) return;
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(window.__bedToastTimer);
  window.__bedToastTimer = setTimeout(()=>t.classList.remove("show"), 1800);
}

let bedLampLevel = 0;
document.getElementById("bedside-lamp")?.addEventListener("click", ()=>{
  bedLampLevel = (bedLampLevel + 1) % 4;
  const dim = document.getElementById("bedroom-dim");
  const levels = [
    ["rgba(4,6,10,0)", "灯亮着。"],
    ["rgba(4,6,10,.18)", "暗一点。"],
    ["rgba(4,6,10,.34)", "再柔和一点。"],
    ["rgba(4,6,10,.52)", "只留一点光。"]
  ];
  dim.style.background = levels[bedLampLevel][0];
  bedSay(levels[bedLampLevel][1]);
});

document.getElementById("sleep-help")?.addEventListener("click", ()=>{
  document.getElementById("sleep-card")?.classList.remove("hidden");
});

document.getElementById("close-sleep-card")?.addEventListener("click", ()=>{
  document.getElementById("sleep-card")?.classList.add("hidden");
  document.getElementById("bed-breathe-orb")?.classList.add("hidden");
  clearTimeout(__bedBreathingTimer);
});

let __bedBreathingTimer;
document.getElementById("start-bed-breathe")?.addEventListener("click", ()=>{
  const orb = document.getElementById("bed-breathe-orb");
  const card = document.getElementById("sleep-card");
  if(!orb) return;

  clearTimeout(__bedBreathingTimer);
  card?.classList.add("hidden");
  orb.classList.remove("hidden");
  bedSay("不用数拍子，跟着光就好。");

  // Three slow cycles, then quietly finish on its own.
  __bedBreathingTimer = setTimeout(()=>{
    orb.classList.add("hidden");
    bedSay("好啦，慢慢待一会儿。");
  }, 24000);
});

document.getElementById("bed-window")?.addEventListener("click", ()=>{
  document.getElementById("window-card")?.classList.remove("hidden");
});

document.getElementById("close-window-card")?.addEventListener("click", ()=>{
  document.getElementById("window-card")?.classList.add("hidden");
});

document.getElementById("bed-note")?.addEventListener("click", async ()=>{
  document.getElementById("bed-note-panel")?.showModal();
  await renderArchive(
    "bed-note",
    document.getElementById("bed-note-list"),
    x=>`<article><small>${when(x.createdAt)}</small><div>${escapeHtml(x.data.text)}</div></article>`
  );
});

document.getElementById("save-bed-note")?.addEventListener("click", async ()=>{
  const input = document.getElementById("bed-note-input");
  if(!input?.value.trim()) return;
  await addMemory("bed-note",{text:input.value.trim()});
  input.value = "";
  await renderArchive(
    "bed-note",
    document.getElementById("bed-note-list"),
    x=>`<article><small>${when(x.createdAt)}</small><div>${escapeHtml(x.data.text)}</div></article>`
  );
  bedSay("留在这里了。");
});

document.getElementById("release-bed-note")?.addEventListener("click", ()=>{
  const input = document.getElementById("bed-note-input");
  if(input) input.value = "";
  document.getElementById("bed-note-panel")?.close();
});


document.getElementById("pet-dodo")?.addEventListener("click", ()=>{
  bedSay("多多没有醒，只是轻轻动了一下耳朵。");
  const reaction = document.getElementById("dodo-reaction");
  if(reaction){
    reaction.classList.remove("hidden");
    reaction.querySelectorAll("span").forEach(el=>{
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
    setTimeout(()=>reaction.classList.add("hidden"), 1800);
  }
});


document.getElementById("dim-bed-light")?.addEventListener("click", ()=>{
  const dim = document.getElementById("bedroom-dim");
  bedLampLevel = 2;
  if(dim) dim.style.background = "rgba(4,6,10,.34)";
  bedSay("好，灯暗一点。");
});

document.getElementById("just-rest")?.addEventListener("click", ()=>{
  document.getElementById("sleep-card")?.classList.add("hidden");
  document.getElementById("bed-breathe-orb")?.classList.add("hidden");
  bedSay("什么也不用做，就躺一会儿。");
});

document.getElementById("bed-night-mode")?.addEventListener("click", ()=>{
  const stage = document.querySelector(".bedroom-stage");
  if(!stage) return;
  const on = stage.classList.toggle("night-on");
  bedSay(on ? "夜间模式。把房间再安静一点。" : "夜间模式关掉了。");
});

document.getElementById("bed-window")?.addEventListener("click", ()=>{
  const stars = document.getElementById("bed-window-stars");
  if(stars){
    stars.classList.remove("hidden");
    setTimeout(()=>stars.classList.add("hidden"), 7000);
  }
});
