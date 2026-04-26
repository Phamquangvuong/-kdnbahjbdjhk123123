async function create(){
  const amount = document.getElementById("amount").value;

  const res = await fetch(`/api/create?amount=${amount}`);
  const data = await res.json();

  document.getElementById("qr").innerHTML = `
    <img src="${data.qr}">
    <p>${data.note}</p>
  `;
}

async function load(){

  // stats
  const stats = await fetch('/api/stats').then(r=>r.json());

  document.getElementById("stats").innerHTML = `
    💰 Tổng tiền: ${stats.total || 0} <br>
    📦 Tổng đơn: ${stats.totalOrders || 0}
  `;

  // orders
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

}

// clock
setInterval(()=>{
  document.getElementById("time").innerText =
    new Date().toLocaleTimeString();
},1000);

setInterval(load,2000);
load();
