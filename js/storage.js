
const DB_NAME = "qixi-home";
const STORE = "memories";

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME,1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(STORE)){
        const store = db.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});
        store.createIndex("type","type");
        store.createIndex("createdAt","createdAt");
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function addMemory(type,data){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).add({type,data,createdAt:new Date().toISOString()});
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
async function getMemories(type){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly");
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result.filter(x=>x.type===type).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
    req.onerror=()=>reject(req.error);
  });
}

async function deleteMemory(id){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
