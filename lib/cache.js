const redis = require("./redis");

const HISTORY_KEY = "mb:history";
const LOCK_KEY = "mb:lock";

const CACHE_TTL = 20;   // 20s cache
const LOCK_TTL  = 10;   // lock 10s

async function getCachedHistory(){
  const data = await redis.get(HISTORY_KEY);
  return data || null;
}

async function setCachedHistory(data){
  await redis.set(HISTORY_KEY, data, { ex: CACHE_TTL });
}

async function acquireLock(){
  // SET NX EX
  const ok = await redis.set(LOCK_KEY, "1", { nx: true, ex: LOCK_TTL });
  return !!ok;
}

async function releaseLock(){
  await redis.del(LOCK_KEY);
}

module.exports = {
  getCachedHistory,
  setCachedHistory,
  acquireLock,
  releaseLock
};
