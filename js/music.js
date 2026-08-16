(()=>{
  // ===== V2.7 全屋 BGM =====
  // 新增歌曲：把 mp3 放到 assets/audio/，然后在这里登记。
  // 示例：
  // { title:"歌名", artist:"歌手", src:"assets/audio/example.mp3" },
  const PLAYLIST = [
    // 等第一批 mp3 到位后填入。
  ];

  const audio=new Audio();
  audio.preload="metadata";
  let currentIndex=-1;
  let randomMode=true;

  const $=id=>document.getElementById(id);
  const hasTracks=()=>PLAYLIST.length>0;
  const current=()=>currentIndex>=0?PLAYLIST[currentIndex]:null;
  const isPlaying=()=>!audio.paused && !audio.ended && !!audio.src;

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,m=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  function randomIndex(except=-1){
    if(!PLAYLIST.length) return -1;
    if(PLAYLIST.length===1) return 0;
    let n;
    do n=Math.floor(Math.random()*PLAYLIST.length);
    while(n===except);
    return n;
  }

  function updateUI(){
    const t=current();
    if($("music-now-title")) $("music-now-title").textContent=t?.title||"还没有音乐";
    if($("music-now-artist")) $("music-now-artist").textContent=t?.artist||"";
    $("music-now-mark")?.classList.toggle("playing",isPlaying());
    if($("music-toggle")) $("music-toggle").textContent=isPlaying()?"Ⅱ":"▶";
    if($("music-empty-hint")) $("music-empty-hint").hidden=hasTracks();
    $("music-random")?.classList.toggle("active",randomMode);

    const list=$("music-track-list");
    if(list){
      list.innerHTML=PLAYLIST.map((x,i)=>`
        <button type="button" class="music-track ${i===currentIndex?"current":""}" data-track-index="${i}">
          <span class="music-track-mark">${i===currentIndex?(isPlaying()?"♪":"◉"):"○"}</span>
          <span class="music-track-copy">
            <b>${escapeHtml(x.title||`Track ${i+1}`)}</b>
            <small>${escapeHtml(x.artist||"")}</small>
          </span>
        </button>
      `).join("");
      list.querySelectorAll("[data-track-index]").forEach(btn=>{
        btn.addEventListener("click",()=>playIndex(Number(btn.dataset.trackIndex)));
      });
    }
  }

  async function playIndex(i){
    if(i<0||i>=PLAYLIST.length) return false;
    currentIndex=i;
    const t=PLAYLIST[i];
    if(audio.getAttribute("src")!==t.src) audio.src=t.src;
    try{
      await audio.play();
      updateUI();
      return true;
    }catch(err){
      console.warn("[gohome] audio play failed",err);
      updateUI();
      return false;
    }
  }

  const playRandom=()=>hasTracks()?playIndex(randomIndex(currentIndex)):Promise.resolve(false);

  async function resume(){
    if(!hasTracks()) return false;
    if(currentIndex<0) return playRandom();
    try{
      await audio.play();
      updateUI();
      return true;
    }catch(err){ return false; }
  }

  function pause(){ audio.pause(); updateUI(); }
  function next(){
    if(!hasTracks()) return;
    return randomMode?playRandom():playIndex((currentIndex+1)%PLAYLIST.length);
  }
  function prev(){
    if(!hasTracks()) return;
    return randomMode?playRandom():playIndex((currentIndex-1+PLAYLIST.length)%PLAYLIST.length);
  }
  function openPlaylist(){ updateUI(); $("music-playlist-panel")?.showModal(); }

  $("music-toggle")?.addEventListener("click",()=>isPlaying()?pause():resume());
  $("music-next")?.addEventListener("click",next);
  $("music-prev")?.addEventListener("click",prev);
  $("music-random")?.addEventListener("click",()=>{
    randomMode=!randomMode;
    updateUI();
  });

  audio.addEventListener("play",updateUI);
  audio.addEventListener("pause",updateUI);
  audio.addEventListener("ended",next);
  audio.addEventListener("error",updateUI);

  window.HomeMusic={
    PLAYLIST,audio,hasTracks,current,isPlaying,
    playIndex,playRandom,resume,pause,next,prev,openPlaylist,updateUI
  };
  updateUI();
  console.info("[gohome] music v2.7 loaded");
})();
