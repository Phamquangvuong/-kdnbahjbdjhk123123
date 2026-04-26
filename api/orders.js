const redis = require("../lib/db");

module.exports = async (req, res) => {
  const keys = await redis.keys("pay:*");

  const data = [];
  for (const k of keys) {
    data.push(await redis.get(k));
  }

  res.json(data);
};
