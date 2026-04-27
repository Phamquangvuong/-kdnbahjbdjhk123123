const redis = require("../lib/redis");

module.exports = async (req, res) => {
  const amount = Number(req.query.nap);

  if (!amount || amount <= 0) {
    return res.json({ error: "invalid amount" });
  }

  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "ip";

  const key = "limit:" + ip;

  const count = await redis.get(key) || 0;

  if (count > 5) {
    return res.json({ error: "too many requests" });
  }

  await redis.set(key, count + 1, { ex: 10 });

  const note = "nap" + Date.now();

  const data = {
    note,
    amount,
    status: "pending",
    expire: Date.now() + 120000
  };

  await redis.set("pay:" + note, data, { ex: 300 });

  res.json({
    qr: `https://img.vietqr.io/image/MB-0975868667-compact2.png?amount=${amount}&addInfo=${note}`,
    note
  });
};
