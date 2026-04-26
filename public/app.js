async function load(){

  const stats = await fetch('/api/stats').then(r=>r.json());
  document.getElementById('stats').innerHTML = `
    <div class="card">
      💰 Tổng tiền: ${stats.totalMoney}<br>
      📦 Đơn: ${stats.totalOrders}<br>
      ✅ Đã thanh toán: ${stats.paidOrders}
    </div>
  `;

  const data = await fetch('/api/orders').then(r=>r.json());

  document.getElementById('orders').innerHTML = data.map(o=>`
    <div class="card">
      <b>${o.note}</b><br>
      💰 ${o.amount}<br>
      📌 ${o.status}
    </div>
  `).join('');
}

setInterval(load,2000);
load();