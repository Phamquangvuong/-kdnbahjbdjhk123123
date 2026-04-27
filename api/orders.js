const redis = require("../lib/redis");

module.exports = async (req, res) => {
  try {
    const keys = await redis.keys("pay:*");
    const data = await Promise.all(keys.map(k => redis.get(k)));

    const totalOrders = data.length;
    const paidOrders = data.filter(i => i.status === "paid").length;
    const income = data.reduce((sum, i) =>
      i.status === "paid" ? sum + i.amount : sum, 0
    );

    res.json({
      totalOrders,
      paidOrders,
      income
    });

  } catch (e) {
    res.json({ error: e.message });
  }
};
