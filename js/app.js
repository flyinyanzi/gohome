
document.getElementById("door").addEventListener("click",()=>{
  const door=document.getElementById("door");
  door.classList.add("open");
  setTimeout(()=>showScene("home"),950);
});
