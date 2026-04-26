const redis = require("../lib/db");

module.exports = async (req, res) => {

  const keys = await redis.keys("pay:*");
  const data = [];

  for (const k of keys) {
    const item = await redis.get(k);
    data.push(item);
  }

  res.json(data.sort((a,b)=>b.createdAt-a.createdAt));
};
