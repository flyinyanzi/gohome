
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

// =========================
// Window room
// =========================
function windowSay(text){
  flash("window-toast", text, 2100);
}

$("window-breeze")?.addEventListener("click", ()=>{
  const wind = $("window-wind-lines");
  if(!wind) return;
  wind.classList.toggle("hidden");
  windowSay(wind.classList.contains("hidden") ? "风轻了一点。" : "让风把烦闷也带走一点。");
});

$("window-dodo")?.addEventListener("click", ()=>{
  const hearts = $("window-dodo-hearts");
  if(hearts){
    hearts.classList.remove("hidden");
    restartChildrenAnimation(hearts);
    clearTimeout(hearts.__timer);
    hearts.__timer = setTimeout(()=>hearts.classList.add("hidden"),1700);
  }
  windowSay("多多今天也很可爱。");
});

$("window-night-mode")?.addEventListener("click", ()=>{
  const stage = document.querySelector(".window-stage");
  if(!stage) return;
  const on = stage.classList.toggle("night-on");
  windowSay(on ? "让这里安静下来。" : "把傍晚的光找回来。");
});

// Laundry mini-game
let selectedLaundry = null;
let laundryDone = new Set();
const laundryLabels = ["衬衫","上衣","床单","毛巾"];

function resetLaundrySelection(){
  document.querySelectorAll(".laundry-item").forEach(el=>el.classList.remove("selected"));
  document.querySelectorAll(".hanger-slot").forEach(el=>el.classList.remove("ready"));
  selectedLaundry = null;
}

function setLaundryCaption(text){
  const el = $("laundry-caption");
  if(el) el.textContent = text;
}

function updateLaundryProgress(){
  document.querySelectorAll(".laundry-progress i").forEach((dot,i)=>{
    dot.classList.toggle("done", laundryDone.has(i));
  });
}

$("window-laundry")?.addEventListener("click", ()=>{
  $("laundry-panel")?.showModal();
  setLaundryCaption(laundryDone.size === 4 ? "今天的衣服也晾好了。" : "点一件衣服，再点晾衣杆上的位置。");
});

document.querySelectorAll(".laundry-item").forEach(item=>{
  item.addEventListener("click", ()=>{
    if(item.classList.contains("used")) return;
    document.querySelectorAll(".laundry-item").forEach(el=>el.classList.remove("selected"));
    item.classList.add("selected");
    selectedLaundry = Number(item.dataset.item);
    document.querySelectorAll(".hanger-slot").forEach(el=>el.classList.add("ready"));
    setLaundryCaption(selectedLaundry === 2 ? "床单有点大。" : "找个合适的位置挂起来吧。");
  });
});

document.querySelectorAll(".hanger-slot").forEach(slot=>{
  slot.addEventListener("click", ()=>{
    if(selectedLaundry === null) return;
    const slotIndex = Number(slot.dataset.slot);

    // Keep one item per slot for a clear little game.
    if(slot.classList.contains("done")){
      setLaundryCaption("这里已经挂好啦。");
      return;
    }

    const item = document.querySelector(`.laundry-item[data-item="${selectedLaundry}"]`);
    slot.classList.remove("ready");
    slot.classList.add("done");
    slot.dataset.label = laundryLabels[selectedLaundry];
    item?.classList.add("used");
    laundryDone.add(selectedLaundry);

    if(selectedLaundry === 2){
      // Quiet collaboration moment: no explanatory relationship copy.
      const helper = $("helper-hand");
      helper?.classList.remove("hidden");
      setLaundryCaption("另一边刚好被接住了。");
      setTimeout(()=>{
        helper?.classList.add("hidden");
        if(laundryDone.size < 4) setLaundryCaption("继续吧。");
      },1800);
    }else{
      setLaundryCaption("好啦。");
    }

    updateLaundryProgress();
    resetLaundrySelection();

    if(laundryDone.size === 4){
      setTimeout(()=>{
        setLaundryCaption("今天的衣服也晾好了。");
        windowSay("今天的衣服也晾好了。");
      },500);
    }
  });
});

// Litter mini-game
$("window-litter")?.addEventListener("click", ()=>{
  $("litter-panel")?.showModal();
});

