function toast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display="block";
  setTimeout(()=>t.style.display="none",1500);
}

// CREATE
async function create(){
  const amount = document.getElementById("amount").value;

  const res = await fetch(`/api/create?amount=${amount}`);
  const data = await res.json();

  document.getElementById("qr").innerHTML = `
    <img src="${data.qr}">
    <p>${data.note}</p>
  `;

  toast("Bill created!");
}

// LOAD DATA
async function load(){

  try{
    document.getElementById("status").innerText = "🟢 Online";

    const stats = await fetch('/api/stats').then(r=>r.json());
    document.getElementById("stats").innerHTML = `
      <div class="stat">💰 ${stats.total || 0}</div>
      <div class="stat">📦 ${stats.totalOrders || 0}</div>
    `;

    const orders = await fetch('/api/orders').then(r=>r.json());

    document.getElementById("orders").innerHTML = orders.map(o=>`
      <div class="order ${o.status}">
        <div>
          🧾 ${o.note}<br>
          💰 ${o.amount}
        </div>
        <div class="badge">${o.status}</div>
      </div>
    `).join('');

  }catch{
    document.getElementById("status").innerText = "🔴 Offline";
  }
}

// CLOCK
setInterval(()=>{
  document.getElementById("clock").innerText =
    new Date().toLocaleTimeString();
},1000);

setInterval(load,2000);
load();
