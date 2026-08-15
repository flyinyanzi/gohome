
(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  function flash(id, text, ms=1900){
    const el = $(id);
    if(!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(el.__hideTimer);
    el.__hideTimer = setTimeout(()=>el.classList.remove("show"), ms);
  }

  function restartChildrenAnimation(container){
    if(!container) return;
    container.querySelectorAll("span,i").forEach(el=>{
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  }

  async function listMemories(type, targetId, formatter){
    const target = $(targetId);
    if(!target || typeof getMemories !== "function") return;
    const rows = await getMemories(type);
    target.innerHTML = rows
      .sort((a,b)=>b.createdAt.localeCompare(a.createdAt))
      .map(formatter)
      .join("");
  }

  function fmt(iso){
    return new Date(iso).toLocaleString("zh-CN",{
      month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"
    });
  }

  function safe(s=""){
    return String(s).replace(/[&<>"']/g,m=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  // =========================
  // Bedroom
  // =========================
  let bedLampLevel = 0;
  let bedBreathingTimer;

  $("bedside-lamp")?.addEventListener("click", ()=>{
    const dim = $("bedroom-dim");
    if(!dim) return;

    bedLampLevel = (bedLampLevel + 1) % 4;
    const levels = [
      ["rgba(4,6,10,0)", "灯亮着。"],
      ["rgba(4,6,10,.18)", "暗一点。"],
      ["rgba(4,6,10,.34)", "再柔和一点。"],
      ["rgba(4,6,10,.52)", "只留一点光。"]
    ];

    dim.style.background = levels[bedLampLevel][0];
    flash("bedroom-toast", levels[bedLampLevel][1]);
  });

  $("sleep-help")?.addEventListener("click", ()=>{
    $("sleep-card")?.classList.remove("hidden");
  });

  $("close-sleep-card")?.addEventListener("click", ()=>{
    $("sleep-card")?.classList.add("hidden");
    $("bed-breathe-orb")?.classList.add("hidden");
    clearTimeout(bedBreathingTimer);
  });

  $("start-bed-breathe")?.addEventListener("click", ()=>{
    const orb = $("bed-breathe-orb");
    if(!orb) return;

    clearTimeout(bedBreathingTimer);
    $("sleep-card")?.classList.add("hidden");
    orb.classList.remove("hidden");
    flash("bedroom-toast","不用数拍子，跟着光就好。");

    bedBreathingTimer = setTimeout(()=>{
      orb.classList.add("hidden");
      flash("bedroom-toast","好啦，慢慢待一会儿。");
    },24000);
  });

  $("dim-bed-light")?.addEventListener("click", ()=>{
    const dim = $("bedroom-dim");
    if(dim) dim.style.background = "rgba(4,6,10,.34)";
    bedLampLevel = 2;
    flash("bedroom-toast","好，灯暗一点。");
  });

  $("just-rest")?.addEventListener("click", ()=>{
    $("sleep-card")?.classList.add("hidden");
    $("bed-breathe-orb")?.classList.add("hidden");
    clearTimeout(bedBreathingTimer);
    flash("bedroom-toast","什么也不用做，就躺一会儿。");
  });

  $("bed-window")?.addEventListener("click", ()=>{
    $("window-card")?.classList.remove("hidden");
    const stars = $("bed-window-stars");
    if(stars){
      stars.classList.remove("hidden");
      clearTimeout(stars.__timer);
      stars.__timer=setTimeout(()=>stars.classList.add("hidden"),7000);
    }
  });

  $("close-window-card")?.addEventListener("click", ()=>{
    $("window-card")?.classList.add("hidden");
  });

  $("bed-note")?.addEventListener("click", async ()=>{
    $("bed-note-panel")?.showModal();
    await listMemories(
      "bed-note","bed-note-list",
      x=>`<article><small>${fmt(x.createdAt)}</small><div>${safe(x.data.text)}</div></article>`
    );
  });

  $("save-bed-note")?.addEventListener("click", async ()=>{
    const input = $("bed-note-input");
    if(!input?.value.trim() || typeof addMemory !== "function") return;
    await addMemory("bed-note",{text:input.value.trim()});
    input.value="";
    await listMemories(
      "bed-note","bed-note-list",
      x=>`<article><small>${fmt(x.createdAt)}</small><div>${safe(x.data.text)}</div></article>`
    );
    flash("bedroom-toast","留在这里了。");
  });

  $("release-bed-note")?.addEventListener("click", ()=>{
    const input=$("bed-note-input");
    if(input) input.value="";
    $("bed-note-panel")?.close();
  });

  $("pet-dodo")?.addEventListener("click", ()=>{
    const hearts=$("dodo-reaction");
    if(hearts){
      hearts.classList.remove("hidden");
      restartChildrenAnimation(hearts);
      clearTimeout(hearts.__timer);
      hearts.__timer=setTimeout(()=>hearts.classList.add("hidden"),1800);
    }
    flash("bedroom-toast","多多没有醒，只是轻轻动了一下耳朵。");
  });

  $("bed-night-mode")?.addEventListener("click", ()=>{
    const stage=document.querySelector(".bedroom-stage");
    if(!stage) return;
    const on=stage.classList.toggle("night-on");
    flash("bedroom-toast",on ? "夜间模式。把房间再安静一点。" : "夜间模式关掉了。");
  });

  // =========================
  // Balcony
  // =========================
  $("balcony-breeze")?.addEventListener("click", ()=>{
    const wind=$("balcony-wind");
    if(!wind) return;
    wind.classList.toggle("hidden");
    flash(
      "balcony-toast",
      wind.classList.contains("hidden") ? "风停了一点。" : "什么也不用想，吹一会儿风。",
      2200
    );
  });

  function showWishPanel(){
    $("balcony-wish-panel")?.showModal();
  }

  $("balcony-shooting-star")?.addEventListener("click", ()=>{
    const star=$("balcony-star-fly");
    if(star){
      star.classList.remove("hidden");
      star.style.animation="none";
      void star.offsetWidth;
      star.style.animation="";
      clearTimeout(star.__timer);
      star.__timer=setTimeout(()=>star.classList.add("hidden"),1600);
    }
    flash("balcony-toast","抓到了。要不要替它留一个愿望？",2200);
    setTimeout(showWishPanel,650);
  });

  $("balcony-write-wish")?.addEventListener("click", showWishPanel);

  async function renderBalconyWishes(){
    await listMemories(
      "balcony-wish","balcony-wish-list",
      x=>`<article><small>${fmt(x.createdAt)}</small><div>${safe(x.data.text)}</div></article>`
    );
  }

  $("balcony-wish-box")?.addEventListener("click", async ()=>{
    showWishPanel();
    await renderBalconyWishes();
  });

  $("save-balcony-wish")?.addEventListener("click", async ()=>{
    const input=$("balcony-wish-input");
    if(!input?.value.trim() || typeof addMemory !== "function") return;
    await addMemory("balcony-wish",{text:input.value.trim()});
    input.value="";
    await renderBalconyWishes();
    flash("balcony-toast","愿望留在这里了。",2200);
  });

  $("send-balcony-wish")?.addEventListener("click", ()=>{
    const input=$("balcony-wish-input");
    if(!input?.value.trim()) return;
    input.value="";
    $("balcony-wish-panel")?.close();
    flash("balcony-toast","送给星星了。今晚不用负责实现它。",2400);
  });

  $("balcony-dodo")?.addEventListener("click", ()=>{
    const hearts=$("balcony-dodo-hearts");
    if(hearts){
      hearts.classList.remove("hidden");
      restartChildrenAnimation(hearts);
      clearTimeout(hearts.__timer);
      hearts.__timer=setTimeout(()=>hearts.classList.add("hidden"),1800);
    }
    flash("balcony-toast","多多好像也很喜欢这里的风。",2200);
  });

  $("balcony-night-mode")?.addEventListener("click", ()=>{
    const stage=document.querySelector(".balcony-stage");
    if(!stage) return;
    const on=stage.classList.toggle("night-deeper");
    flash(
      "balcony-toast",
      on ? "灯光暗一点，星星就更亮一点。" : "把灯光调回来啦。",
      2200
    );
  });

  // Tiny dev marker in console, useful for GitHub Pages cache/deploy checking.
  console.info("[gohome] room-features v1.15 loaded");
})();
