const axios = require("axios");

let session = null;
let lastLogin = 0;

let cache = [];
let lastFetch = 0;

const CACHE_TIME = 20000;

async function login() {
  if (session && Date.now() - lastLogin < 300000) return;

  const res = await axios.post("https://online.mbbank.com.vn/api/login", {
    userId: process.env.MB_USER,
    password: process.env.MB_PASS
  });

  session = res.data.sessionId;
  lastLogin = Date.now();
}

async function getHistory() {

  // cache chống spam
  if (Date.now() - lastFetch < CACHE_TIME) {
    return cache;
  }

  await login();

  try {
    const res = await axios.post(
      "https://online.mbbank.com.vn/api/transaction-history",
      {},
      {
        headers: { Authorization: session },
        timeout: 8000
      }
    );

    cache = res.data.transactions || [];
    lastFetch = Date.now();

    return cache;

  } catch (e) {

    // token die → reset
    session = null;

    return cache;
  }
}

module.exports = { getHistory };
