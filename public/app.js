function toast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(()=>t.style.display="none",1500);
}

// COPY
function copy(btn){
  const text = btn.parentElement.querySelector("span").innerText;
  navigator.clipboard.writeText(window.location.origin + text);
  toast("Copied!");
}

// CREATE QR
async function createQR(){
  const amount = document.getElementById("amount").value;

  const res = await fetch(`/api/create?amount=${amount}`);
  const data = await res.json();

  document.getElementById("qr").innerHTML = `
    <img src="${data.qr}">
    <p>${data.note}</p>
  `;
}

// LOAD DATA
async function load(){

  const stats = await fetch('/api/stats').then(r=>r.json());

  document.getElementById('stats').innerHTML = `
    💰 ${stats.totalMoney} <br>
    📦 ${stats.totalOrders} <br>
    ✅ ${stats.paidOrders}
  `;

  const orders = await fetch('/api/orders').then(r=>r.json());

  document.getElementById('orders').innerHTML = orders.map(o=>`
    <div class="card">
      ${o.note} <br>
      💰 ${o.amount} <br>
      📌 ${o.status}
    </div>
  `).join('');
}

setInterval(load,2000);
load();