document.querySelectorAll(".litter-clump").forEach(clump=>{
  clump.addEventListener("click", ()=>{
    if(clump.classList.contains("removed")) return;
    const scoop = $("litter-scoop");
    scoop?.classList.add("scoop");
    clump.classList.add("removed");

    setTimeout(()=>scoop?.classList.remove("scoop"),420);

    const left = document.querySelectorAll(".litter-clump:not(.removed)").length;
    const cap = $("litter-caption");
    if(cap){
      cap.textContent = left > 0 ? `还剩 ${left} 个小团块。` : "干净啦。";
    }

    if(left === 0){
      setTimeout(()=>{
        windowSay("猫砂盆清理好了。");
        // Tiny domestic joke, kept gentle.
        if(cap) cap.textContent = "……多多已经开始在旁边等了。";
      },450);
    }
  });
});



// =========================
// Cat room
// =========================
function catSay(text){ flash("cat-toast", text, 2100); }

const catPhotos = [
  ["photo-01-first-meet.jpeg","first","第一次见面"],["photo-02-pickup.jpeg","pickup","去接多多"],
  ["photo-03-hotel.jpeg","hotel","刚回来的两天"],["photo-04-hotel.jpeg","hotel","刚回来的两天"],
  ["photo-05-hotel.jpeg","hotel","刚回来的两天"],["photo-06-hotel.jpeg","hotel","刚回来的两天"],
  ["photo-07-later.jpeg","later","后来又见面啦"],["photo-08-later.jpeg","later","后来又见面啦"],
  ["photo-09-later.jpeg","later","后来又见面啦"],["photo-10-daily-food.jpeg","daily","北京的日常"],
  ["photo-11-daily-lap.jpeg","daily","北京的日常"],["photo-12-daily-chair.jpeg","daily","北京的日常"],
  ["photo-13-tongue.jpeg","daily","隐藏彩蛋"],["photo-14-daily-water.jpeg","daily","北京的日常"],
  ["photo-15-daily-play.jpeg","daily","北京的日常"]
].map(([file,cat,label])=>({src:`assets/images/cat-room/photos/${file}`,cat,label}));

function renderCatAlbum(filter="all"){
  const grid=$("cat-album-grid"); if(!grid) return;
  const rows=filter==="all"?catPhotos:catPhotos.filter(p=>p.cat===filter);
  grid.innerHTML=rows.map(p=>`<button type="button"><img src="${p.src}" alt="${safe(p.label)}"><small>${safe(p.label)}</small></button>`).join("");
}

$("cat-photo-wall")?.addEventListener("click",()=>{renderCatAlbum("all");$("cat-album-panel")?.showModal();});
document.querySelectorAll("[data-album-filter]").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll("[data-album-filter]").forEach(b=>b.classList.remove("active"));btn.classList.add("active");renderCatAlbum(btn.dataset.albumFilter);
}));

function showCatPhoto(src,left,top){
  const pop=$("cat-photo-pop"); if(!pop) return;
  pop.style.left=left+"px";pop.style.top=top+"px";pop.style.backgroundImage=`url("${src}")`;
  pop.classList.remove("hidden");clearTimeout(pop.__timer);pop.__timer=setTimeout(()=>pop.classList.add("hidden"),2600);
}

$("cat-main-dodo")?.addEventListener("click",()=>{
  const hearts=$("cat-reaction");
  if(hearts){hearts.classList.remove("hidden");restartChildrenAnimation(hearts);clearTimeout(hearts.__timer);hearts.__timer=setTimeout(()=>hearts.classList.add("hidden"),1700);}
  const p=["多多眨了一下眼睛。","呼噜……","尾巴轻轻动了一下。","多多看了你一眼。"];catSay(p[Math.floor(Math.random()*p.length)]);
});

$("cat-food")?.addEventListener("click",()=>{catSay("饭饭时间。");showCatPhoto("assets/images/cat-room/photos/photo-10-daily-food.jpeg",185,570);});
$("cat-bed")?.addEventListener("click",()=>{catSay("这个窝看起来很舒服。");showCatPhoto("assets/images/cat-room/photos/photo-14-daily-water.jpeg",280,450);});
$("cat-chair")?.addEventListener("click",()=>{catSay("这里以前也被多多占领过。");showCatPhoto("assets/images/cat-room/photos/photo-11-daily-lap.jpeg",520,255);});

