const axios = require("axios");

let session = null;
let lastLogin = 0;

const BASE = "https://online.mbbank.com.vn";

async function login() {
  if (session && Date.now() - lastLogin < 5 * 60 * 1000) return;

  try {
    const res = await axios.post(BASE + "/api/login", {
      userId: process.env.MB_USER,
      password: process.env.MB_PASS
    });

    session = res.data?.sessionId;
    lastLogin = Date.now();

  } catch (e) {
    session = null;
    throw new Error("Login MB failed");
  }
}

async function getHistory() {
  await login();

  try {
    const res = await axios.post(
      BASE + "/api/transaction-history",
      {},
      {
        headers: {
          Authorization: session,
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    return res.data?.transactions || [];

  } catch (e) {
    session = null;
    return [];
  }
}

module.exports = { getHistory };
