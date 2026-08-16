
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

// 唱片机 V2.7：拖唱片 -> 吸附到转盘 -> 点击唱针随机播放
const disc = document.getElementById("record-disc");
const sleeve = document.querySelector(".record-sleeve");
const dropZone = document.getElementById("record-drop-zone");
const needle = document.getElementById("record-needle");
const turntableDisc = document.getElementById("record-on-turntable");

let recordPlaced = false;
let recordDrag = null;

function resetLooseRecord(){
  if(!disc) return;
  disc.style.left="";
  disc.style.top="";
  disc.style.transform="";
}

function placeRecord(){
  if(recordPlaced) return;
  recordPlaced=true;
  sleeve?.classList.add("record-sleeve-empty");
  if(disc){
    disc.style.opacity="0";
    disc.style.pointerEvents="none";
  }
  turntableDisc?.classList.add("placed");
  needle?.classList.add("armed");
  say("唱片放好了。点一下唱针吧。");
}

function removeRecord(){
  recordPlaced=false;
  needle?.classList.remove("down","armed");
  turntableDisc?.classList.remove("placed","playing");
  sleeve?.classList.remove("record-sleeve-empty");
  if(disc){
    disc.style.opacity="1";
    disc.style.pointerEvents="auto";
  }
  resetLooseRecord();
}

if(disc && dropZone){
  disc.addEventListener("pointerdown",e=>{
    if(recordPlaced) return;
    if(e.pointerType==="mouse" && e.button!==0) return;
    recordDrag={
      pointerId:e.pointerId,
      startX:e.clientX,
      startY:e.clientY,
      baseLeft:disc.offsetLeft,
      baseTop:disc.offsetTop
    };
    disc.setPointerCapture?.(e.pointerId);
    disc.classList.add("dragging");
    e.preventDefault();
  });

  disc.addEventListener("pointermove",e=>{
    if(!recordDrag || recordDrag.pointerId!==e.pointerId) return;
    const stage=document.querySelector("#living-room [data-zoom-stage]");
    if(!stage) return;
    const r=stage.getBoundingClientRect();
    const sx=r.width/1536;
    const sy=r.height/1024;
    disc.style.left=`${recordDrag.baseLeft+(e.clientX-recordDrag.startX)/Math.max(.001,sx)}px`;
    disc.style.top=`${recordDrag.baseTop+(e.clientY-recordDrag.startY)/Math.max(.001,sy)}px`;
  });

  const finish=e=>{
    if(!recordDrag || recordDrag.pointerId!==e.pointerId) return;
    disc.releasePointerCapture?.(e.pointerId);
    disc.classList.remove("dragging");
    const r=dropZone.getBoundingClientRect();
    const inside=e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
    inside ? placeRecord() : resetLooseRecord();
    recordDrag=null;
  };
  disc.addEventListener("pointerup",finish);
  disc.addEventListener("pointercancel",e=>{
    if(recordDrag?.pointerId!==e.pointerId) return;
    disc.classList.remove("dragging");
    resetLooseRecord();
    recordDrag=null;
  });
}

needle?.addEventListener("click",async()=>{
  if(!recordPlaced){
    say("先把唱片放上去吧。");
    return;
  }
  if(!window.HomeMusic?.hasTracks()){
    say("播放清单还是空的。");
    window.HomeMusic?.openPlaylist();
    return;
  }

  if(window.HomeMusic.isPlaying()){
    window.HomeMusic.pause();
    needle.classList.remove("down");
    turntableDisc?.classList.remove("playing");
    say("唱针抬起来了。");
    return;
  }

  if(!needle.classList.contains("down")){
    needle.classList.add("down");
    const ok=await window.HomeMusic.playRandom();
    if(ok) turntableDisc?.classList.add("playing");
  }else{
    const ok=await window.HomeMusic.resume();
    if(ok) turntableDisc?.classList.add("playing");
  }
});

// 点已经放好的唱片：换下一张。下一次落针重新随机一首。
turntableDisc?.addEventListener("click",()=>{
  if(!recordPlaced) return;
  window.HomeMusic?.pause();
  removeRecord();
  say("换一张唱片吧。");
});

document.getElementById("living-playlist")?.addEventListener("click",()=>{
  window.HomeMusic?.openPlaylist();
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

function bindArchiveTrigger(selector, handler){
  const el = document.querySelector(selector);
  if(!el) return;
  el.addEventListener("click", handler);
}

bindArchiveTrigger('[data-panel="note-panel"]', ()=>{
  renderArchive(
    "note",
    document.getElementById("note-list"),
    x=>`<article><small>${when(x.createdAt)}</small><div>${escapeHtml(x.data.text)}</div></article>`
  );
});

// The old [data-panel="wish-panel"] trigger was removed when balcony was redesigned.
// Keeping this optional means future removals cannot stop the rest of interactions.js.
bindArchiveTrigger('[data-panel="wish-panel"]', ()=>{
  renderArchive(
    "wish",
    document.getElementById("wish-list"),
    x=>`<article><small>${when(x.createdAt)}</small><div>✦ ${escapeHtml(x.data.text)}</div></article>`
  );
});

bindArchiveTrigger('[data-panel="dream-panel"]', ()=>{
  renderArchive(
    "dream",
    document.getElementById("dream-list"),
    x=>`<article><small>${when(x.createdAt)}</small><div><b>梦：</b>${escapeHtml(x.data.original||"……")}</div><div><b>新的结局：</b>${escapeHtml(x.data.rewrite||"……")}</div></article>`
  );
});
