
function showScene(id){
  const target = document.getElementById(id);
  if(!target) return;
  document.querySelectorAll(".scene").forEach(s=>s.classList.remove("is-active"));
  target.classList.add("is-active");
}
document.querySelectorAll("[data-room]").forEach(btn=>{
  btn.addEventListener("click",()=>showScene(btn.dataset.room));
});
document.querySelectorAll(".back-home").forEach(btn=>{
  btn.addEventListener("click",()=>showScene("home"));
});
document.querySelectorAll("[data-panel]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const panel = document.getElementById(btn.dataset.panel);
    if(panel?.showModal) panel.showModal();
  });
});
document.querySelectorAll("dialog .close").forEach(btn=>{
  btn.addEventListener("click",e=>e.target.closest("dialog").close());
});
