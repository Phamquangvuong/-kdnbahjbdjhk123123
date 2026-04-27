const redis = require("../lib/redis");

module.exports = async (req, res) => {
  const keys = await redis.keys("pay:*");
  const list = await Promise.all(keys.map(k => redis.get(k)));

  const total = list.length;
  const success = list.filter(i => i.status === "paid").length;
  const income = list.reduce((s,i)=> i.status==="paid"?s+i.amount:s,0);

  res.json({
    totalOrders: total,
    successOrders: success,
    income
  });
};
