
function showScene(id){
  document.querySelectorAll(".scene").forEach(s=>s.classList.remove("is-active"));
  document.getElementById(id).classList.add("is-active");
}
document.querySelectorAll("[data-room]").forEach(btn=>{
  btn.addEventListener("click",()=>showScene(btn.dataset.room));
});
document.querySelectorAll(".back-home").forEach(btn=>{
  btn.addEventListener("click",()=>showScene("home"));
});
document.querySelectorAll("[data-panel]").forEach(btn=>{
  btn.addEventListener("click",()=>document.getElementById(btn.dataset.panel).showModal());
});
document.querySelectorAll("dialog .close").forEach(btn=>{
  btn.addEventListener("click",e=>e.target.closest("dialog").close());
});
