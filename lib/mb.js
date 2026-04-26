const { MB } = require("../dist");

let mb, lastLogin = 0;
let cacheHistory = [];
let lastFetch = 0;

async function getMB() {
  if (!mb || Date.now() - lastLogin > 5 * 60 * 1000) {
    mb = new MB({
      username: process.env.MB_USER,
      password: process.env.MB_PASS
    });
    await mb.login();
    lastLogin = Date.now();
  }
  return mb;
}

function format(d) {
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

exports.getHistory = async () => {

  // ⚡ cache 10s (giảm spam MB)
  if (Date.now() - lastFetch < 10000) {
    return cacheHistory;
  }

  const mb = await getMB();
  const bal = await mb.getBalance();
  const acc = bal?.balances?.[0]?.number;

  if (!acc) return [];

  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - 3);

  const data = await mb.getTransactionsHistory({
    accountNumber: acc,
    fromDate: format(from),
    toDate: format(now)
  }) || [];

  cacheHistory = data;
  lastFetch = Date.now();

  return data;
};
