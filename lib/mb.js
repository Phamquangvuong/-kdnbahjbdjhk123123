const axios = require("axios");
const {
  getCachedHistory,
  setCachedHistory,
  acquireLock,
  releaseLock
} = require("./cache");

let session = null;
let lastLogin = 0;

const BASE = "https://online.mbbank.com.vn";

const delay = ms => new Promise(r => setTimeout(r, ms));

async function login(retry = 0){
  if (session && Date.now() - lastLogin < 5 * 60 * 1000) return;

  try{
    const res = await axios.post(BASE + "/api/login", {
      userId: process.env.MB_USER,
      password: process.env.MB_PASS
    }, { timeout: 8000 });

    session = res.data.sessionId;
    lastLogin = Date.now();

  }catch(e){
    if (retry < 2){
      await delay(500 * (retry + 1));
      return login(retry + 1);
    }
    throw new Error("login fail");
  }
}

async function fetchHistory(){
  await login();

  const res = await axios.post(
    BASE + "/api/transaction-history",
    {},
    {
      headers: { Authorization: session },
      timeout: 8000
    }
  );

  return res.data.transactions || [];
}

async function getHistory(){

  // 1. dùng cache trước
  const cached = await getCachedHistory();
  if (cached) return cached;

  // 2. lock tránh spam MB
  const locked = await acquireLock();

  if (!locked){
    // có thằng khác đang fetch → đợi 300ms rồi lấy cache lại
    await delay(300);
    const retryCache = await getCachedHistory();
    if (retryCache) return retryCache;
  }

  try{
    const data = await fetchHistory();

    await setCachedHistory(data);
    await releaseLock();

    return data;

  }catch(e){

    // token lỗi → reset
    session = null;

    await releaseLock();

    // fallback cache cũ
    const fallback = await getCachedHistory();
    return fallback || [];
  }
}

module.exports = { getHistory };
