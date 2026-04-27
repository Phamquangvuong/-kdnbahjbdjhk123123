const axios = require("axios");

let session = null;
let lastLogin = 0;

let cache = [];
let lastFetch = 0;

const BASE = "https://online.mbbank.com.vn";
const CACHE_TIME = 20000;

// sleep
const delay = ms => new Promise(r => setTimeout(r, ms));

async function login(retry = 0) {
  if (session && Date.now() - lastLogin < 5 * 60 * 1000) return;

  try {
    const res = await axios.post(BASE + "/api/login", {
      userId: process.env.MB_USER,
      password: process.env.MB_PASS
    });

    session = res.data?.sessionId;
    lastLogin = Date.now();

  } catch (e) {
    if (retry < 3) {
      await delay(1000 * (retry + 1));
      return login(retry + 1);
    }
    throw new Error("Login fail");
  }
}

async function fetchHistory(retry = 0) {
  try {
    const res = await axios.post(
      BASE + "/api/transaction-history",
      {},
      {
        headers: {
          Authorization: session,
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 10000
      }
    );

    return res.data?.transactions || [];

  } catch (e) {

    // nếu token die → login lại
    session = null;

    if (retry < 2) {
      await login();
      await delay(500);
      return fetchHistory(retry + 1);
    }

    return cache; // fallback
  }
}

async function getHistory() {

  // cache chống spam MB
  if (Date.now() - lastFetch < CACHE_TIME) {
    return cache;
  }

  await login();

  const data = await fetchHistory();

  cache = data;
  lastFetch = Date.now();

  return cache;
}

module.exports = { getHistory };