$("cat-toy")?.addEventListener("click",()=>{
  const ball=$("cat-toy-ball");if(ball){ball.classList.remove("hidden");ball.style.animation="none";void ball.offsetWidth;ball.style.animation="";clearTimeout(ball.__timer);ball.__timer=setTimeout(()=>ball.classList.add("hidden"),1450);}catSay("咻——");
});

$("cat-tree")?.addEventListener("click",()=>catSay(Math.random()<.5?"多多今天没在最高层。":"好像有一条尾巴刚刚闪过去。"));

$("cat-box")?.addEventListener("click",()=>{
  const roll=Math.random();
  if(roll<.25){catSay("……？");showCatPhoto("assets/images/cat-room/photos/photo-13-tongue.jpeg",1110,420);return;}
  const ears=$("cat-box-ears");if(ears){ears.classList.remove("hidden");clearTimeout(ears.__timer);ears.__timer=setTimeout(()=>ears.classList.add("hidden"),1500);}
  catSay(roll<.62?"纸箱里好像有东西。":"今天只是一个普通纸箱。");
});

const dailyLines=["今天适合晒太阳。\\n其他事情明天再说。","饭很好吃。\\n别的以后再说。","今日重要工作：\\n盯着一个东西看。","心情：不知道。\\n尾巴：知道。","今天适合找一个舒服的地方趴着。","今日安排：吃饭、发呆、再吃饭。","有些事情不用想明白，\\n先睡一觉。","今天的多多：\\n不接受采访。","适合玩五分钟，\\n然后突然失去兴趣。","今天也可以只是好好待着。"];
function getDailyDodo(){
  const now=new Date(),key=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;let hash=0;
  for(let i=0;i<key.length;i++) hash=((hash<<5)-hash+key.charCodeAt(i))|0;
  return {date:key,line:dailyLines[Math.abs(hash)%dailyLines.length]};
}
$("cat-calendar")?.addEventListener("click",()=>{
  const data=getDailyDodo(),card=$("cat-daily-card");
  if(card) card.innerHTML=`<div><div class="date">${safe(data.date)} · 今日多多</div><div class="paw">🐾</div><div class="line">${safe(data.line).replace(/\\n/g,"<br>")}</div></div>`;
  $("cat-daily-panel")?.showModal();
});



// =========================
// Study
// =========================
function studySay(text){ flash("study-toast", text, 2100); }

$("study-game-cabinet")?.addEventListener("click", ()=>{
  $("study-games-panel")?.showModal();
});

const studyCollections = {
  books: {
    title:"书架",
    lead:"看过的、想记住的书，都可以慢慢放进来。",
    type:"study-book",
    button:"放到书架上"
  },
  music: {
    title:"唱片架",
    lead:"听过的歌、喜欢的专辑，在这里留一个位置。",
    type:"study-music",
    button:"放进唱片架"
  },
  games: {
    title:"玩过的游戏",
    lead:"这里记录真正玩过、喜欢过的游戏；自己做的小游戏在旁边的游戏柜。",
    type:"study-played-game",
    button:"收进游戏收藏"
  },
  keepsakes: {
    title:"小小的收藏",
    lead:"票根、小摆件、旅行带回来的东西……没有分类也没关系。",
    type:"study-keepsake",
    button:"收好它"
  }
};
let currentStudyCollection = "books";

async function renderStudyCollection(){
  const cfg = studyCollections[currentStudyCollection];
  const list = $("study-collection-list");
  if(!cfg || !list || typeof getMemories !== "function") return;
  const rows = await getMemories(cfg.type);

  if(!rows.length){
    list.innerHTML = `<div class="empty-collection">这里还有很多空位置。</div>`;
    return;
  }

  list.innerHTML = rows.map(x=>`
    <article class="collection-item">
      <button type="button" class="collection-remove" data-memory-id="${x.id}" title="从这里取下来">×</button>
      <b>${safe(x.data.title||"未命名")}</b>
      ${x.data.meta ? `<small>${safe(x.data.meta)}</small>` : ""}
      ${x.data.note ? `<p>${safe(x.data.note)}</p>` : ""}
    </article>
  `).join("");

  list.querySelectorAll(".collection-remove").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      if(typeof deleteMemory === "function"){
        await deleteMemory(Number(btn.dataset.memoryId));
        await renderStudyCollection();
        studySay("从这里取下来了。");
      }
    });
  });
}

