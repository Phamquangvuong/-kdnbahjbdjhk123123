const redis = require("../lib/db");

module.exports = async (req, res) => {

  const keys = await redis.keys("pay:*");

  let total = 0, paid = 0;

  for (const k of keys) {
    const item = await redis.get(k);
    if (item.status === "paid") {
      total += item.amount;
      paid++;
    }
  }

  res.json({
    totalMoney: total,
    totalOrders: keys.length,
    paidOrders: paid
  });
};
