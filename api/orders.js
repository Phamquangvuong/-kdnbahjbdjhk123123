const redis = require("../lib/redis");

module.exports = async (req, res) => {
  try{
    const keys = await redis.keys("pay:*");
    const data = await Promise.all(keys.map(k => redis.get(k)));

    const total = data.length;
    const done = data.filter(i => i.status === "paid").length;
    const income = data.reduce((s,i)=>
      i.status==="paid"?s+i.amount:s,0
    );

    res.json({
      totalOrders: total,
      successOrders: done,
      income
    });

  }catch(e){
    res.json({ error: e.message });
  }
};