async function openStudyCollection(kind){
  currentStudyCollection = kind;
  const cfg = studyCollections[kind];
  if(!cfg) return;
  $("study-collection-title").textContent = cfg.title;
  $("study-collection-lead").textContent = cfg.lead;
  $("save-study-item").textContent = cfg.button;
  $("study-item-title").value = "";
  $("study-item-meta").value = "";
  $("study-item-note").value = "";
  await renderStudyCollection();
  $("study-collection-panel")?.showModal();
}

$("study-books")?.addEventListener("click", ()=>openStudyCollection("books"));
$("study-music")?.addEventListener("click", ()=>openStudyCollection("music"));

// A tap on the physical retro console area records played games;
// the game-card cabinet itself opens the two handmade games.
$("study-keepsakes")?.addEventListener("click", ()=>openStudyCollection("keepsakes"));

$("save-study-item")?.addEventListener("click", async ()=>{
  const cfg = studyCollections[currentStudyCollection];
  const title = $("study-item-title")?.value.trim();
  if(!cfg || !title || typeof addMemory !== "function") return;
  await addMemory(cfg.type,{
    title,
    meta:$("study-item-meta")?.value.trim() || "",
    note:$("study-item-note")?.value.trim() || ""
  });
  $("study-item-title").value="";
  $("study-item-meta").value="";
  $("study-item-note").value="";
  await renderStudyCollection();
  studySay("放好了。");
});

// Long press / secondary access is unnecessary on mobile, so use the small
// retro console zone inside the music/game shelf for played-game collection.
const studyPlayedGameHit = document.createElement("button");
studyPlayedGameHit.type = "button";
studyPlayedGameHit.className = "study-hit";
studyPlayedGameHit.setAttribute("aria-label","玩过的游戏收藏");
studyPlayedGameHit.style.cssText = "left:720px;top:440px;width:115px;height:125px;";
document.querySelector(".study-stage")?.appendChild(studyPlayedGameHit);
studyPlayedGameHit.addEventListener("click", ()=>openStudyCollection("games"));

const studyGalleries = {
  photo: {
    title:"一起看过的摄影展",
    lead:"把当时停下来多看了一会儿的画面，重新挂在这里。",
    files:Array.from({length:10},(_,i)=>`assets/images/study/gallery/photo-${String(i+1).padStart(2,"0")}.jpeg`)
  },
  impression: {
    title:"分享过的印象派",
    lead:"曾经分享过的颜色和风景，在这里慢慢看。",
    files:Array.from({length:10},(_,i)=>`assets/images/study/gallery/impression-${String(i+1).padStart(2,"0")}.jpeg`)
  }
};
let activeGallery = "photo";
let galleryIndex = 0;

function renderStudyGallery(){
  const cfg = studyGalleries[activeGallery];
  if(!cfg) return;
  galleryIndex = (galleryIndex + cfg.files.length) % cfg.files.length;
  $("study-gallery-title").textContent = cfg.title;
  $("study-gallery-lead").textContent = cfg.lead;
  $("study-gallery-image").src = cfg.files[galleryIndex];
  $("study-gallery-image").alt = `${cfg.title} 第 ${galleryIndex+1} 幅`;
  $("study-gallery-caption").textContent = `${galleryIndex+1} / ${cfg.files.length}`;

  const dots = $("study-gallery-dots");
  if(dots){
    dots.innerHTML = cfg.files.map((_,i)=>`<button type="button" data-gallery-index="${i}" class="${i===galleryIndex?"active":""}" aria-label="第 ${i+1} 幅"></button>`).join("");
    dots.querySelectorAll("button").forEach(btn=>{
      btn.addEventListener("click",()=>{
        galleryIndex = Number(btn.dataset.galleryIndex);
        renderStudyGallery();
      });
    });
  }
}

function openStudyGallery(kind){
  activeGallery = kind;
  galleryIndex = 0;
  renderStudyGallery();
  $("study-gallery-panel")?.showModal();
}

$("study-photo-gallery")?.addEventListener("click", ()=>openStudyGallery("photo"));
$("study-impression-gallery")?.addEventListener("click", ()=>openStudyGallery("impression"));
$("gallery-prev")?.addEventListener("click", ()=>{galleryIndex--;renderStudyGallery();});
$("gallery-next")?.addEventListener("click", ()=>{galleryIndex++;renderStudyGallery();});


  console.info("[gohome] room-features v1.18 loaded");
})();
