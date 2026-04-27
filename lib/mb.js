const { MB } = require("../dist");

let mb = null;
let lastLogin = 0;

let cache = [];
let lastFetch = 0;

const CACHE_TIME = 30000;

async function init(){
  if (!mb || Date.now() - lastLogin > 300000) {
    mb = new MB({
      username: process.env.MB_USER,
      password: process.env.MB_PASS,
    });

    await mb.login();
    lastLogin = Date.now();
  }
}

function format(d){
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

async function getHistory(){

  if (Date.now() - lastFetch < CACHE_TIME) {
    return cache;
  }

  await init();

  const bal = await mb.getBalance();
  const acc = bal?.balances?.[0]?.number;

  if (!acc) return [];

  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - 3);

  try{
    const data = await mb.getTransactionsHistory({
      accountNumber: acc,
      fromDate: format(from),
      toDate: format(now),
    });

    cache = data || [];
    lastFetch = Date.now();

    return cache;
  }catch{
    return cache;
  }
}

module.exports = { getHistory };
