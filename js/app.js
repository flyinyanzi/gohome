
document.getElementById("door").addEventListener("click",()=>{
  const door=document.getElementById("door");
  door.classList.add("open");
  setTimeout(()=>showScene("home"),950);
});

// First-version comfort detail: if she stays quietly in the living room,
// Dodo offers a tiny, non-demanding line.
let quietTimer;
const livingBtn=document.querySelector('[data-room="living-room"]');
livingBtn.addEventListener("click",()=>{
  clearTimeout(quietTimer);
  quietTimer=setTimeout(()=> {
    if(document.getElementById("living-room").classList.contains("is-active")) say("这样待着也很好。");
  },30000);
});
